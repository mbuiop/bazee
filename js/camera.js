// سیستم دوربین پهپاد سینمایی با حرکت‌های فیلم‌برداری حرفه‌ای
class CinematicCameraSystem {
    constructor(game) {
        this.game = game;
        this.camera = {
            position: { x: 0, y: 50, z: 100 },
            target: { x: 0, y: 10, z: 0 },
            rotation: { x: -0.3, y: 0, z: 0 },
            fov: 75,
            shake: {
                intensity: 0,
                duration: 0,
                timer: 0
            },
            effects: {
                motionBlur: true,
                depthOfField: true,
                chromaticAberration: false,
                vignette: true
            }
        };

        this.cameraModes = new Map();
        this.cameraShots = new Map();
        this.transition = {
            active: false,
            from: null,
            to: null,
            progress: 0,
            duration: 2.0
        };

        this.drone = {
            position: { x: 0, y: 60, z: 80 },
            target: { x: 0, y: 15, z: -20 },
            movement: {
                speed: 2.0,
                smoothness: 0.1,
                orbitSpeed: 0.5,
                followDistance: 50
            },
            behavior: 'orbit',
            behaviors: new Map()
        };

        this.cameraPaths = new Map();
        this.dynamicFraming = {
            enabled: true,
            ruleOfThirds: true,
            leadRoom: true,
            lookRoom: true
        };

        this.init();
    }

    init() {
        this.setupCameraModes();
        this.setupCameraShots();
        this.setupDroneBehaviors();
        this.setupCameraPaths();
        this.setupSpecialEffects();
        this.setupCameraPresets();
    }

    setupCameraModes() {
        // ۱۵ حالت مختلف دوربین
        this.cameraModes.set('drone_follow', {
            name: 'پهپاد تعقیب‌کننده',
            update: (deltaTime) => this.updateDroneFollow(deltaTime),
            priority: 1,
            description: 'پهپاد در حال تعقیب قطار با حرکت نرم'
        });

        this.cameraModes.set('drone_orbit', {
            name: 'پهپاد مداری',
            update: (deltaTime) => this.updateDroneOrbit(deltaTime),
            priority: 2,
            description: 'پهپاد به دور قطار می‌چرخد'
        });

        this.cameraModes.set('cabin_view', {
            name: 'نمای کابین',
            update: (deltaTime) => this.updateCabinView(deltaTime),
            priority: 3,
            description: 'نمای اول شخص از داخل کابین'
        });

        this.cameraModes.set('side_follow', {
            name: 'نمای جانبی',
            update: (deltaTime) => this.updateSideFollow(deltaTime),
            priority: 2,
            description: 'دوربین در کنار قطار حرکت می‌کند'
        });

        this.cameraModes.set('front_hero', {
            name: 'نمای قهرمانی',
            update: (deltaTime) => this.updateFrontHero(deltaTime),
            priority: 3,
            description: 'نمای روبرو با زاویه پایین'
        });

        this.cameraModes.set('top_down', {
            name: 'نمای از بالا',
            update: (deltaTime) => this.updateTopDown(deltaTime),
            priority: 2,
            description: 'نمای عمودی از بالا'
        });

        this.cameraModes.set('dolly_zoom', {
            name: 'دالی زوم',
            update: (deltaTime) => this.updateDollyZoom(deltaTime),
            priority: 4,
            description: 'افکت معروف vertigo'
        });

        this.cameraModes.set('action_tracking', {
            name: 'ردگیری اکشن',
            update: (deltaTime) => this.updateActionTracking(deltaTime),
            priority: 3,
            description: 'تمرکز روی صحنه‌های اکشن'
        });

        this.cameraModes.set('cinematic_sweep', {
            name: 'پن سینمایی',
            update: (deltaTime) => this.updateCinematicSweep(deltaTime),
            priority: 2,
            description: 'حرکت آرام در صحنه'
        });

        this.cameraModes.set('dynamic_combat', {
            name: 'نمای مبارزه پویا',
            update: (deltaTime) => this.updateDynamicCombat(deltaTime),
            priority: 3,
            description: 'تغییر بین نماها در حین مبارزه'
        });

        // حالت فعلی
        this.currentMode = 'drone_follow';
    }

    setupCameraShots() {
        // ۲۰ نوع شات سینمایی مختلف
        this.cameraShots.set('extreme_wide', {
            fov: 100,
            position: { x: 0, y: 100, z: 200 },
            target: { x: 0, y: 0, z: -100 },
            duration: 5.0,
            useCase: 'نمای محیطی'
        });

        this.cameraShots.set('wide_shot', {
            fov: 75,
            position: { x: 0, y: 50, z: 100 },
            target: { x: 0, y: 10, z: -50 },
            duration: 3.0,
            useCase: 'نمای کلی'
        });

        this.cameraShots.set('medium_shot', {
            fov: 60,
            position: { x: 20, y: 15, z: 30 },
            target: { x: 0, y: 8, z: 0 },
            duration: 2.0,
            useCase: 'نمای متوسط'
        });

        this.cameraShots.set('close_up', {
            fov: 45,
            position: { x: 5, y: 8, z: 10 },
            target: { x: 0, y: 6, z: 0 },
            duration: 1.5,
            useCase: 'نمای نزدیک'
        });

        this.cameraShots.set('extreme_close_up', {
            fov: 30,
            position: { x: 2, y: 6, z: 5 },
            target: { x: 0, y: 5, z: 0 },
            duration: 1.0,
            useCase: 'نمای خیلی نزدیک'
        });

        this.cameraShots.set('low_angle', {
            fov: 65,
            position: { x: 0, y: 2, z: 20 },
            target: { x: 0, y: 10, z: 0 },
            duration: 2.5,
            useCase: 'نمای از پایین'
        });

        this.cameraShots.set('high_angle', {
            fov: 70,
            position: { x: 0, y: 80, z: 40 },
            target: { x: 0, y: 5, z: 0 },
            duration: 2.5,
            useCase: 'نمای از بالا'
        });

        this.cameraShots.set('dutch_angle', {
            fov: 60,
            position: { x: 15, y: 20, z: 30 },
            target: { x: 0, y: 10, z: 0 },
            roll: 0.3,
            duration: 2.0,
            useCase: 'نمای کج'
        });

        this.cameraShots.set('tracking_shot', {
            fov: 65,
            position: { x: 25, y: 15, z: 40 },
            target: { x: 0, y: 10, z: -10 },
            movement: { x: 0, y: 0, z: -5 },
            duration: 4.0,
            useCase: 'نمای تعقیبی'
        });

        this.cameraShots.set('crane_shot', {
            fov: 75,
            position: { x: 0, y: 120, z: 80 },
            target: { x: 0, y: 5, z: -20 },
            movement: { x: 0, y: -80, z: 0 },
            duration: 3.0,
            useCase: 'نمای جرثقیلی'
        });
    }

    setupDroneBehaviors() {
        // رفتارهای مختلف پهپاد
        this.drone.behaviors.set('orbit', {
            update: (deltaTime) => this.updateOrbitBehavior(deltaTime),
            speed: 0.5,
            radius: 60,
            height: 50
        });

        this.drone.behaviors.set('follow', {
            update: (deltaTime) => this.updateFollowBehavior(deltaTime),
            distance: 50,
            height: 40,
            smoothness: 0.1
        });

        this.drone.behaviors.set('lead', {
            update: (deltaTime) => this.updateLeadBehavior(deltaTime),
            distance: 80,
            height: 30,
            predictive: true
        });

        this.drone.behaviors.set('combat', {
            update: (deltaTime) => this.updateCombatBehavior(deltaTime),
            focus: 'action',
            dynamic: true,
            reaction: 0.8
        });

        this.drone.behaviors.set('cinematic', {
            update: (deltaTime) => this.updateCinematicBehavior(deltaTime),
            shotSelection: true,
            timing: 3.0,
            transitions: true
        });
    }

    setupCameraPaths() {
        // مسیرهای از پیش تعریف شده دوربین
        this.cameraPaths.set('intro_sequence', {
            points: [
                { x: 0, y: 200, z: 300, fov: 100, duration: 3.0 },
                { x: 50, y: 100, z: 150, fov: 75, duration: 2.0 },
                { x: 30, y: 60, z: 80, fov: 65, duration: 2.0 },
                { x: 20, y: 40, z: 50, fov: 60, duration: 1.5 }
            ],
            loop: false,
            smooth: true
        });

        this.cameraPaths.set('combat_circle', {
            points: [
                { x: 60, y: 40, z: 0, fov: 70, duration: 2.0 },
                { x: 0, y: 50, z: -60, fov: 75, duration: 2.0 },
                { x: -60, y: 40, z: 0, fov: 70, duration: 2.0 },
                { x: 0, y: 50, z: 60, fov: 75, duration: 2.0 }
            ],
            loop: true,
            smooth: true
        });

        this.cameraPaths.set('dramatic_sweep', {
            points: [
                { x: -100, y: 80, z: 150, fov: 85, duration: 4.0 },
                { x: 100, y: 60, z: 100, fov: 75, duration: 3.0 },
                { x: 80, y: 40, z: 50, fov: 65, duration: 2.0 }
            ],
            loop: false,
            smooth: true
        });
    }

    setupSpecialEffects() {
        // افکت‌های ویژه دوربین
        this.specialEffects = {
            shake: {
                apply: (intensity, duration) => this.applyCameraShake(intensity, duration),
                update: (deltaTime) => this.updateCameraShake(deltaTime)
            },
            motionBlur: {
                apply: () => this.applyMotionBlur(),
                intensity: 0.5,
                samples: 8
            },
            depthOfField: {
                apply: () => this.applyDepthOfField(),
                focusDistance: 50,
                aperture: 0.8
            },
            chromaticAberration: {
                apply: () => this.applyChromaticAberration(),
                intensity: 0.02,
                rgbShift: true
            },
            vignette: {
                apply: () => this.applyVignette(),
                intensity: 0.3,
                smoothness: 0.7
            }
        };
    }

    setupCameraPresets() {
        // پریست‌های از پیش تنظیم شده
        this.presets = new Map();
        
        this.presets.set('action_sequence', {
            modes: ['dynamic_combat', 'action_tracking'],
            shots: ['medium_shot', 'close_up', 'dutch_angle'],
            transitionSpeed: 0.8,
            shakeIntensity: 0.3
        });

        this.presets.set('cinematic_travel', {
            modes: ['cinematic_sweep', 'drone_orbit'],
            shots: ['wide_shot', 'extreme_wide', 'crane_shot'],
            transitionSpeed: 0.4,
            shakeIntensity: 0.1
        });

        this.presets.set('intense_combat', {
            modes: ['dynamic_combat', 'drone_follow'],
            shots: ['close_up', 'dutch_angle', 'low_angle'],
            transitionSpeed: 1.2,
            shakeIntensity: 0.6
        });
    }

    // متدهای به روز رسانی اصلی
    update(deltaTime) {
        this.updateCameraMode(deltaTime);
        this.updateCameraShake(deltaTime);
        this.updateTransitions(deltaTime);
        this.updateDynamicFraming(deltaTime);
        this.updateSpecialEffects(deltaTime);
        
        // اعمال موقعیت نهایی دوربین به بازی
        this.applyCameraToGame();
    }

    updateCameraMode(deltaTime) {
        const mode = this.cameraModes.get(this.currentMode);
        if (mode && mode.update) {
            mode.update(deltaTime);
        }
    }

    // پیاده‌سازی حالت‌های دوربین
    updateDroneFollow(deltaTime) {
        const train = this.game.scene.train;
        const behavior = this.drone.behaviors.get('follow');
        
        // محاسبه موقعیت هدف
        const targetPosition = {
            x: train.position.x,
            y: train.position.y + behavior.height,
            z: train.position.z + behavior.distance
        };

        // حرکت نرم به سمت هدف
        this.drone.position.x += (targetPosition.x - this.drone.position.x) * behavior.smoothness;
        this.drone.position.y += (targetPosition.y - this.drone.position.y) * behavior.smoothness;
        this.drone.position.z += (targetPosition.z - this.drone.position.z) * behavior.smoothness;

        // هدف‌گیری به سمت قطار با مقداری پیش‌بینی
        this.drone.target.x = train.position.x;
        this.drone.target.y = train.position.y + 10;
        this.drone.target.z = train.position.z - 20;

        this.camera.position = { ...this.drone.position };
        this.camera.target = { ...this.drone.target };
    }

    updateDroneOrbit(deltaTime) {
        const train = this.game.scene.train;
        const behavior = this.drone.behaviors.get('orbit');
        
        // محاسبه موقعیت در مدار
        const time = Date.now() * 0.001 * behavior.speed;
        const orbitX = Math.cos(time) * behavior.radius;
        const orbitZ = Math.sin(time) * behavior.radius;

        this.drone.position.x = train.position.x + orbitX;
        this.drone.position.y = train.position.y + behavior.height;
        this.drone.position.z = train.position.z + orbitZ;

        this.drone.target.x = train.position.x;
        this.drone.target.y = train.position.y + 8;
        this.drone.target.z = train.position.z;

        this.camera.position = { ...this.drone.position };
        this.camera.target = { ...this.drone.target };
    }

    updateCabinView(deltaTime) {
        const train = this.game.scene.train;
        
        // موقعیت داخل کابین
        this.camera.position.x = train.position.x;
        this.camera.position.y = train.position.y + 8;
        this.camera.position.z = train.position.z + 5;

        // نگاه به جلو
        this.camera.target.x = train.position.x;
        this.camera.target.y = train.position.y + 6;
        this.camera.target.z = train.position.z - 50;

        // اعمال لرزش بر اساس سرعت
        const speedFactor = train.speed / train.maxSpeed;
        this.applyCameraShake(speedFactor * 0.1, 0.1);
    }

    updateSideFollow(deltaTime) {
        const train = this.game.scene.train;
        
        // موقعیت در کنار قطار
        this.camera.position.x = train.position.x + 25;
        this.camera.position.y = train.position.y + 15;
        this.camera.position.z = train.position.z;

        // هدف‌گیری به سمت قطار
        this.camera.target.x = train.position.x - 5;
        this.camera.target.y = train.position.y + 8;
        this.camera.target.z = train.position.z - 10;
    }

    updateFrontHero(deltaTime) {
        const train = this.game.scene.train;
        
        // موقعیت روبرو با زاویه پایین
        this.camera.position.x = train.position.x;
        this.camera.position.y = train.position.y + 3;
        this.camera.position.z = train.position.z + 30;

        // هدف‌گیری به سمت بالا برای نمای قهرمانی
        this.camera.target.x = train.position.x;
        this.camera.target.y = train.position.y + 15;
        this.camera.target.z = train.position.z - 20;
    }

    updateDollyZoom(deltaTime) {
        const train = this.game.scene.train;
        static zoomProgress = 0;
        
        // اثر دالی زوم (Vertigo)
        const distance = 30 + Math.sin(zoomProgress) * 20;
        const fov = 75 - Math.sin(zoomProgress) * 30;

        this.camera.position.x = train.position.x;
        this.camera.position.y = train.position.y + 10;
        this.camera.position.z = train.position.z + distance;

        this.camera.target.x = train.position.x;
        this.camera.target.y = train.position.y + 8;
        this.camera.target.z = train.position.z - 10;

        this.camera.fov = fov;
        zoomProgress += deltaTime * 0.5;
    }

    updateDynamicCombat(deltaTime) {
        const train = this.game.scene.train;
        const enemies = this.game.enemySystem?.enemies;
        
        if (enemies && enemies.size > 0) {
            // پیدا کردن نزدیک‌ترین دشمن
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            enemies.forEach(enemy => {
                const distance = this.calculateDistance(train.position, enemy.position);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            });

            if (closestEnemy && closestDistance < 100) {
                // تمرکز روی مبارزه
                this.camera.position.x = (train.position.x + closestEnemy.position.x) / 2;
                this.camera.position.y = Math.max(train.position.y, closestEnemy.position.y) + 20;
                this.camera.position.z = (train.position.z + closestEnemy.position.z) / 2 + 40;

                this.camera.target.x = closestEnemy.position.x;
                this.camera.target.y = closestEnemy.position.y + 5;
                this.camera.target.z = closestEnemy.position.z;
            } else {
                // بازگشت به حالت عادی
                this.updateDroneFollow(deltaTime);
            }
        } else {
            this.updateDroneFollow(deltaTime);
        }

        // لرزش در حین شلیک
        if (this.game.scene.train.weapons.machineGun.firing) {
            this.applyCameraShake(0.3, 0.1);
        }
    }

    // سیستم لرزش دوربین
    applyCameraShake(intensity, duration) {
        this.camera.shake.intensity = Math.max(this.camera.shake.intensity, intensity);
        this.camera.shake.duration = Math.max(this.camera.shake.duration, duration);
        this.camera.shake.timer = 0;
    }

    updateCameraShake(deltaTime) {
        if (this.camera.shake.duration > 0) {
            this.camera.shake.timer += deltaTime;
            this.camera.shake.duration -= deltaTime;

            if (this.camera.shake.duration <= 0) {
                this.camera.shake.intensity = 0;
            }
        }
    }

    // سیستم انتقال بین نماها
    startTransition(toMode, duration = 2.0) {
        this.transition.active = true;
        this.transition.from = this.currentMode;
        this.transition.to = toMode;
        this.transition.progress = 0;
        this.transition.duration = duration;
    }

    updateTransitions(deltaTime) {
        if (this.transition.active) {
            this.transition.progress += deltaTime / this.transition.duration;

            if (this.transition.progress >= 1) {
                this.currentMode = this.transition.to;
                this.transition.active = false;
                this.transition.progress = 0;
            } else {
                // اینترپولیشن بین دو حالت
                this.interpolateCameraModes(
                    this.transition.from,
                    this.transition.to,
                    this.transition.progress
                );
            }
        }
    }

    interpolateCameraModes(fromMode, toMode, progress) {
        const from = this.cameraModes.get(fromMode);
        const to = this.cameraModes.get(toMode);

        if (!from || !to) return;

        // اجرای هر دو حالت و اینترپولیشن بین نتایج
        const tempFrom = { ...this.camera };
        const tempTo = { ...this.camera };

        // ذخیره حالت فعلی
        const currentMode = this.currentMode;

        // شبیه‌سازی حالت مبدأ
        this.currentMode = fromMode;
        from.update(0.016); // یک فریم

        // شبیه‌سازی حالت مقصد
        this.currentMode = toMode;
        to.update(0.016); // یک فریم

        // اینترپولیشن
        this.camera.position.x = this.lerp(tempFrom.position.x, tempTo.position.x, progress);
        this.camera.position.y = this.lerp(tempFrom.position.y, tempTo.position.y, progress);
        this.camera.position.z = this.lerp(tempFrom.position.z, tempTo.position.z, progress);

        this.camera.target.x = this.lerp(tempFrom.target.x, tempTo.target.x, progress);
        this.camera.target.y = this.lerp(tempFrom.target.y, tempTo.target.y, progress);
        this.camera.target.z = this.lerp(tempFrom.target.z, tempTo.target.z, progress);

        this.camera.fov = this.lerp(tempFrom.fov, tempTo.fov, progress);

        // بازگرداندن حالت فعلی
        this.currentMode = currentMode;
    }

    // سیستم قاب‌بندی پویا
    updateDynamicFraming(deltaTime) {
        if (!this.dynamicFraming.enabled) return;

        const train = this.game.scene.train;
        
        // قانون یک‌سوم
        if (this.dynamicFraming.ruleOfThirds) {
            this.applyRuleOfThirds();
        }

        // فضای پیشرو
        if (this.dynamicFraming.leadRoom) {
            this.applyLeadRoom();
        }

        // فضای نگاه
        if (this.dynamicFraming.lookRoom) {
            this.applyLookRoom();
        }
    }

    applyRuleOfThirds() {
        // قرار دادن سوژه در نقاط یک‌سوم
        const screenPos = this.game.worldToScreen(this.game.scene.train.position);
        const canvas = this.game.canvas;
        
        const thirdX = canvas.width / 3;
        const thirdY = canvas.height / 3;

        // تنظیم موقعیت دوربین برای قرار دادن قطار در یک‌سوم
        const desiredScreenX = thirdX * 2; // یک‌سوم راست
        const desiredScreenY = thirdY * 1.5; // وسط عمودی

        const currentScreenPos = this.game.worldToScreen(this.game.scene.train.position);
        const offsetX = desiredScreenX - currentScreenPos.x;
        const offsetY = desiredScreenY - currentScreenPos.y;

        // تبدیل افست صفحه به افست دنیا (ساده‌سازی شده)
        this.camera.position.x -= offsetX * 0.01;
        this.camera.position.y -= offsetY * 0.01;
    }

    applyLeadRoom() {
        // فضای بیشتر در جلوی سوژه متحرک
        const train = this.game.scene.train;
        const speed = train.speed;
        
        if (speed > 0) {
            const leadAmount = speed * 0.5; // مقدار فضای پیشرو بر اساس سرعت
            this.camera.target.z = train.position.z - 20 - leadAmount;
        }
    }

    applyLookRoom() {
        // فضای بیشتر در جهت نگاه سوژه
        // در این مورد، قطار به جلو نگاه می‌کند، بنابراین فضای پیشرو اعمال می‌شود
        this.applyLeadRoom();
    }

    // افکت‌های ویژه
    updateSpecialEffects(deltaTime) {
        this.specialEffects.shake.update(deltaTime);
        
        if (this.camera.effects.motionBlur) {
            this.specialEffects.motionBlur.apply();
        }
        
        if (this.camera.effects.depthOfField) {
            this.specialEffects.depthOfField.apply();
        }
        
        if (this.camera.effects.chromaticAberration) {
            this.specialEffects.chromaticAberration.apply();
        }
        
        if (this.camera.effects.vignette) {
            this.specialEffects.vignette.apply();
        }
    }

    applyMotionBlur() {
        // پیاده‌سازی motion blur
        this.game.ctx.globalAlpha = 0.1;
        this.game.ctx.drawImage(this.game.canvas, 0, 0);
        this.game.ctx.globalAlpha = 1.0;
    }

    applyDepthOfField() {
        // افکت عمق میدان (ساده‌سازی شده)
        const focusDistance = this.specialEffects.depthOfField.focusDistance;
        const trainDistance = Math.abs(this.camera.position.z - this.game.scene.train.position.z);
        
        const blurAmount = Math.abs(trainDistance - focusDistance) * 0.01;
        this.game.ctx.filter = `blur(${blurAmount}px)`;
    }

    applyChromaticAberration() {
        // افکت انحراف رنگی
        const intensity = this.specialEffects.chromaticAberration.intensity;
        
        // ایجاد کپی‌های رنگی Shifted
        this.game.ctx.save();
        
        // قرمز
        this.game.ctx.globalCompositeOperation = 'screen';
        this.game.ctx.fillStyle = '#FF0000';
        this.game.ctx.fillRect(-intensity * 10, 0, this.game.canvas.width, this.game.canvas.height);
        
        // آبی
        this.game.ctx.globalCompositeOperation = 'screen';
        this.game.ctx.fillStyle = '#0000FF';
        this.game.ctx.fillRect(intensity * 10, 0, this.game.canvas.width, this.game.canvas.height);
        
        this.game.ctx.restore();
    }

    applyVignette() {
        // افکت وینییت
        const gradient = this.game.ctx.createRadialGradient(
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            0,
            this.game.canvas.width / 2,
            this.game.canvas.height / 2,
            Math.max(this.game.canvas.width, this.game.canvas.height) / 2
        );
        
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
        
        this.game.ctx.fillStyle = gradient;
        this.game.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    }

    // اعمال موقعیت دوربین به بازی
    applyCameraToGame() {
        // اعمال لرزش
        if (this.camera.shake.intensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.camera.shake.intensity * 10;
            const shakeY = (Math.random() - 0.5) * this.camera.shake.intensity * 10;
            
            this.game.camera.position.x = this.camera.position.x + shakeX;
            this.game.camera.position.y = this.camera.position.y + shakeY;
            this.game.camera.position.z = this.camera.position.z;
        } else {
            this.game.camera.position = { ...this.camera.position };
        }

        this.game.camera.target = { ...this.camera.target };
        this.game.camera.rotation = { ...this.camera.rotation };
        this.game.camera.fov = this.camera.fov;
    }

    // متدهای کمکی
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    // API عمومی برای کنترل دوربین
    setCameraMode(modeName) {
        if (this.cameraModes.has(modeName)) {
            this.startTransition(modeName);
        }
    }

    triggerCameraShake(intensity = 0.5, duration = 0.5) {
        this.applyCameraShake(intensity, duration);
    }

    playCameraPath(pathName) {
        const path = this.cameraPaths.get(pathName);
        if (path) {
            this.playPathSequence(path);
        }
    }

    playPathSequence(path) {
        // پیاده‌سازی پخش دنباله مسیر
        console.log(`🎥 Playing camera path with ${path.points.length} points`);
    }

    getCurrentShot() {
        // تشخیص خودکار نوع شات فعلی
        const distance = this.calculateDistance(this.camera.position, this.camera.target);
        
        if (distance > 150) return 'extreme_wide';
        if (distance > 80) return 'wide_shot';
        if (distance > 40) return 'medium_shot';
        if (distance > 15) return 'close_up';
        return 'extreme_close_up';
    }

    // دیباگ و اطلاعات
    getCameraInfo() {
        return {
            mode: this.currentMode,
            position: this.camera.position,
            target: this.camera.target,
            fov: this.camera.fov,
            shot: this.getCurrentShot(),
            shake: this.camera.shake.intensity
        };
    }

    drawDebugInfo() {
        const info = this.getCameraInfo();
        const ctx = this.game.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 300, 120);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText(`Camera Mode: ${info.mode}`, 20, 30);
        ctx.fillText(`Position: (${info.position.x.toFixed(1)}, ${info.position.y.toFixed(1)}, ${info.position.z.toFixed(1)})`, 20, 50);
        ctx.fillText(`Target: (${info.target.x.toFixed(1)}, ${info.target.y.toFixed(1)}, ${info.target.z.toFixed(1)})`, 20, 70);
        ctx.fillText(`FOV: ${info.fov.toFixed(1)}`, 20, 90);
        ctx.fillText(`Shot: ${info.shot}`, 20, 110);
        ctx.fillText(`Shake: ${info.shake.toFixed(2)}`, 20, 130);
    }
}

// راه‌اندازی سیستم دوربین
function initCameraSystem(game) {
    return new CinematicCameraSystem(game);
    }
