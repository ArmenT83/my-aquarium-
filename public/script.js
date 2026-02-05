import Fish from './Fish.js';
import Snail from './Snail.js';
import SoundManager from './SoundManager.js';

const canvas = document.getElementById('aquarium');
const ctx = canvas.getContext('2d');

class Aquarium {
    constructor() {
        this.fish = new Fish();
        this.snail = new Snail();
        this.sound = new SoundManager('ocean.mp3');
        this.bubbles = [];
        this.foods = [];
        this.seaweeds = [];
        this.init();
    }

    init() {
        window.addEventListener('resize', () => this.resize());
        
        // Input-ները (Mouse & Touch)
        canvas.addEventListener('mousemove', (e) => this.handleInput(e.clientX, e.clientY));
        canvas.addEventListener('mousedown', () => this.sound.start());
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput(e.touches[0].clientX, e.touches[0].clientY, true);
        }, { passive: false });
        canvas.addEventListener('touchend', () => this.fish.isFollowing = false);
        
        this.resize();
        this.animate();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        ctx.scale(dpr, dpr);
        this.snail.y = this.height - 25;
        this.initSeaweed();
    }

    initSeaweed() {
        this.seaweeds = [];
        for (let i = 0; i < 8; i++) {
            this.seaweeds.push({
                x: (this.width / 8) * i + Math.random() * 30,
                strands: [
                    { h: 40 + Math.random() * 40, off: Math.random() * 100, xOff: -5 },
                    { h: 30 + Math.random() * 30, off: Math.random() * 100, xOff: 0 },
                    { h: 50 + Math.random() * 40, off: Math.random() * 100, xOff: 5 }
                ]
            });
        }
    }

    handleInput(x, y, isNewTouch = false) {
        this.sound.start();
        const rect = canvas.getBoundingClientRect();
        let mX = x - rect.left;
        let mY = y - rect.top;
        this.fish.targetAngle = Math.atan2(mY - this.fish.y, mX - this.fish.x);
        this.fish.isFollowing = true;
        if (isNewTouch) this.foods.push({ x: mX, y: mY, size: 6, speed: 0.8 });
    }

    update() {
        this.fish.update(this.width, this.height);
        this.snail.update(this.width);

        // Կերակուրի տրամաբանություն
        this.foods.forEach((f, i) => {
            f.y += f.speed;
            if (Math.hypot(f.x - this.fish.x, f.y - this.fish.y) < 30) {
                this.foods.splice(i, 1);
                if (this.fish.size < 90) this.fish.size += 1;
            }
            if (f.y > this.height - 40) this.foods.splice(i, 1);
        });

        // Պղպջակների տրամաբանություն
        if (Math.random() < 0.02) {
            this.bubbles.push({ x: this.fish.x, y: this.fish.y, size: Math.random() * 3 + 2, speed: Math.random() * 1 + 0.5 });
        }
        this.bubbles.forEach((b, i) => {
            b.y -= b.speed;
            if (b.y < 0) this.bubbles.splice(i, 1);
        });
    }

    render() {
        ctx.clearRect(0, 0, this.width, this.height);
        this.drawSeaweed();
        
        // Կերակուր
        ctx.fillStyle = "#ffcc00";
        this.foods.forEach(f => {
            ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill();
        });

        this.snail.draw(ctx);
        this.fish.draw(ctx);

        // Պղպջակներ
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        this.bubbles.forEach(b => {
            ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
        });
    }

    drawSeaweed() {
        this.seaweeds.forEach(group => {
            group.strands.forEach(s => {
                ctx.beginPath();
                let wave = Math.sin(Date.now() * 0.0015 + s.off) * 10;
                ctx.moveTo(group.x + s.xOff, this.height - 30);
                ctx.bezierCurveTo(
                    group.x + s.xOff + wave, this.height - 30 - s.h / 2, 
                    group.x + s.xOff - wave, this.height - 30 - s.h, 
                    group.x + s.xOff + wave / 2, this.height - 30 - s.h
                );
                let grad = ctx.createLinearGradient(0, this.height - 30, 0, this.height - 30 - s.h);
                grad.addColorStop(0, "#1a3c15"); grad.addColorStop(1, "#4d9344");
                ctx.strokeStyle = grad; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();
            });
        });
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

// Մեկնարկ
new Aquarium();
