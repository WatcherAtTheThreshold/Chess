// Audio Manager - Music control and sound effects
// Self-contained audio events and controls

class AudioManager {
    constructor() {
        this.musicPlaying = false;
        this.chessMusic = document.getElementById('chessMusic');
        this.musicToggle = document.getElementById('musicToggle');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        this.initializeControls();
        this.setInitialVolume();
    }
    
    initializeControls() {
        // Set up music toggle button
        if (this.musicToggle) {
            this.musicToggle.addEventListener('click', () => this.toggleMusic());
        }
        
        // Set up volume slider
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
            this.volumeSlider.addEventListener('change', (e) => this.setVolume(e.target.value));
        }
        
        // Handle audio events
        if (this.chessMusic) {
            this.chessMusic.addEventListener('ended', () => this.onMusicEnded());
            this.chessMusic.addEventListener('error', () => this.onMusicError());
        }
    }
    
    setInitialVolume() {
        if (this.chessMusic) {
            this.chessMusic.volume = 0.3; // 30% volume by default
        }
        if (this.volumeSlider) {
            this.volumeSlider.value = 30;
        }
    }
    
    toggleMusic() {
        if (!this.chessMusic) return;
        
        if (this.musicPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }
    
    playMusic() {
        if (!this.chessMusic) return;
        
        this.chessMusic.play().then(() => {
            this.musicPlaying = true;
            this.updateMusicButton('🎵 Pause Music', true);
        }).catch(error => {
            console.log('Could not play audio:', error);
            this.updateMusicButton('🎵 Music Unavailable', false);
        });
    }
    
    pauseMusic() {
        if (!this.chessMusic) return;
        
        this.chessMusic.pause();
        this.musicPlaying = false;
        this.updateMusicButton('🎵 Play Echoes of the Board', false);
    }
    
    updateMusicButton(text, isPlaying) {
        if (!this.musicToggle) return;
        
        this.musicToggle.textContent = text;
        
        if (isPlaying) {
            this.musicToggle.classList.add('playing');
        } else {
            this.musicToggle.classList.remove('playing');
        }
    }
    
    setVolume(value) {
        if (!this.chessMusic) return;
        
        const volume = Math.max(0, Math.min(100, parseInt(value))) / 100;
        this.chessMusic.volume = volume;
        
        // Update slider if called programmatically
        if (this.volumeSlider && this.volumeSlider.value != value) {
            this.volumeSlider.value = value;
        }
    }
    
    getVolume() {
        return this.chessMusic ? this.chessMusic.volume * 100 : 0;
    }
    
    onMusicEnded() {
        // Music loop is handled by HTML loop attribute
        // This is here for future sound effect handling
    }
    
    onMusicError() {
        console.log('Audio error occurred');
        this.musicPlaying = false;
        this.updateMusicButton('🎵 Music Unavailable', false);
    }
    
    // Fade music in/out (for future use)
    fadeIn(duration = 1000) {
        if (!this.chessMusic) return;
        
        const targetVolume = this.volumeSlider ? this.volumeSlider.value / 100 : 0.3;
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = targetVolume / steps;
        
        this.chessMusic.volume = 0;
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            this.chessMusic.volume = Math.min(targetVolume, currentStep * volumeStep);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }
    
    fadeOut(duration = 1000) {
        if (!this.chessMusic) return;
        
        const startVolume = this.chessMusic.volume;
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = startVolume / steps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            this.chessMusic.volume = Math.max(0, startVolume - (currentStep * volumeStep));
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                this.pauseMusic();
            }
        }, stepTime);
    }
    
    // Future: Sound effects for moves, captures, etc.
    playMoveSound() {
        // Placeholder for move sound effect
        // Could add a subtle click sound here
    }
    
    playCaptureSound() {
        // Placeholder for capture sound effect
        // Could add a more dramatic sound here
    }
    
    playCheckSound() {
        // Placeholder for check sound effect
        // Could add a warning chime here
    }
    
    playCheckmateSound() {
        // Placeholder for checkmate sound effect
        // Could add a victory/defeat fanfare here
    }
    
    // Mute/unmute all audio
    mute() {
        if (this.chessMusic) {
            this.chessMusic.muted = true;
        }
    }
    
    unmute() {
        if (this.chessMusic) {
            this.chessMusic.muted = false;
        }
    }
    
    // Get current audio state
    getState() {
        return {
            playing: this.musicPlaying,
            volume: this.getVolume(),
            muted: this.chessMusic ? this.chessMusic.muted : false
        };
    }
    
    // Reset audio for new game (if needed)
    reset() {
        // Currently no reset needed, but placeholder for future functionality
        // Could restart music or reset to specific track here
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}