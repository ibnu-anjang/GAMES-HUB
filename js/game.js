// Game dependencies are loaded globally by preceding script tags in index.html

const TRANSLATIONS = {
  id: {
    title: "QUORIDOR",
    subtitle: "Game Papan Digital Strategi & Pemblokiran",
    gameSetup: "Pengaturan Game",
    gameMode: "Mode Game",
    pvp: "Pemain vs Pemain (Lokal)",
    pvAI: "Pemain vs AI (Komputer)",
    aiDifficulty: "Kesulitan AI",
    smartAI: "AI Pintar (Blokir Jalan)",
    easyAI: "AI Mudah (Santai)",
    wallSetup: "Pengaturan Pagar",
    orientation: "Orientasi",
    rotateWall: "Putar Pagar",
    shortcutText: "Pintasan: <strong>Space</strong>, <strong>R</strong>, atau <strong>Klik Kanan</strong>",
    undoBtn: "Urungkan Langkah",
    restartBtn: "Ulangi Game",
    rulesTitle: "Aturan Quoridor",
    ruleGoal: "<strong>Tujuan:</strong> Capai baris paling luar di sisi lawan terlebih dahulu.",
    ruleMove: "<strong>Gerakan:</strong> Melangkah 1 kotak secara horizontal atau vertikal.",
    ruleJump: "<strong>Lompatan:</strong> Lompat jika ada lawan di depan. Jika terhalang pagar, Anda bisa melompat secara diagonal.",
    ruleWall: "<strong>Pagar:</strong> Memasang pagar akan memblokir jalan. <strong>Penting:</strong> Anda tidak boleh menutup jalan keluar terakhir lawan.",
    victory: "Kemenangan!",
    gameOver: "Game Selesai",
    playAgain: "Main Lagi",
    turnP1: "Giliran Player 1",
    turnP2: "Giliran Player 2",
    turnAIThinking: "AI sedang berpikir...",
    winP1: "Player 1 memenangkan pertandingan! Selamat!",
    winP2: "Player 2 memenangkan pertandingan! Selamat!",
    winAI: "AI memenangkan game! Coba lagi lain kali.",
    p1Name: "♟️ Player 1 (Bawah)",
    p2Name: "🧙‍♂️ Player 2 (Atas)"
  },
  en: {
    title: "QUORIDOR",
    subtitle: "Digital Board Game of Strategy & Blocking",
    gameSetup: "Game Setup",
    gameMode: "Game Mode",
    pvp: "Player vs Player (Local)",
    pvAI: "Player vs AI (Computer)",
    aiDifficulty: "AI Difficulty",
    smartAI: "Smart AI (Path blocking)",
    easyAI: "Easy AI (Casual)",
    wallSetup: "Wall Setup",
    orientation: "Orientation",
    rotateWall: "Rotate Wall",
    shortcutText: "Shortcut: <strong>Space</strong>, <strong>R</strong>, or <strong>Right-Click</strong>",
    undoBtn: "Undo Move",
    restartBtn: "Restart Match",
    rulesTitle: "Quoridor Rules",
    ruleGoal: "<strong>Goal:</strong> Reach the opposite outer row before your opponent does.",
    ruleMove: "<strong>Moves:</strong> Walk 1 cell horizontally or vertically.",
    ruleJump: "<strong>Jumps:</strong> Jump over opponent pawns. If the jump is blocked by a wall, you can jump diagonally.",
    ruleWall: "<strong>Walls:</strong> Placing a wall blocks paths. <strong>Crucial:</strong> You cannot block a player's last remaining path.",
    victory: "Victory!",
    gameOver: "Game Over",
    playAgain: "Play Again",
    turnP1: "Player 1's Turn",
    turnP2: "Player 2's Turn",
    turnAIThinking: "AI is thinking...",
    winP1: "Player 1 wins the match! Congratulations!",
    winP2: "Player 2 wins the match! Congratulations!",
    winAI: "The AI won the game! Better luck next time.",
    p1Name: "♟️ Player 1 (Bottom)",
    p2Name: "🧙‍♂️ Player 2 (Top)"
  }
};

window.QuoridorTranslations = TRANSLATIONS;

// Game state instance
let state = new GameState();

// UI State
let activeOrientation = 'h'; // 'h' or 'v'
let isInteractionBlocked = false; // Prevents moves during AI turn or game over
let currentHoverIntersect = null; // Track currently hovered intersection for re-previews

// DOM Elements
let boardEl;
let restartBtn;
let undoBtn;
let toggleOrientationBtn;
let orientationBadge;
let gameModeSelect;
let difficultySelect;
let difficultyGroup;
let winModal;
let winMessage;
let playAgainBtn;

/**
 * Initializes the game application.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Bind DOM elements
  boardEl = document.getElementById('game-board');
  restartBtn = document.getElementById('restart-btn');
  undoBtn = document.getElementById('undo-btn');
  toggleOrientationBtn = document.getElementById('toggle-orientation-btn');
  orientationBadge = document.getElementById('orientation-badge');
  gameModeSelect = document.getElementById('game-mode-select');
  difficultySelect = document.getElementById('difficulty-select');
  difficultyGroup = document.getElementById('difficulty-group');
  winModal = document.getElementById('win-modal');
  winMessage = document.getElementById('win-message');
  playAgainBtn = document.getElementById('play-again-btn');

  // Set up event listeners
  restartBtn.addEventListener('click', restartGame);
  undoBtn.addEventListener('click', handleUndo);
  toggleOrientationBtn.addEventListener('click', toggleOrientation);
  playAgainBtn.addEventListener('click', () => {
    hideWinModal();
    restartGame();
  });

  // Handle right-click on board to rotate orientation
  boardEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    toggleOrientation();
  });

  // Handle Keyboard shortcuts: 'Space' or 'R' to rotate, and WASD/Arrows to move pawn
  window.addEventListener('keydown', (e) => {
    // 1. Rotate orientation shortcuts
    if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
      if (e.code === 'Space') {
        e.preventDefault();
      }
      toggleOrientation();
      return;
    }

    // 2. Keyboard movements (WASD and Arrow keys)
    if (isInteractionBlocked || state.winner) return;
    
    // If AI's turn, do not allow human moves
    if (state.gameMode === 'ai' && state.currentPlayerIdx === 1) return;

    let dr = 0;
    let dc = 0;
    let isMoveKey = false;

    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        dr = -1;
        dc = 0;
        isMoveKey = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        dr = 1;
        dc = 0;
        isMoveKey = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        dr = 0;
        dc = -1;
        isMoveKey = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        dr = 0;
        dc = 1;
        isMoveKey = true;
        break;
    }

    if (isMoveKey) {
      e.preventDefault(); // Prevent page scroll on arrows
      
      const validMoves = getValidMoves(state.currentPlayerIdx, state);
      const player = state.players[state.currentPlayerIdx];

      let bestMove = null;
      let maxScore = -Infinity;

      for (const mv of validMoves) {
        // Calculate score for this move based on direction matching
        const dot = (mv.r - player.r) * dr + (mv.c - player.c) * dc;
        const score = dot - Math.abs((mv.r - player.r) * dc) - Math.abs((mv.c - player.c) * dr);

        if (score >= 0 && score > maxScore) {
          maxScore = score;
          bestMove = mv;
        }
      }

      if (bestMove) {
        handleCellClick(bestMove.r, bestMove.c);
      }
    }
  });

  // Handle settings changes
  const languageSelect = document.getElementById('language-select');
  languageSelect.addEventListener('change', (e) => {
    state.language = e.target.value;
    applyLanguage();
  });

  gameModeSelect.addEventListener('change', (e) => {
    state.gameMode = e.target.value;
    if (state.gameMode === 'ai') {
      difficultyGroup.classList.remove('hidden');
    } else {
      difficultyGroup.classList.add('hidden');
    }
    restartGame();
  });

  difficultySelect.addEventListener('change', (e) => {
    state.aiDifficulty = e.target.value;
  });

  // Set up the board interaction event handlers
  initBoard(
    boardEl,
    handleCellClick,
    handleIntersectionHover,
    handleIntersectionClick,
    handleIntersectionMouseLeave
  );

  // Initial setup
  restartGame();
});

/**
 * Starts a new game.
 */
function restartGame() {
  state.reset();
  // Fetch current select values in case they differ from defaults
  state.gameMode = gameModeSelect.value;
  state.aiDifficulty = difficultySelect.value;
  state.language = document.getElementById('language-select').value;

  isInteractionBlocked = false;
  currentHoverIntersect = null;
  clearWallPreview(boardEl);
  hideWinModal();

  applyLanguage();
}

/**
 * Toggles the current wall placement orientation.
 */
function toggleOrientation() {
  if (isInteractionBlocked || state.winner) return;
  activeOrientation = activeOrientation === 'h' ? 'v' : 'h';
  
  if (orientationBadge) {
    orientationBadge.innerText = activeOrientation === 'h' ? 'Horizontal (H)' : 'Vertical (V)';
  }

  // Update wall preview in real time if currently hovering
  if (currentHoverIntersect) {
    showWallPreview(boardEl, currentHoverIntersect.r, currentHoverIntersect.c, activeOrientation, state);
  }
}

/**
 * Handles cell click events (moving pawns).
 */
function handleCellClick(r, c) {
  if (isInteractionBlocked || state.winner) return;

  const validMoves = getValidMoves(state.currentPlayerIdx, state);
  const isValid = validMoves.some(mv => mv.r === r && mv.c === c);

  if (isValid) {
    // Save to undo history before making the move
    state.saveToHistory();

    const player = state.players[state.currentPlayerIdx];
    player.r = r;
    player.c = c;

    // Check if player won
    if (player.r === player.targetRow) {
      handleGameOver(state.currentPlayerIdx);
      return;
    }

    // Pass turn
    advanceTurn();
  }
}

/**
 * Handles mouse entering an intersection point (wall preview).
 */
function handleIntersectionHover(r, c) {
  if (isInteractionBlocked || state.winner) return;
  currentHoverIntersect = { r, c };
  showWallPreview(boardEl, r, c, activeOrientation, state);
}

/**
 * Handles mouse leaving an intersection.
 */
function handleIntersectionMouseLeave(r, c) {
  if (isInteractionBlocked || state.winner) return;
  currentHoverIntersect = null;
  clearWallPreview(boardEl);
}

/**
 * Handles click on intersection (placing a wall).
 */
function handleIntersectionClick(r, c) {
  if (isInteractionBlocked || state.winner) return;

  if (canPlaceWall(r, c, activeOrientation, state)) {
    // Save state before placement
    state.saveToHistory();

    const player = state.players[state.currentPlayerIdx];
    player.walls--;

    if (activeOrientation === 'h') {
      state.hWalls[r][c] = true;
    } else {
      state.vWalls[r][c] = true;
    }

    clearWallPreview(boardEl);
    currentHoverIntersect = null;

    advanceTurn();
  } else {
    // Play a micro-animation or shake effect if placement is blocked
    boardEl.classList.add('shake');
    setTimeout(() => boardEl.classList.remove('shake'), 400);
  }
}

/**
 * Transitions turns and handles AI execution if AI is active.
 */
function advanceTurn() {
  state.currentPlayerIdx = 1 - state.currentPlayerIdx;
  
  const validMoves = getValidMoves(state.currentPlayerIdx, state);
  renderBoard(boardEl, state, validMoves, activeOrientation);

  // Run AI turn if gameMode is AI and current player is AI (Player 2)
  if (state.gameMode === 'ai' && state.currentPlayerIdx === 1 && !state.winner) {
    runAITurn();
  }
}

/**
 * Executes the AI player's turn with a realistic thinking delay.
 */
function runAITurn() {
  isInteractionBlocked = true;

  // Visual cues for AI thinking are updated in board.js render pass

  setTimeout(() => {
    // Check if player clicked restart or undo while AI was thinking
    if (!isInteractionBlocked || state.winner) return;

    const action = getAIMove(state);
    
    // Save to history before executing
    state.saveToHistory();

    if (action.type === 'move') {
      const aiPlayer = state.players[1];
      aiPlayer.r = action.r;
      aiPlayer.c = action.c;

      if (aiPlayer.r === aiPlayer.targetRow) {
        handleGameOver(1);
        return;
      }
    } else if (action.type === 'wall') {
      const aiPlayer = state.players[1];
      aiPlayer.walls--;

      if (action.orientation === 'h') {
        state.hWalls[action.r][action.c] = true;
      } else {
        state.vWalls[action.r][action.c] = true;
      }
    }

    isInteractionBlocked = false;
    advanceTurn();
  }, 750); // 750ms delay for natural flow
}

/**
 * Handles undo clicks.
 */
function handleUndo() {
  if (state.winner) return; // Cannot undo after game ends

  // In AI mode, we must undo twice so the player gets their turn back!
  if (state.gameMode === 'ai') {
    // Undo AI's turn
    const undoneAI = state.undo();
    // Undo Player's turn
    const undonePlayer = state.undo();
    
    if (undoneAI || undonePlayer) {
      isInteractionBlocked = false;
      clearWallPreview(boardEl);
      const validMoves = getValidMoves(state.currentPlayerIdx, state);
      renderBoard(boardEl, state, validMoves, activeOrientation);
    }
  } else {
    // PVP mode: Undo once
    if (state.undo()) {
      isInteractionBlocked = false;
      clearWallPreview(boardEl);
      const validMoves = getValidMoves(state.currentPlayerIdx, state);
      renderBoard(boardEl, state, validMoves, activeOrientation);
    }
  }
}

/**
 * Declares the winner and shows the game over dialog.
 */
function handleGameOver(winnerIdx) {
  state.winner = winnerIdx;
  const winner = state.players[winnerIdx];

  isInteractionBlocked = true;
  clearWallPreview(boardEl);
  renderBoard(boardEl, state, [], activeOrientation);

  // Show win modal
  setTimeout(() => {
    if (winMessage) {
      const t = TRANSLATIONS[state.language];
      if (state.gameMode === 'ai' && winnerIdx === 1) {
        winMessage.innerText = t.winAI;
      } else {
        winMessage.innerText = winnerIdx === 0 ? t.winP1 : t.winP2;
      }
      winMessage.style.color = winner.color;
    }
    showWinModal();
  }, 500);
}

function showWinModal() {
  if (winModal) {
    winModal.classList.remove('hidden');
    winModal.classList.add('flex');
  }
}

function hideWinModal() {
  if (winModal) {
    winModal.classList.add('hidden');
    winModal.classList.remove('flex');
  }
}

/**
 * Applies the current language settings to all UI elements.
 */
function applyLanguage() {
  const lang = state.language;
  const t = TRANSLATIONS[lang];

  // Update DOM texts
  document.querySelector('header h1').innerText = t.title;
  document.querySelector('header p.subtitle').innerText = t.subtitle;
  document.querySelector('#lbl-language').innerText = lang === 'id' ? 'Bahasa / Language' : 'Language / Bahasa';
  
  // Settings labels
  document.querySelector('#game-mode-select').previousElementSibling.innerText = t.gameMode;
  document.querySelector('#difficulty-select').previousElementSibling.innerText = t.aiDifficulty;
  
  // Select options
  document.querySelector('#game-mode-select option[value="pvp"]').innerText = t.pvp;
  document.querySelector('#game-mode-select option[value="ai"]').innerText = t.pvAI;
  document.querySelector('#difficulty-select option[value="smart"]').innerText = t.smartAI;
  document.querySelector('#difficulty-select option[value="easy"]').innerText = t.easyAI;
  
  // Panel titles
  const panelTitles = document.querySelectorAll('.panel-title');
  panelTitles[0].innerHTML = `⚙️ ${t.gameSetup}`;
  panelTitles[1].innerHTML = `🧱 ${t.wallSetup}`;
  panelTitles[2].innerHTML = `${t.rulesTitle}`;
  
  // Wall labels
  document.querySelector('#toggle-orientation-btn').previousElementSibling.previousElementSibling.innerText = t.orientation;
  document.querySelector('#toggle-orientation-btn').innerText = `🔄 ${t.rotateWall}`;
  document.querySelector('#toggle-orientation-btn').nextElementSibling.innerHTML = t.shortcutText;
  
  // Action buttons
  document.getElementById('undo-btn').innerText = `↩️ ${t.undoBtn}`;
  document.getElementById('restart-btn').innerText = `🔁 ${t.restartBtn}`;
  
  // Rules
  const rulesList = document.querySelector('.rules-list');
  rulesList.innerHTML = `
    <li>${t.ruleGoal}</li>
    <li>${t.ruleMove}</li>
    <li>${t.ruleJump}</li>
    <li>${t.ruleWall}</li>
  `;
  
  // Player names
  document.querySelector('.status-card[style*="#6366f1"] .player-name').innerText = t.p1Name;
  document.querySelector('.status-card[style*="#f43f5e"] .player-name').innerText = t.p2Name;
  
  // Modal texts
  document.querySelector('.modal-title').innerText = t.victory;
  document.getElementById('play-again-btn').innerText = t.playAgain;

  // Sync state values
  state.players[0].name = lang === 'id' ? "Player 1" : "Player 1";
  state.players[1].name = lang === 'id' ? "Player 2" : "Player 2";
  
  // Trigger board rendering
  const validMoves = getValidMoves(state.currentPlayerIdx, state);
  renderBoard(boardEl, state, validMoves, activeOrientation);
}
