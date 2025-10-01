/**
 * Veggie Clash - Main Entry Point
 * A family-friendly arcade shooter where vegetables battle it out in the garden
 */

import Phaser from 'phaser';
import { GameConfig } from './game/config.ts';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { RunnerGameScene } from './game/scenes/RunnerGameScene';
import { HUDScene } from './game/scenes/HUDScene';
import { PauseScene } from './game/scenes/PauseScene';
import { GameOverScene } from './game/scenes/GameOverScene';

/**
 * Initialize the game when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen once game starts
    const loadingScreen = document.getElementById('loading-screen');

    // Handle start button click
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (gameReady) {
                clearTimeout(loadingTimeout);
                // Force hide loading screen
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                }
            } else {
                // Game not ready, show error
                alert('Game is still initializing or failed to load. Please wait or refresh the page.');
            }
        });
    }

    // Load and persist accessibility settings
    const accessibilitySettings = {
        highContrast: localStorage.getItem('veggie-clash-high-contrast') === 'true',
        reduceMotion: localStorage.getItem('veggie-clash-reduce-motion') === 'true'
    };

    // Apply saved settings
    if (accessibilitySettings.highContrast) {
        document.body.classList.add('high-contrast');
    }
    if (accessibilitySettings.reduceMotion) {
        document.body.classList.add('reduce-motion');
    }

    // Handle accessibility toggles
    const highContrastToggle = document.getElementById('high-contrast-toggle');
    const reduceMotionToggle = document.getElementById('reduce-motion-toggle');

    if (highContrastToggle) {
        // Set initial state from storage
        if (accessibilitySettings.highContrast) {
            highContrastToggle.classList.add('active');
            highContrastToggle.textContent = 'High Contrast (On)';
        }

        highContrastToggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            accessibilitySettings.highContrast = !accessibilitySettings.highContrast;
            highContrastToggle.classList.toggle('active');
            const active = accessibilitySettings.highContrast;
            highContrastToggle.textContent = active ? 'High Contrast (On)' : 'High Contrast';
            localStorage.setItem('veggie-clash-high-contrast', active.toString());
        });
    }

    if (reduceMotionToggle) {
        // Set initial state from storage
        if (accessibilitySettings.reduceMotion) {
            reduceMotionToggle.classList.add('active');
            reduceMotionToggle.textContent = 'Reduce Motion (On)';
        }

        reduceMotionToggle.addEventListener('click', () => {
            document.body.classList.toggle('reduce-motion');
            accessibilitySettings.reduceMotion = !accessibilitySettings.reduceMotion;
            reduceMotionToggle.classList.toggle('active');
            const active = accessibilitySettings.reduceMotion;
            reduceMotionToggle.textContent = active ? 'Reduce Motion (On)' : 'Reduce Motion';
            localStorage.setItem('veggie-clash-reduce-motion', active.toString());
        });
    }

    // Track game ready state
    let gameReady = false;

    // Timeout to display error message if game fails to load
    const loadingTimeout = setTimeout(() => {
        if (loadingScreen) {
            const loadingText = loadingScreen.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Sorry, we encountered a loading issue. Please refresh to try again.';
            }

            // Hide Start Game button since game failed
            const startButton = document.getElementById('start-button');
            if (startButton) {
                startButton.style.display = 'none';
            }

            // Add reload button
            const reloadButton = document.createElement('button');
            reloadButton.textContent = 'Refresh Page';
            reloadButton.style.cssText = `
                margin-top: 20px;
                padding: 10px 20px;
                font-size: 18px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            `;
            reloadButton.onclick = () => window.location.reload();
            loadingScreen.appendChild(reloadButton);

            // Add support info
            const supportInfo = document.createElement('div');
            supportInfo.textContent = 'If issues persist, try a different browser or check console for technical details.';
            supportInfo.style.cssText = 'font-size: 14px; color: #cccccc; margin-top: 10px;';
            loadingScreen.appendChild(supportInfo);
        }
    }, 15000); // 15 second timeout

    try {
        // Create the Phaser game configuration with forced Canvas renderer
        const config: Phaser.Types.Core.GameConfig = {
            ...GameConfig,
            type: Phaser.CANVAS, // Force Canvas renderer to avoid WebGL getParameter errors
            parent: 'game-container',
            scene: [
                BootScene,
                PreloadScene,
                MenuScene,
                GameScene,
                RunnerGameScene,
                HUDScene,
                PauseScene,
                GameOverScene
            ]
        };

        // Create the game instance
        const game = new Phaser.Game(config);

        // Handle game ready event
        game.events.once('ready', () => {
            console.log('🥕 Veggie Clash initialized successfully!');
            clearTimeout(loadingTimeout); // Clear the error timeout
            gameReady = true; // Mark game as ready

            // Hide loading screen with fade effect
            if (loadingScreen) {
                loadingScreen.style.transition = 'opacity 0.5s ease-out';
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            game.scale.refresh();
        });

        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                game.scene.pause('GameScene');
            } else {
                game.scene.resume('GameScene');
            }
        });

        // Mobile device detection and setup
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            setupMobileControls();
        }

        // Store game instance globally for debugging
        (window as any).game = game;
    } catch (error) {
        console.error('Failed to initialize Veggie Clash:', error);
        clearTimeout(loadingTimeout);

        if (loadingScreen) {
            // Hide Start Game button since game failed
            const startButton = document.getElementById('start-button');
            if (startButton) {
                startButton.style.display = 'none';
            }

            const loadingText = loadingScreen.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Sorry, we encountered a loading issue. Please refresh to try again.';
            }

            // Add reload button
            const reloadButton = document.createElement('button');
            reloadButton.textContent = 'Refresh Page';
            reloadButton.style.cssText = `
                margin-top: 20px;
                padding: 10px 20px;
                font-size: 18px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            `;
            reloadButton.onclick = () => window.location.reload();
            loadingScreen.appendChild(reloadButton);

            // Add support info
            const supportInfo = document.createElement('div');
            supportInfo.textContent = 'If issues persist, try a different browser or check console for technical details.';
            supportInfo.style.cssText = 'font-size: 14px; color: #cccccc; margin-top: 10px;';
            loadingScreen.appendChild(supportInfo);
        }
    }
});

/**
 * Set up mobile virtual controls
 */
function setupMobileControls(): void {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;

    mobileControls.style.display = 'block';

    // Virtual joystick setup
    const joystick = document.getElementById('virtual-joystick');
    if (joystick) {
        let isDragging = false;

        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
        });

        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDragging) return;

            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();
            const x = touch.clientX - rect.left - rect.width / 2;
            const y = touch.clientY - rect.top - rect.height / 2;

            // Limit movement to joystick bounds
            const distance = Math.sqrt(x * x + y * y);
            const maxDistance = 30;
            
            if (distance > maxDistance) {
                const angle = Math.atan2(y, x);
                const limitedX = Math.cos(angle) * maxDistance;
                const limitedY = Math.sin(angle) * maxDistance;
                
                const knob = joystick.querySelector('::after') as HTMLElement;
                if (knob) {
                    knob.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
                }
            }

            // Dispatch custom event with joystick data
            window.dispatchEvent(new CustomEvent('joystick-move', {
                detail: { x: x / maxDistance, y: y / maxDistance }
            }));
        });

        joystick.addEventListener('touchend', () => {
            isDragging = false;
            const knob = joystick.querySelector('::after') as HTMLElement;
            if (knob) {
                knob.style.transform = 'translate(-50%, -50%)';
            }
            
            window.dispatchEvent(new CustomEvent('joystick-move', {
                detail: { x: 0, y: 0 }
            }));
        });
    }

    // Mobile button setup
    const shootButton = document.getElementById('shoot-button');
    const dashButton = document.getElementById('dash-button');
    const pauseButton = document.getElementById('pause-button');

    if (shootButton) {
        shootButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('mobile-shoot', { detail: { pressed: true } }));
        });
        
        shootButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('mobile-shoot', { detail: { pressed: false } }));
        });
    }

    if (dashButton) {
        dashButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('mobile-dash'));
        });
    }

    if (pauseButton) {
        pauseButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('mobile-pause'));
        });
    }
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Veggie Clash Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Veggie Clash Unhandled Promise Rejection:', event.reason);
});
