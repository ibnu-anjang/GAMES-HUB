// Assumes window.QuoridorLogic is loaded

/**
 * Board Renderer
 * Manages the drawing and updates of the board UI, pawn movements, wall previews,
 * and syncs with the DOM status indicators.
 */

// We keep references to the pawn DOM elements for smooth positioning transitions
let pawn1El = null;
let pawn2El = null;

/**
 * Initializes the board structure in the DOM.
 * Generates cells and intersection hover points.
 */
function initBoard(
  boardEl,
  onCellClick,
  onIntersectionHover,
  onIntersectionClick,
  onIntersectionMouseLeave
) {
  boardEl.innerHTML = '';

  // 1. Create cells (9x9)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.gridRow = `${2 * r + 1}`;
      cell.style.gridColumn = `${2 * c + 1}`;
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => onCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }

  // 2. Create intersections (8x8)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const intersect = document.createElement('div');
      intersect.className = 'intersection-point';
      intersect.style.gridRow = `${2 * r + 2}`;
      intersect.style.gridColumn = `${2 * c + 2}`;
      intersect.dataset.row = r;
      intersect.dataset.col = c;

      // Mouse events (desktop)
      intersect.addEventListener('mouseenter', () => onIntersectionHover(r, c));
      intersect.addEventListener('mouseleave', () => onIntersectionMouseLeave(r, c));
      intersect.addEventListener('click', () => onIntersectionClick(r, c));

      // Touch events (mobile): tap on intersection = place wall
      intersect.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent ghost mouse click
        onIntersectionClick(r, c);
      }, { passive: false });

      boardEl.appendChild(intersect);
    }
  }

  // 3. Create Pawns
  pawn1El = document.createElement('div');
  pawn1El.className = 'pawn player-1';
  pawn1El.innerText = '♟️';
  boardEl.appendChild(pawn1El);

  pawn2El = document.createElement('div');
  pawn2El.className = 'pawn player-2';
  pawn2El.innerText = '🧙‍♂️';
  boardEl.appendChild(pawn2El);
}

/**
 * Renders the current state of the game board.
 * 
 * @param {object} boardEl - Board container DOM element
 * @param {object} state - GameState instance
 * @param {Array<{r: number, c: number}>} validMoves - Valid moves for active player
 * @param {string} orientation - Active wall orientation ('h' or 'v')
 */
function renderBoard(boardEl, state, validMoves, orientation) {
  // 1. Position the Pawns (uses absolute position transitions)
  const p1 = state.players[0];
  const p2 = state.players[1];

  pawn1El.style.left = `calc(${p1.c} * (var(--cell-size) + var(--gap-size)))`;
  pawn1El.style.top = `calc(${p1.r} * (var(--cell-size) + var(--gap-size)))`;

  pawn2El.style.left = `calc(${p2.c} * (var(--cell-size) + var(--gap-size)))`;
  pawn2El.style.top = `calc(${p2.r} * (var(--cell-size) + var(--gap-size)))`;

  // Apply active scaling animations to current turn pawn
  if (state.currentPlayerIdx === 0) {
    pawn1El.classList.add('active-turn');
    pawn2El.classList.remove('active-turn');
  } else {
    pawn2El.classList.add('active-turn');
    pawn1El.classList.remove('active-turn');
  }

  // 2. Highlight Valid Moves
  const cellElements = boardEl.querySelectorAll('.cell');
  cellElements.forEach(cell => {
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    const isValid = validMoves.some(mv => mv.r === r && mv.c === c);
    if (isValid) {
      cell.classList.add('valid-move');
      // Set target highlight style depending on current active player
      cell.style.setProperty('--highlight-color', state.players[state.currentPlayerIdx].color);
    } else {
      cell.classList.remove('valid-move');
      cell.style.removeProperty('--highlight-color');
    }
  });

  // 3. Render Placed Walls
  // First clear previously rendered permanent walls (so we don't duplicate them)
  const oldWalls = boardEl.querySelectorAll('.wall');
  oldWalls.forEach(w => w.remove());

  // Render Horizontal Walls
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.hWalls[r][c]) {
        const wall = document.createElement('div');
        wall.className = 'wall wall-h';
        wall.style.gridRow = `${2 * r + 2}`;
        wall.style.gridColumn = `${2 * c + 1} / span 3`;
        // Color based on which player placed it? (Stored in history or default color)
        // For neutrality, we can color placed walls a crisp steel blue/gray or active player accent
        boardEl.appendChild(wall);
      }
    }
  }

  // Render Vertical Walls
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.vWalls[r][c]) {
        const wall = document.createElement('div');
        wall.className = 'wall wall-v';
        wall.style.gridRow = `${2 * r + 1} / span 3`;
        wall.style.gridColumn = `${2 * c + 2}`;
        boardEl.appendChild(wall);
      }
    }
  }

  // 4. Update Status Dashboard (outside the board but key for UI sync)
  updateStatusPanel(state);
}

/**
 * Updates status widgets (current turn, wall indicators, player names).
 */
function updateStatusPanel(state) {
  // Turn indicator
  const turnIndicator = document.getElementById('turn-indicator');
  const activePlayer = state.players[state.currentPlayerIdx];
  if (turnIndicator) {
    const lang = state.language || 'id';
    const t = window.QuoridorTranslations ? window.QuoridorTranslations[lang] : null;
    
    if (t) {
      if (state.gameMode === 'ai' && state.currentPlayerIdx === 1) {
        turnIndicator.innerText = t.turnAIThinking;
      } else {
        turnIndicator.innerText = state.currentPlayerIdx === 0 ? t.turnP1 : t.turnP2;
      }
    } else {
      turnIndicator.innerText = `${activePlayer.name}'s Turn`;
    }
    turnIndicator.style.color = activePlayer.color;
  }

  // Sync remaining walls
  state.players.forEach(p => {
    const wallCountEl = document.getElementById(`p${p.id}-wall-count`);
    if (wallCountEl) {
      wallCountEl.innerText = p.walls;
    }

    const wallContainerEl = document.getElementById(`p${p.id}-wall-visuals`);
    if (wallContainerEl) {
      wallContainerEl.innerHTML = '';
      // Render small visual lines for remaining walls
      for (let i = 0; i < p.walls; i++) {
        const stick = document.createElement('div');
        stick.className = 'wall-stick';
        stick.style.backgroundColor = p.color;
        wallContainerEl.appendChild(stick);
      }
    }
  });

  // Undo button state
  const undoBtn = document.getElementById('undo-btn');
  if (undoBtn) {
    undoBtn.disabled = state.history.length === 0 || state.winner !== null;
  }
}

/**
 * Shows a preview of a wall being hovered.
 * Color shifts based on validity (Player color = valid, Red = invalid).
 * 
 * @param {object} boardEl - Board container DOM element
 * @param {number} r - Row index (0-7)
 * @param {number} c - Col index (0-7)
 * @param {string} orientation - Wall orientation ('h' or 'v')
 * @param {object} state - GameState instance
 */
function showWallPreview(boardEl, r, c, orientation, state) {
  // Clear any existing preview
  clearWallPreview(boardEl);

  const { canPlaceWall } = window.QuoridorLogic;
  const isValid = canPlaceWall(r, c, orientation, state);
  const activePlayer = state.players[state.currentPlayerIdx];

  const preview = document.createElement('div');
  preview.className = `wall-preview wall-preview-${orientation}`;
  
  if (orientation === 'h') {
    preview.style.gridRow = `${2 * r + 2}`;
    preview.style.gridColumn = `${2 * c + 1} / span 3`;
  } else {
    preview.style.gridRow = `${2 * r + 1} / span 3`;
    preview.style.gridColumn = `${2 * c + 2}`;
  }

  // Stylize color based on validity
  if (isValid) {
    preview.style.setProperty('--preview-color', activePlayer.color);
    preview.classList.add('valid');
  } else {
    preview.style.setProperty('--preview-color', '#ef4444'); // Red for invalid
    preview.classList.add('invalid');
  }

  boardEl.appendChild(preview);
}

/**
 * Removes wall previews from the board.
 */
function clearWallPreview(boardEl) {
  const previews = boardEl.querySelectorAll('.wall-preview');
  previews.forEach(p => p.remove());
}

// Expose board functions globally
window.QuoridorBoard = {
  initBoard,
  renderBoard,
  showWallPreview,
  clearWallPreview
};
