import { WindowManager } from './js/WindowManager.js';

let windowManager = null;

/**
 * Initializes the window manager with the given window configurations
 * @param {Array} windowConfigs - Array of window configuration objects
 */
export function initializeWindowManager(windowConfigs) {
    windowManager = new WindowManager('windowContainer');
    windowConfigs.forEach(config => windowManager.createWindow(config));
}

/**
 * Gets the window manager instance
 * @returns {WindowManager} The window manager instance
 */
export function getWindowManager() {
    return windowManager;
}

// Export optimized utility functions
export const utils = {
    // More efficient ID generation
    generateId: () => 'window-' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    
    // Optimized bounds checking with caching
    isWithinBounds: (() => {
        let lastElement = null;
        let lastContainer = null;
        let lastResult = null;
        let lastTime = 0;
        
        return (element, container) => {
            const now = Date.now();
            
            // Cache results for 16ms (1 frame)
            if (element === lastElement && 
                container === lastContainer && 
                now - lastTime < 16) {
                return lastResult;
            }
            
            const elementRect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            lastElement = element;
            lastContainer = container;
            lastTime = now;
            
            lastResult = (
                elementRect.left >= containerRect.left &&
                elementRect.right <= containerRect.right &&
                elementRect.top >= containerRect.top &&
                elementRect.bottom <= containerRect.bottom
            );
            
            return lastResult;
        };
    })()
};