export class Window {
    constructor(options = {}) {
        // Initialize state properties
        this.id = options.id;
        this.title = options.title || 'New Window';
        this.icon = options.icon || 'mdi-window-maximize';
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 256;
        this.height = options.height || 256;
        this.minWidth = options.minWidth || 256;
        this.minHeight = options.minHeight || 256;
        this.content = options.content || '';

        // Window state flags
        this.isMaximized = false;
        this.isMinimized = false;
        this.wasMaximized = false;

        // Window behavior options
        this.isResizable = options.isResizable !== undefined ? options.isResizable : true;
        this.hasToolbarInfo = options.hasToolbarInfo !== undefined ? options.hasToolbarInfo : true;
        this.isDraggable = options.isDraggable !== undefined ? options.isDraggable : true;
        this.isMaximizable = options.isMaximizable !== undefined ? options.isMaximizable : true;
        this.hasControls = options.hasControls !== undefined ? options.hasControls : true;

        // Enforce interdependencies
        if (!this.isResizable && !this.hasToolbarInfo) {
            this.hasToolbar = false;
        } else {
            this.hasToolbar = true;
        }
        
        if (!this.isResizable) {
            this.isMaximizable = false;
        }
        
        // Create window structure
        this.createWindowElement();
        
        // Setup animation handlers
        this.setupAnimationEndHandlers();
        
        // Store initial position for restore
        this.saveRestorePosition();
    }

    createWindowElement() {
        this.element = document.createElement('div');
        this.element.className = 'window';
        this.element.id = this.id;
        
        // Set initial position and size
        this.setPosition(this.x, this.y);
        this.setSize(this.width, this.height);

        if (!this.isDraggable) {
            this.element.classList.add('not-draggable');
        }

        this.header = this.createHeader();
        this.contentArea = this.createContent();
        
        this.element.appendChild(this.header);
        this.element.appendChild(this.contentArea);

        if (this.hasToolbar) {
            this.toolbar = this.createToolbar();
            this.element.appendChild(this.toolbar);
        }
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = 'window-header';
    
        const titleContainer = document.createElement('div');
        titleContainer.className = 'window-title-container';
    
        const icon = document.createElement('i');
        icon.className = `mdi ${this.icon}`;
        titleContainer.appendChild(icon);
    
        const title = document.createElement('div');
        title.className = 'window-title';
        title.textContent = this.title;
        titleContainer.appendChild(title);
    
        header.appendChild(titleContainer);
    
        if (this.hasControls) {
            const controls = this.createControls();
            header.appendChild(controls);
        }
    
        return header;
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'window-controls';
    
        if (this.isMaximizable) {
            const maximizeBtn = document.createElement('div');
            maximizeBtn.className = 'window-control control-maximize';
            maximizeBtn.setAttribute('title', 'Maximize');
            controls.appendChild(maximizeBtn);
        }
    
        const minimizeBtn = document.createElement('div');
        minimizeBtn.className = 'window-control control-minimize';
        minimizeBtn.setAttribute('title', 'Minimize');
        controls.appendChild(minimizeBtn);
    
        const closeBtn = document.createElement('div');
        closeBtn.className = 'window-control control-close';
        closeBtn.setAttribute('title', 'Close');
        controls.appendChild(closeBtn);
    
        return controls;
    }

    createContent() {
        const content = document.createElement('div');
        content.className = 'window-content';
        content.innerHTML = this.content;
        return content;
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'window-toolbar';
        
        if (!this.hasToolbarInfo) {
            toolbar.classList.add('no-toolbar-info');
        }

        if (this.hasToolbarInfo) {
            const info = document.createElement('span');
            info.className = 'toolbar-info';
            info.textContent = 'NO_INFORMATION';
            toolbar.appendChild(info);
        }

        if (this.isResizable) {
            this.resizeHandle = document.createElement('div');
            this.resizeHandle.className = 'resize-handle';
            const resizeIcon = document.createElement('i');
            resizeIcon.className = 'mdi mdi-resize-bottom-right';
            this.resizeHandle.appendChild(resizeIcon);
            toolbar.appendChild(this.resizeHandle);
        }

        return toolbar;
    }

    setupAnimationEndHandlers() {
        this.element.addEventListener('animationend', (e) => {
            if (e.animationName === 'minimizeWindow') {
                this.element.classList.remove('minimizing');
                this.element.style.display = 'none';
            } else if (e.animationName === 'closeWindow') {
                this.element.classList.remove('closing');
                this.element.remove();
            }
        });
    }

    saveRestorePosition() {
        this.restorePosition = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
    }

    minimize(animate = true) {
        this.wasMaximized = this.isMaximized;

        if (!this.isMaximized) {
            const rect = this.element.getBoundingClientRect();
            this.saveRestorePosition();
        }
        
        if (animate) {
            this.element.classList.add('minimizing');
        } else {
            this.element.style.display = 'none';
        }
        this.isMinimized = true;
    }

    maximize() {
        if (!this.isMaximizable) return;

        if (!this.isMaximized) {
            const rect = this.element.getBoundingClientRect();
            this.saveRestorePosition();

            const containerRect = this.element.parentElement.getBoundingClientRect();
            this.setPosition(0, 0);
            this.setSize(containerRect.width, containerRect.height);
            this.isMaximized = true;
            
            if (this.resizeHandle) {
                this.resizeHandle.style.display = 'none';
            }
        } else {
            this.restore();
        }
    }

    restore() {
        this.isMinimized = false;
        this.element.style.display = 'flex';
        this.element.classList.remove('minimized', 'minimizing');

        if (this.wasMaximized) {
            const containerRect = this.element.parentElement.getBoundingClientRect();
            this.setPosition(0, 0);
            this.setSize(containerRect.width, containerRect.height);
            this.isMaximized = true;
            
            if (this.resizeHandle) {
                this.resizeHandle.style.display = 'none';
            }
        } else {
            const pos = this.restorePosition;
            this.setPosition(pos.x, pos.y);
            this.setSize(pos.width, pos.height);
            
            if (this.resizeHandle) {
                this.resizeHandle.style.display = 'flex';
            }
            this.isMaximized = false;
        }
        
        this.wasMaximized = false;
    }

    close(animate = true) {
        if (animate) {
            this.element.classList.add('closing');
        } else {
            this.element.remove();
        }
    }

    setTitle(title) {
        this.title = title;
        const titleElement = this.header.querySelector('.window-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    setIcon(iconClass) {
        this.icon = iconClass;
        const iconElement = this.header.querySelector('.window-title-container i');
        if (iconElement) {
            iconElement.className = `mdi ${iconClass}`;
        }
    }

    setContent(content) {
        this.content = content;
        this.contentArea.innerHTML = content;
    }

    setToolbarInfo(info) {
        const infoElement = this.toolbar?.querySelector('.toolbar-info');
        if (infoElement) {
            infoElement.textContent = info;
        }
    }

    setDragging(isDragging) {
        if (this.isDraggable) {
            this.header.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
    }

    destroy() {
        this.element.remove();
    }
}