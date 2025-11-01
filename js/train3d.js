// سیستم گرافیک سه بعدی حرفه‌ای قطار
class Train3D {
    constructor(game) {
        this.game = game;
        this.models = new Map();
        this.materials = new Map();
        this.animations = new Map();
        this.lights = new Map();
        
        this.init();
    }

    init() {
        this.loadTrainModels();
        this.setupMaterials();
        this.createAnimations();
        this.setupLighting();
        this.setupSpecialEffects();
    }

    loadTrainModels() {
        // مدل لوکوموتیو اصلی
        this.models.set('locomotive', this.createLocomotiveModel());
        
        // مدل واگن‌ها
        this.models.set('passenger_car', this.createPassengerCarModel());
        this.models.set('cargo_car', this.createCargoCarModel());
        this.models.set('weapon_car', this.createWeaponCarModel());
        
        // مدل قطار زرهی
        this.models.set('armored_train', this.createArmoredTrainModel());
        
        // مدل قطار فوق سریع
        this.models.set('hyper_train', this.createHyperTrainModel());
    }

    createLocomotiveModel() {
        return {
            type: 'locomotive',
            vertices: this.generateLocomotiveVertices(),
            faces: this.generateLocomotiveFaces(),
            textures: this.generateLocomotiveTextures(),
            materials: ['metal_main', 'glass', 'rubber', 'light_emissive'],
            animations: ['engine_glow', 'wheel_rotation', 'smoke_emission', 'headlight_beam'],
            physics: {
                mass: 15000,
                friction: 0.02,
                drag: 0.1
            },
            details: {
                length: 25,
                width: 4,
                height: 6,
                wheelCount: 8,
                maxSpeed: 200,
                acceleration: 0.5
            }
        };
    }

    generateLocomotiveVertices() {
        const vertices = [];
        const length = 25;
        const width = 4;
        const height = 6;
        
        // بدنه اصلی
        vertices.push(
            // جلو - سطح ۱
            -width/2, 0, length/2,          // پایین چپ جلو
            width/2, 0, length/2,           // پایین راست جلو
            width/2, height/2, length/2,    // بالا راست جلو
            -width/2, height/2, length/2,   // بالا چپ جلو
            
            // عقب - سطح ۲
            -width/2, 0, -length/2,
            width/2, 0, -length/2,
            width/2, height, -length/2,
            -width/2, height, -length/2,
            
            // کابین
            -width/2, height/2, length/4,
            width/2, height/2, length/4,
            width/2, height, length/4,
            -width/2, height, length/4,
            
            // جزئیات اضافی برای گرافیک بالا
            -width/2-0.5, 0.5, length/2-1,    // بالکن چپ
            width/2+0.5, 0.5, length/2-1,     // بالکن راست
            -width/2-0.5, 2, length/2-1,      // بالکن چپ بالا
            width/2+0.5, 2, length/2-1        // بالکن راست بالا
        );
        
        return vertices;
    }

    generateLocomotiveFaces() {
        return [
            // بدنه اصلی
            { vertices: [0, 1, 2, 3], material: 'metal_main', uv: [0,0,1,0,1,1,0,1] }, // جلو
            { vertices: [4, 5, 6, 7], material: 'metal_main', uv: [0,0,1,0,1,1,0,1] }, // عقب
            { vertices: [0, 4, 7, 3], material: 'metal_main', uv: [0,0,1,0,1,1,0,1] }, // چپ
            { vertices: [1, 5, 6, 2], material: 'metal_main', uv: [0,0,1,0,1,1,0,1] }, // راست
            { vertices: [3, 2, 6, 7], material: 'metal_main', uv: [0,0,1,0,1,1,0,1] }, // بالا
            
            // کابین
            { vertices: [8, 9, 10, 11], material: 'glass', uv: [0,0,1,0,1,1,0,1] }, // جلوی کابین
            { vertices: [11, 10, 6, 7], material: 'metal_main', uv: [0,0,1,0,1,1,0,1] }, // پشت کابین
            
            // بالکن‌ها
            { vertices: [12, 13, 15, 14], material: 'metal_main', uv: [0,0,1,0,1,1,0,1] } // بالکن جلو
        ];
    }

    generateLocomotiveTextures() {
        return {
            metal_main: this.createProceduralMetalTexture(),
            glass: this.createProceduralGlassTexture(),
            rubber: this.createProceduralRubberTexture(),
            light_emissive: this.createEmissiveTexture()
        };
    }

    createProceduralMetalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // ایجاد بافت فلز پیشرفته
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#4A4A4A');
        gradient.addColorStop(0.5, '#696969');
        gradient.addColorStop(1, '#8B8B8B');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // اضافه کردن خطوط و جزئیات
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        for (let i = 0; i < 512; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }
        
        // اضافه کردن هایلایت‌ها
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 100; i++) {
            ctx.fillRect(
                Math.random() * 512,
                Math.random() * 512,
                3, 10
            );
        }
        
        return canvas;
    }

    createProceduralGlassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // شیشه با انعکاس
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(200, 230, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(100, 150, 200, 0.4)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // هایلایت‌های شیشه
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(50, 50, 150, 20);
        ctx.fillRect(50, 100, 150, 10);
        
        return canvas;
    }

    createEmissiveTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // بافت نورانی
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, '#FFFF00');
        gradient.addColorStop(1, '#FF4500');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        return canvas;
    }

    setupMaterials() {
        // مواد پیشرفته با خواص فیزیکی
        this.materials.set('metal_main', {
            type: 'phong',
            diffuse: [0.6, 0.6, 0.6],
            specular: [0.8, 0.8, 0.8],
            shininess: 100,
            reflectivity: 0.3,
            normalMap: this.createNormalMap()
        });

        this.materials.set('glass', {
            type: 'transparent',
            diffuse: [0.8, 0.9, 1.0],
            specular: [1.0, 1.0, 1.0],
            shininess: 300,
            opacity: 0.7,
            refraction: 1.5
        });

        this.materials.set('light_emissive', {
            type: 'emissive',
            emissive: [1.0, 0.8, 0.2],
            intensity: 2.0,
            glow: true
        });
    }

    createNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // ایجاد نقشه نرمال برای بافت فلز
        const imageData = ctx.createImageData(256, 256);
        
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const i = (y * 256 + x) * 4;
                
                // الگوی خطوط فلز
                const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1);
                
                imageData.data[i] = 128 + noise * 64;     // Red (X)
                imageData.data[i + 1] = 128;              // Green (Y)
                imageData.data[i + 2] = 128 + noise * 32; // Blue (Z)
                imageData.data[i + 3] = 255;              // Alpha
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    createAnimations() {
        // انیمیشن‌های پیشرفته قطار
        this.animations.set('engine_glow', {
            type: 'pulse',
            duration: 2,
            loop: true,
            keyframes: [
                { time: 0, value: 1.0 },
                { time: 1, value: 1.5 },
                { time: 2, value: 1.0 }
            ],
            target: 'material_intensity'
        });

        this.animations.set('wheel_rotation', {
            type: 'rotation',
            duration: 1,
            loop: true,
            speed: 2,
            axis: 'x'
        });

        this.animations.set('smoke_emission', {
            type: 'particle_system',
            rate: 10,
            lifetime: 3,
            velocity: [0, 2, -1],
            size: [0.5, 2],
            color: [0.8, 0.8, 0.8]
        });

        this.animations.set('headlight_beam', {
            type: 'light_cone',
            intensity: 3,
            angle: 30,
            color: [1.0, 0.9, 0.7],
            flicker: 0.1
        });
    }

    setupLighting() {
        // سیستم نورپردازی پیشرفته
        this.lights.set('headlight', {
            type: 'spot',
            position: [0, 3, 12],
            direction: [0, -0.2, 1],
            color: [1.0, 0.9, 0.7],
            intensity: 3,
            distance: 100,
            angle: Math.PI / 6,
            penumbra: 0.5,
            castShadow: true
        });

        this.lights.set('cabin_light', {
            type: 'point',
            position: [0, 5, -2],
            color: [1.0, 0.8, 0.6],
            intensity: 1,
            distance: 10
        });

        this.lights.set('engine_glow', {
            type: 'point',
            position: [0, 2, -10],
            color: [1.0, 0.3, 0.1],
            intensity: 2,
            distance: 15
        });
    }

    setupSpecialEffects() {
        // افکت‌های ویژه سینمایی
        this.specialEffects = {
            motionBlur: {
                enabled: true,
                samples: 8,
                intensity: 0.5
            },
            depthOfField: {
                enabled: true,
                focus: 50,
                aperture: 0.1
            },
            bloom: {
                enabled: true,
                threshold: 0.8,
                strength: 1.0,
                radius: 0.5
            },
            colorGrading: {
                enabled: true,
                brightness: 1.1,
                contrast: 1.2,
                saturation: 1.1,
                temperature: 6500
            }
        };
    }

    // سایر مدل‌های قطار
    createPassengerCarModel() {
        return {
            type: 'passenger_car',
            vertices: this.generatePassengerCarVertices(),
            faces: this.generatePassengerCarFaces(),
            materials: ['metal_main', 'glass', 'interior_light'],
            details: {
                length: 20,
                width: 3.5,
                height: 5,
                windowCount: 12,
                capacity: 40
            }
        };
    }

    createCargoCarModel() {
        return {
            type: 'cargo_car',
            vertices: this.generateCargoCarVertices(),
            faces: this.generateCargoCarFaces(),
            materials: ['metal_rusty', 'wood', 'cargo'],
            details: {
                length: 18,
                width: 4,
                height: 4.5,
                cargoType: 'container',
                capacity: 25
            }
        };
    }

    createWeaponCarModel() {
        return {
            type: 'weapon_car',
            vertices: this.generateWeaponCarVertices(),
            faces: this.generateWeaponCarFaces(),
            materials: ['metal_armor', 'weapon_metal', 'glass'],
            weapons: {
                machineGun: {
                    position: [0, 3, 0],
                    rotation: [0, 0, 0],
                    damage: 25,
                    range: 100
                },
                cannon: {
                    position: [0, 2, -5],
                    rotation: [0, 0, 0],
                    damage: 100,
                    range: 200
                }
            },
            details: {
                length: 15,
                width: 4,
                height: 4,
                armor: 200
            }
        };
    }

    createArmoredTrainModel() {
        return {
            type: 'armored_train',
            vertices: this.generateArmoredTrainVertices(),
            faces: this.generateArmoredTrainFaces(),
            materials: ['metal_armor', 'reinforced_metal', 'military_camo'],
            weapons: {
                mainCannon: {
                    position: [0, 4, 8],
                    rotation: [0, 0, 0],
                    damage: 150,
                    range: 300
                },
                machineGuns: [
                    { position: [2, 3, -2], rotation: [0, Math.PI/2, 0] },
                    { position: [-2, 3, -2], rotation: [0, -Math.PI/2, 0] }
                ],
                missileLauncher: {
                    position: [0, 5, -8],
                    rotation: [0, 0, 0],
                    damage: 200,
                    range: 500
                }
            },
            details: {
                length: 35,
                width: 5,
                height: 6,
                armor: 500,
                maxSpeed: 120
            }
        };
    }

    createHyperTrainModel() {
        return {
            type: 'hyper_train',
            vertices: this.generateHyperTrainVertices(),
            faces: this.generateHyperTrainFaces(),
            materials: ['carbon_fiber', 'titanium', 'neon_glow'],
            effects: {
                speedLines: true,
                engineTrail: true,
                sonicBoom: false,
                energyShield: true
            },
            details: {
                length: 30,
                width: 3,
                height: 4,
                maxSpeed: 400,
                acceleration: 2.0
            }
        };
    }

    // متدهای رندر پیشرفته
    renderTrain(trainData, camera) {
        const model = this.models.get(trainData.type);
        if (!model) return;

        this.ctx.save();
        
        // اعمال ترنسفورم قطار
        this.ctx.translate(trainData.position.x, trainData.position.y);
        this.ctx.rotate(trainData.rotation.y);
        
        // رندر هر بخش از مدل
        model.faces.forEach(face => {
            this.renderFace(face, model, trainData);
        });
        
        // رندر افکت‌های ویژه
        this.renderSpecialEffects(trainData);
        
        this.ctx.restore();
    }

    renderFace(face, model, trainData) {
        const material = this.materials.get(face.material);
        if (!material) return;

        // اعمال متریال
        this.applyMaterial(material);
        
        // رسم وجه
        this.ctx.beginPath();
        face.vertices.forEach((vertexIndex, index) => {
            const x = model.vertices[vertexIndex * 3];
            const y = model.vertices[vertexIndex * 3 + 1];
            const z = model.vertices[vertexIndex * 3 + 2];
            
            const screenPos = this.worldToScreen(x, y, z, trainData);
            
            if (index === 0) {
                this.ctx.moveTo(screenPos.x, screenPos.y);
            } else {
                this.ctx.lineTo(screenPos.x, screenPos.y);
            }
        });
        
        this.ctx.closePath();
        
        if (material.type === 'transparent') {
            this.ctx.globalAlpha = material.opacity;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        } else {
            this.ctx.fill();
        }
    }

    applyMaterial(material) {
        switch (material.type) {
            case 'phong':
                this.ctx.fillStyle = this.rgbToHex(material.diffuse);
                this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
                this.ctx.shadowBlur = 10;
                break;
                
            case 'emissive':
                this.ctx.fillStyle = this.rgbToHex(material.emissive);
                this.ctx.shadowColor = this.rgbToHex(material.emissive);
                this.ctx.shadowBlur = 20;
                break;
                
            case 'transparent':
                this.ctx.strokeStyle = this.rgbToHex(material.diffuse);
                this.ctx.lineWidth = 2;
                break;
        }
    }

    renderSpecialEffects(trainData) {
        // رندر افکت‌های سرعت
        if (trainData.speed > 100) {
            this.renderSpeedLines(trainData);
        }
        
        // رندر دود موتور
        this.renderEngineSmoke(trainData);
        
        // رندر نور چراغ‌ها
        this.renderHeadlights(trainData);
        
        // رندر سایه‌ها
        this.renderShadows(trainData);
    }

    renderSpeedLines(trainData) {
        const speed = trainData.speed;
        const intensity = Math.min((speed - 100) / 100, 1);
        
        for (let i = 0; i < 20 * intensity; i++) {
            const x = (Math.random() - 0.5) * this.game.canvas.width;
            const y = Math.random() * this.game.canvas.height;
            const length = Math.random() * 50 + 20;
            const speed = Math.random() * 10 + 5;
            
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * intensity})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - length, y);
            this.ctx.stroke();
        }
    }

    renderEngineSmoke(trainData) {
        const smokeCount = Math.min(Math.floor(trainData.speed / 10), 10);
        
        for (let i = 0; i < smokeCount; i++) {
            const progress = (Date.now() * 0.001 + i * 0.2) % 1;
            const size = progress * 20;
            const alpha = 1 - progress;
            
            const x = -15 + Math.sin(i) * 2;
            const y = 2;
            const z = -12 - progress * 10;
            
            const screenPos = this.worldToScreen(x, y, z, trainData);
            
            this.ctx.fillStyle = `rgba(100, 100, 100, ${alpha * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    renderHeadlights(trainData) {
        const headlight = this.lights.get('headlight');
        if (!headlight) return;

        // رندر مخروط نور
        const startPos = this.worldToScreen(
            headlight.position[0],
            headlight.position[1],
            headlight.position[2],
            trainData
        );
        
        const endPos = this.worldToScreen(
            headlight.position[0] + headlight.direction[0] * 50,
            headlight.position[1] + headlight.direction[1] * 50,
            headlight.position[2] + headlight.direction[2] * 50,
            trainData
        );
        
        const gradient = this.ctx.createRadialGradient(
            startPos.x, startPos.y, 5,
            endPos.x, endPos.y, 50
        );
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
            startPos.x - 50, startPos.y - 50,
            100, 100
        );
    }

    renderShadows(trainData) {
        // رندر سایه‌های پویا
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(
            trainData.position.x - 15,
            trainData.position.y + 10,
            30, 10
        );
    }

    // تابع کمکی برای تبدیل مختصات
    worldToScreen(x, y, z, trainData) {
        const relativeX = x - this.game.camera.x;
        const relativeY = y - this.game.camera.y;
        const relativeZ = z - this.game.camera.z;
        
        const cosY = Math.cos(this.game.camera.rotation.y);
        const sinY = Math.sin(this.game.camera.rotation.y);
        
        const rotatedX = relativeX * cosY - relativeZ * sinY;
        const rotatedZ = relativeX * sinY + relativeZ * cosY;
        
        const scale = this.game.camera.fov / (rotatedZ + this.game.camera.fov);
        const screenX = this.game.canvas.width / 2 + rotatedX * scale;
        const screenY = this.game.canvas.height / 2 - relativeY * scale;
        
        return { x: screenX, y: screenY, scale: scale };
    }

    rgbToHex(rgb) {
        return `#${Math.floor(rgb[0] * 255).toString(16).padStart(2, '0')}${Math.floor(rgb[1] * 255).toString(16).padStart(2, '0')}${Math.floor(rgb[2] * 255).toString(16).padStart(2, '0')}`;
    }

    // انیمیشن‌های پیشرفته
    updateAnimations(deltaTime) {
        this.animations.forEach((animation, name) => {
            this.updateAnimation(animation, deltaTime);
        });
    }

    updateAnimation(animation, deltaTime) {
        switch (animation.type) {
            case 'pulse':
                this.updatePulseAnimation(animation, deltaTime);
                break;
            case 'rotation':
                this.updateRotationAnimation(animation, deltaTime);
                break;
            case 'particle_system':
                this.updateParticleSystem(animation, deltaTime);
                break;
        }
    }

    updatePulseAnimation(animation, deltaTime) {
        animation.currentTime = (animation.currentTime || 0) + deltaTime;
        if (animation.currentTime > animation.duration) {
            animation.currentTime = 0;
        }
        
        const progress = animation.currentTime / animation.duration;
        const keyframe = this.interpolateKeyframes(animation.keyframes, progress);
        
        // اعمال به متریال‌ها
        if (animation.target === 'material_intensity') {
            this.updateMaterialIntensity(keyframe.value);
        }
    }

    interpolateKeyframes(keyframes, progress) {
        for (let i = 0; i < keyframes.length - 1; i++) {
            if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
                const localProgress = (progress - keyframes[i].time) / (keyframes[i + 1].time - keyframes[i].time);
                const value = keyframes[i].value + (keyframes[i + 1].value - keyframes[i].value) * localProgress;
                return { value: value };
            }
        }
        return keyframes[keyframes.length - 1];
    }

    updateMaterialIntensity(intensity) {
        const material = this.materials.get('light_emissive');
        if (material) {
            material.intensity = intensity;
        }
    }

    // سیستم فیزیک پیشرفته
    calculateTrainPhysics(trainData, deltaTime) {
        const model = this.models.get(trainData.type);
        if (!model) return;

        const physics = model.physics;
        
        // محاسبه شتاب
        if (trainData.accelerating && trainData.speed < model.details.maxSpeed) {
            trainData.speed += physics.acceleration * deltaTime;
        }
        
        if (trainData.braking && trainData.speed > 0) {
            trainData.speed -= physics.friction * 3 * deltaTime;
        }
        
        // مقاومت هوا
        trainData.speed -= physics.drag * trainData.speed * deltaTime;
        
        // به روز رسانی موقعیت
        trainData.position.z -= trainData.speed * deltaTime;
        
        // ارتعاشات بر اساس سرعت
        this.calculateVibrations(trainData, deltaTime);
    }

    calculateVibrations(trainData, deltaTime) {
        const speedFactor = trainData.speed / trainData.maxSpeed;
        
        // ارتعاش عمودی
        trainData.rotation.x = Math.sin(Date.now() * 0.005) * 0.1 * speedFactor;
        
        // ارتعاش جانبی
        trainData.rotation.z = Math.sin(Date.now() * 0.003) * 0.05 * speedFactor;
        
        // ارتعاش طولی
        trainData.position.y = 5 + Math.sin(Date.now() * 0.008) * 0.2 * speedFactor;
    }

    // مدیریت لودینگ و منابع
    preloadAssets() {
        const assets = [
            { type: 'texture', name: 'metal_main', url: this.createProceduralMetalTexture() },
            { type: 'texture', name: 'glass', url: this.createProceduralGlassTexture() },
            { type: 'texture', name: 'normal_map', url: this.createNormalMap() }
        ];

        let loaded = 0;
        const total = assets.length;

        assets.forEach(asset => {
            if (asset.url instanceof HTMLCanvasElement) {
                loaded++;
                if (loaded === total) {
                    this.onAssetsLoaded();
                }
            }
        });
    }

    onAssetsLoaded() {
        console.log('✅ تمام assets های قطار سه بعدی لود شدند');
        this.ready = true;
    }

    // متدهای عمومی
    isReady() {
        return this.ready;
    }

    update(deltaTime) {
        if (!this.ready) return;

        this.updateAnimations(deltaTime);
        this.updateLighting(deltaTime);
        this.updateSpecialEffects(deltaTime);
    }

    updateLighting(deltaTime) {
        // به روز رسانی نورپردازی پویا
        const headlight = this.lights.get('headlight');
        if (headlight && headlight.flicker) {
            headlight.intensity = 3 + Math.sin(Date.now() * 0.01) * headlight.flicker;
        }
    }

    updateSpecialEffects(deltaTime) {
        // به روز رسانی افکت‌های ویژه
        if (this.specialEffects.motionBlur.enabled) {
            this.updateMotionBlur(deltaTime);
        }
    }

    updateMotionBlur(deltaTime) {
        // پیاده‌سازی motion blur
        this.game.ctx.globalAlpha = 0.1;
        this.game.ctx.drawImage(this.game.canvas, 0, 0);
        this.game.ctx.globalAlpha = 1.0;
    }
}

// راه‌اندازی سیستم گرافیک قطار
function initTrain3D(game) {
    return new Train3D(game);
              }
