// UI Controller - Board and UI rendering, interactions
// Handles all DOM manipulations and visual updates

class UIController {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.boardElement = document.getElementById('chessBoard');
        this.statusElement = document.getElementById('gameStatus');
        this.historyElement = document.getElementById('moveHistory');
        this.showLastMoveBtn = document.getElementById('showLastMoveBtn');
        
        this.initializeEventListeners();
    }
    
    createBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                this.boardElement.appendChild(square);
            }
        }
    }
    
    updateDisplay() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.gameEngine.board[row][col];
            
            square.innerHTML = '';
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.className = `piece ${piece.color}`;
                pieceElement.textContent = this.gameEngine.pieces[piece.color][piece.type];
                square.appendChild(pieceElement);
            }
        });
        
        this.updateGameStatus();
    }
    
    updateGameStatus() {
        if (this.gameEngine.gameOver) {
            if (this.gameEngine.isCheckmate(this.gameEngine.currentPlayer)) {
                this.statusElement.textContent = `Checkmate! ${this.gameEngine.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
                this.showOverlay('Checkmate', 'checkmate', 3000);
            } else if (this.gameEngine.isStalemate(this.gameEngine.currentPlayer)) {
                this.statusElement.textContent = 'Stalemate! Draw!';
                this.showOverlay('Stalemate', 'checkmate', 3000);
            }
        } else if (this.gameEngine.isInCheck(this.gameEngine.currentPlayer)) {
            this.statusElement.textContent = `${this.gameEngine.currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
            this.highlightKingInCheck();
            this.showOverlay('Check', 'check', 1800);
        } else {
            this.statusElement.textContent = `${this.gameEngine.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
        }
    }
    
    highlightKingInCheck() {
        const kingPosition = this.gameEngine.findKing(this.gameEngine.currentPlayer);
        if (kingPosition) {
            const square = document.querySelector(`[data-row="${kingPosition.row}"][data-col="${kingPosition.col}"]`);
            square.classList.add('check');
        }
    }
    
    clearHighlights() {
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('selected', 'valid-move', 'check', 'ai-from', 'ai-to');
        });
    }
    
    highlightSquare(row, col, className) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add(className);
        }
    }
    
    highlightValidMoves(row, col) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.gameEngine.isValidMove(row, col, r, c)) {
                    const square = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    square.classList.add('valid-move');
                }
            }
        }
    }
    
    highlightAIMove(fromRow, fromCol, toRow, toCol) {
        // Clear any existing AI highlights
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('ai-from', 'ai-to');
        });
        
        const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
        const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        
        if (fromSquare) fromSquare.classList.add('ai-from');
        if (toSquare) toSquare.classList.add('ai-to');
        
        // Remove highlights after animation
        setTimeout(() => {
            if (fromSquare) fromSquare.classList.remove('ai-from');
            if (toSquare) toSquare.classList.remove('ai-to');
        }, 2000);
    }
    
    showLastAIMove() {
        if (!this.gameEngine.lastAIMove) return;
        
        this.clearHighlights();
        this.highlightAIMove(
            this.gameEngine.lastAIMove.from.row,
            this.gameEngine.lastAIMove.from.col,
            this.gameEngine.lastAIMove.to.row,
            this.gameEngine.lastAIMove.to.col
        );
    }
    
    updateMoveHistory() {
        if (this.gameEngine.moveHistory.length === 0) {
            this.historyElement.innerHTML = '<p><em>Move history will appear here...</em></p>';
            return;
        }
        
        let historyHTML = '<div style="font-family: \'Source Sans Pro\', sans-serif; line-height: 1.8; font-size: 0.9rem;">';
        
        for (let i = 0; i < this.gameEngine.moveHistory.length; i++) {
            const move = this.gameEngine.moveHistory[i];
            const moveNumber = Math.floor(i / 2) + 1;
            
            historyHTML += `<div style="margin-bottom: 0.5rem; padding: 0.3rem; background: rgba(255,255,255,0.05); border-radius: 4px; border-left: 3px solid ${move.player === 'white' ? 'rgba(222,184,135,0.6)' : 'rgba(138,43,226,0.6)'};">`;
            historyHTML += `<span style="color: rgba(255,255,255,0.5); font-weight: bold; margin-right: 0.5rem;">${moveNumber}.</span>`;
            historyHTML += `<span style="color: ${move.player === 'white' ? 'rgba(255,255,255,0.9)' : 'rgba(180,120,255,1)'};">${move.notation}</span>`;
            historyHTML += `</div>`;
        }
        
        historyHTML += '</div>';
        this.historyElement.innerHTML = historyHTML;
        
        // Auto-scroll to bottom
        this.historyElement.scrollTop = this.historyElement.scrollHeight;
    }
    
    // Game overlay functions
    showOverlay(text, className = '', duration = 3000) {
        const overlay = document.getElementById('gameOverlay');
        const overlayText = document.getElementById('overlayText');
        
        overlayText.textContent = text;
        overlayText.className = `overlay-text ${className}`;
        overlay.classList.add('show');
        
        if (duration > 0) {
            setTimeout(() => {
                overlay.classList.remove('show');
            }, duration);
        }
    }
    
    hideOverlay() {
        const overlay = document.getElementById('gameOverlay');
        overlay.classList.remove('show');
    }
    
    showBeginGameOverlay() {
        setTimeout(() => {
            this.showOverlay('Begin Game', 'begin', 2500);
        }, 500);
    }
    
    updateButtonStates() {
        // Enable/disable show last move button
        if (this.showLastMoveBtn) {
            this.showLastMoveBtn.disabled = !this.gameEngine.lastAIMove;
        }
    }
    
    showAIThinking() {
        this.statusElement.textContent = "AI is thinking...";
    }
    
    // Initialize event listeners for UI elements
    initializeEventListeners() {
        // Back to top functionality
        const topButton = document.getElementById('scrollTop');
        if (topButton) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    topButton.classList.add('show');
                } else {
                    topButton.classList.remove('show');
                }
            });
            
            topButton.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // Mobile menu functionality
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const navLinks = document.getElementById('navLinks');
        
        if (mobileMenuButton && navLinks) {
            mobileMenuButton.addEventListener('click', () => {
                navLinks.classList.toggle('open');
                
                // Update button text and icon
                if (navLinks.classList.contains('open')) {
                    mobileMenuButton.textContent = '✕ Close';
                } else {
                    mobileMenuButton.textContent = '☰ Menu';
                }
            });
            
            // Close mobile menu when clicking on a link
            navLinks.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    navLinks.classList.remove('open');
                    mobileMenuButton.textContent = '☰ Menu';
                }
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav')) {
                    navLinks.classList.remove('open');
                    mobileMenuButton.textContent = '☰ Menu';
                }
            });
        }
        
        // Enhanced parallax effect for mist
        let ticking = false;
        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            const mistOverlay = document.querySelector('.mist-overlay');
            if (mistOverlay) {
                mistOverlay.style.transform = `translateY(${rate}px)`;
            }
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }
    
    // Initialize the UI
    init() {
        this.createBoard();
        this.updateDisplay();
        this.updateMoveHistory();
        this.updateButtonStates();
        this.showBeginGameOverlay();
    }
    
    // Reset UI for new game
    reset() {
        this.hideOverlay();
        this.clearHighlights();
        this.updateDisplay();
        this.updateMoveHistory();
        this.updateButtonStates();
        this.showBeginGameOverlay();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}