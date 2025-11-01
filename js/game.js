// تمام کدهای بازی در یک فایل برای جلوگیری از خطا
class ThreeJSGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.init();
    }

    init() {
        // ایجاد صحنه
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a237e, 50, 300);

        // ایجاد دوربین
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 8, 15);

        // ایجاد رندرر
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x1a237e);
        this.renderer.shadowMap.enabled = true;

        document.getElementById('threejsContainer').appendChild(this.renderer.domElement);

        // اضافه کردن نورها
        this.setupLights();
        
        // ایجاد محیط
        this.createEnvironment();
        
        // مدیریت رزولوشن
        this.setupResizeHandler();
    }

    setupLights() {
        // نور اصلی
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // نور جهت‌دار
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    createEnvironment() {
        // ایجاد زمین
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // ایجاد مسیر قطار
        this.createTrainTrack();
        
        // ایجاد کوه‌ها در دوردست
        this.createMountains();
    }

    createMountains() {
        const mountainGroup = new THREE.Group();
        
        for (let i = 0; i < 10; i++) {
            const height = Math.random() * 20 + 10;
            const geometry = new THREE.ConeGeometry(8, height, 4);
            const material = new THREE.MeshLambertMaterial({ color: 0x455a64 });
            const mountain = new THREE.Mesh(geometry, material);
            
            mountain.position.x = (Math.random() - 0.5) * 100;
            mountain.position.z = -Math.random() * 100 - 50;
            mountain.position.y = height / 2 - 2;
            
            mountainGroup.add(mountain);
        }
        
        this.scene.add(mountainGroup);
    }

    createTrainTrack() {
        const trackGroup = new THREE.Group();
        
        // ریل‌ها
        const railGeometry = new THREE.BoxGeometry(1, 0.3, 200);
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
        
        const leftRail = new THREE.Mesh(railGeometry, railMaterial);
        leftRail.position.x = -2;
        leftRail.position.y = -1.8;
        
        const rightRail = new THREE.Mesh(railGeometry, railMaterial);
        rightRail.position.x = 2;
        rightRail.position.y = -1.8;
        
        trackGroup.add(leftRail);
        trackGroup.add(rightRail);
        
        this.scene.add(trackGroup);
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    getScene() { return this.scene; }
    getCamera() { return this.camera; }
    getRenderer() { return this.renderer; }
}

// کلاس قطار سه بعدی
class Train3D {
    constructor(scene) {
        this.scene = scene;
        this.speed = 0;
        this.maxSpeed = 0.3;
        this.acceleration = 0.002;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = 0;
        this.mesh = null;
        this.gun = null;
        
        this.keys = {};
        this.setupControls();
        this.createTrain();
    }

    createTrain() {
        const trainGroup = new THREE.Group();

        // بدنه اصلی قطار
        const bodyGeometry = new THREE.BoxGeometry(6, 2, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        trainGroup.add(body);

        // کابین
        const cabinGeometry = new THREE.BoxGeometry(4, 2, 4);
        const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0xf44336 });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.z = -3;
        cabin.position.y = 0.5;
        cabin.castShadow = true;
        trainGroup.add(cabin);

        // تیربار
        this.createGun(trainGroup);

        // چرخ‌ها
        this.createWheels(trainGroup);

        trainGroup.position.y = 1;
        this.mesh = trainGroup;
        this.scene.add(this.mesh);
    }

    createGun(trainGroup) {
        const gunGroup = new THREE.Group();

        // پایه تیربار
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1.5;
        gunGroup.add(base);

        // لوله تیربار
        const barrelGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2);
        const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x388e3c });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -1;
        barrel.position.y = 1.5;
        gunGroup.add(barrel);

        gunGroup.position.z = 4;
        this.gun = gunGroup;
        trainGroup.add(gunGroup);
    }

    createWheels(trainGroup) {
        const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x212121 });

        const wheelPositions = [
            { x: -1.8, z: -3 }, { x: 1.8, z: -3 },
            { x: -1.8, z: 0 }, { x: 1.8, z: 0 },
            { x: -1.8, z: 3 }, { x: 1.8, z: 3 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, -0.8, pos.z);
            wheel.castShadow = true;
            trainGroup.add(wheel);
        });
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    update(deltaTime) {
        // کنترل سرعت
        if (this.keys['KeyW']) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else if (this.keys['KeyS']) {
            this.speed = Math.max(this.speed - this.acceleration * 2, -this.maxSpeed * 0.5);
        } else {
            // کاهش تدریجی سرعت
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - this.acceleration * 0.3, 0);
            } else if (this.speed < 0) {
                this.speed = Math.min(this.speed + this.acceleration * 0.3, 0);
            }
        }

        // کنترل جهت
        if (this.keys['KeyA']) {
            this.rotation += 0.03;
        }
        if (this.keys['KeyD']) {
            this.rotation -= 0.03;
        }

        // اعمال حرکت و چرخش
        this.mesh.rotation.y = this.rotation;
        
        const direction = new THREE.Vector3(
            Math.sin(this.rotation),
            0,
            -Math.cos(this.rotation)
        );
        
        this.position.add(direction.multiplyScalar(this.speed * deltaTime));
        this.mesh.position.copy(this.position);

        // آپدیت دوربین
        this.updateCamera();

        // آپدیت UI سرعت
        this.updateSpeedUI();
    }

    updateCamera() {
        const camera = window.threeJSGame.camera;
        const cameraDistance = 10;
        const cameraHeight = 5;
        
        const cameraOffset = new THREE.Vector3(
            Math.sin(this.rotation) * cameraDistance,
            cameraHeight,
            -Math.cos(this.rotation) * cameraDistance
        );
        
        camera.position.copy(this.position).add(cameraOffset);
        camera.lookAt(this.position.x, this.position.y + 2, this.position.z);
    }

    updateSpeedUI() {
        const speedKmh = Math.round(Math.abs(this.speed) * 150);
        document.getElementById('speedValue').textContent = speedKmh;
    }

    shoot() {
        if (!this.gun) return null;

        const worldPosition = new THREE.Vector3();
        this.gun.getWorldPosition(worldPosition);

        const direction = new THREE.Vector3(
            Math.sin(this.rotation),
            0,
            -Math.cos(this.rotation)
        );

        const bullet = new Bullet3D(this.scene, worldPosition, direction);
        return bullet;
    }

    getPosition() {
        return this.position;
    }

    getMesh() {
        return this.mesh;
    }
}

// کلاس تیر
class Bullet3D {
    constructor(scene, position, direction) {
        this.scene = scene;
        this.position = position.clone();
        this.direction = direction.clone();
        this.speed = 0.8;
        this.mesh = null;
        this.createBullet();
    }

    createBullet() {
        const geometry = new THREE.SphereGeometry(0.1);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        this.position.add(this.direction.multiplyScalar(this.speed * deltaTime));
        this.mesh.position.copy(this.position);
        
        // حذف اگر خیلی دور شد
        if (this.position.length() > 100) {
            this.remove();
            return true;
        }
        return false;
    }

    remove() {
        if (this.mesh && this.scene) {
            this.scene.remove(this.mesh);
        }
    }

    getPosition() {
        return this.position;
    }
}

// کلاس چترباز
class Parachute3D {
    constructor(scene, trainPosition) {
        this.scene = scene;
        this.position = new THREE.Vector3(
            (Math.random() - 0.5) * 30,
            20,
            trainPosition.z - 30 - Math.random() * 20
        );
        this.speed = 0.05;
        this.mesh = null;
        this.createParachute();
    }

    createParachute() {
        const parachuteGroup = new THREE.Group();

        // چتر
        const canopyGeometry = new THREE.SphereGeometry(1.5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const canopyMaterial = new THREE.MeshLambertMaterial({ color: 0xff5722 });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.y = 0.5;
        parachuteGroup.add(canopy);

        // شخص
        const personGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
        const personMaterial = new THREE.MeshLambertMaterial({ color: 0x795548 });
        const person = new THREE.Mesh(personGeometry, personMaterial);
        person.position.y = -1;
        parachuteGroup.add(person);

        // بندها
        this.createStrings(parachuteGroup);

        this.mesh = parachuteGroup;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    createStrings(parachuteGroup) {
        const stringMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        const points = [];
        points.push(new THREE.Vector3(0, 0.5, 0));
        points.push(new THREE.Vector3(0, -1, 0));
        
        const stringGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const string = new THREE.Line(stringGeometry, stringMaterial);
        parachuteGroup.add(string);
    }

    update(deltaTime) {
        this.position.y -= this.speed * deltaTime;
        this.mesh.position.copy(this.position);
        
        // چرخش ملایم
        this.mesh.rotation.y += 0.01;
        
        // حذف اگر به زمین رسید
        if (this.position.y < 0) {
            this.remove();
            return true;
        }
        return false;
    }

    remove() {
        if (this.mesh && this.scene) {
            this.scene.remove(this.mesh);
        }
    }

    getPosition() {
        return this.position;
    }

    shouldRemove() {
        return this.position.y < 0;
    }
}

// کلاس انفجار
class Explosion3D {
    constructor(scene, position) {
        this.scene = scene;
        this.position = position.clone();
        this.mesh = null;
        this.life = 1.0;
        this.createExplosion();
    }

    createExplosion() {
        const geometry = new THREE.SphereGeometry(1);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff9800,
            transparent: true,
            opacity: 0.8
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    update() {
        this.life -= 0.05;
        this.mesh.scale.multiplyScalar(1.1);
        this.mesh.material.opacity = this.life;
        
        if (this.life <= 0) {
            this.remove();
            return true;
        }
        return false;
    }

    remove() {
        if (this.mesh && this.scene) {
            this.scene.remove(this.mesh);
        }
    }

    shouldRemove() {
        return this.life <= 0;
    }
}

// کلاس اصلی بازی
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
        this.parachuteInterval = 2000;
        
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        this.createTrain();
        this.setupEventListeners();
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

        const deltaTime = Math.min(this.clock.getDelta(), 0.1) * 60;

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
            const shouldRemove = parachute.update(deltaTime);
            
            if (shouldRemove) {
                parachute.remove();
                this.parachutes.splice(i, 1);
                this.decreaseHealth(10);
            }
        }
    }

    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const shouldRemove = bullet.update(deltaTime);
            
            if (shouldRemove) {
                bullet.remove();
                this.bullets.splice(i, 1);
            }
        }
    }

    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            const shouldRemove = explosion.update();
            
            if (shouldRemove) {
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
                
                const distance = bullet.getPosition().distanceTo(parachute.getPosition());
                
                if (distance < 2) {
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
        this.parachutes.forEach(p => p.remove());
        this.bullets.forEach(b => b.remove());
        this.explosions.forEach(e => e.remove());
        
        this.parachutes = [];
        this.bullets = [];
        this.explosions = [];
    }
}

// مدیریت بازی
class GameManager {
    constructor() {
        this.game = null;
        this.threeJSGame = null;
        this.init();
    }

    init() {
        this.initializeThreeJS();
        this.setupEventListeners();
        this.showStartMenu();
    }

    initializeThreeJS() {
        this.threeJSGame = new ThreeJSGame();
        window.threeJSGame = this.threeJSGame;
        this.threeJSGame.animate();
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }

    showStartMenu() {
        document.getElementById('startMenu').classList.remove('hidden');
        document.getElementById('gameOverMenu').classList.add('hidden');
    }

    showGameOverMenu(score) {
        document.getElementById('finalScore').textContent = score;
        document.getElementById('gameOverMenu').classList.remove('hidden');
        document.getElementById('startMenu').classList.add('hidden');
    }

    startGame() {
        document.getElementById('startMenu').classList.add('hidden');
        this.game = new Game3D(this);
        this.game.start();
    }

    restartGame() {
        if (this.game) {
            this.game.stop();
        }
        this.startGame();
    }

    gameOver(score) {
        this.showGameOverMenu(score);
    }
}

// راه‌اندازی بازی
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});
