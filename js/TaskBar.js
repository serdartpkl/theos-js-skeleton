export class TaskBar {
    constructor() {
        // Create elements with fragment
        const fragment = document.createDocumentFragment();
        
        this.element = document.createElement('div');
        this.element.className = 'taskbar';
        
        this.tasksContainer = document.createElement('div');
        this.tasksContainer.className = 'taskbar-tasks';
        
        fragment.appendChild(this.tasksContainer);
        this.element.appendChild(fragment);
        
        // Initialize task storage with Map for better performance
        this.tasks = new Map();
        
        // Bind methods for better performance
        this.handleTaskClick = this.handleTaskClick.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    addTask(window) {
        const taskButton = document.createElement('div');
        taskButton.className = 'taskbar-item';
        taskButton.setAttribute('data-window-id', window.id);

        // Create elements with fragment
        const fragment = document.createDocumentFragment();

        // Create icon
        const icon = document.createElement('i');
        icon.className = `mdi ${window.icon}`;
        fragment.appendChild(icon);

        // Create title
        const title = document.createElement('span');
        title.textContent = window.title;
        fragment.appendChild(title);

        // Single DOM update
        taskButton.appendChild(fragment);

        // Store task reference
        this.tasks.set(window.id, taskButton);
        
        // Add event listeners
        taskButton.addEventListener('mouseenter', this.handleMouseEnter);
        taskButton.addEventListener('mouseleave', this.handleMouseLeave);
        taskButton.addEventListener('click', this.handleTaskClick);

        // Add to DOM with animation frame
        requestAnimationFrame(() => {
            this.tasksContainer.appendChild(taskButton);
        });

        return taskButton;
    }

    handleTaskClick(e) {
        const taskButton = e.currentTarget;
        const windowId = taskButton.getAttribute('data-window-id');
        this.onTaskClick?.(windowId);
    }

    handleMouseEnter(e) {
        const taskButton = e.currentTarget;
        if (!taskButton.classList.contains('active')) {
            taskButton.classList.add('taskbar-item-hover');
        }
    }

    handleMouseLeave(e) {
        e.currentTarget.classList.remove('taskbar-item-hover');
    }

    removeTask(windowId) {
        const task = this.tasks.get(windowId);
        if (!task) return;

        // Clean up event listeners
        task.removeEventListener('mouseenter', this.handleMouseEnter);
        task.removeEventListener('mouseleave', this.handleMouseLeave);
        task.removeEventListener('click', this.handleTaskClick);

        // Remove from storage
        this.tasks.delete(windowId);

        // Animate removal
        requestAnimationFrame(() => {
            task.style.animation = 'removeTaskbarItem 150ms ease-out forwards';
            task.addEventListener('animationend', () => {
                if (task.parentNode) {
                    task.remove();
                }
            }, { once: true });
        });
    }

    updateTask(window) {
        const task = this.tasks.get(window.id);
        if (!task) return;

        requestAnimationFrame(() => {
            // Update classes in a batch
            const classList = task.classList;
            classList.toggle('active', !window.isMinimized);
            classList.toggle('minimized', window.isMinimized);

            // Update title if changed
            const titleSpan = task.querySelector('span');
            if (titleSpan.textContent !== window.title) {
                titleSpan.textContent = window.title;
            }
        });
    }

    setActiveTask(windowId) {
        requestAnimationFrame(() => {
            this.tasks.forEach((task, id) => {
                task.classList.toggle('active', id === windowId);
                if (id === windowId) {
                    task.classList.remove('taskbar-item-hover');
                }
            });
        });
    }

    mount(container) {
        container.appendChild(this.element);
    }

    unmount() {
        // Clean up all tasks
        this.tasks.forEach((task, windowId) => {
            this.removeTask(windowId);
        });
        this.element.remove();
    }

    // Clean up method
    destroy() {
        this.unmount();
        this.tasks.clear();
        this.tasks = null;
    }

    // Register click handler
    setTaskClickHandler(handler) {
        this.onTaskClick = handler;
    }
}