const canvas = document.getElementById('aquarium');
const ctx = canvas.getContext('2d');

let width, height;
let bubbles = [];
let foods = [];
let seaweedGroups = []; // Մամուռների (ջրիմուռների) զանգված

function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    initSeaweed();
    snail.y = height - 25; // Խխունջին մի քիչ ավելի ցածր դնենք
}

// Ավելի բնական ջրիմուռների ստեղծում
function initSeaweed() {
    seaweedGroups = [];
    for (let i = 0; i < 8; i++) {
        seaweedGroups.push({
            x: (width / 8) * i + Math.random() * 30,
            baseWidth: 5 + Math.random() * 5,
            strands: [
                { h: 40 + Math.random() * 40, off: Math.random() * 100, xOff: -5 },
                { h: 30 + Math.random() * 30, off: Math.random() * 100, xOff: 0 },
                { h: 50 + Math.random() * 40, off: Math.random() * 100, xOff: 5 }
            ]
        });
    }
}

window.addEventListener('resize', resize);

let fish = {
    x: 150, y: 150,
    speed: 2.2, angle: 0, targetAngle: 0,
    turnSpeed: 0.05, size: 55,
    flipScale: 1, targetFlipScale: 1,
    isFollowing: false
};

// ԽԽՈՒՆՋԻ ՓՈՓՈԽՈՒԹՅՈՒՆ. արագությունը դարձրինք 0.15 (ավելի դանդաղ)
let snail = { x: 100, y: 0, speed: 0.15, dir: 1, size: 28 };

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

function draw() {
    ctx.clearRect(0, 0, width, height);

    // --- ԲՆԱԿԱՆ ՋՐԻՄՈՒՌՆԵՐԻ ՆԿԱՐՉՈՒԹՅՈՒՆ ---
    seaweedGroups.forEach(group => {
        group.strands.forEach(s => {
            ctx.beginPath();
            let wave = Math.sin(Date.now() * 0.0015 + s.off) * 10;
            ctx.moveTo(group.x + s.xOff, height - 30);
            ctx.bezierCurveTo(
                group.x + s.xOff + wave, height - 30 - s.h / 2, 
                group.x + s.xOff - wave, height - 30 - s.h, 
                group.x + s.xOff + wave / 2, height - 30 - s.h
            );
            
            // Գույնը դարձնում ենք գրադիենտ (ներքևը մուգ, վերևը բաց)
            let grad = ctx.createLinearGradient(0, height - 30, 0, height - 30 - s.h);
            grad.addColorStop(0, "#1a3c15");
            grad.addColorStop(1, "#4d9344");
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.stroke();
        });
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

    // --- ԽԽՈՒՆՋ (Ուղղված դիրք ու արագություն) ---
    snail.x += snail.speed * snail.dir;
    if (snail.x > width - 40 || snail.x < 40) snail.dir *= -1;
    ctx.save();
    ctx.translate(snail.x, snail.y);
    // Խխունջը 🐌 նայում է ձախ, դրա համար եթե dir = 1 (աջ), պետք է flip անել
    ctx.scale(snail.dir === 1 ? -1 : 1, 1); 
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
