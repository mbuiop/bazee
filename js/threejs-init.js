// تنظیمات Three.js
class ThreeJSGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.init();
    }

    init() {
        // ایجاد صحنه
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a237e, 50, 300);

        // ایجاد دوربین
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 25);
        this.camera.lookAt(0, 0, -50);

        // ایجاد رندرر
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x1a237e);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.getElementById('threejsContainer').appendChild(this.renderer.domElement);

        // اضافه کردن نورها
        this.setupLights();
        
        // ایجاد محیط
        this.createEnvironment();
        
        // مدیریت رزولوشن
        this.setupResizeHandler();
        
        // شروع رندر
        this.animate();
    }

    setupLights() {
        // نور اصلی
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // نور جهت‌دار
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // نور نقطه‌ای برای جلوه‌های خاص
        const pointLight = new THREE.PointLight(0x4caf50, 0.5, 100);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }

    createEnvironment() {
        // ایجاد آسمان
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        // ایجاد زمین
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3e2723,
            wireframe: false
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // ایجاد کوه‌ها
        this.createMountains();
        
        // ایجاد مسیر قطار
        this.createTrainTrack();
    }

    createMountains() {
        const mountainGroup = new THREE.Group();
        
        for (let i = 0; i < 20; i++) {
            const mountain = this.createSingleMountain();
            mountain.position.x = (Math.random() - 0.5) * 800;
            mountain.position.z = -Math.random() * 500 - 50;
            mountainGroup.add(mountain);
        }
        
        this.scene.add(mountainGroup);
    }

    createSingleMountain() {
        const height = Math.random() * 30 + 10;
        const geometry = new THREE.ConeGeometry(15, height, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x455a64,
            wireframe: false
        });
        const mountain = new THREE.Mesh(geometry, material);
        mountain.castShadow = true;
        return mountain;
    }

    createTrainTrack() {
        const trackGroup = new THREE.Group();
        
        // ریل‌ها
        const railGeometry = new THREE.BoxGeometry(2, 0.5, 1000);
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
        
        const leftRail = new THREE.Mesh(railGeometry, railMaterial);
        leftRail.position.x = -3;
        leftRail.position.y = -1.5;
        
        const rightRail = new THREE.Mesh(railGeometry, railMaterial);
        rightRail.position.x = 3;
        rightRail.position.y = -1.5;
        
        trackGroup.add(leftRail);
        trackGroup.add(rightRail);
        
        // تراورس‌ها
        const tieGeometry = new THREE.BoxGeometry(8, 0.3, 1);
        const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x4e342e });
        
        for (let z = -500; z < 100; z += 5) {
            const tie = new THREE.Mesh(tieGeometry, tieMaterial);
            tie.position.z = z;
            tie.position.y = -1.7;
            trackGroup.add(tie);
        }
        
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

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }
      }
