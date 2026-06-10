/**
 * Game Logic Utilities for Quoridor
 * Handles board navigation, move generation, jump validation, and BFS pathfinding.
 */

/**
 * Returns the valid orthogonal neighbors for a given cell, taking walls into account.
 * Pawns are ignored in this function (only wall blocking is validated).
 * 
 * @param {number} r - Row index (0-8)
 * @param {number} c - Col index (0-8)
 * @param {boolean[][]} hWalls - 8x8 array of horizontal walls
 * @param {boolean[][]} vWalls - 8x8 array of vertical walls
 * @returns {Array<{r: number, c: number}>} List of unblocked neighbor coordinates
 */
function getNeighbors(r, c, hWalls, vWalls) {
  const neighbors = [];

  // 1. Move Up (r-1, c)
  if (r > 0) {
    // Blocked if there is a horizontal wall directly above (row r-1)
    // A horizontal wall at (r-1, c) covers columns c and c+1
    // A horizontal wall at (r-1, c-1) covers columns c-1 and c
    const blocked = (c < 8 && hWalls[r - 1][c]) || (c > 0 && hWalls[r - 1][c - 1]);
    if (!blocked) neighbors.push({ r: r - 1, c });
  }

  // 2. Move Down (r+1, c)
  if (r < 8) {
    // Blocked if there is a horizontal wall directly below (row r)
    const blocked = (c < 8 && hWalls[r][c]) || (c > 0 && hWalls[r][c - 1]);
    if (!blocked) neighbors.push({ r: r + 1, c });
  }

  // 3. Move Left (r, c-1)
  if (c > 0) {
    // Blocked if there is a vertical wall directly left (col c-1)
    // A vertical wall at (r, c-1) covers rows r and r+1
    // A vertical wall at (r-1, c-1) covers rows r-1 and r
    const blocked = (r < 8 && vWalls[r][c - 1]) || (r > 0 && vWalls[r - 1][c - 1]);
    if (!blocked) neighbors.push({ r, c: c - 1 });
  }

  // 4. Move Right (r, c+1)
  if (c < 8) {
    // Blocked if there is a vertical wall directly right (col c)
    const blocked = (r < 8 && vWalls[r][c]) || (r > 0 && vWalls[r - 1][c]);
    if (!blocked) neighbors.push({ r, c: c + 1 });
  }

  return neighbors;
}

/**
 * Returns all valid moves for a player at their turn.
 * Handles normal movement, jumping over opponent, and diagonal jumps.
 * 
 * @param {number} playerIdx - Current player index (0 or 1)
 * @param {object} state - GameState instance
 * @returns {Array<{r: number, c: number}>} List of valid cell coordinates
 */
function getValidMoves(playerIdx, state) {
  const player = state.players[playerIdx];
  const opponent = state.players[1 - playerIdx];
  const validMoves = [];

  // Get unblocked neighbors from the player's position
  const neighbors = getNeighbors(player.r, player.c, state.hWalls, state.vWalls);

  for (const n of neighbors) {
    // Check if the neighbor cell is occupied by the opponent
    if (n.r === opponent.r && n.c === opponent.c) {
      // Opponent is here! We must jump.
      const dr = n.r - player.r;
      const dc = n.c - player.c;

      // Jump target coordinates (extending in the same direction)
      const jr = n.r + dr;
      const jc = n.c + dc;

      const isJumpTargetInBounds = jr >= 0 && jr <= 8 && jc >= 0 && jc <= 8;
      let canJumpStraight = false;

      if (isJumpTargetInBounds) {
        // Can only jump straight if there is no wall between opponent and jump target
        const oppNeighbors = getNeighbors(opponent.r, opponent.c, state.hWalls, state.vWalls);
        const isBlockedByWall = !oppNeighbors.some(on => on.r === jr && on.c === jc);
        if (!isBlockedByWall) {
          canJumpStraight = true;
        }
      }

      if (canJumpStraight) {
        validMoves.push({ r: jr, c: jc });
      } else {
        // Straight jump is blocked by a wall or board edge!
        // Player can jump diagonally to any of the opponent's valid adjacent cells
        // (excluding the player's original position)
        const oppNeighbors = getNeighbors(opponent.r, opponent.c, state.hWalls, state.vWalls);
        for (const on of oppNeighbors) {
          // Exclude player's starting cell
          if (!(on.r === player.r && on.c === player.c)) {
            validMoves.push({ r: on.r, c: on.c });
          }
        }
      }
    } else {
      // No opponent in neighbor cell, it is a valid regular move
      validMoves.push(n);
    }
  }

  return validMoves;
}

/**
 * Checks if a wall can be placed at the specified coordinates.
 * Validates grid bounds, overlapping with other walls, intersecting wall crosses,
 * remaining wall count, and pathing (ensures both players can still reach their goal).
 * 
 * @param {number} r - Grid row index (0-7)
 * @param {number} c - Grid col index (0-7)
 * @param {string} orientation - 'h' for horizontal, 'v' for vertical
 * @param {object} state - GameState instance
 * @returns {boolean} True if the wall can be placed, false otherwise
 */
function canPlaceWall(r, c, orientation, state) {
  // 1. Check intersection coordinates boundary
  if (r < 0 || r > 7 || c < 0 || c > 7) return false;

  // 2. Check overlap and intersection rules
  if (orientation === 'h') {
    // Cannot overlap directly with another horizontal wall
    if (state.hWalls[r][c]) return false;
    // Cannot overlap with adjacent horizontal walls (overlapping columns)
    if (c > 0 && state.hWalls[r][c - 1]) return false;
    if (c < 7 && state.hWalls[r][c + 1]) return false;
    // Cannot intersect/cross a vertical wall at the same intersection (r, c)
    if (state.vWalls[r][c]) return false;
  } else if (orientation === 'v') {
    // Cannot overlap directly with another vertical wall
    if (state.vWalls[r][c]) return false;
    // Cannot overlap with adjacent vertical walls (overlapping rows)
    if (r > 0 && state.vWalls[r - 1][c]) return false;
    if (r < 7 && state.vWalls[r + 1][c]) return false;
    // Cannot intersect/cross a horizontal wall at the same intersection (r, c)
    if (state.hWalls[r][c]) return false;
  } else {
    return false;
  }

  // 3. Check if current player has walls remaining
  const currentPlayer = state.players[state.currentPlayerIdx];
  if (currentPlayer.walls <= 0) return false;

  // 4. Validate paths (BFS path check)
  // Temporarily place the wall in the state, run BFS, and then restore original state
  if (orientation === 'h') {
    state.hWalls[r][c] = true;
  } else {
    state.vWalls[r][c] = true;
  }

  const p1PathExists = hasPathToGoal(0, state);
  const p2PathExists = hasPathToGoal(1, state);

  // Revert the temporary placement
  if (orientation === 'h') {
    state.hWalls[r][c] = false;
  } else {
    state.vWalls[r][c] = false;
  }

  return p1PathExists && p2PathExists;
}

/**
 * Checks if a path exists from the player's current position to their goal row.
 * Uses Breadth-First Search (BFS) for pathfinding.
 * 
 * @param {number} playerIdx - Index of the player (0 or 1)
 * @param {object} state - GameState instance
 * @returns {boolean} True if a valid path exists, false otherwise
 */
function hasPathToGoal(playerIdx, state) {
  const player = state.players[playerIdx];
  const targetRow = player.targetRow;

  const queue = [{ r: player.r, c: player.c }];
  const visited = new Set();
  visited.add(`${player.r},${player.c}`);

  let head = 0;
  while (head < queue.length) {
    const { r, c } = queue[head++];

    if (r === targetRow) {
      return true;
    }

    const neighbors = getNeighbors(r, c, state.hWalls, state.vWalls);
    for (const n of neighbors) {
      const key = `${n.r},${n.c}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(n);
      }
    }
  }

  return false;
}

/**
 * Computes the shortest path from a starting position to a target row.
 * Returns the path array of coordinates, or null if no path exists.
 * 
 * @param {number} startR - Start row (0-8)
 * @param {number} startC - Start col (0-8)
 * @param {number} targetRow - Goal row (0 or 8)
 * @param {boolean[][]} hWalls - Horizontal walls state
 * @param {boolean[][]} vWalls - Vertical walls state
 * @returns {Array<{r: number, c: number}>|null} Shortest path array, or null
 */
function findShortestPath(startR, startC, targetRow, hWalls, vWalls) {
  const queue = [{ r: startR, c: startC, path: [{ r: startR, c: startC }] }];
  const visited = new Set();
  visited.add(`${startR},${startC}`);

  let head = 0;
  while (head < queue.length) {
    const { r, c, path } = queue[head++];

    if (r === targetRow) {
      return path;
    }

    const neighbors = getNeighbors(r, c, hWalls, vWalls);
    for (const n of neighbors) {
      const key = `${n.r},${n.c}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ r: n.r, c: n.c, path: [...path, n] });
      }
    }
  }

  return null;
}

// Expose functions globally under QuoridorLogic namespace
window.QuoridorLogic = {
  getNeighbors,
  getValidMoves,
  canPlaceWall,
  hasPathToGoal,
  findShortestPath
};
