// کلاس اصلی بازی

class Game {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.score = 0;
        this.health = 100;
        this.isRunning = false;
        this.gameSpeed = 1;
        
        this.train = new Train();
        this.parachutes = [];
        this.bullets = [];
        this.explosions = [];
        
        this.lastParachuteTime = 0;
        this.parachuteInterval = 2000; // هر 2 ثانیه یک چترباز
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // کنترل‌های کیبورد
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;

            switch(e.code) {
                case 'ArrowLeft':
                    this.train.moveLeft();
                    break;
                case 'ArrowRight':
                    this.train.moveRight();
                    break;
                case 'Space':
                    this.shoot();
                    e.preventDefault();
                    break;
            }
        });

        // کنترل لمسی برای موبایل
        document.addEventListener('touchstart', (e) => {
            if (!this.isRunning) return;
            
            const touchX = e.touches[0].clientX;
            const screenWidth = window.innerWidth;
            
            if (touchX < screenWidth / 2) {
                this.train.moveLeft();
            } else {
                this.train.moveRight();
            }
            
            this.shoot();
        });
    }

    start() {
        this.isRunning = true;
        this.score = 0;
        this.health = 100;
        this.updateUI();
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
        this.cleanup();
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = Date.now();
        
        // تولید چترباز جدید
        if (currentTime - this.lastParachuteTime > this.parachuteInterval) {
            this.spawnParachute();
            this.lastParachuteTime = currentTime;
        }

        // آپدیت المان‌های بازی
        this.updateParachutes();
        this.updateBullets();
        this.updateExplosions();
        this.checkCollisions();
        
        // افزایش سرعت بازی با زمان
        this.gameSpeed = 1 + (this.score * 0.001);
        
        requestAnimationFrame(() => this.gameLoop());
    }

    spawnParachute() {
        const parachute = new Parachute();
        this.parachutes.push(parachute);
    }

    shoot() {
        const bullet = this.train.shoot();
        if (bullet) {
            this.bullets.push(bullet);
        }
    }

    updateParachutes() {
        for (let i = this.parachutes.length - 1; i >= 0; i--) {
            const parachute = this.parachutes[i];
            parachute.update(this.gameSpeed);
            
            // حذف چتربازهای خارج از صفحه
            if (parachute.isOutOfScreen()) {
                parachute.remove();
                this.parachutes.splice(i, 1);
                this.decreaseHealth(10);
            }
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(this.gameSpeed);
            
            // حذف تیرهای خارج از صفحه
            if (bullet.isOutOfScreen()) {
                bullet.remove();
                this.bullets.splice(i, 1);
            }
        }
    }

    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            if (explosion.isFinished()) {
                explosion.remove();
                this.explosions.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // بررسی برخورد تیرها با چتربازها
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.parachutes.length - 1; j >= 0; j--) {
                const parachute = this.parachutes[j];
                
                if (this.isColliding(bullet, parachute)) {
                    // ایجاد انفجار
                    const explosion = new Explosion(parachute.x, parachute.y);
                    this.explosions.push(explosion);
                    
                    // حذف تیر و چترباز
                    bullet.remove();
                    parachute.remove();
                    
                    this.bullets.splice(i, 1);
                    this.parachutes.splice(j, 1);
                    
                    // افزایش امتیاز
                    this.increaseScore(10);
                    
                    break;
                }
            }
        }
    }

    isColliding(bullet, parachute) {
        const dx = bullet.x - parachute.x;
        const dy = bullet.y - parachute.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 25; // فاصله برخورد
    }

    increaseScore(points) {
        this.score += points;
        this.updateUI();
    }

    decreaseHealth(amount) {
        this.health -= amount;
        this.updateUI();
        
        if (this.health <= 0) {
            this.health = 0;
            this.gameOver();
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('healthFill').style.width = this.health + '%';
    }

    gameOver() {
        this.stop();
        this.gameManager.gameOver(this.score);
    }

    cleanup() {
        // پاک کردن تمام المان‌های بازی
        this.parachutes.forEach(p => p.remove());
        this.bullets.forEach(b => b.remove());
        this.explosions.forEach(e => e.remove());
        
        this.parachutes = [];
        this.bullets = [];
        this.explosions = [];
    }

    handleResize() {
        // مدیریت تغییر سایز صفحه
        this.train.handleResize();
    }
              }
