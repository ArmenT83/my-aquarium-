export default class SoundManager {
    constructor(src) {
        this.sound = new Audio(src);
        this.sound.loop = true;
        this.sound.volume = 0.4;
        this.isStarted = false;
    }
    start() {
        if (!this.isStarted) {
            this.sound.play().catch(e => console.log("Audio play blocked", e));
            this.isStarted = true;
        }
    }
}
