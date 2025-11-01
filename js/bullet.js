// کلاس تیر

class Bullet {
    constructor(trainX, startPosition) {
        this.x = startPosition.x;
        this.y = startPosition.y;
        this.speed = 8;
        this.element = this.createElement();
        
        this.container = document.getElementById('bulletsContainer');
        this.container.appendChild(this.element);
        
        this.updatePosition();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'bullet';
        return element;
    }

    update(gameSpeed) {
        this.y -= this.speed * gameSpeed;
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    isOutOfScreen() {
        return this.y < -50;
    }

    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// کلاس انفجار
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = this.createElement();
        this.startTime = Date.now();
        this.duration = 500; // میلی‌ثانیه
        
        this.container = document.getElementById('explosionsContainer');
        this.container.appendChild(this.element);
        
        this.updatePosition();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'explosion';
        element.style.animation = 'explode 0.5s ease-out forwards';
        return element;
    }

    updatePosition() {
        this.element.style.left = (this.x - 20) + 'px';
        this.element.style.top = (this.y - 20) + 'px';
    }

    isFinished() {
        return Date.now() - this.startTime > this.duration;
    }

    remove() {
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
  }
