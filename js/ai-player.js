// AI Player - Basic AI move selection and strategy
// Integration with game state and animation triggers

class AIPlayer {
    constructor(gameEngine, uiController) {
        this.gameEngine = gameEngine;
        this.uiController = uiController;
        this.isThinking = false;
    }
    
    makeMove() {
        if (this.gameEngine.gameOver || this.gameEngine.currentPlayer !== 'black' || this.isThinking) {
            return;
        }
        
        const moves = this.gameEngine.getAllValidMoves('black');
        if (moves.length === 0) {
            this.gameEngine.gameOver = true;
            this.uiController.updateDisplay();
            return;
        }
        
        this.isThinking = true;
        
        // AI "thinking" delay - varies based on move complexity
        const thinkingTime = Math.random() * 1500 + 800; // 800-2300ms
        
        // Show AI is thinking
        this.uiController.showAIThinking();
        
        setTimeout(() => {
            const bestMove = this.selectBestMove(moves);
            
            // Store this move as the last AI move for UI highlighting
            this.gameEngine.lastAIMove = {
                from: { row: bestMove.from.row, col: bestMove.from.col },
                to: { row: bestMove.to.row, col: bestMove.to.col }
            };
            
            // Make the move
            const moveResult = this.gameEngine.makeMove(
                bestMove.from.row, 
                bestMove.from.col, 
                bestMove.to.row, 
                bestMove.to.col
            );
            
            // Trigger UI updates and animations
            this.handleMoveResult(moveResult, bestMove);
            
            // Check for game over
            if (this.gameEngine.isCheckmate('white')) {
                this.gameEngine.gameOver = true;
            } else if (this.gameEngine.isStalemate('white')) {
                this.gameEngine.gameOver = true;
            }
            
            this.uiController.updateDisplay();
            this.uiController.updateMoveHistory();
            this.uiController.updateButtonStates();
            
            this.isThinking = false;
        }, thinkingTime);
    }
    
    selectBestMove(moves) {
        // Simple AI with basic strategy
        let bestMove = moves[0];
        let bestScore = -1000;
        
        for (const move of moves) {
            let score = Math.random() * 10; // Base randomness
            
            // Evaluate the move
            score += this.evaluateMove(move);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    evaluateMove(move) {
        let score = 0;
        const targetPiece = this.gameEngine.board[move.to.row][move.to.col];
        const movingPiece = this.gameEngine.board[move.from.row][move.from.col];
        
        // Prefer captures - weighted by piece value
        if (targetPiece) {
            score += this.getPieceValue(targetPiece.type);
        }
        
        // Prefer center control
        if ((move.to.row >= 3 && move.to.row <= 4) && (move.to.col >= 3 && move.to.col <= 4)) {
            score += 10;
        }
        
        // Prefer piece development (moving pieces from back rank)
        if (movingPiece && move.from.row === 0 && (movingPiece.type === 'knight' || movingPiece.type === 'bishop')) {
            score += 15;
        }
        
        // Prefer pawn advancement
        if (movingPiece && movingPiece.type === 'pawn') {
            score += (7 - move.to.row) * 2; // Reward advancing pawns
        }
        
        // Avoid moving the same piece repeatedly (if we have move history)
        if (this.gameEngine.moveHistory.length > 0) {
            const lastMove = this.gameEngine.moveHistory[this.gameEngine.moveHistory.length - 1];
            if (lastMove.player === 'black' && 
                lastMove.to.row === move.from.row && 
                lastMove.to.col === move.from.col) {
                score -= 5; // Small penalty for moving same piece again
            }
        }
        
        // Check if move gives check
        if (this.wouldGiveCheck(move)) {
            score += 20;
        }
        
        // Avoid moving into attack
        if (this.isSquareUnderAttack(move.to.row, move.to.col, 'white')) {
            score -= this.getPieceValue(movingPiece.type) / 2;
        }
        
        return score;
    }
    
    getPieceValue(pieceType) {
        const values = {
            pawn: 10,
            knight: 30,
            bishop: 30,
            rook: 50,
            queen: 90,
            king: 1000
        };
        return values[pieceType] || 0;
    }
    
    wouldGiveCheck(move) {
        // Temporarily make the move
        const originalPiece = this.gameEngine.board[move.to.row][move.to.col];
        const movingPiece = this.gameEngine.board[move.from.row][move.from.col];
        
        this.gameEngine.board[move.to.row][move.to.col] = movingPiece;
        this.gameEngine.board[move.from.row][move.from.col] = null;
        
        const givesCheck = this.gameEngine.isInCheck('white');
        
        // Restore the board
        this.gameEngine.board[move.from.row][move.from.col] = movingPiece;
        this.gameEngine.board[move.to.row][move.to.col] = originalPiece;
        
        return givesCheck;
    }
    
    isSquareUnderAttack(row, col, byColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.gameEngine.board[r][c];
                if (piece && piece.color === byColor) {
                    if (this.gameEngine.isPieceMovementValid(piece, r, c, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    handleMoveResult(moveResult, bestMove) {
        // Trigger particle effects through UI controller
        if (moveResult.capturedPiece) {
            // This would trigger capture particles
            // The particle effects will be handled by the particle effects module
            this.triggerCaptureEffect(bestMove.to.row, bestMove.to.col);
        } else {
            // This would trigger move particles
            this.triggerMoveEffect(bestMove.to.row, bestMove.to.col);
        }
        
        // Highlight the AI's move
        this.uiController.highlightAIMove(
            bestMove.from.row,
            bestMove.from.col,
            bestMove.to.row,
            bestMove.to.col
        );
        
        // Handle pawn promotion effect
        if (moveResult.piece.type === 'pawn' && (bestMove.to.row === 0 || bestMove.to.row === 7)) {
            // Extra sparkles for promotion
            setTimeout(() => {
                this.triggerMoveEffect(bestMove.to.row, bestMove.to.col);
            }, 200);
        }
    }
    
    // These methods will interface with the particle effects module
    triggerMoveEffect(row, col) {
        // This will be called by the particle effects module
        if (window.particleEffects) {
            window.particleEffects.createMoveParticles(row, col);
        }
    }
    
    triggerCaptureEffect(row, col) {
        // This will be called by the particle effects module
        if (window.particleEffects) {
            window.particleEffects.createCaptureParticles(row, col);
        }
    }
    
    // Reset AI state for new game
    reset() {
        this.isThinking = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPlayer;
}