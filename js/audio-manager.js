// Audio Manager - Music control and sound effects
// Self-contained audio events and controls with enhanced error handling

class AudioManager {
    constructor() {
        this.musicPlaying = false;
        this.chessMusic = null;
        this.musicToggle = null;
        this.volumeSlider = null;
        this.isReady = false;
        
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        console.log('AudioManager: Initializing...');
        
        // Get DOM elements
        this.chessMusic = document.getElementById('chessMusic');
        this.musicToggle = document.getElementById('musicToggle');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        // Debug: Check if elements exist
        console.log('AudioManager: Audio element found:', !!this.chessMusic);
        console.log('AudioManager: Toggle button found:', !!this.musicToggle);
        console.log('AudioManager: Volume slider found:', !!this.volumeSlider);
        
        if (!this.chessMusic) {
            console.error('AudioManager: Audio element with id "chessMusic" not found');
            return;
        }
        
        if (!this.musicToggle) {
            console.error('AudioManager: Music toggle button with id "musicToggle" not found');
            return;
        }
        
        if (!this.volumeSlider) {
            console.error('AudioManager: Volume slider with id "volumeSlider" not found');
            return;
        }
        
        this.initializeControls();
        this.setInitialVolume();
        this.setupAudioEventListeners();
        
        console.log('AudioManager: Initialization complete');
    }
    
    initializeControls() {
        // Set up music toggle button
        if (this.musicToggle) {
            // Remove any existing listeners
            this.musicToggle.replaceWith(this.musicToggle.cloneNode(true));
            this.musicToggle = document.getElementById('musicToggle');
            
            this.musicToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('AudioManager: Toggle button clicked');
                this.toggleMusic();
            });
            
            console.log('AudioManager: Music toggle listener attached');
        }
        
        // Set up volume slider
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                console.log('AudioManager: Volume changed to:', e.target.value);
                this.setVolume(e.target.value);
            });
            
            this.volumeSlider.addEventListener('change', (e) => {
                this.setVolume(e.target.value);
            });
            
            console.log('AudioManager: Volume slider listeners attached');
        }
    }
    
    setupAudioEventListeners() {
        if (!this.chessMusic) return;
        
        // Audio loading events
        this.chessMusic.addEventListener('loadstart', () => {
            console.log('AudioManager: Started loading audio');
        });
        
        this.chessMusic.addEventListener('canplay', () => {
            console.log('AudioManager: Audio can start playing');
            this.isReady = true;
        });
        
        this.chessMusic.addEventListener('canplaythrough', () => {
            console.log('AudioManager: Audio can play through without buffering');
        });
        
        this.chessMusic.addEventListener('loadeddata', () => {
            console.log('AudioManager: Audio data loaded');
        });
        
        this.chessMusic.addEventListener('loadedmetadata', () => {
            console.log('AudioManager: Audio metadata loaded, duration:', this.chessMusic.duration);
        });
        
        // Playback events
        this.chessMusic.addEventListener('play', () => {
            console.log('AudioManager: Audio started playing');
            this.musicPlaying = true;
            this.updateMusicButton('🎵 Pause Music', true);
        });
        
        this.chessMusic.addEventListener('pause', () => {
            console.log('AudioManager: Audio paused');
            this.musicPlaying = false;
            this.updateMusicButton('🎵 Play Echoes of the Board', false);
        });
        
        this.chessMusic.addEventListener('ended', () => {
            console.log('AudioManager: Audio ended');
            this.onMusicEnded();
        });
        
        // Error events
        this.chessMusic.addEventListener('error', (e) => {
            console.error('AudioManager: Audio error:', e);
            console.error('AudioManager: Error details:', {
                code: this.chessMusic.error?.code,
                message: this.chessMusic.error?.message,
                networkState: this.chessMusic.networkState,
                readyState: this.chessMusic.readyState
            });
            this.onMusicError();
        });
        
        this.chessMusic.addEventListener('stalled', () => {
            console.warn('AudioManager: Audio loading stalled');
        });
        
        this.chessMusic.addEventListener('suspend', () => {
            console.log('AudioManager: Audio loading suspended');
        });
        
        this.chessMusic.addEventListener('abort', () => {
            console.warn('AudioManager: Audio loading aborted');
        });
        
        // Check if audio source exists
        console.log('AudioManager: Audio source:', this.chessMusic.src || this.chessMusic.currentSrc);
        console.log('AudioManager: Audio ready state:', this.chessMusic.readyState);
        console.log('AudioManager: Audio network state:', this.chessMusic.networkState);
        
        // Try to preload
        this.chessMusic.load();
    }
    
    setInitialVolume() {
        if (this.chessMusic) {
            this.chessMusic.volume = 0.3; // 30% volume by default
            console.log('AudioManager: Initial volume set to 30%');
        }
        if (this.volumeSlider) {
            this.volumeSlider.value = 30;
        }
    }
    
    toggleMusic() {
        console.log('AudioManager: Toggle music called, current state:', this.musicPlaying);
        
        if (!this.chessMusic) {
            console.error('AudioManager: No audio element available');
            return;
        }
        
        if (this.musicPlaying) {
            this.pauseMusic();
        } else {
            this.playMusic();
        }
    }
    
    async playMusic() {
        if (!this.chessMusic) {
            console.error('AudioManager: No audio element for playback');
            return;
        }
        
        console.log('AudioManager: Attempting to play music...');
        console.log('AudioManager: Ready state:', this.chessMusic.readyState);
        console.log('AudioManager: Network state:', this.chessMusic.networkState);
        
        try {
            // Check if we can play
            if (this.chessMusic.readyState < 2) { // HAVE_CURRENT_DATA
                console.log('AudioManager: Audio not ready, waiting...');
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Audio loading timeout'));
                    }, 5000);
                    
                    const onCanPlay = () => {
                        clearTimeout(timeout);
                        this.chessMusic.removeEventListener('canplay', onCanPlay);
                        this.chessMusic.removeEventListener('error', onError);
                        resolve();
                    };
                    
                    const onError = (e) => {
                        clearTimeout(timeout);
                        this.chessMusic.removeEventListener('canplay', onCanPlay);
                        this.chessMusic.removeEventListener('error', onError);
                        reject(e);
                    };
                    
                    this.chessMusic.addEventListener('canplay', onCanPlay);
                    this.chessMusic.addEventListener('error', onError);
                });
            }
            
            const playPromise = this.chessMusic.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                console.log('AudioManager: Music started successfully');
            }
            
        } catch (error) {
            console.error('AudioManager: Failed to play music:', error);
            
            // Handle specific error types
            if (error.name === 'NotAllowedError') {
                this.updateMusicButton('🎵 Click to Play (Browser Blocked)', false);
                console.log('AudioManager: Autoplay blocked by browser - user interaction required');
            } else if (error.name === 'NotSupportedError') {
                this.updateMusicButton('🎵 Format Not Supported', false);
                console.error('AudioManager: Audio format not supported');
            } else {
                this.updateMusicButton('🎵 Music Unavailable', false);
                console.error('AudioManager: Unknown playback error:', error);
            }
        }
    }
    
    pauseMusic() {
        if (!this.chessMusic) return;
        
        console.log('AudioManager: Pausing music');
        this.chessMusic.pause();
        // Note: The 'pause' event listener will update the button state
    }
    
    updateMusicButton(text, isPlaying) {
        if (!this.musicToggle) return;
        
        console.log('AudioManager: Updating button:', text, 'Playing:', isPlaying);
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
        console.log('AudioManager: Volume set to:', volume);
        
        // Update slider if called programmatically
        if (this.volumeSlider && this.volumeSlider.value != value) {
            this.volumeSlider.value = value;
        }
    }
    
    getVolume() {
        return this.chessMusic ? this.chessMusic.volume * 100 : 0;
    }
    
    onMusicEnded() {
        console.log('AudioManager: Music ended naturally');
        // Music loop is handled by HTML loop attribute
        // This is here for future sound effect handling
    }
    
    onMusicError() {
        console.error('AudioManager: Music error occurred');
        this.musicPlaying = false;
        this.updateMusicButton('🎵 Music Unavailable', false);
    }
    
    // Debug method to check audio state
    getDebugInfo() {
        if (!this.chessMusic) {
            return { error: 'No audio element' };
        }
        
        return {
            src: this.chessMusic.src || this.chessMusic.currentSrc,
            readyState: this.chessMusic.readyState,
            networkState: this.chessMusic.networkState,
            duration: this.chessMusic.duration,
            currentTime: this.chessMusic.currentTime,
            volume: this.chessMusic.volume,
            muted: this.chessMusic.muted,
            paused: this.chessMusic.paused,
            ended: this.chessMusic.ended,
            loop: this.chessMusic.loop,
            error: this.chessMusic.error
        };
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
    }
    
    playCaptureSound() {
        // Placeholder for capture sound effect
    }
    
    playCheckSound() {
        // Placeholder for check sound effect
    }
    
    playCheckmateSound() {
        // Placeholder for checkmate sound effect
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
            muted: this.chessMusic ? this.chessMusic.muted : false,
            ready: this.isReady
        };
    }
    
    // Reset audio for new game (if needed)
    reset() {
        // Currently no reset needed, but placeholder for future functionality
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}

// Make debug function available globally for troubleshooting
window.debugAudio = function() {
    if (window.gameModules && window.gameModules.audioManager) {
        const audioManager = window.gameModules.audioManager();
        if (audioManager) {
            console.log('Audio Debug Info:', audioManager.getDebugInfo());
        }
    }
};
