// Assumes window.QuoridorLogic is loaded

/**
 * Computes the best move for the AI player (Player 2).
 * The AI can either move its pawn or place a wall to block the opponent.
 * 
 * @param {object} state - GameState instance
 * @returns {object} Action details: { type: 'move', r, c } or { type: 'wall', r, c, orientation }
 */
function getAIMove(state) {
  const { getValidMoves, canPlaceWall, findShortestPath } = window.QuoridorLogic;
  const aiIdx = 1; // AI is Player 2
  const oppIdx = 0; // Opponent is Player 1
  const aiPlayer = state.players[aiIdx];
  const oppPlayer = state.players[oppIdx];

  // 1. Get current shortest paths for both players
  const myPath = findShortestPath(aiPlayer.r, aiPlayer.c, aiPlayer.targetRow, state.hWalls, state.vWalls);
  const oppPath = findShortestPath(oppPlayer.r, oppPlayer.c, oppPlayer.targetRow, state.hWalls, state.vWalls);

  const myDist = myPath ? myPath.length - 1 : Infinity;
  const oppDist = oppPath ? oppPath.length - 1 : Infinity;

  // 2. Decide whether to place a wall
  let shouldTryWall = false;

  if (aiPlayer.walls > 0) {
    if (state.aiDifficulty === 'smart') {
      // Smart AI places walls when:
      // - Opponent is closer to the goal than AI
      // - Opponent is very close to winning (e.g., within 4 steps)
      // - Or randomly with a small probability (20%) to create obstacle-heavy games
      shouldTryWall = (oppDist < myDist) || (oppDist <= 4) || (Math.random() < 0.2);
    } else {
      // Easy AI has a smaller chance of placing walls (15% chance only)
      shouldTryWall = Math.random() < 0.15;
    }
  }

  // 3. Find and evaluate wall candidates if AI decides to block
  if (shouldTryWall && oppPath && oppPath.length > 1) {
    const candidates = [];

    // Analyze transitions in the opponent's shortest path
    // We try to place walls that cut across these transitions
    for (let i = 0; i < oppPath.length - 1; i++) {
      const curr = oppPath[i];
      const next = oppPath[i + 1];

      const dr = next.r - curr.r;
      const dc = next.c - curr.c;

      if (dr !== 0) {
        // Vertical transition (moving up or down between rows)
        // Block with a horizontal wall
        const minR = Math.min(curr.r, next.r); // row boundary index
        // Try placing at col next.c or next.c - 1
        const colsToTry = [next.c, next.c - 1];
        for (const col of colsToTry) {
          if (canPlaceWall(minR, col, 'h', state)) {
            candidates.push({ r: minR, c: col, orientation: 'h' });
          }
        }
      } else if (dc !== 0) {
        // Horizontal transition (moving left or right between columns)
        // Block with a vertical wall
        const minC = Math.min(curr.c, next.c); // col boundary index
        // Try placing at row next.r or next.r - 1
        const rowsToTry = [next.r, next.r - 1];
        for (const row of rowsToTry) {
          if (canPlaceWall(row, minC, 'v', state)) {
            candidates.push({ r: row, c: minC, orientation: 'v' });
          }
        }
      }
    }

    if (candidates.length > 0) {
      if (state.aiDifficulty === 'smart') {
        let bestWall = null;
        let bestScore = -Infinity;

        // Evaluate all candidate walls to find the one that slows the opponent
        // down the most while minimizing self-sabotage
        for (const cand of candidates) {
          // Temporarily place the wall
          if (cand.orientation === 'h') {
            state.hWalls[cand.r][cand.c] = true;
          } else {
            state.vWalls[cand.r][cand.c] = true;
          }

          // Compute new shortest paths
          const newOppPath = findShortestPath(oppPlayer.r, oppPlayer.c, oppPlayer.targetRow, state.hWalls, state.vWalls);
          const newMyPath = findShortestPath(aiPlayer.r, aiPlayer.c, aiPlayer.targetRow, state.hWalls, state.vWalls);

          // Revert placement
          if (cand.orientation === 'h') {
            state.hWalls[cand.r][cand.c] = false;
          } else {
            state.vWalls[cand.r][cand.c] = false;
          }

          if (newOppPath && newMyPath) {
            const newOppDist = newOppPath.length - 1;
            const newMyDist = newMyPath.length - 1;

            const oppIncrease = newOppDist - oppDist;
            const myIncrease = newMyDist - myDist;

            // Score: we want to increase opponent's path, but NOT our own
            // We heavily penalize walls that slow us down (multiplier 1.5)
            const score = oppIncrease - (myIncrease * 1.5);

            // Only consider wall if it actually slows down the opponent and is a net positive
            if (oppIncrease > 0 && score > bestScore) {
              bestScore = score;
              bestWall = cand;
            }
          }
        }

        if (bestWall && (bestScore > 0 || Math.random() < 0.3)) {
          return { type: 'wall', ...bestWall };
        }
      } else {
        // Easy AI: Pick a random candidate wall from the list of valid blocks
        const randomCand = candidates[Math.floor(Math.random() * candidates.length)];
        return { type: 'wall', ...randomCand };
      }
    }
  }

  // 4. Default Action: Move pawn closer to the goal
  // AI evaluates all valid moves and chooses the one that results in the shortest path to row 8.
  const validMoves = getValidMoves(aiIdx, state);
  if (!validMoves || validMoves.length === 0) {
    // Fallback (should never happen as there is always a valid path/move)
    return { type: 'move', r: aiPlayer.r, c: aiPlayer.c };
  }

  let bestMove = validMoves[0];
  let minPathLength = Infinity;

  for (const move of validMoves) {
    const path = findShortestPath(move.r, move.c, aiPlayer.targetRow, state.hWalls, state.vWalls);
    if (path) {
      const len = path.length - 1;
      if (len < minPathLength) {
        minPathLength = len;
        bestMove = move;
      }
    }
  }

  return { type: 'move', r: bestMove.r, c: bestMove.c };
}

// Expose functions globally
window.getAIMove = getAIMove;
