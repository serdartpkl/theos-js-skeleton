export class StatusBar {
    constructor() {
        // Create all elements in one go using fragment
        const fragment = document.createDocumentFragment();
        
        this.element = document.createElement('div');
        this.element.className = 'status-bar';
        
        // Create sections
        this.sections = {
            left: this.createSection('status-bar-left'),
            center: this.createSection('status-bar-center'),
            right: this.createSection('status-bar-right')
        };
        
        // Add sections to fragment
        Object.values(this.sections).forEach(section => {
            fragment.appendChild(section);
        });
        
        // Single DOM update
        this.element.appendChild(fragment);
        
        // Add default content efficiently
        this.batchUpdate(() => {
            this.updateLeft('Desktop Environment');
            this.updateCenter(new Date().toLocaleTimeString());
            this.updateRight('Ready');
        });
        
        // Optimized time update
        this.startTimeUpdate();
    }

    createSection(className) {
        const section = document.createElement('div');
        section.className = className;
        return section;
    }

    // Batch update helper
    batchUpdate(updateFn) {
        requestAnimationFrame(() => {
            updateFn();
        });
    }

    // Optimized content update with type checking
    updateSection(section, content) {
        if (!this.sections[section]) return;
        
        requestAnimationFrame(() => {
            if (typeof content === 'string') {
                if (this.sections[section].textContent !== content) {
                    this.sections[section].textContent = content;
                }
            } else {
                this.sections[section].innerHTML = '';
                this.sections[section].appendChild(content);
            }
        });
    }

    updateLeft(content) {
        this.updateSection('left', content);
    }

    updateCenter(content) {
        this.updateSection('center', content);
    }

    updateRight(content) {
        this.updateSection('right', content);
    }

    // Optimized time update with RAF
    startTimeUpdate() {
        let previousTime = '';
        
        const updateTime = () => {
            const currentTime = new Date().toLocaleTimeString();
            if (currentTime !== previousTime) {
                this.updateCenter(currentTime);
                previousTime = currentTime;
            }
            this.timeUpdateId = requestAnimationFrame(updateTime);
        };
        
        this.timeUpdateId = requestAnimationFrame(updateTime);
    }

    mount(container) {
        container.insertBefore(this.element, container.firstChild);
    }

    unmount() {
        if (this.timeUpdateId) {
            cancelAnimationFrame(this.timeUpdateId);
        }
        this.element.remove();
    }

    // Clean up method
    destroy() {
        this.unmount();
        this.sections = null;
    }
}