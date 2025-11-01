// موتور رندر سه‌بعدی سینمایی - بازی قطار
class CinematicTrain3D {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu';
        this.score = 0;
        this.wave = 1;
        this.health = 100;
        this.ammo = 1000;
        this.trainSpeed = 120;
        
        // مختصات سه‌بعدی
        this.camera = {
            x: 0, y: 15, z: -25,
            targetX: 0, targetY: 5, targetZ: 50,
            fov: 60
        };
        
        this.train = {
            x: 0, y: 2, z: 0,
            rail: 2,
            rotation: 0
        };
        
        this.enemies = [];
        this.environment = [];
        this.particles = [];
        
        this.keys = {};
        this.lastTime = 0;
        this.animationId = null;
        
        this.initialize();
    }

    initialize() {
        this.setupCanvas();
        this.setupEventListeners();
        this.generateEnvironment();
        this.simulateLoading();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    setupEventListeners() {
        // دکمه‌های منو
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMainMenu());

        // کنترل‌های صفحه‌کلید
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape') this.togglePause();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        window.addEventListener('resize', () => this.setupCanvas());
    }

    simulateLoading() {
        const progressFill = document.getElementById('loadingProgress');
        const progressText = document.getElementById('loadingText');
        const steps = [
            'بارگذاری موتور گرافیکی سه‌بعدی...',
            'مقداردهی سیستم فیزیک پیشرفته...',
            'لود مدل‌های سینمایی...',
            'آماده‌سازی محیط‌های بازی...',
            'تنظیم دوربین پهپادی...',
            'بارگذاری صداهای دالبی...',
            'فعال‌سازی سیستم نورپردازی...',
            'پیکربندی افکت‌های پس‌پردازش...',
            'بررسی عملکرد سینمایی...',
            'آماده برای شروع ماجراجویی!'
        ];

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = steps[progress / 10 - 1];
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    progressText.textContent = 'دنیای سینمایی آماده است!';
                }, 500);
            }
        }, 300);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    startGame() {
        this.showScreen('gameScreen');
        this.gameState = 'playing';
        this.initializeGame();
        this.gameLoop();
    }

    initializeGame() {
        this.score = 0;
        this.wave = 1;
        this.health = 100;
        this.ammo = 1000;
        this.trainSpeed = 120;
        
        this.train = { x: 0, y: 2, z: 0, rail: 2, rotation: 0 };
        this.enemies = [];
        this.particles = [];
        
        this.generateEnemies();
        this.updateHUD();
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        this.updateTrain(deltaTime);
        this.updateCamera(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateParticles(deltaTime);
        this.updateEnvironment(deltaTime);
        this.handleInput();
        this.checkCollisions();
        this.updateHUD();
    }

    updateTrain(deltaTime) {
        // حرکت قطار به جلو
        this.train.z += this.trainSpeed * deltaTime * 0.1;
        
        // تغییر ریل
        const targetX = (this.train.rail - 2) * 6;
        this.train.x += (targetX - this.train.x) * 0.1;
        
        // انیمیشن قطار
        this.train.rotation = Math.sin(Date.now() * 0.005) * 0.1;
        
        // افزایش سرعت تدریجی
        this.trainSpeed = Math.min(200, 120 + this.wave * 5);
    }

    updateCamera(deltaTime) {
        // حرکت دوربین پهپادی سینمایی
        const time = Date.now() * 0.001;
        
        this.camera.x = Math.sin(time * 0.3) * 8;
        this.camera.y = 10 + Math.sin(time * 0.5) * 2;
        this.camera.z = this.train.z - 20 + Math.cos(time * 0.4) * 3;
        
        this.camera.targetX = this.train.x;
        this.camera.targetY = this.train.y + 2;
        this.camera.targetZ = this.train.z + 30;
    }

    updateEnemies(deltaTime) {
        // به‌روزرسانی دشمنان
        for (let enemy of this.enemies) {
            enemy.z -= this.trainSpeed * deltaTime * 0.1;
            enemy.x += Math.sin(enemy.z * 0.1 + enemy.id) * 0.1;
            enemy.y += Math.cos(enemy.z * 0.05 + enemy.id) * 0.05;
            
            // چرخش دشمنان
            enemy.rotationY += deltaTime;
            
            // حذف دشمنان عقب‌افتاده
            if (enemy.z < this.train.z - 50) {
                enemy.z = this.train.z + 100 + Math.random() * 50;
            }
        }
    }

    updateParticles(deltaTime) {
        // به‌روزرسانی ذرات
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.z += particle.vz * deltaTime;
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // ایجاد ذرات جدید برای دود قطار
        if (Math.random() < 0.3) {
            this.particles.push({
                x: this.train.x,
                y: this.train.y + 1,
                z: this.train.z - 5,
                vx: (Math.random() - 0.5) * 0.5,
                vy: Math.random() * 0.5,
                vz: -Math.random() * 2,
                life: 2 + Math.random() * 2,
                size: 3 + Math.random() * 4
            });
        }
    }

    updateEnvironment(deltaTime) {
        // حرکت محیط به عقب برای ایجاد حس حرکت
        for (let obj of this.environment) {
            obj.z -= this.trainSpeed * deltaTime * 0.1;
            if (obj.z < this.train.z - 100) {
                obj.z += 200;
            }
        }
    }

    handleInput() {
        if (this.keys['ArrowLeft'] && this.train.rail > 0) {
            this.train.rail--;
            this.keys['ArrowLeft'] = false;
        }
        if (this.keys['ArrowRight'] && this.train.rail < 4) {
            this.train.rail++;
            this.keys['ArrowRight'] = false;
        }
        if (this.keys[' ']) {
            this.shoot();
            this.keys[' '] = false;
        }
    }

    shoot() {
        if (this.ammo > 0) {
            this.ammo--;
            
            // ایجاد افکت شلیک
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: this.train.x,
                    y: this.train.y + 1,
                    z: this.train.z + 2,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: (Math.random() - 0.5) * 0.2,
                    vz: 10 + Math.random() * 5,
                    life: 0.5 + Math.random() * 0.3,
                    size: 1 + Math.random() * 2,
                    color: '#ffff00'
                });
            }
            
            // بررسی برخورد با دشمنان
            for (let enemy of this.enemies) {
                const dx = enemy.x - this.train.x;
                const dz = enemy.z - this.train.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < 3) {
                    enemy.health -= 10;
                    this.score += 100;
                    
                    // افکت انفجار
                    this.createExplosion(enemy.x, enemy.y, enemy.z);
                    
                    if (enemy.health <= 0) {
                        enemy.z = this.train.z + 200; // انتقال دشمن به عقب
                        enemy.health = 100;
                        this.score += 500;
                    }
                }
            }
        }
    }

    createExplosion(x, y, z) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                z: z,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                vz: (Math.random() - 0.5) * 10,
                life: 1 + Math.random(),
                size: 2 + Math.random() * 3,
                color: '#ff5500'
            });
        }
    }

    checkCollisions() {
        for (let enemy of this.enemies) {
            const dx = enemy.x - this.train.x;
            const dz = enemy.z - this.train.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 2) {
                this.health -= 1;
                this.createExplosion(enemy.x, enemy.y, enemy.z);
                enemy.z = this.train.z + 100;
            }
        }
        
        if (this.health <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        alert(`بازی پایان یافت! امتیاز نهایی: ${this.score}`);
        this.showMainMenu();
    }

    updateHUD() {
        document.getElementById('scoreValue').textContent = this.score.toLocaleString();
        document.getElementById('waveValue').textContent = this.wave;
        document.getElementById('speedValue').textContent = `${Math.round(this.trainSpeed)} km/h`;
        document.getElementById('healthFill').style.width = `${this.health}%`;
        document.getElementById('ammoCount').textContent = this.ammo.toLocaleString();
    }

    render() {
        // پاک‌سازی صفحه
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رندر آسمان
        this.renderSky();
        
        // رندر محیط
        this.renderEnvironment();
        
        // رندر ریل‌ها
        this.renderRails();
        
        // رندر قطار
        this.renderTrain();
        
        // رندر دشمنان
        this.renderEnemies();
        
        // رندر ذرات
        this.renderParticles();
        
        // رندر افکت‌های ویژه
        this.renderSpecialEffects();
    }

    renderSky() {
        // گرادیان آسمان
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#003366');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // ستاره‌ها
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (Math.sin(i * 7.3) * this.canvas.width + Date.now() * 0.01) % this.canvas.width;
            const y = (i * 13) % (this.canvas.height * 0.7);
            const size = Math.sin(i + Date.now() * 0.001) * 1 + 0.5;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderEnvironment() {
        // کوه‌ها و زمین
        this.ctx.fillStyle = '#2d5a27';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height * 0.7);
        
        for (let x = 0; x < this.canvas.width; x += 50) {
            const y = this.canvas.height * 0.7 + Math.sin(x * 0.01) * 20;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // درختان و ساختمان‌ها
        for (let obj of this.environment) {
            const screenPos = this.project3D(obj.x, obj.y, obj.z);
            if (screenPos) {
                this.ctx.fillStyle = obj.color;
                this.ctx.fillRect(screenPos.x - 5, screenPos.y - 10, 10, 20);
            }
        }
    }

    renderRails() {
        const railCount = 5;
        const railSpacing = 6;
        
        for (let i = 0; i < railCount; i++) {
            const railX = (i - 2) * railSpacing;
            this.drawRail(railX);
        }
    }

    drawRail(railX) {
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        for (let z = -50; z <= 50; z += 10) {
            const pos = this.project3D(railX, 0, this.train.z + z);
            if (pos) {
                if (z === -50) {
                    this.ctx.moveTo(pos.x, pos.y);
                } else {
                    this.ctx.lineTo(pos.x, pos.y);
                }
            }
        }
        this.ctx.stroke();
        
        // تراورس
        this.ctx.strokeStyle = '#664422';
        this.ctx.lineWidth = 3;
        for (let z = -50; z <= 50; z += 5) {
            const pos1 = this.project3D(-railSpacing * 2, 0, this.train.z + z);
            const pos2 = this.project3D(railSpacing * 2, 0, this.train.z + z);
            if (pos1 && pos2) {
                this.ctx.beginPath();
                this.ctx.moveTo(pos1.x, pos1.y);
                this.ctx.lineTo(pos2.x, pos2.y);
                this.ctx.stroke();
            }
        }
    }

    renderTrain() {
        const pos = this.project3D(this.train.x, this.train.y, this.train.z);
        if (!pos) return;
        
        // بدنه اصلی قطار
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(pos.x - 30, pos.y - 15, 60, 30);
        
        // پنجره‌ها
        this.ctx.fillStyle = '#3498db';
        for (let i = 0; i < 3; i++) {
            this.ctx.fillRect(pos.x - 20 + i * 15, pos.y - 10, 10, 8);
        }
        
        // نور جلو
        const gradient = this.ctx.createRadialGradient(pos.x + 25, pos.y, 0, pos.x + 25, pos.y, 15);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(pos.x + 20, pos.y - 15, 30, 30);
        
        // چرخ‌ها
        this.ctx.fillStyle = '#333333';
        for (let i = -1; i <= 1; i++) {
            const wheelPos = this.project3D(this.train.x + i * 12, this.train.y - 2, this.train.z);
            if (wheelPos) {
                this.ctx.beginPath();
                this.ctx.arc(wheelPos.x, wheelPos.y, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    renderEnemies() {
        for (let enemy of this.enemies) {
            const pos = this.project3D(enemy.x, enemy.y, enemy.z);
            if (!pos) continue;
            
            // بدنه دشمن
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(pos.x - 8, pos.y - 8, 16, 16);
            
            // چشم‌ها
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(pos.x - 4, pos.y - 4, 3, 3);
            this.ctx.fillRect(pos.x + 1, pos.y - 4, 3, 3);
            
            // نوار سلامت
            const healthWidth = 16 * (enemy.health / 100);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(pos.x - 8, pos.y - 12, 16, 2);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(pos.x - 8, pos.y - 12, healthWidth, 2);
        }
    }

    renderParticles() {
        for (let particle of this.particles) {
            const pos = this.project3D(particle.x, particle.y, particle.z);
            if (!pos) continue;
            
            this.ctx.fillStyle = particle.color || '#aaaaaa';
            this.ctx.globalAlpha = particle.life;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    renderSpecialEffects() {
        // افکت سرعت
        if (this.trainSpeed > 150) {
            this.ctx.fillStyle = 'rgba(0, 168, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    project3D(x, y, z) {
        // تبدیل مختصات سه‌بعدی به دو‌بعدی
        const dx = x - this.camera.x;
        const dy = y - this.camera.y;
        const dz = z - this.camera.z;
        
        // فاصله از دوربین
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance > 100) return null;
        
        // زاویه دید
        const scale = this.camera.fov / (this.camera.fov + dz);
        
        const screenX = this.centerX + dx * scale;
        const screenY = this.centerY - dy * scale;
        
        return { x: screenX, y: screenY, scale: scale };
    }

    generateEnvironment() {
        // تولید محیط اطراف
        for (let i = 0; i < 50; i++) {
            this.environment.push({
                x: (Math.random() - 0.5) * 100,
                y: 0,
                z: Math.random() * 200 - 100,
                color: Math.random() > 0.5 ? '#27ae60' : '#8e44ad',
                type: Math.random() > 0.7 ? 'building' : 'tree'
            });
        }
    }

    generateEnemies() {
        // تولید دشمنان
        for (let i = 0; i < 10; i++) {
            this.enemies.push({
                id: i,
                x: (Math.random() - 0.5) * 20,
                y: Math.random() * 5 + 2,
                z: this.train.z + 20 + Math.random() * 80,
                health: 100,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                rotationY: 0
            });
        }
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseMenu').style.display = 'flex';
            cancelAnimationFrame(this.animationId);
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pauseMenu').style.display = 'none';
        this.lastTime = performance.now();
        this.gameLoop();
    }

    restartGame() {
        this.initializeGame();
        this.resumeGame();
    }

    showMainMenu() {
        this.gameState = 'menu';
        document.getElementById('pauseMenu').style.display = 'none';
        cancelAnimationFrame(this.animationId);
        this.showScreen('startScreen');
    }
}

// راه‌اندازی بازی
window.addEventListener('load', () => {
    const game = new CinematicTrain3D();
    console.log('🎮 بازی قطار سینمایی سه‌بعدی راه‌اندازی شد!');
    console.log('🚂 کنترل‌ها: ← → تغییر ریل, Space شلیک, ESC مکث');
});
