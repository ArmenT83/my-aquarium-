export default class Fish {
  constructor() {
    this.x = 150;
    this.y = 150;
    this.speed = 2.2;
    this.angle = 0;
    this.targetAngle = 0;
    this.turnSpeed = 0.05;
    this.size = 55;
    this.flipScale = 1;
    this.targetFlipScale = 1;
    this.isFollowing = false;
  }
  update(width, height) {
    let margin = 50;
    if (!this.isFollowing) {
      this.targetAngle += (Math.random() - 0.5) * 0.05;
      if (this.x > width - margin) this.targetAngle = Math.PI;
      if (this.x < margin) this.targetAngle = 0;
      if (this.y > height - margin - 40) this.targetAngle = -Math.PI / 2;
      if (this.y < margin) this.targetAngle = Math.PI / 2;
    }
    let aDiff = this.targetAngle - this.angle;
    while (aDiff < -Math.PI) aDiff += Math.PI * 2;
    while (aDiff > Math.PI) aDiff -= Math.PI * 2;
    this.angle += aDiff * this.turnSpeed;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.targetFlipScale = Math.cos(this.angle) < 0 ? 1 : -1;
    this.flipScale += (this.targetFlipScale - this.flipScale) * 0.1;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(
      Math.sin(Date.now() * 0.003) * 0.1 +
        (Math.cos(this.angle) < 0 ? this.angle - Math.PI : this.angle),
    );
    ctx.scale(this.flipScale, 1);
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
    ctx.font = this.size + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐟', 0, 0);
    ctx.restore();
  }
}
