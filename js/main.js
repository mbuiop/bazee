// فایل اصلی - مدیریت بازی
class GameManager {
    constructor() {
        this.game = null;
        this.threeJSGame = null;
        this.init();
    }

    init() {
        // ابتدا Three.js را راه‌اندازی می‌کنیم
        this.initializeThreeJS();
        
        // سپس منو را نشان می‌دهیم
        setTimeout(() => {
            this.setupEventListeners();
            this.showStartMenu();
        }, 1000);
    }

    initializeThreeJS() {
        this.threeJSGame = new ThreeJSGame();
        window.threeJSGame = this.threeJSGame;
    }

    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });

        window.addEventListener('resize', () => {
            if (this.threeJSGame) {
                this.threeJSGame.camera.aspect = window.innerWidth / window.innerHeight;
                this.threeJSGame.camera.updateProjectionMatrix();
                this.threeJSGame.renderer.setSize(window.innerWidth, window.innerHeight);
            }
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
        
        // ریست کردن صحنه Three.js
        while(this.threeJSGame.scene.children.length > 0) { 
            this.threeJSGame.scene.remove(this.threeJSGame.scene.children[0]); 
        }
        
        this.threeJSGame.createEnvironment();
        this.startGame();
    }

    gameOver(score) {
        this.showGameOverMenu(score);
    }
}

// راه‌اندازی بازی وقتی صفحه لود شد
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});
