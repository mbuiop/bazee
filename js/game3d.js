// کلاس بازی سه بعدی
class Game3D {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.scene = window.threeJSGame.getScene();
        this.camera = window.threeJSGame.getCamera();
        
        this.score = 0;
        this.health = 100;
        this.isRunning = false;
        
        this.train = null;
        this.parachutes = [];
        this.bullets = [];
        this.explosions = [];
        
        this.lastParachuteTime = 0;
        this.parachuteInterval = 3000;
        
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.createTrain();
        this.setupEventListeners();
        this.showCinematicBars();
    }

    createTrain() {
        this.train = new Train3D(this.scene);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isRunning) return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
            }
        });

        // کنترل‌های لمسی برای موبایل
        this.setupTouchControls();
    }

    setupTouchControls() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const shootBtn = document.getElementById('shootBtn');

        if (leftBtn) {
            leftBtn.addEventListener('touchstart', () => this.train.keys['KeyA'] = true);
            leftBtn.addEventListener('touchend', () => this.train.keys['KeyA'] = false);
        }

        if (rightBtn) {
            rightBtn.addEventListener('touchstart', () => this.train.keys['KeyD'] = true);
            rightBtn.addEventListener('touchend', () => this.train.keys['KeyD'] = false);
        }

        if (shootBtn) {
            shootBtn.addEventListener('touchstart', () => this.shoot());
        }
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

        const deltaTime = this.clock.getDelta() * 60;

        // آپدیت قطار
        this.train.update(deltaTime);

        // تولید چترباز
        const currentTime = Date.now();
        if (currentTime - this.lastParachuteTime > this.parachuteInterval) {
            this.spawnParachute();
            this.lastParachuteTime = currentTime;
        }

        // آپدیت المان‌های بازی
        this.updateParachutes(deltaTime);
        this.updateBullets(deltaTime);
        this.updateExplosions();
        this.checkCollisions();

        requestAnimationFrame(() => this.gameLoop());
    }

    spawnParachute() {
        const parachute = new Parachute3D(this.scene, this.train.getPosition());
        this.parachutes.push(parachute);
    }

    shoot() {
        const bullet = this.train.shoot();
        if (bullet) {
            this.bullets.push(bullet);
        }
    }

    updateParachutes(deltaTime) {
        for (let i = this.parachutes.length - 1; i >= 0; i--) {
            const parachute = this.parachutes[i];
            parachute.update(deltaTime);
            
            if (parachute.shouldRemove()) {
                parachute.remove();
                this.parachutes.splice(i, 1);
                this.decreaseHealth(5);
            }
        }
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);
            
            if (bullet.shouldRemove()) {
                bullet.remove();
                this.bullets.splice(i, 1);
            }
        }
    }

    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            if (explosion.shouldRemove()) {
                explosion.remove();
                this.explosions.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.parachutes.length - 1; j >= 0; j--) {
                const parachute = this.parachutes[j];
                
                if (this.isColliding(bullet, parachute)) {
                    // ایجاد انفجار
                    const explosion = new Explosion3D(this.scene, parachute.getPosition());
                    this.explosions.push(explosion);
                    
                    // حذف تیر و چترباز
                    bullet.remove();
                    parachute.remove();
                    
                    this.bullets.splice(i, 1);
                    this.parachutes.splice(j, 1);
                    
                    // افزایش امتیاز
                    this.increaseScore(25);
                    
                    break;
                }
            }
        }
    }

    isColliding(bullet, parachute) {
        const bulletPos = bullet.getPosition();
        const parachutePos = parachute.getPosition();
        
        const dx = bulletPos.x - parachutePos.x;
        const dy = bulletPos.y - parachutePos.y;
        const dz = bulletPos.z - parachutePos.z;
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return distance < 3;
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
        this.hideCinematicBars();
        this.gameManager.gameOver(this.score);
    }

    cleanup() {
        this.parachutes.forEach(p => p.remove());
        this.bullets.forEach(b => b.remove());
        this.explosions.forEach(e => e.remove());
        
        this.parachutes = [];
        this.bullets = [];
        this.explosions = [];
    }

    showCinematicBars() {
        document.getElementById('cinematicBars').classList.remove('hidden');
    }

    hideCinematicBars() {
        document.getElementById('cinematicBars').classList.add('hidden');
    }
                  }
