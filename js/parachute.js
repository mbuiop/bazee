// کلاس چترباز

class Parachute {
    constructor() {
        this.x = Math.random() * 80 + 10; // موقعیت افقی (درصد)
        this.y = -50;
        this.speed = 1;
        this.element = this.createElement();
        
        this.container = document.getElementById('parachutesContainer');
        this.container.appendChild(this.element);
        
        this.updatePosition();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'parachute';
        
        element.innerHTML = `
            <div class="parachute-canopy"></div>
            <div class="parachute-person"></div>
        `;
        
        return element;
    }

    update(gameSpeed) {
        this.y += this.speed * gameSpeed;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = this.x + '%';
        this.element.style.top = this.y + 'px';
    }

    isOutOfScreen() {
        return this.y > window.innerHeight + 50;
    }

    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
