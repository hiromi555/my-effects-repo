import p5 from 'p5'
import { setupScrollObserver } from '../utils/scrollObserver';

const getIsIntersecting = setupScrollObserver('.myeffect-target-class');
const textContainer = document.querySelector('.myeffect-text-class');
window.addEventListener("load", showTextContainer)

function hideTextContainer() {
    if (textContainer) {
        textContainer.classList.remove('is-show');
    }
}
function showTextContainer() {
    if (textContainer) {
      textContainer.classList.add('is-show');
    }
}

const INITIAL_GRAVITY = 0.3;
const INITIAL_HUE = 30;
const INITIAL_SATURATION = 30;
const INITIAL_BRIGHTNSS = 100;
const HISTORY_LENGTH = 10;

const velocityFunctions = {
    circle: (p, min = 1, max = 15) => {
        return p5.Vector.random2D().mult(p.random(min, max));
    },
    heart: (p, min = 0.5, max = 0.5) => {
        let t = p.random(0, p.TWO_PI);
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        return p.createVector(x, -y).mult(p.random(min, max));
    }
};
const fireworkSettings = {
    threshold: 100,
    count: 150,
    velocityType: 'circle',
    velocityRange: [1, 15],
    velocityMultiplier: 0.9,
    gravity: 0.05,
    lifespanDecrement: 2,
    randomHue: true,
    hueRange: [0, 360],
    saturation: 100,
    brightness:100,
    strokeWeightValue: 4,
    trail: false,
    historyLength: 20,
    updateInterval: 5,
    finish: false,
    finishThreshold: 100,
    finishCount: 3,
    finishColor: true,
    finishHueRange: [0, 360],
    finishSaturation: 50,
    finishBrightness: 100,
    finishStrokeWeightValue: 4,
};

let fireworks = [];
let fireworkIndex = 0;
const sketch = (p) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight).parent('myeffect-webgl');
        p.frameRate(30);
        p.colorMode(p.HSB, 360, 100, 100, 255);
        const canvasElement = p.canvas;
        canvasElement.addEventListener('click', handleMouseClick);
        canvasElement.addEventListener('touchend', handleTouchEnd);
      };
      p.draw = () => {
            if(getIsIntersecting()){
                p.background(0, 0, 0, 255);
                for (let i = 0; i < fireworks.length; i++) {
                fireworks[i].update();
                fireworks[i].display();
                    if (fireworks[i].done()) {
                        fireworks.splice(i, 1);
                    }
                }
            }else {
                p.clear();
            }
      };
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth * 0.95, p.windowHeight * 0.95);
      };
      const createFirework = (p, x, y) => {
        fireworks.length = 0;
        const fireworkClass = fireworkList[fireworkIndex];
        fireworks.push(new fireworkClass(p, x, y));
        fireworkIndex = (fireworkIndex + 1) % fireworkList.length;
      };
      const handleMouseClick = (event) => {
        const x = event.clientX;
        const y = event.clientY;
        createFirework(p, x, y);
        hideTextContainer()
      };
      const handleTouchEnd = (event) => {
        if (event.changedTouches && event.changedTouches.length > 0) {
          const x = event.changedTouches[0].clientX;
          const y = event.changedTouches[0].clientY;
          createFirework(p, x, y);
        }
        event.preventDefault();
        hideTextContainer()
      };
};
new p5(sketch);

class Particle {
    constructor(p, x, y, exploded =false, hue=INITIAL_HUE, settings = fireworkSettings) {
    this.hue = hue;
    this.p = p;
    this.position = exploded ? p.createVector(x, y) : p.createVector(x, p.height);
    this.acceleration = p.createVector(0, 0);
    this.gravity = this.p.createVector(0, INITIAL_GRAVITY);
    this.targetY = y;
    this.lifespan = 255;
    this.exploded = exploded;
    this.hasUpdated = false;
    this.settings = settings;
    this.finishLocation = null;
    this.hasFinished = false;
    // 10%の確率でリセットをスキップ
    this.finishSkipped = Math.random() < 0.1;
    exploded ? this.setExplodedVelocity() : this.setInitialVelocity();
    }
    setInitialVelocity() {
    let initialVelocityY = -Math.sqrt(2 * Math.abs(INITIAL_GRAVITY) * (this.p.height - this.targetY));
    this.velocity = this.p.createVector(0, initialVelocityY);
    }
    setExplodedVelocity() {
    this.velocity = velocityFunctions[this.settings.velocityType](this.p, ...this.settings.velocityRange);
    }
    update(j) {
    this.acceleration.add(this.gravity);
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
        if (this.exploded) {
            this.hasUpdated = true;
            this.lifespan -= this.settings.lifespanDecrement;
            this.velocity.mult(this.settings.velocityMultiplier)
            this.gravity = this.p.createVector(0, this.settings.gravity);
            if (this.settings.finish && this.lifespan <= this.settings.finishThreshold && !this.hasFinished) {
                this.finishLocation = this.position.copy();
                // if(this.finishLocation && j % this.settings.finishCount === 0){
                //  this.lifespan = 255
                // }
             //ここを調整　 finishCountが1の時は90%に
                if (this.finishLocation && j % this.settings.finishCount === 0) {
                     // 10%のパーティクルだけリセットをスキップ
                    if (this.settings.finishCount === 1 && !this.finishSkipped) {
                        this.lifespan = 255;
                    } else if (this.settings.finishCount !== 1) {
                        this.lifespan = 255;
                    }
                }
             this.hasFinished = true;
            }
        }
    }
    display() {
        if (this.finishLocation) {
            const finishHue = this.settings.finishColor ? this.hue : this.p.random(this.settings.finishHueRange[0], this.settings.finishHueRange[1]);
            this.p.stroke(finishHue, this.settings.finishSaturation, this.settings.finishBrightness, this.lifespan);
            this.p.strokeWeight(this.settings.finishStrokeWeightValue);
            this.p.point(this.finishLocation.x, this.finishLocation.y);
        }
        else if (this.exploded) {
            if(this.hasUpdated){
                this.p.stroke(this.hue, this.settings.saturation, this.settings.brightness, this.lifespan);
                this.p.strokeWeight(this.settings.strokeWeightValue);
                this.p.point(this.position.x, this.position.y)
          }
        }
        else {
            this.p.stroke(INITIAL_HUE, INITIAL_SATURATION, INITIAL_BRIGHTNSS, this.lifespan);
            this.p.strokeWeight(4);
            this.p.point(this.position.x, this.position.y);
        }
    }
    isDone() {
        // return this.lifespan <= 0;
        //ここを修正
        const adjusted = !this.settings.finish ? 0 : 0 -(255 - this.settings.finishThreshold);
        return this.lifespan <= adjusted;
    }
    lifespanWatcher() {
        return this.exploded && this.lifespan <= this.settings.threshold;
    }
}

class TrailParticle extends Particle {
    constructor(p, x, y, exploded, hue, settings) {
        super(p, x, y, exploded, hue, settings);
        this.history = [];
        this.updateCounter = 0;
        exploded ? this.setExplodedVelocity() : this.setInitialVelocity();
    }
    update(j) {
        super.update(j);
        if (!this.finishLocation) {
            this.updateCounter++;
            if (this.exploded && this.updateCounter % this.settings.updateInterval === 0) {
                this.addHistory();
            } else {
                this.addHistory();
            }
       }
    }
    addHistory() {
        let v = this.position.copy();
        this.history.push(v);
        const historyLength = this.exploded ? this.settings.historyLength : HISTORY_LENGTH;
        if (this.history.length > historyLength) {
            this.history.shift();
        }
    }
    display() {
        if (this.finishLocation) {
            const finishHue = this.settings.finishColor ? this.hue : this.p.random(this.settings.finishHueRange[0], this.settings.finishHueRange[1]);
            this.p.stroke(finishHue, this.settings.finishSaturation, this.settings.finishBrightness, this.lifespan);
            this.p.strokeWeight(this.settings.finishStrokeWeightValue)
            this.p.point(this.finishLocation.x, this.finishLocation.y);
        } else {
            super.display();
            for (let i = 0; i < this.history.length; i++) {
                let pos = this.history[i];
                let alpha = 255 * (i / this.history.length) * (this.lifespan / 255);
                if (this.exploded) {
                    this.p.stroke(this.hue, this.settings.saturation, this.settings.brightness, alpha);
                    this.p.point(pos.x, pos.y);
                } else {
                    this.p.stroke(INITIAL_HUE, INITIAL_SATURATION, INITIAL_BRIGHTNSS, alpha);
                    this.p.point(pos.x, pos.y);
                }
            }
        }
    }
}

class Firework {
    constructor(p, x, y) {
    this.p = p;
    this.firework = new TrailParticle(p, x, y);
    this.xUnit = p.width/10;
    this.yUnit = p.height/10;
    this.exploded = false;
    this.particleGroups = [];
    }
    setupExplosions() {}
    createParticles(overrides = {}, positionOffsets = { xOffset: 0, yOffset: 0 }) {
        const particles = [];
        const defaultSettings = fireworkSettings;
        const settings = { ...defaultSettings, ...overrides };
        const randomHue = settings.randomHue ? Math.round(this.p.random(0, 36)) * 10 : null;
        const baseX = Math.min(Math.max(this.firework.position.x + positionOffsets.xOffset, 0), this.p.width);
        const baseY = Math.min(Math.max(this.firework.position.y + positionOffsets.yOffset, 0), this.p.height);
        for (let i = 0; i < settings.count; i++) {
        const particleHue = settings.randomHue ? randomHue : this.p.random(settings.hueRange[0], settings.hueRange[1]);
        const particle = settings.trail ?
            new TrailParticle(this.p, baseX, baseY, true, particleHue, settings) :
            new Particle(this.p, baseX, baseY, true, particleHue, settings);
        particles.push(particle);
        }
        this.particleGroups.push({ particles:particles });
    }
    update() {
        if (!this.exploded) {
            this.firework.update();
            if (this.firework.velocity.y >= 0) {
                this.exploded = true;
                this.setupExplosions();
            }
        } else {
        for (let i = 0; i < this.particleGroups.length; i++) {
            let particles = this.particleGroups[i].particles;
            let belowThresholdCount = 0;
            for (let j = particles.length - 1; j >= 0; j--) {
                let particle = particles[j];
                particle.update(j);
                if (particle.lifespanWatcher()) {
                    belowThresholdCount++;
                }
                if (particle.isDone()) {
                    particles.splice(j, 1);
                }
            }
            if (belowThresholdCount === 0) {
                break;
            }
        }
        this.particleGroups = this.particleGroups.filter(group => group.particles.length > 0);
      }
    }
    display() {
        if (!this.exploded) {
            this.firework.display();
        } else {
        for (let i = 0; i < this.particleGroups.length; i++) {
            let particles = this.particleGroups[i].particles;
            for (let j = 0; j < particles.length; j++) {
                let particle = particles[j];
                particle.display();
            }
        }
      }
    }
    done() {
    return this.exploded && this.particleGroups.every(particleGroup => particleGroup.particles.length === 0);
    }
}

class Firework1 extends Firework {
    setupExplosions() {
    this.createParticles({ threshold: 250, velocityRange: [1, 12]}, {xOffset: this.xUnit*2, yOffset: this.yUnit});
    this.createParticles({ threshold: 250, velocityRange: [1, 12]}, {xOffset: -this.xUnit*2, yOffset: -this.yUnit*1.5});
    this.createParticles({ threshold: 200, velocityRange: [1, 12]}, {xOffset: this.xUnit, yOffset: -this.yUnit*2.5});
    this.createParticles({ threshold: 250, count: 200, velocityRange: [1, 25], velocityMultiplier: 0.9, gravity: 0.01, randomHue:false, hueRange:[180, 220], saturation: 10, strokeWeightValue: 2.5, trail: true, historyLength: 20, updateInterval: 30});
    this.createParticles({threshold:200, count:200, randomHue:false, hueRange:[10, 30], strokeWeightValue: 5.5 });
    this.createParticles({velocityRange: [1, 25], count:300, randomHue:false, hueRange:[0, 40], saturation:50, finish:true, finishColor: false, finishHueRange: [0, 60]});
    }
}

class Firework2 extends Firework {
    setupExplosions() {
       this.createParticles({threshold:150, trail:true ,velocityMultiplier: 0.93, gravity: 0.01, lifespanDecrement:8});
       this.createParticles({threshold:150, randomHue:false, hueRange:[30, 60],saturation:100,lifespanDecrement:8});
       this.createParticles({trail:true,velocityMultiplier: 0.94, gravity: 0.01,randomHue:false, hueRange:[30, 60],lifespanDecrement:8, saturation: 35});
       this.createParticles({threshold:150,randomHue:false, hueRange:[90, 150],saturation:100,lifespanDecrement:8});
       this.createParticles({trail:true,velocityMultiplier: 0.94, gravity: 0.01, randomHue:false, hueRange:[90, 150],lifespanDecrement:8, saturation: 35});
       this.createParticles({threshold:250, randomHue:false, hueRange:[180, 240],saturation:100,lifespanDecrement:8});
       this.createParticles({trail:true,velocityMultiplier: 0.94, gravity: 0.01,randomHue:false, hueRange:[180, 240],lifespanDecrement:8, saturation: 35});
       this.createParticles({threshold:250, randomHue:false, hueRange:[270, 330],saturation:100,lifespanDecrement:4});
       this.createParticles({trail:true, velocityMultiplier: 0.94, gravity: 0.01, randomHue:false, hueRange:[270, 330], lifespanDecrement:3, saturation: 35,finish:true, finishColor: false, finishHueRange: [0, 60], finishCount:1});
    }
}

class Firework3 extends Firework {
    setupExplosions() {
      this.createParticles({threshold:255, velocityRange: [0, 4],gravity: 0.01, count:50,randomHue:false, hueRange:[270, 330], saturation:60,strokeWeightValue:5,},{xOffset: -this.xUnit*2, yOffset: -this.yUnit });
      this.createParticles({threshold:240, trail:true,velocityRange: [8, 9],gravity: 0.01, count:50,randomHue:false, hueRange:[270, 330], velocityMultiplier: 0.9,saturation:100},{xOffset: -this.xUnit*2, yOffset: -this.yUnit });
      this.createParticles({threshold:250, velocityRange: [4, 7],gravity: 0.01, count:100,randomHue:false, hueRange:[270, 330], velocityMultiplier: 0.9,saturation:100,strokeWeightValue:6,},{xOffset: -this.xUnit*2, yOffset: -this.yUnit });
      this.createParticles({threshold:255, velocityRange: [0, 4], gravity: 0.01,count:50, randomHue:false, hueRange:[180, 220],saturation:60,strokeWeightValue:5,},{xOffset: this.xUnit*2, yOffset: this.yUnit });
      this.createParticles({threshold:240,  trail:true,velocityRange: [8, 9], gravity: 0.01, count:50, randomHue:false, hueRange:[180, 220],velocityMultiplier: 0.9,saturation:100},{xOffset: this.xUnit*2, yOffset: this.yUnit });
      this.createParticles({threshold:250, velocityRange: [4, 7], gravity: 0.01, count:100, randomHue:false, hueRange:[180, 220],velocityMultiplier: 0.9,saturation:100,strokeWeightValue:6,},{xOffset: this.xUnit*2, yOffset: this.yUnit });
      this.createParticles({threshold:250, velocityRange: [13, 20],lifespanDecrement:4, gravity: 0.01, count:100,trail:true,historyLength:10, updateInterval:30, randomHue:false, hueRange:[270, 330], saturation:10},{xOffset: -this.xUnit*2, yOffset: -this.yUnit });
      this.createParticles({threshold:230, velocityRange: [0, 15], gravity: 0.01, randomHue:false, hueRange:[270, 330], saturation:10, finish:true, finishColor:false},{xOffset: -this.xUnit*2, yOffset: -this.yUnit });
      this.createParticles({threshold:250, velocityRange: [13, 20],lifespanDecrement:4, gravity: 0.01, count:100, trail:true, historyLength:10, updateInterval:30, randomHue:false, hueRange:[180, 220], saturation:10},{xOffset: this.xUnit*2, yOffset: this.yUnit });
      this.createParticles({threshold:250, velocityRange: [0, 15], gravity: 0.01, randomHue:false, hueRange:[180, 220], saturation:10,finish:true, finishColor:false},{xOffset: this.xUnit*2, yOffset: this.yUnit });
      this.createParticles( {threshold:230, velocityRange: [28, 32],velocityMultiplier: 0.87, lifespanDecrement:6,  count:100,trail:true, updateInterval:30, randomHue:false, hueRange:[270, 330], saturation:10},{xOffset: -this.xUnit*2, yOffset: -this.yUnit });
      this.createParticles( {velocityRange: [28, 32], velocityMultiplier: 0.87, lifespanDecrement:6,  count:100,trail:true, updateInterval:30, randomHue:false, hueRange:[180, 220], saturation:10},{xOffset: this.xUnit*2, yOffset: this.yUnit });
    }
}

class Firework4 extends Firework {
    setupExplosions() {
     this.createParticles({threshold:240,lifespanDecrement:2, trail:true, historyLength:15,updateInterval:30, count:25, velocityRange: [1, 3], velocityMultiplier: 0.97,gravity: 0.3, randomHue:false, hueRange:[30, 60], saturation:20, strokeWeightValue:2.5});
     this.createParticles({threshold:240,lifespanDecrement:2, trail:true, historyLength:15,updateInterval:30, count:25, velocityRange: [1, 3], velocityMultiplier: 0.97,gravity: 0.3, randomHue:false, hueRange:[30, 60], saturation:20, strokeWeightValue:2.5},{xOffset: -this.xUnit, yOffset: -this.yUnit*0.4 });
     this.createParticles({threshold:240,lifespanDecrement:2, trail:true, historyLength:15,updateInterval:30, count:25, velocityRange: [1, 3], velocityMultiplier: 0.97,gravity: 0.3, randomHue:false, hueRange:[30, 60], saturation:20, strokeWeightValue:2.5},{xOffset: this.xUnit, yOffset: -this.yUnit*0.8 });
     this.createParticles({threshold:240,lifespanDecrement:2, trail:true, historyLength:15,updateInterval:30, count:25, velocityRange: [1, 3], velocityMultiplier: 0.97,gravity: 0.3, randomHue:false, hueRange:[30, 60], saturation:20, strokeWeightValue:2.5},{xOffset: -this.xUnit*0.5, yOffset:-this.yUnit*1.2 });
     this.createParticles({threshold:150,lifespanDecrement:2, trail:true, historyLength:15,updateInterval:30, count:25, velocityRange: [1, 3], velocityMultiplier: 0.97,gravity: 0.3, randomHue:false, hueRange:[30, 60], saturation:20, strokeWeightValue:2.5},{xOffset:this.xUnit*0.3, yOffset: -this.yUnit*1.6});
     this.createParticles({threshold:250,trail:true, historyLength:30,updateInterval:60, count:200, velocityRange: [5, 55], velocityMultiplier: 0.83,gravity: 0.35, randomHue:false, hueRange:[30, 60], saturation:30},{xOffset: 0, yOffset: this.yUnit*0});
     this.createParticles({velocityRange: [1, 40], randomHue:false, hueRange:[30, 55], saturation:30, strokeWeightValue:3, finish:true, finishThreshold:80,finishColor:false, finishHueRange:[0,80],finishCount: 1, finishStrokeWeightValue:2.5},{xOffset: 0, yOffset: this.yUnit*2});
    }
}

class Firework5 extends Firework {
    setupExplosions() {
        this.createParticles({threshold:240,count:100, velocityRange: [4,6], randomHue:false, hueRange:[220, 240]},{xOffset: -140, yOffset: -this.yUnit*0.3});
        this.createParticles({threshold:240,count:100, velocityRange: [4,6], randomHue:false, hueRange:[40, 60]},{xOffset: -70, yOffset: this.yUnit*0.3});
        this.createParticles({threshold:240,count:100, velocityRange: [4,6], randomHue:false, saturation:0, brightness:50},{xOffset: 0, yOffset:  -this.yUnit*0.3});
        this.createParticles({threshold:240,count:100, velocityRange: [4,6], randomHue:false, hueRange:[130, 150]},{xOffset: 70, yOffset: this.yUnit*0.3});
        this.createParticles({threshold:200,count:100, velocityRange: [4,6], randomHue:false, hueRange:[0, 20]},{xOffset: 140, yOffset: -this.yUnit*0.3});
        this.createParticles({threshold:250,count:200,velocityRange: [22, 23]});
        this.createParticles({threshold:230,count:200,velocityType:'heart',velocityRange: [1.0,1.1], randomHue:false, hueRange:[300, 350], saturation:10,});
        this.createParticles({count:200,trail:true, lifespanDecrement:5,velocityType:'heart',velocityRange: [1,1],randomHue:false,hueRange:[330, 350], saturation:60, brightness:70, strokeWeightValue:2.5});
    }
}

class Firework6 extends Firework {
    setupExplosions() {
      this.createParticles({threshold:255,count:50,gravity:0.01,lifespanDecrement:4,velocityRange: [0,2], randomHue:false, hueRange:[130, 150]});
      this.createParticles({threshold:250,count:50,gravity:0.01,lifespanDecrement:4,velocityRange: [2,2], randomHue:false, hueRange:[130, 150]});
      this.createParticles({threshold:255,count:100,gravity:0.01,lifespanDecrement:4,velocityRange: [2,3], randomHue:false, hueRange:[0, 30]});
      this.createParticles({threshold:250,count:70,gravity:0.01,lifespanDecrement:4,velocityRange: [3,4], randomHue:false, hueRange:[0,30]});
      this.createParticles({threshold:255,gravity:0.01,lifespanDecrement:4,velocityRange: [4,6], randomHue:false, hueRange:[30, 60]});
      this.createParticles({threshold:250,count:100,gravity:0.01,lifespanDecrement:4,velocityRange: [6,7], randomHue:false, hueRange:[30,60]});
      this.createParticles({threshold:255,gravity:0.01,lifespanDecrement:4,velocityRange: [7,9], randomHue:false, hueRange:[180, 220]});
      this.createParticles({gravity:0.01,lifespanDecrement:4,velocityRange: [9,10], randomHue:false, hueRange:[180,220]});
      this.createParticles({threshold:250,trail:true,updateInterval:20, gravity:0.01,lifespanDecrement:5,velocityRange: [10,21], randomHue:false, hueRange:[180,220],saturation:30, strokeWeightValue:2.5});
      this.createParticles({threshold:150,conut:40,trail:true,updateInterval:20, gravity:0.01,lifespanDecrement:5,velocityRange: [20,22], randomHue:false, hueRange:[180,220],saturation:30, strokeWeightValue:2.5});
      this.createParticles({threshold:255,gravity:0.01,count:300,lifespanDecrement:5,velocityRange: [1,22], randomHue:false, hueRange:[0, 30], saturation:100,strokeWeightValue:5});
      this.createParticles({ gravity:0.01,count:100, lifespanDecrement:6,velocityRange: [22,23], randomHue:false, hueRange:[0, 30], saturation:100});
       this.createParticles({threshold:255,count:200,gravity:0.01,velocityRange: [1,8], randomHue:false, hueRange:[180, 220], saturation:10});
       this.createParticles({threshold:220,count:100, gravity:0.01,velocityRange: [8,9], randomHue:false, hueRange:[180, 220], saturation:10});
       this.createParticles({threshold:255,count:300,gravity:0.01,lifespanDecrement:4,velocityRange: [1,20], randomHue:false, saturation:20,finish:true, finishColor:false, finishThreshold:10, finishCount:1});
       this.createParticles({threshold:255,count:200,trail:true,updateInterval:20,gravity:0.01,lifespanDecrement:4,velocityRange: [10,25], randomHue:false,  saturation:20, strokeWeightValue:2.5});
       this.createParticles({gravity:0.01,lifespanDecrement:4, velocityRange: [23,26], randomHue:false, hueRange:[280,320], brightness:40, finish:true, finishColor:false, finishHueRange:[0,60],finishStrokeWeightValue:5, finishThreshold:10});
    }
}

class Firework7 extends Firework {
    setupExplosions() {
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: 0, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*0.25, yOffset: this.yUnit*0.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: this.xUnit*0.5, yOffset: -this.yUnit});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit, yOffset: this.yUnit});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  -this.xUnit*0.5, yOffset: -this.yUnit*1.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*1.5, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*2.25, yOffset: -this.yUnit*1.25});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*0.25, yOffset: -this.yUnit*0.25});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*2.2, yOffset: -this.yUnit*0.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*1.5, yOffset:0});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*1.75, yOffset: -this.yUnit*1.95});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*1.5, yOffset:this.yUnit*1.75});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  -this.xUnit, yOffset: -this.yUnit});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  0, yOffset: this.yUnit*2.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*0.7, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:-this.xUnit*1.8, yOffset: this.yUnit*2.6});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*2.5, yOffset:-this.yUnit});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: - this.xUnit*1.8, yOffset: this.yUnit});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*2.5, yOffset:this.yUnit*1.3});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: this.xUnit*0.7, yOffset: this.yUnit*0.7});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  -this.xUnit, yOffset: this.yUnit*1.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*0.1, yOffset: this.yUnit*1.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  -this.xUnit*1.5, yOffset: 0});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*1.5, yOffset:0});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  -this.xUnit*0.25, yOffset: this.yUnit*0.25});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*0.8, yOffset: this.yUnit*2.8});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*2.5, yOffset: -this.yUnit*0.5});

        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: 0, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*0.25, yOffset: this.yUnit*0.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: this.xUnit*0.5, yOffset: -this.yUnit});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit, yOffset: this.yUnit});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  -this.xUnit*0.5, yOffset: -this.yUnit*1.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*1.5, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset: -this.xUnit*2.25, yOffset: -this.yUnit*1.25});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*0.25, yOffset: -this.yUnit*0.25});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*2.2, yOffset: -this.yUnit*0.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*1.5, yOffset:0});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5]},{xOffset:  this.xUnit*1.75, yOffset: -this.yUnit*1.95});

        this.createParticles({threshold:255,gravity:0.01,count:300,velocityRange: [1,23], randomHue:false, hueRange:[0, 220], saturation:20,lifespanDecrement:4});
        this.createParticles({threshold:250,gravity:0,trail:true, historyLength:30,updateInterval:60, count:200, lifespanDecrement:6,velocityRange: [5, 43], velocityMultiplier: 0.85, randomHue:false, hueRange:[0, 60], saturation:50, strokeWeightValue:4,finish:true, finishCount:1,finishThreshold:0, finishColor:false});

        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: 0, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: -this.xUnit*0.25, yOffset: this.yUnit*0.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: this.xUnit*0.5, yOffset: -this.yUnit});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: -this.xUnit, yOffset: this.yUnit});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  -this.xUnit*0.5, yOffset: -this.yUnit*1.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: -this.xUnit*1.5, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: -this.xUnit*2.25, yOffset: -this.yUnit*1.25});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*0.25, yOffset: -this.yUnit*0.25});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*2.2, yOffset: -this.yUnit*0.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*1.5, yOffset:0});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*1.75, yOffset: -this.yUnit*1.95});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*1.5, yOffset:this.yUnit*1.75});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  -this.xUnit, yOffset: -this.yUnit});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  0, yOffset: this.yUnit*2.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*0.7, yOffset: -this.yUnit*2.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:-this.xUnit*1.8, yOffset: this.yUnit*2.6});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: -this.xUnit*2.5, yOffset:-this.yUnit});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: - this.xUnit*1.8, yOffset: this.yUnit});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: -this.xUnit*2.5, yOffset:this.yUnit*1.3});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset: this.xUnit*0.7, yOffset: this.yUnit*0.7});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  -this.xUnit, yOffset: this.yUnit*1.5});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*0.1, yOffset: this.yUnit*1.5});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  -this.xUnit*1.5, yOffset: 0});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*1.5, yOffset:0});
        this.createParticles({threshold:230, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  -this.xUnit*0.25, yOffset: this.yUnit*0.25});
        this.createParticles({threshold:250, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*0.8, yOffset: this.yUnit*2.8});
        this.createParticles({threshold:255, count:6, trail:true, updateInterval:30,lifespanDecrement:8, gravity:0,velocityRange: [2,5], saturation:40},{xOffset:  this.xUnit*2.5, yOffset: -this.yUnit*0.5});
    }

}

const fireworkList = [Firework7,Firework6, Firework1,Firework2,Firework3,Firework4,Firework5];
