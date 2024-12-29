import { Window } from './Window.js';
import { utils } from '../app.js';

export class WindowManager {
    constructor(container) {
        this.container = typeof container === 'string' ? 
            document.getElementById(container) : container;
        this.windows = new Map();
        this.zIndex = 100;
        this.taskBar = null;
        this.activeWindow = null;
        this.cachedBounds = null;
        
        // Initialize bounds
        this.updateContainerBounds();
        window.addEventListener('resize', () => this.updateContainerBounds());
    }

    updateContainerBounds() {
        this.cachedBounds = this.container.getBoundingClientRect();
    }

    setTaskBar(taskBar) {
        this.taskBar = taskBar;
        this.taskBar.setTaskClickHandler((windowId) => this.activateWindow(windowId));
    }

    createWindow(options = {}) {
        const windowId = utils.generateId();
        
        const windowInstance = new Window({
            id: windowId,
            ...options
        });
    
        this.windows.set(windowId, windowInstance);
        this.container.appendChild(windowInstance.element);
        this.setupWindowEvents(windowInstance);
    
        if (this.taskBar) {
            this.taskBar.addTask(windowInstance);
        }
    
        this.bringToFront(windowInstance);
        return windowInstance;
    }

    setupWindowEvents(windowInstance) {
        if (!windowInstance || !windowInstance.element) return;

        if (windowInstance.hasControls) {
            this.setupWindowControls(windowInstance);
        }
    
        if (windowInstance.isDraggable && windowInstance.header) {
            windowInstance.header.addEventListener('mousedown', (e) => {
                if (!windowInstance.isMaximized && 
                    (e.target === windowInstance.header || 
                     e.target.classList.contains('window-title') ||
                     e.target.classList.contains('window-title-container'))) {
                    this.handleDragStart(e, windowInstance);
                }
            });
        }
    
        if (windowInstance.isResizable && windowInstance.resizeHandle) {
            windowInstance.resizeHandle.addEventListener('mousedown', (e) => {
                if (!windowInstance.isMaximized) {
                    this.handleResizeStart(e, windowInstance);
                }
            });
        }
    
        windowInstance.element.addEventListener('mousedown', () => {
            this.bringToFront(windowInstance);
        });
    }

    setupWindowControls(windowInstance) {
        const controls = windowInstance.header.querySelector('.window-controls');
        if (!controls) return;
    
        if (windowInstance.isMaximizable) {
            const maximizeBtn = controls.querySelector('.control-maximize');
            maximizeBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.maximizeWindow(windowInstance);
            });
        }
    
        const minimizeBtn = controls.querySelector('.control-minimize');
        minimizeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(windowInstance);
        });
    
        const closeBtn = controls.querySelector('.control-close');
        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(windowInstance);
        });
    }

    handleDragStart(e, windowInstance) {
        if (windowInstance.isMaximized) return;

        const rect = windowInstance.element.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        windowInstance.setDragging(true);

        const handleDrag = (e) => {
            // Update bounds on each drag
            this.updateContainerBounds();
            
            let newX = e.clientX - this.cachedBounds.left - offsetX;
            let newY = e.clientY - this.cachedBounds.top - offsetY;

            // Apply bounds using the updated cachedBounds
            newX = Math.max(0, Math.min(newX, this.cachedBounds.width - rect.width));
            newY = Math.max(0, Math.min(newY, this.cachedBounds.height - rect.height));

            windowInstance.setPosition(newX, newY);
        };

        const handleDragEnd = () => {
            windowInstance.setDragging(false);
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
        };

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        e.preventDefault();
    }

    handleResizeStart(e, windowInstance) {
        if (windowInstance.isMaximized) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = windowInstance.element.getBoundingClientRect();

        const handleResize = (e) => {
            // Update bounds on each resize
            this.updateContainerBounds();
            
            const newWidth = startRect.width + (e.clientX - startX);
            const newHeight = startRect.height + (e.clientY - startY);
            
            const maxWidth = this.cachedBounds.width - (startRect.left - this.cachedBounds.left);
            const maxHeight = this.cachedBounds.height - (startRect.top - this.cachedBounds.top);

            windowInstance.setSize(
                Math.min(Math.max(windowInstance.minWidth, newWidth), maxWidth),
                Math.min(Math.max(windowInstance.minHeight, newHeight), maxHeight)
            );
        };

        const handleResizeEnd = () => {
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', handleResizeEnd);
        };

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeEnd);
        e.preventDefault();
    }

    handleResizeStart(e, windowInstance) {
        if (windowInstance.isMaximized) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = windowInstance.element.getBoundingClientRect();

        const handleResize = (e) => {
            const newWidth = startRect.width + (e.clientX - startX);
            const newHeight = startRect.height + (e.clientY - startY);
            
            const maxWidth = this.cachedBounds.width - (startRect.left - this.cachedBounds.left);
            const maxHeight = this.cachedBounds.height - (startRect.top - this.cachedBounds.top);

            windowInstance.setSize(
                Math.min(Math.max(windowInstance.minWidth, newWidth), maxWidth),
                Math.min(Math.max(windowInstance.minHeight, newHeight), maxHeight)
            );
        };

        const handleResizeEnd = () => {
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', handleResizeEnd);
        };

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', handleResizeEnd);
        e.preventDefault();
    }

    closeWindow(windowInstance) {
        windowInstance.close(true);
        if (this.taskBar) {
            this.taskBar.removeTask(windowInstance.id);
        }
        this.windows.delete(windowInstance.id);

        if (windowInstance === this.activeWindow) {
            const remainingWindows = Array.from(this.windows.values());
            if (remainingWindows.length > 0) {
                this.bringToFront(remainingWindows[remainingWindows.length - 1]);
            } else {
                this.activeWindow = null;
            }
        }
    }

    minimizeWindow(windowInstance) {
        windowInstance.minimize(true);
        if (this.taskBar) {
            this.taskBar.updateTask(windowInstance);
        }
    }

    maximizeWindow(windowInstance) {
        windowInstance.maximize();
        if (this.taskBar) {
            this.taskBar.updateTask(windowInstance);
        }
    }

    activateWindow(windowId) {
        const windowInstance = this.windows.get(windowId);
        if (windowInstance) {
            if (windowInstance.isMinimized) {
                windowInstance.restore();
            }
            this.bringToFront(windowInstance);
            if (this.taskBar) {
                this.taskBar.updateTask(windowInstance);
            }
        }
    }

    bringToFront(windowInstance) {
        if (this.zIndex > 10000) {
            this.resetZIndices();
        }
        
        this.zIndex += 10;
        windowInstance.element.style.zIndex = this.zIndex;
        this.activeWindow = windowInstance;
        
        if (this.taskBar) {
            this.taskBar.setActiveTask(windowInstance.id);
        }
    }

    resetZIndices() {
        let baseZ = 100;
        const windows = Array.from(this.windows.values())
            .sort((a, b) => a.element.style.zIndex - b.element.style.zIndex);
        
        windows.forEach(win => {
            win.element.style.zIndex = baseZ;
            baseZ += 10;
        });
        
        this.zIndex = baseZ;
    }

    getWindow(windowId) {
        return this.windows.get(windowId);
    }

    getAllWindows() {
        return Array.from(this.windows.values());
    }

    destroy() {
        window.removeEventListener('resize', this.updateContainerBounds);
        
        this.windows.forEach(window => {
            window.destroy();
        });
        
        this.windows.clear();
        this.activeWindow = null;
        this.taskBar = null;
    }
}