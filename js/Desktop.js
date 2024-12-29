import { WindowManager } from './WindowManager.js';
import { TaskBar } from './TaskBar.js';
import { StatusBar } from './StatusBar.js';

export class Desktop {
    constructor(options = {}) {
        const {
            containerId = 'desktopRoot',
            fullWidth = false,
            hasStatusbar = true
        } = options;

        // Create desktop container
        this.container = document.getElementById(containerId);
        this.container.className = this.getInitialClassName(fullWidth, hasStatusbar);
        
        // Create desktop components
        this.createComponents(hasStatusbar);
        
        // Handle window resize
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    getInitialClassName(fullWidth, hasStatusbar) {
        const classes = ['desktop-container'];
        
        if (!fullWidth) classes.push('with-padding');
        if (hasStatusbar) classes.push('has-status-bar');
        if (fullWidth) classes.push('full-width');
        
        return classes.join(' ');
    }

    createComponents(hasStatusbar) {
        // Create window container first
        this.windowContainer = document.createElement('div');
        this.windowContainer.className = 'window-container';
        
        if (hasStatusbar) {
            this.statusBar = new StatusBar();
            this.container.appendChild(this.statusBar.element);
        }
        
        this.container.appendChild(this.windowContainer);

        // Initialize window manager
        this.windowManager = new WindowManager(this.windowContainer);

        // Create taskbar (always at bottom)
        this.taskBar = new TaskBar();
        this.container.appendChild(this.taskBar.element);

        // Link taskbar with window manager
        this.windowManager.setTaskBar(this.taskBar);
    }

    handleResize() {
        // Update container dimensions if needed
        const rect = this.container.getBoundingClientRect();
        if (this.windowManager) {
            this.windowManager.updateContainerBounds(rect);
        }
    }

    setFullWidth(isFullWidth) {
        this.container.classList.toggle('full-width', isFullWidth);
        this.container.classList.toggle('with-padding', !isFullWidth);
        this.handleResize();
    }

    toggleStatusbar(show) {
        if (show && !this.statusBar) {
            this.statusBar = new StatusBar();
            this.statusBar.mount(this.container);
            this.container.classList.add('has-status-bar');
        } else if (!show && this.statusBar) {
            this.statusBar.unmount();
            this.statusBar = null;
            this.container.classList.remove('has-status-bar');
        }
        this.handleResize();
    }

    updateStatus(section, content) {
        if (this.statusBar) {
            switch(section) {
                case 'left':
                    this.statusBar.updateLeft(content);
                    break;
                case 'center':
                    this.statusBar.updateCenter(content);
                    break;
                case 'right':
                    this.statusBar.updateRight(content);
                    break;
            }
        }
    }

    destroy() {
        // Remove resize listener
        window.removeEventListener('resize', this.handleResize);
        
        // Destroy window manager
        if (this.windowManager) {
            this.windowManager.destroy();
        }

        // Destroy status bar
        if (this.statusBar) {
            this.statusBar.unmount();
        }

        // Destroy taskbar
        if (this.taskBar) {
            this.taskBar.unmount();
        }

        // Clear container
        this.container.innerHTML = '';

        // Clear references
        this.windowManager = null;
        this.statusBar = null;
        this.taskBar = null;
        this.container = null;
    }
}