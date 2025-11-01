// کلاس قطار سه بعدی
class Train3D {
    constructor(scene) {
        this.scene = scene;
        this.speed = 0;
        this.maxSpeed = 0.5;
        this.acceleration = 0.001;
        this.position = new THREE.Vector3(0, 0, 0);
        this.mesh = null;
        this.gun = null;
        this.bullets = [];
        
        this.createTrain();
        this.setupControls();
    }

    createTrain() {
        const trainGroup = new THREE.Group();

        // بدنه اصلی قطار
        const bodyGeometry = new THREE.BoxGeometry(8, 3, 15);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        trainGroup.add(body);

        // کابین
        const cabinGeometry = new THREE.BoxGeometry(6, 2.5, 4);
        const cabinMaterial = new THREE.MeshLambertMaterial({ color: 0xf44336 });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.z = -4;
        cabin.position.y = 0.5;
        cabin.castShadow = true;
        trainGroup.add(cabin);

        // پنجره‌ها
        const windowGeometry = new THREE.PlaneGeometry(1, 1);
        const windowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xbbdefb,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < 4; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(2.1, 0.5, -6 + i * 2);
            window.rotation.y = Math.PI / 2;
            trainGroup.add(window);
        }

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
        const baseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 2;
        gunGroup.add(base);

        // لوله تیربار
        const barrelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3);
        const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x388e3c });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = -1.5;
        barrel.position.y = 2;
        gunGroup.add(barrel);

        gunGroup.position.z = 5;
        this.gun = gunGroup;
        trainGroup.add(gunGroup);
    }

    createWheels(trainGroup) {
        const wheelGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x212121 });

        const wheelPositions = [
            { x: -2.5, z: -4 }, { x: 2.5, z: -4 },
            { x: -2.5, z: 0 }, { x: 2.5, z: 0 },
            { x: -2.5, z: 4 }, { x: 2.5, z: 4 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, -1, pos.z);
            wheel.castShadow = true;
            trainGroup.add(wheel);
        });
    }

    setupControls() {
        this.keys = {};
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    update(deltaTime) {
        // کنترل سرعت
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.speed = Math.max(this.speed - this.acceleration * 2, 0);
        } else {
            this.speed = Math.max(this.speed - this.acceleration * 0.5, 0);
        }

        // کنترل جهت
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.mesh.rotation.y += 0.02;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.mesh.rotation.y -= 0.02;
        }

        // حرکت به جلو
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.mesh.quaternion);
        this.position.add(direction.multiplyScalar(this.speed * deltaTime));
        
        this.mesh.position.copy(this.position);

        // آپدیت موقعیت دوربین
        this.updateCamera();

        // آپدیت سرعت در UI
        this.updateSpeedUI();
    }

    updateCamera() {
        const camera = window.threeJSGame.camera;
        const offset = new THREE.Vector3(0, 8, 15);
        offset.applyQuaternion(this.mesh.quaternion);
        
        camera.position.copy(this.position).add(offset);
        camera.lookAt(this.position.x, this.position.y + 2, this.position.z - 10);
    }

    updateSpeedUI() {
        const speedKmh = Math.round(this.speed * 200);
        document.getElementById('speedValue').textContent = speedKmh;
    }

    shoot() {
        if (!this.gun) return null;

        const worldPosition = new THREE.Vector3();
        this.gun.getWorldPosition(worldPosition);

        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.mesh.quaternion);

        const bullet = new Bullet3D(this.scene, worldPosition, direction);
        this.bullets.push(bullet);

        // افکت شلیک
        this.createMuzzleFlash();

        return bullet;
    }

    createMuzzleFlash() {
        const flashGeometry = new THREE.SphereGeometry(0.3);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });
        
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        
        const worldPosition = new THREE.Vector3();
        this.gun.getWorldPosition(worldPosition);
        flash.position.copy(worldPosition);
        
        this.scene.add(flash);

        // انیمیشن محو شدن
        let opacity = 0.8;
        const fadeOut = () => {
            opacity -= 0.1;
            flashMaterial.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                this.scene.remove(flash);
            }
        };
        
        fadeOut();
    }

    getPosition() {
        return this.position;
    }

    getMesh() {
        return this.mesh;
    }
          }
