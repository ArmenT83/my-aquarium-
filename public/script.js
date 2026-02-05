const canvas = document.getElementById('aquarium');
const ctx = canvas.getContext('2d');

let width, height;

// 1. Էկրանի չափսերի և հստակության կարգավորում (Retina Display support)
function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resize);
resize();

// 2. Ձկան սկզբնական տվյալները
let fish = {
    x: width / 2,
    y: height / 2,
    speed: 2.2,
    angle: 0,
    targetAngle: 0,
    turnSpeed: 0.05,
    size: 60,
    flipScale: 1,
    targetFlipScale: 1,
    isFollowing: false
};

let bubbles = [];
let foods = [];

// 3. Մատի կամ մկնիկի կառավարում
function handleInput(x, y, isNewTouch = false) {
    let dx = x - fish.x;
    let dy = y - fish.y;
    fish.targetAngle = Math.atan2(dy, dx);
    fish.isFollowing = true;

    // Եթե սեղմել է (touchstart/click), ավելացնենք կեր
    if (isNewTouch) {
        foods.push({ x: x, y: y, size: 6, speed: 0.8 });
    }

    // Եթե ձուկը շատ մոտ է մատին, դադարեցնել հետևելը
    let dist = Math.hypot(dx, dy);
    if (dist < 30) fish.isFollowing = false;
}

// Մկնիկի համար
canvas.addEventListener('mousemove', (e) => handleInput(e.clientX, e.clientY));

// Mobile Touch-ի համար
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY, true);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleInput(touch.clientX, touch.clientY, false);
}, { passive: false });

canvas.addEventListener('touchend', () => {
    fish.isFollowing = false;
});

// 4. Հիմնական նկարչության ցիկլը (Animation Loop)
function draw() {
    ctx.clearRect(0, 0, width, height);

    // --- Կերակուրի նկարչություն ---
    ctx.fillStyle = "#ffcc00"; 
    foods.forEach((f, index) => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fill();
        f.y += f.speed; // Կերը դանդաղ իջնում է

        // Ստուգում ենք՝ ձուկը կերավ կերը
        let distToFood = Math.hypot(f.x - fish.x, f.y - fish.y);
        if (distToFood < 40) {
            foods.splice(index, 1);
            if (fish.size < 120) fish.size += 1; // Ձուկը մեծանում է
        }
        if (f.y > height) foods.splice(index, 1);
    });

    // --- Պղպջակների նկարչություն ---
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    bubbles.forEach((b, index) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        b.y -= b.speed;
        if (b.y < -10) bubbles.splice(index, 1);
    });

    // --- Ձկան Տրամաբանություն ---
    let margin = 80;
    
    if (!fish.isFollowing) {
        // Պատահական լողալ
        fish.targetAngle += (Math.random() - 0.5) * 0.05;

        // Պատերից հետ դառնալ
        if (fish.x > width - margin) fish.targetAngle = Math.PI; 
        if (fish.x < margin) fish.targetAngle = 0; 
        if (fish.y > height - margin) fish.targetAngle = -Math.PI / 2; 
        if (fish.y < margin) fish.targetAngle = Math.PI / 2; 
    }

    // Անկյան սահուն փոփոխություն (Lerp)
    let angleDiff = fish.targetAngle - fish.angle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    fish.angle += angleDiff * fish.turnSpeed;

    fish.x += Math.cos(fish.angle) * fish.speed;
    fish.y += Math.sin(fish.angle) * fish.speed;

    // Շրջվելու էֆեկտ (Flip)
    let isHeadingLeft = Math.cos(fish.angle) < 0;
    fish.targetFlipScale = isHeadingLeft ? 1 : -1;
    fish.flipScale += (fish.targetFlipScale - fish.flipScale) * 0.1;

    // --- Ձկան նկարչություն ---
    ctx.save();
    ctx.translate(fish.x, fish.y);
    
    // Թեթև օրորվելու էֆեկտ
    let tilt = Math.sin(Date.now() * 0.003) * 0.1;
    ctx.rotate(tilt + (isHeadingLeft ? fish.angle - Math.PI : fish.angle));
    
    ctx.scale(fish.flipScale, 1);
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
    ctx.font = fish.size + "px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐟", 0, 0);
    ctx.restore();

    // Պղպջակներ բերանից
    if (Math.random() < 0.02) {
        let bX = fish.x + Math.cos(fish.angle) * (fish.size / 2);
        let bY = fish.y + Math.sin(fish.angle) * (fish.size / 2);
        bubbles.push({
            x: bX, 
            y: bY, 
            size: Math.random() * 3 + 2, 
            speed: Math.random() * 1 + 0.5
        });
    }

    requestAnimationFrame(draw);
}

draw();
