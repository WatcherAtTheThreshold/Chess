// Main.js - Entry point and module coordinator
// Orchestrates all modules and handles game controls

// Module instances
let gameEngine;
let uiController;
let aiPlayer;
let particleEffects;
let audioManager;

// Game state
let gameState = {
    initialized: false,
    playerTurn: true,
    difficulty: 'novice' // Default difficulty level
};

// Initialize all modules and set up the game
function initializeGame() {
    try {
        // Initialize core modules
        gameEngine = new ChessGame();
        uiController = new UIController(gameEngine);
        aiPlayer = new AIPlayer(gameEngine, uiController);
        particleEffects = new ParticleEffects();
        audioManager = new AudioManager();
        
        // Make particle effects globally available for other modules
        window.particleEffects = particleEffects;
        
        // Set up board click handling
        setupBoardInteraction();
        
        // Initialize UI
        uiController.init();
        
        // Set up game control button listeners
        setupGameControls();
        
        // Set up difficulty button listeners
        setupDifficultyControls();
        
        // Add difficulty indicator to UI
        addDifficultyIndicator();
        
        gameState.initialized = true;
        console.log('Chess game initialized successfully with difficulty:', gameState.difficulty);
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        handleGameError(error);
    }
}

// Add permanent difficulty indicator to the UI
function addDifficultyIndicator() {
    const gameStatus = document.getElementById('gameStatus');
    if (!gameStatus) return;
    
    // Create container for status and difficulty indicator
    const statusContainer = document.createElement('div');
    statusContainer.className = 'game-status-container';
    
    // Create difficulty indicator
    const difficultyIndicator = document.createElement('div');
    difficultyIndicator.id = 'difficultyIndicator';
    difficultyIndicator.className = `difficulty-indicator ${gameState.difficulty}`;
    
    // Get difficulty display info
    const difficultyInfo = getDifficultyDisplayInfo(gameState.difficulty);
    difficultyIndicator.innerHTML = `${difficultyInfo.icon} ${difficultyInfo.name}`;
    
    // Restructure the DOM
    const parent = gameStatus.parentNode;
    parent.insertBefore(statusContainer, gameStatus);
    statusContainer.appendChild(gameStatus);
    statusContainer.appendChild(difficultyIndicator);
    
    console.log('Difficulty indicator added to UI');
}

// Get difficulty display information
function getDifficultyDisplayInfo(difficulty) {
    const difficultyMap = {
        'novice': { name: 'Novice', icon: '🛡️' },
        'knight': { name: 'Knight', icon: '⚔️' },
        'grandmaster': { name: 'Grandmaster', icon: '👑' }
    };
    return difficultyMap[difficulty] || difficultyMap.novice;
}

// Set up difficulty button controls
function setupDifficultyControls() {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    if (difficultyButtons.length === 0) {
        console.warn('No difficulty buttons found');
        return;
    }
    
    // Add click listeners to all difficulty buttons
    difficultyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const difficulty = e.target.dataset.difficulty;
            if (difficulty) {
                changeDifficulty(difficulty);
            }
        });
    });
    
    // Set initial difficulty display
    updateDifficultyDisplay(gameState.difficulty);
    
    console.log('Difficulty controls initialized with default:', gameState.difficulty);
}

// Change difficulty and update UI
function changeDifficulty(newDifficulty) {
    const validDifficulties = ['novice', 'knight', 'grandmaster'];
    
    if (!validDifficulties.includes(newDifficulty)) {
        console.error('Invalid difficulty:', newDifficulty);
        return;
    }
    
    const oldDifficulty = gameState.difficulty;
    
    // Only change if different
    if (oldDifficulty === newDifficulty) {
        console.log('Difficulty already set to:', newDifficulty);
        return;
    }
    
    gameState.difficulty = newDifficulty;
    
    // Ensure AI is properly updated
    if (aiPlayer) {
        if (aiPlayer.setDifficulty) {
            aiPlayer.setDifficulty(newDifficulty);
            console.log('AI difficulty updated to:', newDifficulty);
        } else {
            console.warn('AI setDifficulty method not available');
        }
    }
    
    // Update visual displays
    updateDifficultyDisplay(newDifficulty);
    updateDifficultyIndicator(newDifficulty);
    
    // Show feedback message
    showDifficultyChangeMessage(newDifficulty, oldDifficulty);
    
    console.log(`Difficulty changed from ${oldDifficulty} to ${newDifficulty}`);
}

// Update difficulty button visual states
function updateDifficultyDisplay(activeDifficulty) {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    difficultyButtons.forEach(button => {
        const buttonDifficulty = button.dataset.difficulty;
        
        if (buttonDifficulty === activeDifficulty) {
            button.classList.add('active');
            console.log('Activated difficulty button:', buttonDifficulty);
        } else {
            button.classList.remove('active');
        }
    });
}

// Update the permanent difficulty indicator
function updateDifficultyIndicator(difficulty) {
    const indicator = document.getElementById('difficultyIndicator');
    if (!indicator) return;
    
    // Remove old difficulty classes
    indicator.classList.remove('novice', 'knight', 'grandmaster');
    
    // Add new difficulty class
    indicator.classList.add(difficulty);
    
    // Update content
    const difficultyInfo = getDifficultyDisplayInfo(difficulty);
    indicator.innerHTML = `${difficultyInfo.icon} ${difficultyInfo.name}`;
    
    console.log('Difficulty indicator updated to:', difficulty);
}

// Show a brief message when difficulty changes
function showDifficultyChangeMessage(newDifficulty, oldDifficulty) {
    const statusElement = document.getElementById('gameStatus');
    if (!statusElement) return;
    
    const originalText = statusElement.textContent;
    const difficultyInfo = getDifficultyDisplayInfo(newDifficulty);
    
    // Show difficulty change message
    statusElement.textContent = `Switched to ${difficultyInfo.icon} ${difficultyInfo.name} difficulty`;
    statusElement.style.color = getDifficultyColor(newDifficulty);
    
    // Restore original message after 2.5 seconds
    setTimeout(() => {
        statusElement.textContent = originalText;
        statusElement.style.color = ''; // Reset to default color
    }, 2500);
}

// Get theme color for each difficulty
function getDifficultyColor(difficulty) {
    const colors = {
        'novice': 'rgba(76, 175, 80, 1)',
        'knight': 'rgba(255, 152, 0, 1)',
        'grandmaster': 'rgba(233, 30, 99, 1)'
    };
    return colors[difficulty] || '';
}

// Get current difficulty (for AI and other modules to use)
function getCurrentDifficulty() {
    console.log('Current difficulty requested:', gameState.difficulty);
    return gameState.difficulty;
}

// Force refresh difficulty across all systems (debugging helper)
function refreshDifficulty() {
    const currentDifficulty = gameState.difficulty;
    console.log('Refreshing difficulty systems with:', currentDifficulty);
    
    // Re-apply to AI
    if (aiPlayer && aiPlayer.setDifficulty) {
        aiPlayer.setDifficulty(currentDifficulty);
    }
    
    // Re-apply to UI
    updateDifficultyDisplay(currentDifficulty);
    updateDifficultyIndicator(currentDifficulty);
}

// Set up board square click interactions
function setupBoardInteraction() {
    const boardElement = document.getElementById('chessBoard');
    if (!boardElement) return;
    
    // Use event delegation for better performance
    boardElement.addEventListener('click', (e) => {
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        handleSquareClick(row, col);
    });
}

// Handle square click with full game logic
function handleSquareClick(row, col) {
    if (gameEngine.gameOver || gameEngine.currentPlayer === 'black') return;
    
    // Clear previous highlights
    uiController.clearHighlights();
    
    const piece = gameEngine.board[row][col];
    
    if (gameEngine.selectedSquare) {
        const selectedRow = gameEngine.selectedSquare.row;
        const selectedCol = gameEngine.selectedSquare.col;
        
        if (row === selectedRow && col === selectedCol) {
            // Deselect current square
            gameEngine.selectedSquare = null;
            uiController.updateDisplay();
            return;
        }
        
        if (gameEngine.isValidMove(selectedRow, selectedCol, row, col)) {
            makePlayerMove(selectedRow, selectedCol, row, col);
            return;
        }
    }
    
    if (piece && piece.color === gameEngine.currentPlayer) {
        gameEngine.selectedSquare = { row, col };
        uiController.highlightSquare(row, col, 'selected');
        uiController.highlightValidMoves(row, col);
    }
}

// Execute a player move and handle consequences
function makePlayerMove(fromRow, fromCol, toRow, toCol) {
    try {
        // Check if it's a capture or special move for particle effects
        const capturedPiece = gameEngine.board[toRow][toCol];
        const movingPiece = gameEngine.board[fromRow][fromCol];
        
        // Make the move
        const moveResult = gameEngine.makeMove(fromRow, fromCol, toRow, toCol);
        gameEngine.selectedSquare = null;
        
        // Trigger appropriate particle effects
        if (capturedPiece) {
            particleEffects.createCaptureParticles(toRow, toCol);
        } else {
            particleEffects.createMoveParticles(toRow, toCol);
        }
        
        // Handle pawn promotion with extra effects
        if (movingPiece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            setTimeout(() => {
                particleEffects.createMoveParticles(toRow, toCol);
            }, 200);
        }
        
        // Check for game over
        if (gameEngine.isCheckmate('black')) {
            gameEngine.gameOver = true;
            particleEffects.createCheckmateExplosion();
        } else if (gameEngine.isStalemate('black')) {
            gameEngine.gameOver = true;
        } else {
            // Schedule AI move - ensure difficulty is maintained
            setTimeout(() => {
                // Double-check AI difficulty before move
                if (aiPlayer && aiPlayer.setDifficulty) {
                    aiPlayer.setDifficulty(gameState.difficulty);
                }
                aiPlayer.makeMove();
            }, 500);
        }
        
        // Update UI
        uiController.updateDisplay();
        uiController.updateMoveHistory();
        
    } catch (error) {
        console.error('Error making player move:', error);
        handleGameError(error);
    }
}

// Set up game control buttons
function setupGameControls() {
    // New Game button
    const newGameBtn = document.getElementById('newGameBtn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', newGame);
    }
    
    // Undo Move button
    const undoBtn = document.getElementById('undoMoveBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', undoMove);
    }
    
    // Show Last Move button
    const showLastMoveBtn = document.getElementById('showLastMoveBtn');
    if (showLastMoveBtn) {
        showLastMoveBtn.addEventListener('click', showLastAIMove);
    }
    
    // Legacy support - remove any existing onclick attributes and replace with proper listeners
    const legacyNewGameBtn = document.querySelector('button[onclick*="newGame"]');
    if (legacyNewGameBtn) {
        legacyNewGameBtn.removeAttribute('onclick');
        legacyNewGameBtn.addEventListener('click', newGame);
    }
    
    const legacyUndoBtn = document.querySelector('button[onclick*="undoMove"]');
    if (legacyUndoBtn) {
        legacyUndoBtn.removeAttribute('onclick');
        legacyUndoBtn.addEventListener('click', undoMove);
    }
    
    const legacyShowLastMoveBtn = document.querySelector('button[onclick*="showLastAIMove"]');
    if (legacyShowLastMoveBtn) {
        legacyShowLastMoveBtn.removeAttribute('onclick');
        legacyShowLastMoveBtn.addEventListener('click', showLastAIMove);
    }
}

// Game control functions
function newGame() {
    try {
        // Clear any existing particle effects
        particleEffects.clearAllParticles();
        
        // Reset all modules
        gameEngine.reset();
        uiController.reset();
        aiPlayer.reset();
        
        // IMPORTANT: Re-apply difficulty after reset
        const currentDifficulty = gameState.difficulty;
        if (aiPlayer && aiPlayer.setDifficulty) {
            aiPlayer.setDifficulty(currentDifficulty);
            console.log('Difficulty re-applied after new game:', currentDifficulty);
        }
        
        // Reset game state (but preserve difficulty)
        gameState.playerTurn = true;
        
        // Refresh difficulty display
        refreshDifficulty();
        
        console.log('New game started with difficulty:', gameState.difficulty);
        
    } catch (error) {
        console.error('Error starting new game:', error);
        handleGameError(error);
    }
}

function undoMove() {
    try {
        if (gameEngine.moveHistory.length >= 2) {
            // Undo last two moves (player + AI)
            for (let i = 0; i < 2; i++) {
                const lastMove = gameEngine.moveHistory.pop();
                if (lastMove) {
                    gameEngine.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
                    gameEngine.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
                    gameEngine.currentPlayer = gameEngine.currentPlayer === 'white' ? 'black' : 'white';
                }
            }
            
            // Clear the last AI move since we undid it
            gameEngine.lastAIMove = null;
            gameEngine.gameOver = false;
            
            // Ensure difficulty is maintained after undo
            refreshDifficulty();
            
            // Update UI
            uiController.updateDisplay();
            uiController.updateMoveHistory();
            uiController.updateButtonStates();
            
            console.log('Move undone, difficulty maintained:', gameState.difficulty);
        }
    } catch (error) {
        console.error('Error undoing move:', error);
        handleGameError(error);
    }
}

function showLastAIMove() {
    try {
        if (uiController) {
            uiController.showLastAIMove();
        }
    } catch (error) {
        console.error('Error showing last AI move:', error);
        handleGameError(error);
    }
}

// Error handling
function handleGameError(error) {
    console.error('Game error:', error);
    
    // Show user-friendly error message
    const statusElement = document.getElementById('gameStatus');
    if (statusElement) {
        statusElement.textContent = 'An error occurred. Please refresh the page.';
        statusElement.style.color = '#e74c3c';
    }
    
    // Could add more sophisticated error recovery here
    // For example: attempt to restore from a previous game state
}

// Legacy function support for any remaining onclick attributes
window.newGame = newGame;
window.undoMove = undoMove;
window.showLastAIMove = showLastAIMove;

// Export difficulty functions for other modules to use
window.getCurrentDifficulty = getCurrentDifficulty;
window.changeDifficulty = changeDifficulty;
window.refreshDifficulty = refreshDifficulty; // For debugging

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are loaded
    setTimeout(initializeGame, 100);
});

// Also initialize immediately if DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Document still loading, wait for DOMContentLoaded
} else {
    // Document already loaded
    setTimeout(initializeGame, 100);
}

// Export modules for debugging/testing (optional)
window.gameModules = {
    gameEngine: () => gameEngine,
    uiController: () => uiController,
    aiPlayer: () => aiPlayer,
    particleEffects: () => particleEffects,
    audioManager: () => audioManager,
    gameState: () => gameState
};
