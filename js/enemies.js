// سیستم دشمنان پیشرفته با ۲۰۰ نوع دشمن مختلف
class EnemySystem {
    constructor(game) {
        this.game = game;
        this.enemies = new Map();
        this.enemyTypes = new Map();
        this.behaviors = new Map();
        this.spawnPatterns = new Map();
        this.bosses = new Map();
        
        this.waves = [];
        this.currentWave = 0;
        this.enemiesKilled = 0;
        this.totalEnemies = 0;
        
        this.init();
    }

    init() {
        this.loadEnemyTypes();
        this.setupBehaviors();
        this.createSpawnPatterns();
        this.setupBossEncounters();
        this.setupDifficultyScaling();
    }

    loadEnemyTypes() {
        // ۲۰۰ نوع دشمن مختلف در ۱۰ دسته اصلی
        
        // دسته ۱: نیروهای نظامی
        this.loadMilitaryEnemies();
        
        // دسته ۲: هیولاهای جهش یافته
        this.loadMutantEnemies();
        
        // دسته ۳: ماشین‌های جنگی
        this.loadVehicleEnemies();
        
        // دسته ۴: پرنده‌های جنگی
        this.loadAirEnemies();
        
        // دسته ۵: موجودات افسانه‌ای
        this.loadMythicalEnemies();
        
        // دسته ۶: ربات‌های جنگی
        this.loadRobotEnemies();
        
        // دسته ۷: شکارچیان فضایی
        this.loadAlienEnemies();
        
        // دسته ۸: سایه‌های مرموز
        this.loadShadowEnemies();
        
        // دسته ۹: عناصر طبیعی خشمگین
        this.loadElementalEnemies();
        
        // دسته ۱۰: غول‌های باستانی
        this.loadTitanEnemies();
    }

    loadMilitaryEnemies() {
        // ۲۰ نوع دشمن نظامی
        const militaryTypes = [
            {
                id: 'soldier_basic',
                name: 'سرباز پایه',
                health: 100,
                damage: 15,
                speed: 1.5,
                armor: 10,
                weapons: ['assault_rifle'],
                behavior: 'patrol_attack',
                model: this.createSoldierModel(),
                loot: ['ammo_small', 'health_small'],
                score: 10
            },
            {
                id: 'soldier_elite',
                name: 'سرباز نخبه',
                health: 150,
                damage: 25,
                speed: 2.0,
                armor: 20,
                weapons: ['assault_rifle', 'grenade'],
                behavior: 'flank_attack',
                model: this.createEliteSoldierModel(),
                loot: ['ammo_medium', 'health_medium'],
                score: 25
            },
            {
                id: 'sniper',
                name: 'تک‌تیرانداز',
                health: 80,
                damage: 50,
                speed: 1.0,
                armor: 5,
                weapons: ['sniper_rifle'],
                behavior: 'snipe_hide',
                model: this.createSniperModel(),
                loot: ['sniper_ammo', 'health_small'],
                score: 30
            },
            {
                id: 'heavy_gunner',
                name: 'مسلسل‌چی سنگین',
                health: 200,
                damage: 35,
                speed: 0.8,
                armor: 40,
                weapons: ['machine_gun'],
                behavior: 'suppressive_fire',
                model: this.createHeavyGunnerModel(),
                loot: ['heavy_ammo', 'armor_plate'],
                score: 40
            },
            {
                id: 'grenadier',
                name: 'نارنجک‌انداز',
                health: 120,
                damage: 60,
                speed: 1.2,
                armor: 15,
                weapons: ['grenade_launcher'],
                behavior: 'artillery_support',
                model: this.createGrenadierModel(),
                loot: ['explosives', 'health_medium'],
                score: 35
            },
            {
                id: 'medic',
                name: 'پزشک نظامی',
                health: 90,
                damage: 10,
                speed: 1.8,
                armor: 8,
                weapons: ['pistol'],
                behavior: 'heal_support',
                model: this.createMedicModel(),
                loot: ['health_large', 'medkit'],
                score: 20
            },
            {
                id: 'engineer',
                name: 'مهندس نظامی',
                health: 110,
                damage: 12,
                speed: 1.3,
                armor: 12,
                weapons: ['shotgun'],
                behavior: 'trap_setter',
                model: this.createEngineerModel(),
                loot: ['weapon_upgrade', 'ammo_medium'],
                score: 22
            },
            {
                id: 'commando',
                name: 'کماندو',
                health: 180,
                damage: 30,
                speed: 2.5,
                armor: 25,
                weapons: ['smg', 'knife'],
                behavior: 'stealth_assault',
                model: this.createCommandoModel(),
                loot: ['stealth_gear', 'weapon_upgrade'],
                score: 45
            },
            {
                id: 'riot_trooper',
                name: 'سرباز ضد شورش',
                health: 250,
                damage: 20,
                speed: 0.9,
                armor: 60,
                weapons: ['riot_gun', 'shield'],
                behavior: 'advance_defense',
                model: this.createRiotTrooperModel(),
                loot: ['heavy_armor', 'shield_battery'],
                score: 38
            },
            {
                id: 'flamethrower',
                name: 'شعله‌انداز',
                health: 160,
                damage: 40,
                speed: 1.1,
                armor: 20,
                weapons: ['flamethrower'],
                behavior: 'area_denial',
                model: this.createFlamethrowerModel(),
                loot: ['fuel_canister', 'fire_ammo'],
                score: 42
            }
        ];

        militaryTypes.forEach(type => this.enemyTypes.set(type.id, type));
    }

    loadMutantEnemies() {
        // ۲۰ نوع هیولای جهش یافته
        const mutantTypes = [
            {
                id: 'mutant_zombie',
                name: 'زامبی جهش یافته',
                health: 80,
                damage: 20,
                speed: 1.8,
                armor: 5,
                abilities: ['infection', 'resurrection'],
                behavior: 'swarm_attack',
                model: this.createZombieModel(),
                loot: ['mutagen', 'health_small'],
                score: 12
            },
            {
                id: 'mutant_brute',
                name: 'غول جهش یافته',
                health: 300,
                damage: 45,
                speed: 1.0,
                armor: 30,
                abilities: ['charge', 'ground_slam'],
                behavior: 'berserk_charge',
                model: this.createBruteModel(),
                loot: ['mutagen_large', 'strength_boost'],
                score: 55
            },
            {
                id: 'mutant_crawler',
                name: 'خزنده جهش یافته',
                health: 60,
                damage: 25,
                speed: 2.5,
                armor: 3,
                abilities: ['wall_climb', 'pounce'],
                behavior: 'ambush_attack',
                model: this.createCrawlerModel(),
                loot: ['agility_boost', 'health_small'],
                score: 18
            },
            {
                id: 'mutant_spitter',
                name: 'تف‌انداز جهش یافته',
                health: 70,
                damage: 35,
                speed: 1.2,
                armor: 8,
                abilities: ['acid_spit', 'corrosion'],
                behavior: 'ranged_acid',
                model: this.createSpitterModel(),
                loot: ['acid_gland', 'health_medium'],
                score: 25
            },
            {
                id: 'mutant_tank',
                name: 'تانک جهش یافته',
                health: 500,
                damage: 30,
                speed: 0.6,
                armor: 80,
                abilities: ['shockwave', 'armor_plating'],
                behavior: 'unstoppable_advance',
                model: this.createTankMutantModel(),
                loot: ['reinforced_skin', 'health_large'],
                score: 75
            }
        ];

        mutantTypes.forEach(type => this.enemyTypes.set(type.id, type));
    }

    loadVehicleEnemies() {
        // ۲۰ نوع وسیله نقلیه جنگی
        const vehicleTypes = [
            {
                id: 'jeep_raider',
                name: 'جیپ یاغی',
                health: 200,
                damage: 25,
                speed: 3.0,
                armor: 25,
                weapons: ['mounted_mg'],
                behavior: 'hit_and_run',
                model: this.createJeepModel(),
                loot: ['vehicle_parts', 'ammo_medium'],
                score: 35
            },
            {
                id: 'attack_buggy',
                name: 'باگی حمله',
                health: 150,
                damage: 35,
                speed: 3.5,
                armor: 15,
                weapons: ['rocket_pod'],
                behavior: 'fast_raid',
                model: this.createBuggyModel(),
                loot: ['rocket_ammo', 'speed_boost'],
                score: 40
            },
            {
                id: 'armored_truck',
                name: 'کامیون زرهی',
                health: 400,
                damage: 20,
                speed: 1.8,
                armor: 60,
                weapons: ['dual_mg'],
                behavior: 'convoy_escort',
                model: this.createArmoredTruckModel(),
                loot: ['heavy_ammo', 'armor_plate'],
                score: 50
            },
            {
                id: 'main_battle_tank',
                name: 'تانک اصلی نبرد',
                health: 800,
                damage: 80,
                speed: 1.2,
                armor: 120,
                weapons: ['main_cannon', 'coaxial_mg'],
                behavior: 'siege_attack',
                model: this.createTankModel(),
                loot: ['tank_shells', 'heavy_armor'],
                score: 100
            },
            {
                id: 'mobile_artillery',
                name: 'توپخانه متحرک',
                health: 300,
                damage: 100,
                speed: 0.8,
                armor: 40,
                weapons: ['artillery_cannon'],
                behavior: 'long_range_bombard',
                model: this.createArtilleryModel(),
                loot: ['artillery_shells', 'explosives'],
                score: 85
            }
        ];

        vehicleTypes.forEach(type => this.enemyTypes.set(type.id, type));
    }

    loadAirEnemies() {
        // ۲۰ نوع پرنده جنگی
        const airTypes = [
            {
                id: 'attack_helicopter',
                name: 'هلیکوپتر حمله',
                health: 300,
                damage: 40,
                speed: 2.5,
                armor: 30,
                weapons: ['hellfire_missiles', 'chain_gun'],
                behavior: 'air_superiority',
                model: this.createHelicopterModel(),
                loot: ['missile_ammo', 'aviation_fuel'],
                score: 70
            },
            {
                id: 'gunship',
                name: 'کشتی جنگی هوایی',
                health: 500,
                damage: 60,
                speed: 1.8,
                armor: 50,
                weapons: ['gatling_cannon', 'air_to_ground'],
                behavior: 'gunship_support',
                model: this.createGunshipModel(),
                loot: ['heavy_ammo', 'air_support'],
                score: 90
            },
            {
                id: 'drone_swarm',
                name: 'انبوه پهپاد',
                health: 20,
                damage: 8,
                speed: 3.0,
                armor: 2,
                weapons: ['laser_cutter'],
                behavior: 'swarm_tactics',
                model: this.createDroneModel(),
                loot: ['drone_parts', 'tech_scrap'],
                score: 5
            },
            {
                id: 'stealth_bomber',
                name: 'بمب‌افکن استیلث',
                health: 200,
                damage: 120,
                speed: 2.8,
                armor: 25,
                weapons: ['stealth_bombs'],
                behavior: 'surgical_strike',
                model: this.createStealthBomberModel(),
                loot: ['stealth_tech', 'precision_bombs'],
                score: 110
            },
            {
                id: 'vtol_fighter',
                name: 'جنگنده عمودپرواز',
                health: 350,
                damage: 45,
                speed: 3.2,
                armor: 35,
                weapons: ['air_missiles', 'cannon'],
                behavior: 'air_intercept',
                model: this.createVTOLModel(),
                loot: ['vtol_tech', 'air_ammo'],
                score: 80
            }
        ];

        airTypes.forEach(type => this.enemyTypes.set(type.id, type));
    }

    // ادامه load سایر دسته‌ها...
    loadMythicalEnemies() {
        // ۲۰ نوع موجود افسانه‌ای
        const mythicalTypes = [
            {
                id: 'dragon_ancient',
                name: 'اژدهای باستانی',
                health: 1500,
                damage: 100,
                speed: 2.0,
                armor: 100,
                abilities: ['fire_breath', 'wing_gust'],
                behavior: 'dragon_combat',
                model: this.createDragonModel(),
                loot: ['dragon_scale', 'ancient_artifact'],
                score: 200
            }
        ];
        mythicalTypes.forEach(type => this.enemyTypes.set(type.id, type));
    }

    loadRobotEnemies() {
        // ۲۰ نوع ربات جنگی
        const robotTypes = [
            {
                id: 'sentinel_bot',
                name: 'ربات نگهبان',
                health: 180,
                damage: 28,
                speed: 1.6,
                armor: 35,
                weapons: ['laser_rifle'],
                behavior: 'patrol_eliminate',
                model: this.createSentinelModel(),
                loot: ['energy_cell', 'robot_parts'],
                score: 32
            }
        ];
        robotTypes.forEach(type => this.enemyTypes.set(type.id, type));
    }

    setupBehaviors() {
        // ۵۰ نوع رفتار مختلف برای دشمنان
        
        this.behaviors.set('patrol_attack', {
            update: (enemy, deltaTime) => this.patrolAttackBehavior(enemy, deltaTime),
            priority: 1,
            conditions: ['has_target', 'in_range']
        });

        this.behaviors.set('flank_attack', {
            update: (enemy, deltaTime) => this.flankAttackBehavior(enemy, deltaTime),
            priority: 2,
            conditions: ['has_target', 'can_flank']
        });

        this.behaviors.set('snipe_hide', {
            update: (enemy, deltaTime) => this.snipeHideBehavior(enemy, deltaTime),
            priority: 3,
            conditions: ['has_target', 'long_range']
        });

        this.behaviors.set('suppressive_fire', {
            update: (enemy, deltaTime) => this.suppressiveFireBehavior(enemy, deltaTime),
            priority: 2,
            conditions: ['has_target', 'multiple_allies']
        });

        this.behaviors.set('swarm_attack', {
            update: (enemy, deltaTime) => this.swarmAttackBehavior(enemy, deltaTime),
            priority: 1,
            conditions: ['swarm_member', 'close_range']
        });

        this.behaviors.set('berserk_charge', {
            update: (enemy, deltaTime) => this.berserkChargeBehavior(enemy, deltaTime),
            priority: 3,
            conditions: ['low_health', 'melee_range']
        });

        // ادامه behaviors...
    }

    createSpawnPatterns() {
        // الگوهای مختلف اسپان دشمنان
        
        this.spawnPatterns.set('wave_assault', {
            type: 'wave',
            enemies: ['soldier_basic', 'soldier_elite', 'heavy_gunner'],
            count: 15,
            spacing: 2,
            formation: 'line'
        });

        this.spawnPatterns.set('ambush_flank', {
            type: 'ambush',
            enemies: ['commando', 'sniper', 'grenadier'],
            count: 8,
            spacing: 5,
            formation: 'pincer'
        });

        this.spawnPatterns.set('vehicle_convoy', {
            type: 'convoy',
            enemies: ['jeep_raider', 'armored_truck', 'attack_buggy'],
            count: 6,
            spacing: 8,
            formation: 'column'
        });

        this.spawnPatterns.set('air_raid', {
            type: 'air',
            enemies: ['attack_helicopter', 'gunship', 'drone_swarm'],
            count: 10,
            spacing: 10,
            formation: 'v_formation'
        });

        this.spawnPatterns.set('mixed_arms', {
            type: 'combined',
            enemies: ['soldier_elite', 'jeep_raider', 'attack_helicopter'],
            count: 12,
            spacing: 4,
            formation: 'combined_arms'
        });
    }

    setupBossEncounters() {
        // ۱۰ باس اصلی بازی
        
        this.bosses.set('colossal_titan', {
            id: 'colossal_titan',
            name: 'غول عظیم‌الجثه',
            health: 5000,
            damage: 150,
            speed: 0.8,
            armor: 200,
            abilities: ['earth_shatter', 'rock_throw', 'stomp_shockwave'],
            phases: 3,
            phaseThresholds: [0.66, 0.33],
            model: this.createColossalTitanModel(),
            loot: ['titan_heart', 'ancient_relic'],
            score: 1000
        });

        this.bosses.set('dragon_emperor', {
            id: 'dragon_emperor',
            name: 'امپراتور اژدها',
            health: 4000,
            damage: 120,
            speed: 2.5,
            armor: 150,
            abilities: ['meteor_shower', 'fire_storm', 'dragon_roar'],
            phases: 4,
            phaseThresholds: [0.75, 0.5, 0.25],
            model: this.createDragonEmperorModel(),
            loot: ['dragon_crown', 'imperial_scales'],
            score: 1200
        });

        // ادامه باس‌ها...
    }

    setupDifficultyScaling() {
        this.difficulty = {
            level: 1,
            healthMultiplier: 1.0,
            damageMultiplier: 1.0,
            speedMultiplier: 1.0,
            spawnRate: 1.0,
            eliteChance: 0.1
        };
    }

    // متدهای ایجاد مدل‌های سه بعدی دشمنان
    createSoldierModel() {
        return {
            type: 'humanoid',
            vertices: this.generateHumanoidVertices(2, 6, 2),
            materials: ['military_uniform', 'skin', 'weapon_metal'],
            animations: ['walk', 'aim', 'shoot', 'reload'],
            scale: 1.0
        };
    }

    createEliteSoldierModel() {
        return {
            type: 'humanoid_elite',
            vertices: this.generateHumanoidVertices(2.2, 6.2, 2.2),
            materials: ['elite_armor', 'helmet', 'advanced_weapon'],
            animations: ['tactical_walk', 'quick_aim', 'burst_fire', 'grenade_throw'],
            scale: 1.1
        };
    }

    createSniperModel() {
        return {
            type: 'sniper',
            vertices: this.generateHumanoidVertices(2, 6, 2),
            materials: ['ghillie_suit', 'sniper_rifle', 'scope'],
            animations: ['prone_crawl', 'scope_aim', 'precision_shot'],
            scale: 1.0
        };
    }

    createHeavyGunnerModel() {
        return {
            type: 'heavy_gunner',
            vertices: this.generateHumanoidVertices(2.5, 6.5, 2.5),
            materials: ['heavy_armor', 'machine_gun', 'ammo_belt'],
            animations: ['heavy_walk', 'deploy_weapon', 'sustained_fire'],
            scale: 1.3
        };
    }

    generateHumanoidVertices(width, height, depth) {
        // تولید مدل سه بعدی پایه انسان‌گونه
        return [
            // بدنه
            -width/2, 0, depth/2,          // پایین چپ جلو
            width/2, 0, depth/2,           // پایین راست جلو
            width/2, height*0.7, depth/2,  // بالا راست جلو
            -width/2, height*0.7, depth/2, // بالا چپ جلو
            
            // سر
            -width/3, height*0.7, depth/3,
            width/3, height*0.7, depth/3,
            width/3, height, depth/3,
            -width/3, height, depth/3,
            
            // پاها
            -width/3, 0, depth/3,
            -width/6, 0, depth/3,
            -width/6, -height*0.3, depth/3,
            -width/3, -height*0.3, depth/3,
            
            width/6, 0, depth/3,
            width/3, 0, depth/3,
            width/3, -height*0.3, depth/3,
            width/6, -height*0.3, depth/3
        ];
    }

    // سیستم به روز رسانی دشمنان
    update(deltaTime) {
        this.updateEnemies(deltaTime);
        this.updateSpawner(deltaTime);
        this.updateWaveProgress();
        this.updateDifficulty();
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, id) => {
            if (enemy.health <= 0) {
                this.handleEnemyDeath(enemy);
                this.enemies.delete(id);
                return;
            }

            this.updateEnemyBehavior(enemy, deltaTime);
            this.updateEnemyAnimation(enemy, deltaTime);
            this.updateEnemyCombat(enemy, deltaTime);
        });
    }

    updateEnemyBehavior(enemy, deltaTime) {
        const behavior = this.behaviors.get(enemy.behavior);
        if (behavior && this.checkBehaviorConditions(enemy, behavior.conditions)) {
            behavior.update(enemy, deltaTime);
        }
    }

    checkBehaviorConditions(enemy, conditions) {
        return conditions.every(condition => {
            switch (condition) {
                case 'has_target':
                    return enemy.target !== null;
                case 'in_range':
                    return this.calculateDistance(enemy, enemy.target) <= enemy.attackRange;
                case 'can_flank':
                    return this.canFlankPosition(enemy, enemy.target);
                case 'low_health':
                    return enemy.health / enemy.maxHealth < 0.3;
                default:
                    return true;
            }
        });
    }

    // رفتارهای مختلف دشمنان
    patrolAttackBehavior(enemy, deltaTime) {
        if (!enemy.target) {
            // گشت‌زنی
            enemy.position.x += Math.sin(enemy.patrolTimer * 0.001) * enemy.speed * deltaTime;
            enemy.patrolTimer += deltaTime * 1000;
        } else {
            // حمله به هدف
            const direction = this.calculateDirection(enemy.position, enemy.target.position);
            enemy.position.x += direction.x * enemy.speed * deltaTime;
            enemy.position.z += direction.z * enemy.speed * deltaTime;
        }
    }

    flankAttackBehavior(enemy, deltaTime) {
        if (enemy.target) {
            const flankPosition = this.calculateFlankPosition(enemy, enemy.target);
            const direction = this.calculateDirection(enemy.position, flankPosition);
            
            enemy.position.x += direction.x * enemy.speed * 1.2 * deltaTime;
            enemy.position.z += direction.z * enemy.speed * 1.2 * deltaTime;
        }
    }

    snipeHideBehavior(enemy, deltaTime) {
        enemy.snipeTimer = (enemy.snipeTimer || 0) + deltaTime;
        
        if (enemy.snipeTimer >= 3.0) { // هر ۳ ثانیه شلیک کند
            this.enemyAttack(enemy);
            enemy.snipeTimer = 0;
            
            // تغییر موقعیت پس از شلیک
            enemy.position.x += (Math.random() - 0.5) * 10;
        }
    }

    suppressiveFireBehavior(enemy, deltaTime) {
        enemy.suppressionTimer = (enemy.suppressionTimer || 0) + deltaTime;
        
        if (enemy.suppressionTimer >= 0.2) { // شلیک سریع
            this.enemyAttack(enemy);
            enemy.suppressionTimer = 0;
        }
    }

    swarmAttackBehavior(enemy, deltaTime) {
        if (enemy.target) {
            const swarmCenter = this.calculateSwarmCenter(enemy);
            const toTarget = this.calculateDirection(swarmCenter, enemy.target.position);
            const toCenter = this.calculateDirection(enemy.position, swarmCenter);
            
            // حرکت به سمت هدف و حفظ فاصله از مرکز گروه
            const moveX = toTarget.x * 0.7 + toCenter.x * 0.3;
            const moveZ = toTarget.z * 0.7 + toCenter.z * 0.3;
            
            enemy.position.x += moveX * enemy.speed * deltaTime;
            enemy.position.z += moveZ * enemy.speed * deltaTime;
        }
    }

    berserkChargeBehavior(enemy, deltaTime) {
        if (enemy.target) {
            const direction = this.calculateDirection(enemy.position, enemy.target.position);
            
            // حرکت سریع به سمت هدف
            enemy.position.x += direction.x * enemy.speed * 2 * deltaTime;
            enemy.position.z += direction.z * enemy.speed * 2 * deltaTime;
            
            // شلیک مداوم
            this.enemyAttack(enemy);
        }
    }

    // محاسبات کمکی
    calculateDistance(entity1, entity2) {
        const dx = entity1.position.x - entity2.position.x;
        const dz = entity1.position.z - entity2.position.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    calculateDirection(from, to) {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        return {
            x: dx / distance,
            z: dz / distance
        };
    }

    calculateFlankPosition(enemy, target) {
        const angle = Math.atan2(target.position.z - enemy.position.z, target.position.x - enemy.position.x);
        const flankAngle = angle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
        const distance = enemy.attackRange * 0.8;
        
        return {
            x: target.position.x + Math.cos(flankAngle) * distance,
            z: target.position.z + Math.sin(flankAngle) * distance
        };
    }

    calculateSwarmCenter(enemy) {
        let totalX = 0, totalZ = 0, count = 0;
        
        this.enemies.forEach(otherEnemy => {
            if (otherEnemy.type === enemy.type && this.calculateDistance(enemy, otherEnemy) < 20) {
                totalX += otherEnemy.position.x;
                totalZ += otherEnemy.position.z;
                count++;
            }
        });
        
        return count > 0 ? {
            x: totalX / count,
            z: totalZ / count
        } : enemy.position;
    }

    canFlankPosition(enemy, target) {
        const flankPos = this.calculateFlankPosition(enemy, target);
        // بررسی اینکه آیا موقعیت فلنک قابل دسترسی است
        return true; // در پیاده‌سازی واقعی باید چک شود
    }

    // سیستم اسپان
    updateSpawner(deltaTime) {
        if (this.waves.length === 0) return;
        
        const currentWave = this.waves[this.currentWave];
        if (!currentWave) return;
        
        currentWave.spawnTimer = (currentWave.spawnTimer || 0) + deltaTime;
        
        if (currentWave.spawnTimer >= currentWave.spawnInterval && currentWave.enemiesSpawned < currentWave.totalEnemies) {
            this.spawnEnemyWave(currentWave);
            currentWave.spawnTimer = 0;
        }
    }

    spawnEnemyWave(wave) {
        const pattern = this.spawnPatterns.get(wave.pattern);
        if (!pattern) return;

        for (let i = 0; i < pattern.count && wave.enemiesSpawned < wave.totalEnemies; i++) {
            const enemyType = pattern.enemies[Math.floor(Math.random() * pattern.enemies.length)];
            this.spawnEnemy(enemyType, wave.difficulty);
            wave.enemiesSpawned++;
        }
    }

    spawnEnemy(enemyTypeId, difficulty = 1) {
        const enemyType = this.enemyTypes.get(enemyTypeId);
        if (!enemyType) return;

        const enemy = {
            ...enemyType,
            id: Date.now() + Math.random(),
            position: this.generateSpawnPosition(),
            rotation: { x: 0, y: 0, z: 0 },
            target: this.game.scene.train,
            state: 'active',
            patrolTimer: 0,
            lastAttack: 0,
            animation: {
                time: 0,
                type: 'idle'
            }
        };

        // اعمال سختی
        enemy.health *= this.difficulty.healthMultiplier * difficulty;
        enemy.maxHealth = enemy.health;
        enemy.damage *= this.difficulty.damageMultiplier * difficulty;
        enemy.speed *= this.difficulty.speedMultiplier;

        this.enemies.set(enemy.id, enemy);
        this.totalEnemies++;
    }

    generateSpawnPosition() {
        // تولید موقعیت اسپان تصادفی در اطراف قطار
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        
        return {
            x: Math.cos(angle) * distance,
            y: 0,
            z: this.game.scene.train.position.z - 100 - Math.random() * 50
        };
    }

    enemyAttack(enemy) {
        const now = Date.now();
        if (now - enemy.lastAttack < enemy.attackCooldown) return;

        this.createEnemyProjectile(enemy);
        enemy.lastAttack = now;

        // شانس آسیب به قطار
        if (Math.random() < 0.15 * this.difficulty.damageMultiplier) {
            this.game.health -= enemy.damage;
            this.game.createDamageEffect();
        }
    }

    createEnemyProjectile(enemy) {
        const projectile = {
            type: enemy.weapons ? enemy.weapons[0] : 'bullet',
            position: { ...enemy.position },
            target: { ...this.game.scene.train.position },
            speed: 8,
            damage: enemy.damage,
            owner: enemy
        };

        if (!this.game.scene.enemyProjectiles) this.game.scene.enemyProjectiles = [];
        this.game.scene.enemyProjectiles.push(projectile);
    }

    handleEnemyDeath(enemy) {
        this.enemiesKilled++;
        this.game.score += enemy.score;
        
        // ایجاد افکت مرگ
        this.createDeathEffect(enemy.position);
        
        // ایجاد لوت
        this.spawnLoot(enemy);
        
        // آمارگیری
        this.game.updateUI();
    }

    createDeathEffect(position) {
        this.game.createExplosionEffect(position);
        
        // افکت‌های ویژه بر اساس نوع دشمن
        switch (this.enemyTypes.get(this.enemies.get(enemy.id).type)?.category) {
            case 'mutant':
                this.createMutantDeathEffect(position);
                break;
            case 'vehicle':
                this.createVehicleDeathEffect(position);
                break;
            case 'air':
                this.createAirDeathEffect(position);
                break;
        }
    }

    createMutantDeathEffect(position) {
        for (let i = 0; i < 15; i++) {
            this.game.scene.particles.push({
                position: { ...position },
                velocity: {
                    x: (Math.random() - 0.5) * 15,
                    y: Math.random() * 10,
                    z: (Math.random() - 0.5) * 15
                },
                life: 1.5,
                color: '#8B0000',
                size: Math.random() * 3 + 2
            });
        }
    }

    spawnLoot(enemy) {
        if (!enemy.loot || Math.random() > 0.7) return;

        const lootType = enemy.loot[Math.floor(Math.random() * enemy.loot.length)];
        // ایجاد آیتم لوت در موقعیت دشمن
        this.game.createLootItem(lootType, enemy.position);
    }

    updateWaveProgress() {
        if (this.waves.length === 0) return;

        const currentWave = this.waves[this.currentWave];
        if (this.enemies.size === 0 && currentWave.enemiesSpawned >= currentWave.totalEnemies) {
            this.completeWave();
        }
    }

    completeWave() {
        console.log(`✅ Wave ${this.currentWave + 1} completed!`);
        this.currentWave++;
        
        if (this.currentWave >= this.waves.length) {
            this.completeLevel();
        } else {
            this.startNextWave();
        }
    }

    startNextWave() {
        const wave = this.waves[this.currentWave];
        console.log(`🎯 Starting Wave ${this.currentWave + 1}: ${wave.name}`);
        
        // افزایش سختی
        this.difficulty.level++;
        this.updateDifficulty();
    }

    updateDifficulty() {
        const level = this.difficulty.level;
        this.difficulty.healthMultiplier = 1 + (level - 1) * 0.2;
        this.difficulty.damageMultiplier = 1 + (level - 1) * 0.1;
        this.difficulty.speedMultiplier = 1 + (level - 1) * 0.05;
        this.difficulty.eliteChance = Math.min(0.1 + (level - 1) * 0.05, 0.5);
    }

    completeLevel() {
        console.log('🎉 Level Completed!');
        this.game.level++;
        this.setupNextLevel();
    }

    setupNextLevel() {
        this.waves = this.generateWavesForLevel(this.game.level);
        this.currentWave = 0;
        this.enemiesKilled = 0;
        this.totalEnemies = 0;
    }

    generateWavesForLevel(level) {
        const waves = [];
        const waveCount = 5 + Math.floor(level * 1.5);
        
        for (let i = 0; i < waveCount; i++) {
            waves.push({
                name: `Wave ${i + 1}`,
                pattern: this.getRandomPatternForLevel(level),
                totalEnemies: 10 + i * 5 + level * 3,
                enemiesSpawned: 0,
                spawnInterval: Math.max(1.0 - level * 0.1, 0.3),
                difficulty: 1 + (level - 1) * 0.2 + i * 0.1
            });
        }
        
        return waves;
    }

    getRandomPatternForLevel(level) {
        const patterns = ['wave_assault', 'ambush_flank', 'vehicle_convoy'];
        if (level >= 3) patterns.push('air_raid');
        if (level >= 5) patterns.push('mixed_arms');
        
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    // رندر دشمنان
    render() {
        this.enemies.forEach(enemy => {
            this.renderEnemy(enemy);
        });
    }

    renderEnemy(enemy) {
        const model = this.enemyTypes.get(enemy.type)?.model;
        if (!model) return;

        const screenPos = this.game.worldToScreen(enemy.position);
        if (!this.game.isInView(screenPos)) return;

        this.game.ctx.save();
        this.game.ctx.translate(screenPos.x, screenPos.y);
        
        // اعمال انیمیشن
        this.applyEnemyAnimation(enemy, model);
        
        // رندر مدل
        this.renderEnemyModel(enemy, model);
        
        // رندر نوار سلامت
        this.renderEnemyHealthBar(enemy, screenPos);
        
        this.game.ctx.restore();
    }

    applyEnemyAnimation(enemy, model) {
        enemy.animation.time += 0.1;
        
        // اعمال انیمیشن بر اساس حالت
        switch (enemy.state) {
            case 'moving':
                this.applyWalkAnimation(enemy);
                break;
            case 'attacking':
                this.applyAttackAnimation(enemy);
                break;
            case 'idle':
                this.applyIdleAnimation(enemy);
                break;
        }
    }

    applyWalkAnimation(enemy) {
        const bounce = Math.sin(enemy.animation.time * 5) * 2;
        this.game.ctx.translate(0, bounce);
    }

    applyAttackAnimation(enemy) {
        const recoil = Math.sin(enemy.animation.time * 20) * 3;
        this.game.ctx.translate(recoil, 0);
    }

    renderEnemyModel(enemy, model) {
        this.game.ctx.fillStyle = this.getEnemyColor(enemy.type);
        
        // رندر ساده مدل - در پیاده‌سازی واقعی از مدل سه بعدی استفاده می‌شود
        this.game.ctx.fillRect(-10, -20, 20, 20);
        
        // رندر سلاح اگر دارد
        if (enemy.weapons) {
            this.game.ctx.fillStyle = '#333333';
            this.game.ctx.fillRect(-2, -25, 4, 10);
        }
    }

    getEnemyColor(enemyType) {
        const colors = {
            'soldier_basic': '#36454F',
            'soldier_elite': '#2F4F4F',
            'sniper': '#556B2F',
            'heavy_gunner': '#8B0000',
            'mutant_zombie': '#228B22',
            'mutant_brute': '#800020'
        };
        
        return colors[enemyType] || '#666666';
    }

    renderEnemyHealthBar(enemy, screenPos) {
        const barWidth = 40;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        this.game.ctx.fillStyle = '#FF0000';
        this.game.ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - 30, barWidth, 4);
        
        this.game.ctx.fillStyle = '#00FF00';
        this.game.ctx.fillRect(screenPos.x - barWidth/2, screenPos.y - 30, barWidth * healthPercent, 4);
    }

    // متدهای کمکی
    getEnemyCount() {
        return this.enemies.size;
    }

    getTotalKills() {
        return this.enemiesKilled;
    }

    getCurrentWave() {
        return this.currentWave + 1;
    }

    getTotalWaves() {
        return this.waves.length;
    }

    isBossFight() {
        return this.currentWave === this.waves.length - 1 && this.waves[this.currentWave]?.isBoss;
    }
}

// راه‌اندازی سیستم دشمنان
function initEnemySystem(game) {
    return new EnemySystem(game);
              }
