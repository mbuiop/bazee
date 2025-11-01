// کلاس قطار

class Train {
    constructor() {
        this.x = 50; // موقعیت افقی (درصد)
        this.speed = 2;
        this.element = document.getElementById('train');
        this.gunElement = document.getElementById('trainGun');
        
        this.setupTrain();
    }

    setupTrain() {
        // اضافه کردن انیمیشن به قطار
        this.element.style.animation = 'trainMove 1s ease-in-out infinite';
        this.updatePosition();
    }

    moveLeft() {
        this.x = Math.max(10, this.x - this.speed);
        this.updatePosition();
    }

    moveRight() {
        this.x = Math.min(90, this.x + this.speed);
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = this.x + '%';
    }

    shoot() {
        // ایجاد تیر جدید
        const bullet = new Bullet(this.x, this.getGunPosition());
        return bullet;
    }

    getGunPosition() {
        const rect = this.gunElement.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top
        };
    }

    handleResize() {
        this.updatePosition();
    }
}
