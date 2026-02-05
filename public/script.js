const canvas = document.getElementById('aquarium');
const ctx = canvas.getContext('2d');

let width, height;
let bubbles = [];
let foods = [];
let mossPlants = [];

// 1. Էկրանի չափսերն ու մամուռի ստեղծումը
function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    initMoss();
    snail.y = height - 35; // Խխունջին դնում ենք ավազին
}

function initMoss() {
    mossPlants = [];
    for (let i = 0; i < 7; i++) {
        mossPlants.push({
            x: (width / 7) * i + Math.random() * 40,
            h: 30 + Math.random() * 40,
            w: 12 + Math.random() * 8,
            off: Math.random() * 100
        });
    }
}

window.addEventListener('resize', resize);

// 2. Ձկան և Խխունջի տվյալները
let fish = {
    x: 100, y: 100,
    speed: 2.2, angle: 0, targetAngle: 0,
    turnSpeed: 0.05, size: 50,
    flipScale: 1, targetFlipScale: 1,
    isFollowing: false
};

let snail = { x: 50, y: 0, speed: 0.3, dir: 1, size: 30 };

// 3. Կառավարում
function handleInput(x, y, isNewTouch = false) {
    const rect = canvas.getBoundingClientRect();
    let mX = x - rect.left;
    let mY = y - rect.top;
    fish.targetAngle = Math.atan2(mY - fish.y, mX - fish.x);
    fish.isFollowing = true;
    if (isNewTouch) foods.push({ x: mX, y: mY, size: 6, speed: 0.8 });
}

canvas.addEventListener('mousemove', (e) => handleInput(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY, true);
}, { passive: false });
canvas.addEventListener('touchend', () => fish.isFollowing = false);

// 4. Հիմնական Draw ցիկլը
function draw() {
    ctx.clearRect(0, 0, width, height);

    // Նկարում ենք մամուռը
    mossPlants.forEach(p => {
        ctx.beginPath();
        let wave = Math.sin(Date.now() * 0.002 + p.off) * 12;
        ctx.moveTo(p.x, height - 30);
        ctx.quadraticCurveTo(p.x + wave, height - 30 - p.h / 2, p.x, height - 30 - p.h);
        ctx.strokeStyle = "#2d5a27";
        ctx.lineWidth = p.w;
        ctx.lineCap = "round";
        ctx.stroke();
    });

    // Կերակուր
    ctx.fillStyle = "#ffcc00"; 
    foods.forEach((f, i) => {
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill();
        f.y += f.speed;
        if (Math.hypot(f.x - fish.x, f.y - fish.y) < 30) {
            foods.splice(i, 1);
            if (fish.size < 90) fish.size += 1;
        }
        if (f.y > height - 40) foods.splice(i, 1);
    });

    // Խխունջը
    snail.x += snail.speed * snail.dir;
    if (snail.x > width - 30 || snail.x < 30) snail.dir *= -1;
    ctx.save();
    ctx.translate(snail.x, snail.y);
    ctx.scale(snail.dir, 1);
    ctx.font = snail.size + "px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🐌", 0, 0);
    ctx.restore();

    // Ձկան շարժում
    let margin = 50;
    if (!fish.isFollowing) {
        fish.targetAngle += (Math.random() - 0.5) * 0.05;
        if (fish.x > width - margin) fish.targetAngle = Math.PI;
        if (fish.x < margin) fish.targetAngle = 0;
        if (fish.y > height - margin - 40) fish.targetAngle = -Math.PI / 2;
        if (fish.y < margin) fish.targetAngle = Math.PI / 2;
    }

    let aDiff = fish.targetAngle - fish.angle;
    while (aDiff < -Math.PI) aDiff += Math.PI * 2;
    while (aDiff > Math.PI) aDiff -= Math.PI * 2;
    fish.angle += aDiff * fish.turnSpeed;
    fish.x += Math.cos(fish.angle) * fish.speed;
    fish.y += Math.sin(fish.angle) * fish.speed;
    fish.targetFlipScale = Math.cos(fish.angle) < 0 ? 1 : -1;
    fish.flipScale += (fish.targetFlipScale - fish.flipScale) * 0.1;

    // Նկարում ենք ձկանը
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(Math.sin(Date.now() * 0.003) * 0.1 + (Math.cos(fish.angle) < 0 ? fish.angle - Math.PI : fish.angle));
    ctx.scale(fish.flipScale, 1);
    ctx.shadowBlur = 10; ctx.shadowColor = "white";
    ctx.font = fish.size + "px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🐟", 0, 0);
    ctx.restore();

    // Պղպջակներ
    if (Math.random() < 0.02) {
        bubbles.push({ x: fish.x, y: fish.y, size: Math.random() * 3 + 2, speed: Math.random() * 1 + 0.5 });
    }
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    bubbles.forEach((b, i) => {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2); ctx.fill();
        b.y -= b.speed;
        if (b.y < 0) bubbles.splice(i, 1);
    });

    requestAnimationFrame(draw);
}

resize();
draw();
