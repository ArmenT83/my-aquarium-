export default class Snail {
  constructor() {
    this.x = 100;
    this.y = 0;
    this.speed = 0.15;
    this.dir = 1;
    this.size = 28;
  }
  update(width) {
    this.x += this.speed * this.dir;
    if (this.x > width - 40 || this.x < 40) this.dir *= -1;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.dir === 1 ? -1 : 1, 1);
    ctx.font = this.size + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐌', 0, 0);
    ctx.restore();
  }
}
