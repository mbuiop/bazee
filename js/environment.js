// سیستم محیط سه بعدی حرفه‌ای با افکت‌های سینمایی
class EnvironmentSystem {
    constructor(game) {
        this.game = game;
        this.environments = new Map();
        this.weatherSystem = null;
        this.timeSystem = null;
        this.terrain = null;
        this.dynamicElements = new Map();
        this.specialEffects = new Map();
        
        this.currentBiome = 'city';
        this.biomeTransition = {
            progress: 0,
            from: 'city',
            to: 'city'
        };
        
        this.init();
    }

    init() {
        this.setupBiomes();
        this.setupWeatherSystem();
        this.setupTimeSystem();
        this.setupTerrain();
        this.setupDynamicElements();
        this.setupSpecialEffects();
        this.setupPostProcessing();
    }

    setupBiomes() {
        // ۱۰ محیط مختلف با ویژگی‌های منحصر به فرد
        this.environments.set('city', this.createCityEnvironment());
        this.environments.set('desert', this.createDesertEnvironment());
        this.environments.set('ocean', this.createOceanEnvironment());
        this.environments.set('mountains', this.createMountainEnvironment());
        this.environments.set('forest', this.createForestEnvironment());
        this.environments.set('arctic', this.createArcticEnvironment());
        this.environments.set('volcano', this.createVolcanoEnvironment());
        this.environments.set('canyon', this.createCanyonEnvironment());
        this.environments.set('swamp', this.createSwampEnvironment());
        this.environments.set('future_city', this.createFutureCityEnvironment());
    }

    createCityEnvironment() {
        return {
            type: 'urban',
            skybox: this.createCitySkybox(),
            terrain: {
                texture: this.createCityGroundTexture(),
                detail: 'concrete',
                roughness: 0.3,
                reflectivity: 0.1
            },
            buildings: this.generateCityBuildings(),
            props: this.generateCityProps(),
            lighting: {
                ambient: [0.4, 0.4, 0.5],
                directional: [0.8, 0.8, 0.9],
                fog: {
                    color: [0.7, 0.8, 1.0],
                    density: 0.002,
                    near: 50,
                    far: 300
                }
            },
            sounds: ['city_traffic', 'distant_sirens', 'wind_urban'],
            particles: ['smog', 'paper_debris', 'light_dust']
        };
    }

    createDesertEnvironment() {
        return {
            type: 'arid',
            skybox: this.createDesertSkybox(),
            terrain: {
                texture: this.createDesertSandTexture(),
                detail: 'sand',
                roughness: 0.8,
                reflectivity: 0.05
            },
            vegetation: this.generateDesertVegetation(),
            rockFormations: this.generateDesertRocks(),
            lighting: {
                ambient: [0.6, 0.5, 0.3],
                directional: [1.0, 0.9, 0.6],
                fog: {
                    color: [0.9, 0.8, 0.6],
                    density: 0.001,
                    near: 100,
                    far: 500
                }
            },
            sounds: ['desert_wind', 'sand_storm', 'coyote_howl'],
            particles: ['sand_dust', 'heat_haze', 'tumbleweed']
        };
    }

    createOceanEnvironment() {
        return {
            type: 'aquatic',
            skybox: this.createOceanSkybox(),
            terrain: {
                texture: this.createOceanWaterTexture(),
                detail: 'water',
                roughness: 0.1,
                reflectivity: 0.8
            },
            islands: this.generateOceanIslands(),
            marineLife: this.generateMarineLife(),
            lighting: {
                ambient: [0.3, 0.4, 0.6],
                directional: [0.7, 0.8, 1.0],
                fog: {
                    color: [0.2, 0.3, 0.5],
                    density: 0.003,
                    near: 30,
                    far: 200
                }
            },
            sounds: ['ocean_waves', 'seagulls', 'dolphin_echos'],
            particles: ['water_spray', 'sea_foam', 'ocean_mist']
        };
    }

    createMountainEnvironment() {
        return {
            type: 'alpine',
            skybox: this.createMountainSkybox(),
            terrain: {
                texture: this.createMountainRockTexture(),
                detail: 'rock',
                roughness: 0.9,
                reflectivity: 0.1
            },
            peaks: this.generateMountainPeaks(),
            vegetation: this.generateMountainVegetation(),
            lighting: {
                ambient: [0.3, 0.4, 0.5],
                directional: [0.9, 0.9, 1.0],
                fog: {
                    color: [0.8, 0.9, 1.0],
                    density: 0.004,
                    near: 20,
                    far: 150
                }
            },
            sounds: ['mountain_wind', 'eagle_cry', 'avalanche_distant'],
            particles: ['snow_flurries', 'mountain_mist', 'rock_debris']
        };
    }

    createCitySkybox() {
        return {
            type: 'procedural',
            colors: {
                top: [0.3, 0.4, 0.6],
                middle: [0.6, 0.7, 0.9],
                bottom: [0.8, 0.9, 1.0]
            },
            stars: false,
            clouds: true,
            sunPosition: [0.7, 0.5, 0.3]
        };
    }

    createDesertSkybox() {
        return {
            type: 'procedural',
            colors: {
                top: [0.8, 0.7, 0.4],
                middle: [1.0, 0.9, 0.6],
                bottom: [1.0, 0.8, 0.4]
            },
            stars: false,
            clouds: false,
            sunPosition: [0.9, 0.8, 0.2],
            heatDistortion: true
        };
    }

    createOceanSkybox() {
        return {
            type: 'procedural',
            colors: {
                top: [0.2, 0.3, 0.6],
                middle: [0.4, 0.5, 0.8],
                bottom: [0.6, 0.7, 1.0]
            },
            stars: false,
            clouds: true,
            sunPosition: [0.5, 0.6, 0.4],
            waterReflection: true
        };
    }

    generateCityBuildings() {
        const buildings = [];
        const buildingCount = 100;
        
        for (let i = 0; i < buildingCount; i++) {
            const height = Math.random() * 80 + 20;
            const width = Math.random() * 15 + 10;
            const depth = Math.random() * 15 + 10;
            
            buildings.push({
                type: 'skyscraper',
                position: {
                    x: (Math.random() - 0.5) * 400,
                    y: height / 2,
                    z: i * -20 - 50
                },
                size: {
                    width: width,
                    height: height,
                    depth: depth
                },
                color: this.getRandomBuildingColor(),
                windows: Math.floor(Math.random() * 50) + 20,
                lightsOn: Math.random() > 0.3,
                details: {
                    antenna: Math.random() > 0.7,
                    signage: Math.random() > 0.5,
                    rooftop: Math.random() > 0.8
                }
            });
        }
        
        return buildings;
    }

    generateDesertVegetation() {
        const vegetation = [];
        const plantCount = 50;
        
        for (let i = 0; i < plantCount; i++) {
            vegetation.push({
                type: 'cactus',
                position: {
                    x: (Math.random() - 0.5) * 300,
                    y: 0,
                    z: Math.random() * -500 - 100
                },
                height: Math.random() * 4 + 2,
                arms: Math.floor(Math.random() * 4),
                color: '#228B22'
            });
            
            if (Math.random() > 0.7) {
                vegetation.push({
                    type: 'tumbleweed',
                    position: {
                        x: (Math.random() - 0.5) * 350,
                        y: 1,
                        z: Math.random() * -600 - 150
                    },
                    size: Math.random() * 2 + 1,
                    rolling: true
                });
            }
        }
        
        return vegetation;
    }

    generateOceanIslands() {
        const islands = [];
        const islandCount = 8;
        
        for (let i = 0; i < islandCount; i++) {
            islands.push({
                type: 'tropical_island',
                position: {
                    x: (Math.random() - 0.5) * 400,
                    y: -1,
                    z: Math.random() * -800 - 200
                },
                size: Math.random() * 40 + 20,
                trees: Math.floor(Math.random() * 15) + 5,
                hasBeach: true,
                palmTrees: Math.floor(Math.random() * 8) + 3
            });
        }
        
        return islands;
    }

    generateMountainPeaks() {
        const peaks = [];
        const peakCount = 20;
        
        for (let i = 0; i < peakCount; i++) {
            peaks.push({
                type: 'mountain_peak',
                position: {
                    x: (Math.random() - 0.5) * 500,
                    y: 0,
                    z: Math.random() * -1000 - 300
                },
                height: Math.random() * 120 + 60,
                baseSize: Math.random() * 100 + 50,
                snowCovered: Math.random() > 0.3,
                rocky: true
            });
        }
        
        return peaks;
    }

    setupWeatherSystem() {
        this.weatherSystem = {
            current: 'clear',
            intensity: 0,
            transitionSpeed: 0.01,
            particles: new Map(),
            
            types: {
                clear: { fog: 0.001, wind: 0.1, particles: [] },
                rain: { fog: 0.003, wind: 0.5, particles: ['rain_drops'] },
                storm: { fog: 0.005, wind: 1.0, particles: ['rain_drops', 'lightning'] },
                snow: { fog: 0.004, wind: 0.3, particles: ['snow_flakes'] },
                sandstorm: { fog: 0.008, wind: 0.8, particles: ['sand_particles'] },
                fog: { fog: 0.01, wind: 0.1, particles: ['fog_banks'] }
            },
            
            update: (deltaTime) => this.updateWeather(deltaTime),
            change: (newWeather) => this.changeWeather(newWeather)
        };
    }

    setupTimeSystem() {
        this.timeSystem = {
            currentTime: 0.5, // 0 = midnight, 0.5 = noon
            cycleSpeed: 0.0001,
            dayLength: 240, // seconds per full day cycle
            
            getSunPosition: () => {
                const angle = this.timeSystem.currentTime * Math.PI * 2;
                return {
                    x: Math.cos(angle),
                    y: Math.sin(angle),
                    z: 0
                };
            },
            
            getLightColor: () => {
                const time = this.timeSystem.currentTime;
                if (time < 0.25 || time > 0.75) {
                    // شب
                    return [0.1, 0.1, 0.2];
                } else if (time < 0.3 || time > 0.7) {
                    // طلوع/غروب
                    return [0.8, 0.6, 0.4];
                } else {
                    // روز
                    return [1.0, 0.95, 0.9];
                }
            },
            
            update: (deltaTime) => this.updateTime(deltaTime)
        };
    }

    setupTerrain() {
        this.terrain = {
            segments: [],
            detail: 100,
            heightMap: this.generateHeightMap(),
            
            getHeightAt: (x, z) => {
                // محاسبه ارتفاع بر اساس نقشه ارتفاع
                const normalizedX = (x / 500 + 1) * 0.5;
                const normalizedZ = (z / 500 + 1) * 0.5;
                
                const height = this.sampleHeightMap(normalizedX, normalizedZ);
                return height * 50; // scale height
            },
            
            generateMesh: () => this.generateTerrainMesh()
        };
        
        this.terrain.segments = this.generateTerrainSegments();
    }

    generateHeightMap() {
        const size = 256;
        const heightMap = new Float32Array(size * size);
        
        // ایجاد نویز پرلین برای زمین طبیعی
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const nx = x / size - 0.5;
                const ny = y / size - 0.5;
                
                // ترکیب چند لایه نویز
                let height = 0;
                height += this.perlinNoise(nx * 4, ny * 4) * 0.5;
                height += this.perlinNoise(nx * 8, ny * 8) * 0.25;
                height += this.perlinNoise(nx * 16, ny * 16) * 0.125;
                
                heightMap[y * size + x] = height;
            }
        }
        
        return heightMap;
    }

    perlinNoise(x, y) {
        // پیاده‌سازی ساده نویز پرلین
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const n00 = this.grad(this.perm[X + this.perm[Y]], x, y);
        const n01 = this.grad(this.perm[X + this.perm[Y + 1]], x, y - 1);
        const n10 = this.grad(this.perm[X + 1 + this.perm[Y]], x - 1, y);
        const n11 = this.grad(this.perm[X + 1 + this.perm[Y + 1]], x - 1, y - 1);
        
        return this.lerp(
            this.lerp(n00, n10, u),
            this.lerp(n01, n11, u),
            v
        );
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const grad = 1 + (h & 7);
        return ((h & 8) ? -grad : grad) * x;
    }

    setupDynamicElements() {
        // عناصر پویای محیط
        this.dynamicElements.set('traffic', this.createTrafficSystem());
        this.dynamicElements.set('wildlife', this.createWildlifeSystem());
        this.dynamicElements.set('weather_effects', this.createWeatherEffects());
        this.dynamicElements.set('destructible', this.createDestructibleElements());
        this.dynamicElements.set('interactive', this.createInteractiveElements());
    }

    createTrafficSystem() {
        return {
            vehicles: [],
            spawnRate: 0.1,
            maxVehicles: 20,
            
            spawnVehicle: () => {
                const types = ['car', 'bus', 'truck', 'motorcycle'];
                const type = types[Math.floor(Math.random() * types.length)];
                
                this.dynamicElements.get('traffic').vehicles.push({
                    type: type,
                    position: {
                        x: (Math.random() - 0.5) * 100,
                        y: 0,
                        z: Math.random() * -200 - 50
                    },
                    speed: Math.random() * 3 + 1,
                    lane: Math.floor(Math.random() * 3) - 1
                });
            },
            
            update: (deltaTime) => {
                const traffic = this.dynamicElements.get('traffic');
                
                // اسپان وسایل نقلیه جدید
                if (Math.random() < traffic.spawnRate && traffic.vehicles.length < traffic.maxVehicles) {
                    traffic.spawnVehicle();
                }
                
                // به روز رسانی موقعیت وسایل نقلیه
                traffic.vehicles.forEach(vehicle => {
                    vehicle.position.z += vehicle.speed;
                    
                    // حذف وسایل نقلیه دور
                    if (vehicle.position.z > 100) {
                        traffic.vehicles = traffic.vehicles.filter(v => v !== vehicle);
                    }
                });
            }
        };
    }

    createWildlifeSystem() {
        return {
            animals: [],
            spawnRate: 0.05,
            
            spawnAnimal: (biome) => {
                let animalType;
                switch (biome) {
                    case 'forest':
                        animalType = Math.random() > 0.5 ? 'deer' : 'rabbit';
                        break;
                    case 'desert':
                        animalType = 'coyote';
                        break;
                    case 'arctic':
                        animalType = 'polar_bear';
                        break;
                    default:
                        animalType = 'bird';
                }
                
                this.dynamicElements.get('wildlife').animals.push({
                    type: animalType,
                    position: {
                        x: (Math.random() - 0.5) * 200,
                        y: 0,
                        z: Math.random() * -300 - 100
                    },
                    speed: Math.random() * 2 + 0.5,
                    state: 'wandering'
                });
            },
            
            update: (deltaTime) => {
                const wildlife = this.dynamicElements.get('wildlife');
                
                // اسپان حیوانات جدید
                if (Math.random() < wildlife.spawnRate) {
                    wildlife.spawnAnimal(this.currentBiome);
                }
                
                // به روز رسانی حیوانات
                wildlife.animals.forEach(animal => {
                    if (animal.state === 'wandering') {
                        animal.position.x += (Math.random() - 0.5) * animal.speed;
                        animal.position.z += animal.speed * 0.5;
                    }
                    
                    // فرار از قطار
                    const distanceToTrain = Math.abs(animal.position.z - this.game.scene.train.position.z);
                    if (distanceToTrain < 50) {
                        animal.state = 'fleeing';
                        animal.speed *= 2;
                    }
                });
            }
        };
    }

    setupSpecialEffects() {
        // افکت‌های ویژه سینمایی
        this.specialEffects.set('lens_flare', this.createLensFlareSystem());
        this.specialEffects.set('motion_blur', this.createMotionBlurSystem());
        this.specialEffects.set('depth_of_field', this.createDepthOfFieldSystem());
        this.specialEffects.set('color_grading', this.createColorGradingSystem());
        this.specialEffects.set('bloom', this.createBloomSystem());
    }

    createLensFlareSystem() {
        return {
            enabled: true,
            intensity: 0.8,
            elements: [
                { type: 'glow', size: 100, color: [1.0, 0.9, 0.8] },
                { type: 'halo', size: 50, color: [0.8, 0.9, 1.0] },
                { type: 'burst', size: 25, color: [1.0, 1.0, 1.0] }
            ],
            
            render: () => {
                if (!this.specialEffects.get('lens_flare').enabled) return;
                
                const sunPos = this.timeSystem.getSunPosition();
                const screenPos = this.game.worldToScreen({
                    x: sunPos.x * 1000,
                    y: sunPos.y * 1000,
                    z: 0
                });
                
                this.renderLensFlareElements(screenPos);
            }
        };
    }

    setupPostProcessing() {
        this.postProcessing = {
            enabled: true,
            effects: [
                'color_correction',
                'bloom',
                'vignette',
                'film_grain',
                'chromatic_aberration'
            ],
            
            apply: () => {
                if (!this.postProcessing.enabled) return;
                
                this.applyColorCorrection();
                this.applyBloom();
                this.applyVignette();
                this.applyFilmGrain();
                this.applyChromaticAberration();
            }
        };
    }

    // متدهای به روز رسانی
    update(deltaTime) {
        this.updateTime(deltaTime);
        this.updateWeather(deltaTime);
        this.updateDynamicElements(deltaTime);
        this.updateBiomeTransition(deltaTime);
        this.updateSpecialEffects(deltaTime);
    }

    updateTime(deltaTime) {
        this.timeSystem.currentTime += this.timeSystem.cycleSpeed * deltaTime;
        if (this.timeSystem.currentTime >= 1) {
            this.timeSystem.currentTime = 0;
        }
    }

    updateWeather(deltaTime) {
        const weather = this.weatherSystem;
        
        // تغییر تصادفی آب و هوا
        if (Math.random() < 0.001) {
            const weatherTypes = Object.keys(weather.types);
            const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            weather.change(newWeather);
        }
        
        // به روز رسانی انتقال آب و هوا
        if (weather.intensity < 1) {
            weather.intensity += weather.transitionSpeed * deltaTime;
        }
    }

    updateDynamicElements(deltaTime) {
        this.dynamicElements.forEach((system, key) => {
            if (system.update) {
                system.update(deltaTime);
            }
        });
    }

    updateBiomeTransition(deltaTime) {
        if (this.biomeTransition.progress < 1) {
            this.biomeTransition.progress += 0.01 * deltaTime;
            
            if (this.biomeTransition.progress >= 1) {
                this.currentBiome = this.biomeTransition.to;
                this.biomeTransition.progress = 0;
            }
        }
    }

    changeBiome(newBiome) {
        if (this.currentBiome === newBiome) return;
        
        this.biomeTransition.from = this.currentBiome;
        this.biomeTransition.to = newBiome;
        this.biomeTransition.progress = 0;
        
        console.log(`🌍 تغییر محیط از ${this.biomeTransition.from} به ${newBiome}`);
    }

    changeWeather(newWeather) {
        this.weatherSystem.current = newWeather;
        this.weatherSystem.intensity = 0;
        
        console.log(`🌤️ تغییر آب و هوا به: ${newWeather}`);
    }

    // متدهای رندر
    render() {
        this.renderSky();
        this.renderTerrain();
        this.renderEnvironmentObjects();
        this.renderDynamicElements();
        this.renderSpecialEffects();
        this.applyPostProcessing();
    }

    renderSky() {
        const skybox = this.environments.get(this.currentBiome).skybox;
        const timeColor = this.timeSystem.getLightColor();
        
        // رندر آسمان با گرادیان
        const gradient = this.game.ctx.createLinearGradient(0, 0, 0, this.game.canvas.height);
        gradient.addColorStop(0, this.rgbToHex([
            skybox.colors.top[0] * timeColor[0],
            skybox.colors.top[1] * timeColor[1],
            skybox.colors.top[2] * timeColor[2]
        ]));
        gradient.addColorStop(0.5, this.rgbToHex([
            skybox.colors.middle[0] * timeColor[0],
            skybox.colors.middle[1] * timeColor[1],
            skybox.colors.middle[2] * timeColor[2]
        ]));
        gradient.addColorStop(1, this.rgbToHex([
            skybox.colors.bottom[0] * timeColor[0],
            skybox.colors.bottom[1] * timeColor[1],
            skybox.colors.bottom[2] * timeColor[2]
        ]));
        
        this.game.ctx.fillStyle = gradient;
        this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        
        // رندر خورشید
        this.renderSun();
        
        // رندر ابرها اگر وجود دارد
        if (skybox.clouds) {
            this.renderClouds();
        }
    }

    renderSun() {
        const sunPos = this.timeSystem.getSunPosition();
        const screenPos = this.game.worldToScreen({
            x: sunPos.x * 1000,
            y: sunPos.y * 1000,
            z: 0
        });
        
        // رندر خورشید
        const sunGradient = this.game.ctx.createRadialGradient(
            screenPos.x, screenPos.y, 0,
            screenPos.x, screenPos.y, 30
        );
        sunGradient.addColorStop(0, '#FFFF00');
        sunGradient.addColorStop(1, '#FFA50000');
        
        this.game.ctx.fillStyle = sunGradient;
        this.game.ctx.beginPath();
        this.game.ctx.arc(screenPos.x, screenPos.y, 30, 0, Math.PI * 2);
        this.game.ctx.fill();
    }

    renderClouds() {
        // رندر ابرها به صورت procedural
        for (let i = 0; i < 10; i++) {
            const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * this.game.canvas.width;
            const y = (Math.cos(i * 456.789) * 0.2 + 0.3) * this.game.canvas.height * 0.5;
            const size = 60 + Math.sin(i * 321.654) * 20;
            
            this.game.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.game.ctx.beginPath();
            this.game.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.game.ctx.fill();
        }
    }

    renderTerrain() {
        const environment = this.environments.get(this.currentBiome);
        const segments = this.terrain.segments;
        
        segments.forEach(segment => {
            const screenPos = this.game.worldToScreen(segment.position);
            if (!this.game.isInView(screenPos)) return;
            
            this.game.ctx.fillStyle = environment.terrain.texture;
            this.game.ctx.fillRect(
                screenPos.x - segment.size.width / 2,
                screenPos.y - segment.size.height / 2,
                segment.size.width,
                segment.size.height
            );
        });
    }

    renderEnvironmentObjects() {
        const environment = this.environments.get(this.currentBiome);
        
        // رندر ساختمان‌ها
        if (environment.buildings) {
            environment.buildings.forEach(building => {
                this.renderBuilding(building);
            });
        }
        
        // رندر پوشش گیاهی
        if (environment.vegetation) {
            environment.vegetation.forEach(plant => {
                this.renderVegetation(plant);
            });
        }
        
        // رندر جزایر
        if (environment.islands) {
            environment.islands.forEach(island => {
                this.renderIsland(island);
            });
        }
        
        // رندر کوه‌ها
        if (environment.peaks) {
            environment.peaks.forEach(peak => {
                this.renderMountainPeak(peak);
            });
        }
    }

    renderBuilding(building) {
        const screenPos = this.game.worldToScreen(building.position);
        if (!this.game.isInView(screenPos)) return;
        
        this.game.ctx.fillStyle = building.color;
        this.game.ctx.fillRect(
            screenPos.x - building.size.width / 2,
            screenPos.y - building.size.height,
            building.size.width,
            building.size.height
        );
        
        // رندر پنجره‌ها
        if (building.windows > 0) {
            this.renderBuildingWindows(building, screenPos);
        }
    }

    renderBuildingWindows(building, screenPos) {
        this.game.ctx.fillStyle = building.lightsOn ? '#FFD700' : '#1a1a1a';
        
        const windowSpacing = building.size.height / (building.windows / 2);
        for (let i = 0; i < building.windows / 2; i++) {
            for (let j = 0; j < 2; j++) {
                const windowX = screenPos.x - building.size.width / 2 + (j + 1) * (building.size.width / 3);
                const windowY = screenPos.y - building.size.height + i * windowSpacing + 10;
                
                this.game.ctx.fillRect(windowX - 2, windowY, 4, 8);
            }
        }
    }

    renderVegetation(plant) {
        const screenPos = this.game.worldToScreen(plant.position);
        if (!this.game.isInView(screenPos)) return;
        
        switch (plant.type) {
            case 'cactus':
                this.game.ctx.fillStyle = plant.color;
                this.game.ctx.fillRect(
                    screenPos.x - 2,
                    screenPos.y - plant.height,
                    4,
                    plant.height
                );
                
                // رندر بازوها
                for (let i = 0; i < plant.arms; i++) {
                    this.game.ctx.fillRect(
                        screenPos.x - 6 + i * 4,
                        screenPos.y - plant.height + 10,
                        8,
                        3
                    );
                }
                break;
                
            case 'tumbleweed':
                this.game.ctx.fillStyle = '#8B4513';
                this.game.ctx.beginPath();
                this.game.ctx.arc(screenPos.x, screenPos.y, plant.size, 0, Math.PI * 2);
                this.game.ctx.fill();
                break;
        }
    }

    renderDynamicElements() {
        this.dynamicElements.forEach((system, key) => {
            if (system.vehicles) {
                system.vehicles.forEach(vehicle => {
                    this.renderVehicle(vehicle);
                });
            }
            
            if (system.animals) {
                system.animals.forEach(animal => {
                    this.renderAnimal(animal);
                });
            }
        });
    }

    renderVehicle(vehicle) {
        const screenPos = this.game.worldToScreen(vehicle.position);
        if (!this.game.isInView(screenPos)) return;
        
        this.game.ctx.fillStyle = this.getVehicleColor(vehicle.type);
        this.game.ctx.fillRect(
            screenPos.x - 4,
            screenPos.y - 2,
            8,
            4
        );
    }

    renderAnimal(animal) {
        const screenPos = this.game.worldToScreen(animal.position);
        if (!this.game.isInView(screenPos)) return;
        
        this.game.ctx.fillStyle = this.getAnimalColor(animal.type);
        this.game.ctx.fillRect(
            screenPos.x - 3,
            screenPos.y - 2,
            6,
            4
        );
    }

    // متدهای کمکی
    getRandomBuildingColor() {
        const colors = ['#708090', '#2F4F4F', '#696969', '#800000', '#8B4513'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getVehicleColor(type) {
        const colors = {
            'car': '#FF0000',
            'bus': '#0000FF',
            'truck': '#008000',
            'motorcycle': '#FFFF00'
        };
        return colors[type] || '#666666';
    }

    getAnimalColor(type) {
        const colors = {
            'deer': '#8B4513',
            'rabbit': '#FFFFFF',
            'coyote': '#A0522D',
            'polar_bear': '#F5F5F5',
            'bird': '#1E90FF'
        };
        return colors[type] || '#666666';
    }

    rgbToHex(rgb) {
        return `#${Math.floor(rgb[0] * 255).toString(16).padStart(2, '0')}${Math.floor(rgb[1] * 255).toString(16).padStart(2, '0')}${Math.floor(rgb[2] * 255).toString(16).padStart(2, '0')}`;
    }

    // سایر محیط‌ها
    createForestEnvironment() {
        return {
            type: 'woodland',
            skybox: this.createForestSkybox(),
            terrain: { texture: '#228B22', detail: 'grass', roughness: 0.6 },
            trees: this.generateForestTrees(),
            lighting: { ambient: [0.3, 0.5, 0.3] },
            sounds: ['forest_birds', 'wind_trees'],
            particles: ['leaf_particles', 'forest_mist']
        };
    }

    createArcticEnvironment() {
        return {
            type: 'snow',
            skybox: this.createArcticSkybox(),
            terrain: { texture: '#FFFFFF', detail: 'snow', roughness: 0.7 },
            iceFormations: this.generateIceFormations(),
            lighting: { ambient: [0.8, 0.9, 1.0] },
            sounds: ['arctic_wind', 'ice_cracking'],
            particles: ['snow_flakes', 'ice_crystals']
        };
    }

    createVolcanoEnvironment() {
        return {
            type: 'volcanic',
            skybox: this.createVolcanoSkybox(),
            terrain: { texture: '#8B0000', detail: 'lava', roughness: 0.9 },
            volcanicFeatures: this.generateVolcanicFeatures(),
            lighting: { ambient: [0.8, 0.3, 0.1] },
            sounds: ['volcano_rumble', 'lava_bubble'],
            particles: ['ash_cloud', 'lava_sparks']
        };
    }

    // آرایه perm برای نویز پرلین
    perm = new Array(512);
    
    constructor() {
        // مقداردهی اولیه آرایه perm
        const permutation = [];
        for (let i = 0; i < 256; i++) {
            permutation[i] = Math.floor(Math.random() * 256);
        }
        
        for (let i = 0; i < 512; i++) {
            this.perm[i] = permutation[i & 255];
        }
    }
}

// راه‌اندازی سیستم محیط
function initEnvironmentSystem(game) {
    return new EnvironmentSystem(game);
              }
