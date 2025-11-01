// فایل اصلی - مدیریت رویدادها و تنظیمات بازی

class GameManager {
    constructor() {
        this.game = null;
        this.init();
    }

    init() {
        // تنظیمات اولیه
        this.setupEventListeners();
        this.showStartMenu();
    }

    setupEventListeners() {
        // دکمه شروع بازی
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        // دکمه بازی مجدد
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });

        // مدیریت رزولوشن و سایز صفحه
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.handleResize();
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
        this.game = new Game(this);
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

// راه‌اندازی بازی وقتی صفحه لود شد
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});
