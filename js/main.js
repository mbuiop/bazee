// فایل اصلی بازی - گرافیک سه بعدی سینمایی
class TrainCombatGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = document.getElementById('ui');
        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.health = 100;
        this.ammo = 1000;
        this.speed = 0;
        
        // تنظیمات گرافیک
        this.graphics = {
            quality: 'ultra',
            shadows: true,
            reflections: true,
            particles: true,
            postProcessing: true
        };
        
        // دوربین پهپاد
        this.camera = {
            x: 0,
            y: 50,
            z: 100,
            rotation: {
                x: -0.3,
                y: 0,
                z: 0
            },
            fov: 75,
            shake: 0
        };
        
        // اشیاء سه بعدی
        this.scene = {
            train: null,
            tracks: [],
            enemies: [],
            environment: [],
            particles: [],
            bullets: []
        };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.create3DScene();
        this.setupEventListeners();
        this.gameLoop();
        
        // شروع انیمیشن‌های پس‌زمینه
        this.startBackgroundAnimations();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // تنظیمات پیشرفته گرافیک
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // ایجاد افکت سینمایی
        this.createCinematicEffects();
    }

    create3DScene() {
        // ایجاد قطار سه بعدی
        this.scene.train = this.create3DTrain();
        
        // ایجاد ریل‌های سه بعدی
        this.create3DTracks();
        
        // ایجاد محیط سه بعدی
        this.create3DEnvironment();
        
        // ایجاد دشمنان اولیه
        this.spawnInitialEnemies();
    }

    create3DTrain() {
        return {
            position: { x: 0, y: 5, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            speed: 0,
            maxSpeed: 200,
            cars: [],
            weapons: {
                machineGun: {
                    position: { x: 2, y: 8, z: -15 },
                    rotation: { x: 0, y: 0, z: 0 },
                    firing: false,
                    cooldown: 0
                }
            },
            // جزئیات گرافیکی قطار
            details: {
                color: '#8B4513',
                metallic: 0.8,
                roughness: 0.2,
                lights: {
                    front: { on: true, color: '#FFFFFF', intensity: 2 },
                    cabin: { on: true, color: '#FFA500', intensity: 1 }
                }
            }
        };
    }

    create3DTracks() {
        const trackCount = 100;
        for (let i = 0; i < trackCount; i++) {
            this.scene.tracks.push({
                position: { x: 0, y: 0, z: i * -10 },
                type: 'straight',
                curve: 0,
                // جزئیات گرافیکی ریل
                details: {
                    metalColor: '#696969',
                    woodColor: '#8B4513',
                    reflectivity: 0.6
                }
            });
        }
    }

    create3DEnvironment() {
        // محیط شهری
        this.createCityEnvironment();
        
        // محیط بیابانی
        this.createDesertEnvironment();
        
        // محیط دریایی
        this.createOceanEnvironment();
        
        // محیط کوهستانی
        this.createMountainEnvironment();
    }

    createCityEnvironment() {
        const buildingCount = 50;
        for (let i = 0; i < buildingCount; i++) {
            const size = Math.random() * 30 + 20;
            this.scene.environment.push({
                type: 'building',
                position: {
                    x: (Math.random() - 0.5) * 200,
                    y: size / 2,
                    z: Math.random() * -500
                },
                size: {
                    width: Math.random() * 15 + 10,
                    height: size,
                    depth: Math.random() * 15 + 10
                },
                color: this.getRandomBuildingColor(),
                windows: Math.floor(Math.random() * 20) + 10,
                lights: Math.random() > 0.3
            });
        }
    }

    createDesertEnvironment() {
        const rockCount = 30;
        for (let i = 0; i < rockCount; i++) {
            this.scene.environment.push({
                type: 'rock',
                position: {
                    x: (Math.random() - 0.5) * 300,
                    y: 0,
                    z: Math.random() * -800 - 200
                },
                size: Math.random() * 8 + 2,
                color: '#A0522D',
                roughness: 0.9
            });
        }

        // ایجاد کاکتوس‌ها
        const cactusCount = 20;
        for (let i = 0; i < cactusCount; i++) {
            this.scene.environment.push({
                type: 'cactus',
                position: {
                    x: (Math.random() - 0.5) * 250,
                    y: 0,
                    z: Math.random() * -800 - 200
                },
                height: Math.random() * 6 + 3,
                color: '#228B22',
                arms: Math.floor(Math.random() * 3)
            });
        }
    }

    createOceanEnvironment() {
        // ایجاد جزایر
        const islandCount = 5;
        for (let i = 0; i < islandCount; i++) {
            this.scene.environment.push({
                type: 'island',
                position: {
                    x: (Math.random() - 0.5) * 400,
                    y: -2,
                    z: Math.random() * -1000 - 300
                },
                size: Math.random() * 50 + 30,
                color: '#32CD32',
                trees: Math.floor(Math.random() * 20) + 10
            });
        }

        // ایجاد امواج
        const waveCount = 100;
        for (let i = 0; i < waveCount; i++) {
            this.scene.environment.push({
                type: 'wave',
                position: {
                    x: (Math.random() - 0.5) * 600,
                    y: 0,
                    z: Math.random() * -1200 - 400
                },
                amplitude: Math.random() * 2 + 1,
                frequency: Math.random() * 0.1 + 0.05,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    createMountainEnvironment() {
        const mountainCount = 15;
        for (let i = 0; i < mountainCount; i++) {
            this.scene.environment.push({
                type: 'mountain',
                position: {
                    x: (Math.random() - 0.5) * 500,
                    y: 0,
                    z: Math.random() * -1500 - 600
                },
                height: Math.random() * 100 + 50,
                baseSize: Math.random() * 80 + 40,
                color: '#708090',
                snow: Math.random() > 0.7
            });
        }
    }

    spawnInitialEnemies() {
        const enemyTypes = ['soldier', 'jeep', 'tank', 'helicopter', 'monster'];
        
        for (let i = 0; i < 20; i++) {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            this.scene.enemies.push(this.createEnemy(type, i));
        }
    }

    createEnemy(type, id) {
        const baseEnemy = {
            id: id,
            type: type,
            position: {
                x: (Math.random() - 0.5) * 200,
                y: 0,
                z: Math.random() * -500 - 100
            },
            health: 100,
            maxHealth: 100,
            speed: Math.random() * 2 + 1,
            attackPower: 10,
            attackRange: 50,
            lastAttack: 0,
            state: 'patrol', // patrol, attack, chase, dead
            animation: {
                time: 0,
                type: 'idle'
            }
        };

        switch (type) {
            case 'soldier':
                return {
                    ...baseEnemy,
                    size: { width: 2, height: 6, depth: 2 },
                    color: '#36454F',
                    weapon: 'rifle',
                    attackCooldown: 1000
                };
            case 'jeep':
                return {
                    ...baseEnemy,
                    size: { width: 4, height: 3, depth: 6 },
                    color: '#8B0000',
                    weapon: 'machineGun',
                    attackCooldown: 500
                };
            case 'tank':
                return {
                    ...baseEnemy,
                    size: { width: 8, height: 4, depth: 10 },
                    color: '#556B2F',
                    weapon: 'cannon',
                    attackCooldown: 2000,
                    health: 200,
                    maxHealth: 200
                };
            case 'helicopter':
                return {
                    ...baseEnemy,
                    position: { ...baseEnemy.position, y: 20 },
                    size: { width: 6, height: 3, depth: 12 },
                    color: '#2F4F4F',
                    weapon: 'missiles',
                    attackCooldown: 1500,
                    movement: 'air'
                };
            case 'monster':
                return {
                    ...baseEnemy,
                    size: { width: 10, height: 8, depth: 10 },
                    color: '#800020',
                    weapon: 'claws',
                    attackCooldown: 800,
                    health: 150,
                    maxHealth: 150,
                    specialAbility: 'charge'
                };
        }
    }

    setupEventListeners() {
        // کنترل‌های کیبورد
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // کنترل‌های لمسی برای موبایل
        this.setupTouchControls();
        
        // ریسایز پنجره
        window.addEventListener('resize', () => this.handleResize());
        
        // کنترل‌های ماوس
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // کنترل‌های گیم پد
        this.setupGamepad();
    }

    handleKeyDown(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.accelerateTrain();
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.decelerateTrain();
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.aimLeft();
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.aimRight();
                break;
            case 'Space':
                this.startFiring();
                break;
            case 'KeyR':
                this.reloadWeapon();
                break;
            case 'KeyC':
                this.switchCamera();
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.code) {
            case 'Space':
                this.stopFiring();
                break;
        }
    }

    setupTouchControls() {
        // ایجاد کنترل‌های لمسی
        this.createTouchControls();
    }

    createTouchControls() {
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `
            <div class="control-btn" id="accelerateBtn">🚄</div>
            <div class="control-btn" id="fireBtn">🔫</div>
            <div class="control-btn" id="brakeBtn">🛑</div>
            <div class="control-btn" id="cameraBtn">📷</div>
        `;
        document.getElementById('gameContainer').appendChild(controls);

        // اضافه کردن ایونت‌های لمسی
        document.getElementById('accelerateBtn').addEventListener('touchstart', () => this.accelerateTrain());
        document.getElementById('fireBtn').addEventListener('touchstart', () => this.startFiring());
        document.getElementById('fireBtn').addEventListener('touchend', () => this.stopFiring());
        document.getElementById('brakeBtn').addEventListener('touchstart', () => this.decelerateTrain());
        document.getElementById('cameraBtn').addEventListener('touchstart', () => this.switchCamera());
    }

    accelerateTrain() {
        if (this.scene.train.speed < this.scene.train.maxSpeed) {
            this.scene.train.speed += 2;
            this.createSpeedParticles();
        }
    }

    decelerateTrain() {
        if (this.scene.train.speed > 0) {
            this.scene.train.speed -= 3;
            this.createBrakeParticles();
        }
    }

    startFiring() {
        this.scene.train.weapons.machineGun.firing = true;
        this.createMuzzleFlash();
    }

    stopFiring() {
        this.scene.train.weapons.machineGun.firing = false;
    }

    createMuzzleFlash() {
        if (!this.scene.train.weapons.machineGun.firing) return;

        const flash = {
            position: { ...this.scene.train.weapons.machineGun.position },
            size: 3,
            life: 0.1,
            maxLife: 0.1,
            color: '#FFFF00'
        };
        this.scene.particles.push(flash);

        // ایجاد گلوله
        this.createBullet();
    }

    createBullet() {
        const bullet = {
            position: { ...this.scene.train.weapons.machineGun.position },
            velocity: {
                x: Math.sin(this.scene.train.weapons.machineGun.rotation.y) * 20,
                y: -Math.sin(this.scene.train.weapons.machineGun.rotation.x) * 20,
                z: -Math.cos(this.scene.train.weapons.machineGun.rotation.y) * 20
            },
            life: 2,
            damage: 25
        };
        this.scene.bullets.push(bullet);

        this.ammo--;
        this.updateUI();
    }

    createSpeedParticles() {
        if (this.scene.train.speed > 50) {
            for (let i = 0; i < 3; i++) {
                this.scene.particles.push({
                    position: {
                        x: (Math.random() - 0.5) * 10,
                        y: 2,
                        z: 20
                    },
                    velocity: {
                        x: (Math.random() - 0.5) * 2,
                        y: Math.random() * 2,
                        z: Math.random() * 5 + 5
                    },
                    life: 1,
                    color: '#87CEEB',
                    size: Math.random() * 2 + 1
                });
            }
        }
    }

    createBrakeParticles() {
        for (let i = 0; i < 5; i++) {
            this.scene.particles.push({
                position: {
                    x: (Math.random() - 0.5) * 8,
                    y: 1,
                    z: -25
                },
                velocity: {
                    x: (Math.random() - 0.5) * 3,
                    y: Math.random() * 1,
                    z: Math.random() * -2 - 1
                },
                life: 0.5,
                color: '#FF4500',
                size: Math.random() * 3 + 2
            });
        }
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.updateTrain();
        this.updateCamera();
        this.updateEnemies();
        this.updateBullets();
        this.updateParticles();
        this.checkCollisions();
        this.updateUI();
    }

    updateTrain() {
        // به روز رسانی موقعیت قطار بر اساس سرعت
        this.scene.train.position.z -= this.scene.train.speed * 0.1;
        
        // انیمیشن قطار
        this.scene.train.rotation.x = Math.sin(Date.now() * 0.005) * 0.1;
        this.scene.train.rotation.z = Math.sin(Date.now() * 0.003) * 0.05;
        
        // به روز رسانی اسلحه
        if (this.scene.train.weapons.machineGun.firing) {
            this.scene.train.weapons.machineGun.cooldown--;
            if (this.scene.train.weapons.machineGun.cooldown <= 0) {
                this.createMuzzleFlash();
                this.scene.train.weapons.machineGun.cooldown = 3;
            }
        }
    }

    updateCamera() {
        // حرکت دوربین پهپاد
        const time = Date.now() * 0.001;
        this.camera.x = Math.sin(time * 0.5) * 20;
        this.camera.y = 50 + Math.sin(time * 0.3) * 10;
        this.camera.z = 100 + Math.cos(time * 0.2) * 15;
        
        this.camera.rotation.y = Math.sin(time * 0.1) * 0.2;
        
        // لرزش دوربین در هنگام شلیک
        if (this.scene.train.weapons.machineGun.firing) {
            this.camera.shake = 0.5;
        }
        
        if (this.camera.shake > 0) {
            this.camera.shake -= 0.1;
        }
    }

    updateEnemies() {
        this.scene.enemies.forEach(enemy => {
            if (enemy.health <= 0) {
                enemy.state = 'dead';
                return;
            }

            // محاسبه فاصله تا قطار
            const dx = enemy.position.x - this.scene.train.position.x;
            const dz = enemy.position.z - this.scene.train.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            switch (enemy.state) {
                case 'patrol':
                    enemy.position.x += Math.sin(Date.now() * 0.001 + enemy.id) * enemy.speed * 0.1;
                    if (distance < enemy.attackRange) {
                        enemy.state = 'attack';
                    }
                    break;
                case 'attack':
                    if (distance > enemy.attackRange * 1.5) {
                        enemy.state = 'patrol';
                    } else {
                        this.enemyAttack(enemy);
                    }
                    break;
            }

            // به روز رسانی انیمیشن
            enemy.animation.time += 0.1;
        });

        // حذف دشمنان مرده
        this.scene.enemies = this.scene.enemies.filter(enemy => enemy.health > 0);
    }

    enemyAttack(enemy) {
        const now = Date.now();
        if (now - enemy.lastAttack > enemy.attackCooldown) {
            // ایجاد پرتابه دشمن
            this.createEnemyProjectile(enemy);
            enemy.lastAttack = now;
            
            // شانس آسیب به قطار
            if (Math.random() < 0.1) {
                this.health -= enemy.attackPower;
                this.createDamageEffect();
            }
        }
    }

    createEnemyProjectile(enemy) {
        const projectile = {
            type: enemy.weapon,
            position: { ...enemy.position },
            target: { ...this.scene.train.position },
            speed: 5,
            damage: enemy.attackPower
        };
        
        // اضافه کردن به لیست پرتابه‌ها
        if (!this.scene.enemyProjectiles) this.scene.enemyProjectiles = [];
        this.scene.enemyProjectiles.push(projectile);
    }

    updateBullets() {
        // به روز رسانی گلوله‌های玩家
        this.scene.bullets.forEach(bullet => {
            bullet.position.x += bullet.velocity.x;
            bullet.position.y += bullet.velocity.y;
            bullet.position.z += bullet.velocity.z;
            bullet.life -= 0.016;
        });

        this.scene.bullets = this.scene.bullets.filter(bullet => bullet.life > 0);

        // به روز رسانی پرتابه‌های دشمن
        if (this.scene.enemyProjectiles) {
            this.scene.enemyProjectiles.forEach(projectile => {
                const dx = projectile.target.x - projectile.position.x;
                const dz = projectile.target.z - projectile.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance > 1) {
                    projectile.position.x += (dx / distance) * projectile.speed;
                    projectile.position.z += (dz / distance) * projectile.speed;
                }
            });

            this.scene.enemyProjectiles = this.scene.enemyProjectiles.filter(p => {
                const dx = p.target.x - p.position.x;
                const dz = p.target.z - p.position.z;
                return Math.sqrt(dx * dx + dz * dz) > 1;
            });
        }
    }

    updateParticles() {
        this.scene.particles.forEach(particle => {
            particle.position.x += particle.velocity?.x || 0;
            particle.position.y += particle.velocity?.y || 0;
            particle.position.z += particle.velocity?.z || 0;
            particle.life -= 0.016;
        });

        this.scene.particles = this.scene.particles.filter(p => p.life > 0);
    }

    checkCollisions() {
        // بررسی برخورد گلوله‌ها با دشمنان
        this.scene.bullets.forEach((bullet, bulletIndex) => {
            this.scene.enemies.forEach((enemy, enemyIndex) => {
                const dx = bullet.position.x - enemy.position.x;
                const dz = bullet.position.z - enemy.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance < (enemy.size.width / 2 + 1)) {
                    enemy.health -= bullet.damage;
                    this.createHitEffect(enemy.position);
                    this.scene.bullets.splice(bulletIndex, 1);
                    this.score += 10;
                    
                    if (enemy.health <= 0) {
                        this.createExplosionEffect(enemy.position);
                        this.score += 50;
                    }
                }
            });
        });
    }

    createHitEffect(position) {
        for (let i = 0; i < 5; i++) {
            this.scene.particles.push({
                position: { ...position },
                velocity: {
                    x: (Math.random() - 0.5) * 10,
                    y: (Math.random() - 0.5) * 10,
                    z: (Math.random() - 0.5) * 10
                },
                life: 0.5,
                color: '#FF0000',
                size: Math.random() * 2 + 1
            });
        }
    }

    createExplosionEffect(position) {
        for (let i = 0; i < 20; i++) {
            this.scene.particles.push({
                position: { ...position },
                velocity: {
                    x: (Math.random() - 0.5) * 20,
                    y: (Math.random() - 0.5) * 20,
                    z: (Math.random() - 0.5) * 20
                },
                life: 1,
                color: '#FF4500',
                size: Math.random() * 4 + 2
            });
        }
        
        // لرزش دوربین
        this.camera.shake = 1;
    }

    createDamageEffect() {
        // ایجاد افکت آسیب قرمز
        const damageEffect = document.createElement('div');
        damageEffect.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 0, 0, 0.3);
            pointer-events: none;
            z-index: 100;
        `;
        document.getElementById('gameContainer').appendChild(damageEffect);
        
        setTimeout(() => {
            damageEffect.remove();
        }, 200);
    }

    render() {
        // پاک کردن کانواس
        this.ctx.fillStyle = this.getSkyColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // اعمال لرزش دوربین
        if (this.camera.shake > 0) {
            this.ctx.save();
            this.ctx.translate(
                (Math.random() - 0.5) * this.camera.shake * 10,
                (Math.random() - 0.5) * this.camera.shake * 10
            );
        }
        
        // رندر محیط
        this.renderEnvironment();
        
        // رندر ریل‌ها
        this.renderTracks();
        
        // رندر قطار
        this.renderTrain();
        
        // رندر دشمنان
        this.renderEnemies();
        
        // رندر گلوله‌ها
        this.renderBullets();
        
        // رندر ذرات
        this.renderParticles();
        
        // بازگرداندن ترنسفورم در صورت لرزش
        if (this.camera.shake > 0) {
            this.ctx.restore();
        }
        
        // رندر افکت‌های پس‌پردازش
        this.renderPostProcessing();
    }

    renderEnvironment() {
        this.scene.environment.forEach(item => {
            switch (item.type) {
                case 'building':
                    this.renderBuilding(item);
                    break;
                case 'rock':
                    this.renderRock(item);
                    break;
                case 'cactus':
                    this.renderCactus(item);
                    break;
                case 'wave':
                    this.renderWave(item);
                    break;
                case 'mountain':
                    this.renderMountain(item);
                    break;
            }
        });
    }

    renderBuilding(building) {
        const screenPos = this.worldToScreen(building.position);
        if (!this.isInView(screenPos)) return;

        const width = building.size.width * 2;
        const height = building.size.height;
        
        // بدنه ساختمان
        this.ctx.fillStyle = building.color;
        this.ctx.fillRect(screenPos.x - width/2, screenPos.y - height, width, height);
        
        // پنجره‌ها
        if (building.lights) {
            this.ctx.fillStyle = '#FFD700';
            for (let i = 0; i < building.windows; i++) {
                const wx = screenPos.x - width/2 + Math.random() * width;
                const wy = screenPos.y - height + Math.random() * height;
                if (Math.random() > 0.7) {
                    this.ctx.fillRect(wx, wy, 3, 5);
                }
            }
        }
    }

    renderTrain() {
        const train = this.scene.train;
        const screenPos = this.worldToScreen(train.position);
        
        // بدنه اصلی قطار
        this.ctx.fillStyle = train.details.color;
        this.ctx.fillRect(screenPos.x - 20, screenPos.y - 15, 40, 30);
        
        // کابین
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.fillRect(screenPos.x - 15, screenPos.y - 25, 20, 10);
        
        // چرخ‌ها
        this.ctx.fillStyle = '#000000';
        for (let i = -15; i <= 15; i += 10) {
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x + i, screenPos.y + 15, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // اسلحه
        this.renderWeapon();
    }

    renderWeapon() {
        const weapon = this.scene.train.weapons.machineGun;
        const screenPos = this.worldToScreen(weapon.position);
        
        this.ctx.fillStyle = '#36454F';
        this.ctx.fillRect(screenPos.x - 2, screenPos.y - 10, 4, 15);
        
        // لوله اسلحه
        this.ctx.fillStyle = '#696969';
        this.ctx.fillRect(screenPos.x - 1, screenPos.y - 15, 2, 10);
    }

    renderEnemies() {
        this.scene.enemies.forEach(enemy => {
            const screenPos = this.worldToScreen(enemy.position);
            if (!this.isInView(screenPos)) return;

            this.ctx.fillStyle = enemy.color;
            
            switch (enemy.type) {
                case 'soldier':
                    this.ctx.fillRect(screenPos.x - 5, screenPos.y - 15, 10, 15);
                    break;
                case 'jeep':
                    this.ctx.fillRect(screenPos.x - 10, screenPos.y - 8, 20, 8);
                    break;
                case 'tank':
                    this.ctx.fillRect(screenPos.x - 15, screenPos.y - 10, 30, 10);
                    // لوله تانک
                    this.ctx.fillStyle = '#696969';
                    this.ctx.fillRect(screenPos.x, screenPos.y - 15, 3, 10);
                    break;
                case 'helicopter':
                    this.ctx.fillRect(screenPos.x - 8, screenPos.y - 6, 16, 6);
                    // پره‌ها
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(screenPos.x, screenPos.y - 10, 12, 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;
                case 'monster':
                    this.ctx.fillRect(screenPos.x - 12, screenPos.y - 20, 24, 20);
                    // چشم‌ها
                    this.ctx.fillStyle = '#FF0000';
                    this.ctx.fillRect(screenPos.x - 8, screenPos.y - 18, 3, 3);
                    this.ctx.fillRect(screenPos.x + 5, screenPos.y - 18, 3, 3);
                    break;
            }
            
            // نوار سلامت
            this.renderHealthBar(enemy, screenPos);
        });
    }

    renderHealthBar(enemy, screenPos) {
        const barWidth = 30;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - 25, barWidth, 3);
        
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - 25, barWidth * healthPercent, 3);
    }

    renderBullets() {
        this.ctx.fillStyle = '#FFFF00';
        this.scene.bullets.forEach(bullet => {
            const screenPos = this.worldToScreen(bullet.position);
            if (this.isInView(screenPos)) {
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    renderParticles() {
        this.scene.particles.forEach(particle => {
            const screenPos = this.worldToScreen(particle.position);
            if (this.isInView(screenPos)) {
                const alpha = particle.life / particle.maxLife;
                this.ctx.fillStyle = this.hexToRgb(particle.color, alpha);
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    worldToScreen(worldPos) {
        // تبدیل مختصات سه بعدی به دو بعدی با در نظر گرفتن دوربین
        const relativeX = worldPos.x - this.camera.x;
        const relativeY = worldPos.y - this.camera.y;
        const relativeZ = worldPos.z - this.camera.z;
        
        // اعمال چرخش دوربین
        const cosY = Math.cos(this.camera.rotation.y);
        const sinY = Math.sin(this.camera.rotation.y);
        
        const rotatedX = relativeX * cosY - relativeZ * sinY;
        const rotatedZ = relativeX * sinY + relativeZ * cosY;
        
        // projection ساده
        const scale = this.camera.fov / (rotatedZ + this.camera.fov);
        const screenX = this.canvas.width / 2 + rotatedX * scale;
        const screenY = this.canvas.height / 2 - relativeY * scale;
        
        return { x: screenX, y: screenY, scale: scale };
    }

    isInView(screenPos) {
        return screenPos.x > -100 && screenPos.x < this.canvas.width + 100 &&
               screenPos.y > -100 && screenPos.y < this.canvas.height + 100;
    }

    getSkyColor() {
        // گرادیان آسمان بر اساس موقعیت
        const time = (Date.now() * 0.0001) % 1;
        if (time < 0.25) return '#87CEEB'; // روز
        if (time < 0.5) return '#FFA500'; // غروب
        if (time < 0.75) return '#191970'; // شب
        return '#FF4500'; // طلوع
    }

    hexToRgb(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    getRandomBuildingColor() {
        const colors = ['#708090', '#2F4F4F', '#696969', '#800000', '#8B4513'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateUI() {
        document.getElementById('healthFill').style.width = `${this.health}%`;
        document.getElementById('ammoCounter').textContent = `🔫 مهمات: ${this.ammo}`;
        document.getElementById('speedIndicator').textContent = `🚄 سرعت: ${Math.round(this.scene.train.speed)} کیلومتر`;
        
        // تغییر رنگ سلامت بر اساس مقدار
        if (this.health < 30) {
            document.getElementById('healthFill').style.background = 'linear-gradient(90deg, #ff0000, #ff0000)';
        } else if (this.health < 60) {
            document.getElementById('healthFill').style.background = 'linear-gradient(90deg, #ff0000, #ff9500)';
        }
    }

    createCinematicEffects() {
        // ایجاد افکت‌های سینمایی
        this.createFilmGrain();
        this.createVignette();
        this.createCinematicBars();
    }

    createFilmGrain() {
        const grain = document.createElement('div');
        grain.id = 'filmGrain';
        grain.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" opacity="0.05"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" stitchTiles="stitch"/></filter><rect width="400" height="400" filter="url(%23noise)"/></svg>');
            animation: filmGrain 1s steps(10) infinite;
            pointer-events: none;
            z-index: 300;
        `;
        document.getElementById('gameContainer').appendChild(grain);
    }

    createVignette() {
        const vignette = document.createElement('div');
        vignette.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%);
            pointer-events: none;
            z-index: 250;
        `;
        document.getElementById('gameContainer').appendChild(vignette);
    }

    createCinematicBars() {
        const bars = document.createElement('div');
        bars.className = 'cinematic-bars';
        bars.innerHTML = `
            <div class="top-bar"></div>
            <div class="bottom-bar"></div>
        `;
        document.getElementById('gameContainer').appendChild(bars);
    }

    startBackgroundAnimations() {
        this.animateBackgroundElements();
    }

    animateBackgroundElements() {
        // انیمیشن عناصر پس‌زمینه
        setInterval(() => {
            this.scene.environment.forEach(item => {
                if (item.type === 'wave') {
                    item.phase += 0.1;
                }
            });
        }, 100);
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupGamepad() {
        // پشتیبانی از گیم پد
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected:", e.gamepad);
        });
    }

    switchCamera() {
        // تغییر زاویه دوربین
        this.camera.fov = this.camera.fov === 75 ? 45 : 75;
    }

    reloadWeapon() {
        this.ammo = 1000;
        this.updateUI();
    }

    aimLeft() {
        this.scene.train.weapons.machineGun.rotation.y -= 0.1;
    }

    aimRight() {
        this.scene.train.weapons.machineGun.rotation.y += 0.1;
    }

    // سایر متدهای رندر برای محیط‌های مختلف
    renderTracks() {
        this.scene.tracks.forEach(track => {
            const screenPos = this.worldToScreen(track.position);
            if (this.isInView(screenPos)) {
                this.ctx.fillStyle = track.details.metalColor;
                this.ctx.fillRect(screenPos.x - 100, screenPos.y, 200, 5);
            }
        });
    }

    renderRock(rock) {
        const screenPos = this.worldToScreen(rock.position);
        if (this.isInView(screenPos)) {
            this.ctx.fillStyle = rock.color;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, rock.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderCactus(cactus) {
        const screenPos = this.worldToScreen(cactus.position);
        if (this.isInView(screenPos)) {
            this.ctx.fillStyle = cactus.color;
            this.ctx.fillRect(screenPos.x - 3, screenPos.y - cactus.height, 6, cactus.height);
            
            // بازوهای کاکتوس
            for (let i = 0; i < cactus.arms; i++) {
                this.ctx.fillRect(screenPos.x - 8 + i * 8, screenPos.y - cactus.height + 10, 8, 3);
            }
        }
    }

    renderWave(wave) {
        const screenPos = this.worldToScreen(wave.position);
        if (this.isInView(screenPos)) {
            const waveHeight = Math.sin(wave.phase + wave.position.z * wave.frequency) * wave.amplitude;
            this.ctx.fillStyle = '#1E90FF';
            this.ctx.fillRect(screenPos.x - 20, screenPos.y - waveHeight, 40, 5);
        }
    }

    renderMountain(mountain) {
        const screenPos = this.worldToScreen(mountain.position);
        if (this.isInView(screenPos)) {
            this.ctx.fillStyle = mountain.color;
            this.ctx.beginPath();
            this.ctx.moveTo(screenPos.x - mountain.baseSize/2, screenPos.y);
            this.ctx.lineTo(screenPos.x, screenPos.y - mountain.height);
            this.ctx.lineTo(screenPos.x + mountain.baseSize/2, screenPos.y);
            this.ctx.closePath();
            this.ctx.fill();
            
            if (mountain.snow) {
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(screenPos.x - 10, screenPos.y - mountain.height, 20, 10);
            }
        }
    }

    renderPostProcessing() {
        // اعمال افکت‌های پس‌پردازش
        if (this.graphics.postProcessing) {
            this.applyColorGrading();
            this.applyBloomEffect();
        }
    }

    applyColorGrading() {
        // اعمال گرادیان رنگ سینمایی
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/2
        );
        gradient.addColorStop(0, 'rgba(255, 223, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(138, 43, 226, 0.1)');
        
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = 'source-over';
    }

    applyBloomEffect() {
        // ایجاد افکت درخشش
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
}

// راه‌اندازی بازی
function initGame() {
    window.game = new TrainCombatGame();
}

// شروع بازی وقتی صفحه لود شد
window.addEventListener('load', () => {
    console.log('🎮 بازی قطار جنگی سه بعدی آماده است!');
    console.log('🚄 کنترل‌ها:');
    console.log('   W/↑: شتاب گرفتن');
    console.log('   S/↓: ترمز گرفتن');
    console.log('   A/←: هدف‌گیری چپ');
    console.log('   D/→: هدف‌گیری راست');
    console.log('   Space: شلیک');
    console.log('   R: پر کردن مهمات');
    console.log('   C: تغییر دوربین');
});
