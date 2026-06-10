/**
 * GameState Class
 * Manages the state of the Quoridor game, including player positions,
 * wall counts, placed walls, history for undo, and game mode settings.
 */
class GameState {
  constructor() {
    this.reset();
  }

  /**
   * Resets the game state to its initial configuration.
   */
  reset() {
    // Player 1 (Indigo): Starts at the bottom row (8, 4), target is row 0
    // Player 2 (Rose): Starts at the top row (0, 4), target is row 8
    this.players = [
      {
        id: 1,
        name: "Player 1",
        r: 8,
        c: 4,
        walls: 10,
        color: "#6366f1", // Indigo
        targetRow: 0,
        avatar: "♟️"
      },
      {
        id: 2,
        name: "Player 2",
        r: 0,
        c: 4,
        walls: 10,
        color: "#f43f5e", // Rose
        targetRow: 8,
        avatar: "🧙‍♂️"
      }
    ];

    this.currentPlayerIdx = 0; // 0 for Player 1, 1 for Player 2
    
    // Grid walls represented as 8x8 arrays of booleans (representing intersections)
    // hWalls[r][c] = true means a horizontal wall is placed at intersection (r, c)
    // vWalls[r][c] = true means a vertical wall is placed at intersection (r, c)
    this.hWalls = Array(8).fill(null).map(() => Array(8).fill(false));
    this.vWalls = Array(8).fill(null).map(() => Array(8).fill(false));

    this.gameMode = 'pvp'; // 'pvp' (Player vs Player) or 'ai' (Player vs Computer)
    this.aiDifficulty = 'smart'; // 'easy' or 'smart'
    this.language = 'id'; // 'id' or 'en'
    this.winner = null;
    this.history = []; // History stack for undo: array of serialized state snapshots
    this.lastAction = null; // Last applied action, for highlighting the opponent's move
    this.moveLog = []; // Ordered list of applied actions, for the move history panel
  }

  /**
   * Applies a single action to the board and records it.
   * An action is `{ type: 'move', r, c }` or
   * `{ type: 'wall', r, c, orientation }`. Turn passing and win detection
   * are handled by the caller — this only mutates the board and the log.
   *
   * Centralizing mutation here keeps local, AI, and (future) networked moves
   * on one code path.
   */
  applyAction(action) {
    const player = this.players[this.currentPlayerIdx];

    if (action.type === 'move') {
      player.r = action.r;
      player.c = action.c;
    } else if (action.type === 'wall') {
      player.walls--;
      if (action.orientation === 'h') {
        this.hWalls[action.r][action.c] = true;
      } else {
        this.vWalls[action.r][action.c] = true;
      }
    }

    this.lastAction = { ...action, playerIdx: this.currentPlayerIdx };
    this.moveLog.push(this.lastAction);
  }

  /**
   * Returns a deep clone of the current walls state.
   */
  cloneWalls() {
    return {
      hWalls: this.hWalls.map(row => [...row]),
      vWalls: this.vWalls.map(row => [...row])
    };
  }

  /**
   * Serializes the current state for history recording.
   */
  saveToHistory() {
    const snapshot = {
      players: this.players.map(p => ({ ...p })),
      currentPlayerIdx: this.currentPlayerIdx,
      hWalls: this.hWalls.map(row => [...row]),
      vWalls: this.vWalls.map(row => [...row]),
      winner: this.winner,
      lastAction: this.lastAction,
      moveLog: this.moveLog.map(a => ({ ...a }))
    };
    this.history.push(JSON.stringify(snapshot));
    // Limit history size to 50 moves
    if (this.history.length > 50) {
      this.history.shift();
    }
  }

  /**
   * Restores the game to the previous state.
   * Returns true if successful, false otherwise.
   */
  undo() {
    if (this.history.length === 0) return false;
    
    const lastStateJson = this.history.pop();
    const lastState = JSON.parse(lastStateJson);
    
    this.players = lastState.players;
    this.currentPlayerIdx = lastState.currentPlayerIdx;
    this.hWalls = lastState.hWalls;
    this.vWalls = lastState.vWalls;
    this.winner = lastState.winner;
    this.lastAction = lastState.lastAction || null;
    this.moveLog = lastState.moveLog || [];

    return true;
  }
}

// Expose to global window scope
window.GameState = GameState;
