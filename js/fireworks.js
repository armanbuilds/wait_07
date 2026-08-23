import { stopFireworksAudio } from "./audio.js";

/**
 * Premium Physically Realistic HTML5 Canvas Fireworks Engine
 */

const PALETTES = [
  // Gold & Warm White
  { primary: ["#ffd700", "#ffe066", "#fff4b8", "#ffffff"], secondary: ["#ff9900", "#ffaa33"] },
  // Sapphire & Cyan
  { primary: ["#00d8ff", "#0088ff", "#80e5ff", "#ffffff"], secondary: ["#0055ff", "#00ffff"] },
  // Ruby & Coral
  { primary: ["#ff3366", "#ff6644", "#ffa380", "#ffffff"], secondary: ["#ff0033", "#ffaa44"] },
  // Violet & Lavender
  { primary: ["#d055ff", "#9933ff", "#e6b3ff", "#ffffff"], secondary: ["#7700ff", "#ff80df"] },
  // Emerald & Jade
  { primary: ["#00ffaa", "#00e676", "#b9f6ca", "#ffffff"], secondary: ["#00b0ff", "#ffd700"] },
  // Platinum & Ice
  { primary: ["#e0f7fa", "#80deea", "#ffffff", "#e1f5fe"], secondary: ["#4dd0e1", "#ffd700"] },
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

class Rocket {
  constructor(x, y, targetY, shellType, palette, isFinalRocket = false) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.targetY = targetY;
    this.shellType = shellType;
    this.palette = palette;
    this.isFinalRocket = isFinalRocket;

    this.trail = [];
    this.dead = false;

    if (isFinalRocket) {
      this.speedY = -randomRange(6.5, 7.2);
      this.speedX = 0;
      this.gravity = 0.038;
      this.color = "#ffd700";
    } else {
      const distance = y - targetY;
      this.gravity = 0.07;
      // Calculate initial upward speed so rocket decelerates nicely near targetY
      this.speedY = -Math.sqrt(Math.max(10, 2 * this.gravity * distance * randomRange(0.85, 1.05)));
      this.speedX = randomRange(-0.8, 0.8);
      this.color = getRandomItem(palette.primary);
    }
  }

  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > (this.isFinalRocket ? 12 : 7)) {
      this.trail.shift();
    }

    this.trail.forEach((t) => {
      t.alpha -= 0.12;
    });

    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;

    // Check if apex reached or target exceeded
    if (this.speedY >= -0.5 || this.y <= this.targetY) {
      this.dead = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Draw trailing rocket line
    for (let i = 0; i < this.trail.length - 1; i++) {
      const p1 = this.trail[i];
      const p2 = this.trail[i + 1];
      if (p1.alpha <= 0) continue;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = this.isFinalRocket
        ? `rgba(255, 220, 100, ${p1.alpha})`
        : `rgba(255, 235, 180, ${p1.alpha * 0.85})`;
      ctx.lineWidth = this.isFinalRocket ? 3.5 : 2;
      ctx.stroke();
    }

    // Draw rocket head glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.isFinalRocket ? 3.5 : 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.isFinalRocket ? 15 : 8;
    ctx.shadowColor = this.color;
    ctx.fill();

    ctx.restore();
  }
}

class Particle {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx;
    this.vy = options.vy;
    this.color = options.color;
    this.size = options.size || randomRange(1.2, 2.5);
    this.alpha = 1;
    this.decay = options.decay || randomRange(0.012, 0.022);
    this.friction = options.friction !== undefined ? options.friction : 0.97;
    this.gravity = options.gravity !== undefined ? options.gravity : 0.05;
    this.flicker = options.flicker || false;
    this.isWillow = options.isWillow || false;
    this.isCrossette = options.isCrossette || false;
    this.crossetteTimer = options.crossetteTimer || 0;
    this.dead = false;

    this.trail = [];
    this.maxTrailLength = options.trailLength || (this.isWillow ? 8 : 4);
  }

  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;

    this.alpha -= this.decay;

    if (this.isCrossette && this.crossetteTimer > 0) {
      this.crossetteTimer--;
    }

    if (this.alpha <= 0) {
      this.dead = true;
    }
  }

  draw(ctx) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    let currentAlpha = this.alpha;
    if (this.flicker && Math.random() < 0.35) {
      currentAlpha *= 0.3;
    }

    // Draw particle trail
    for (let i = 0; i < this.trail.length - 1; i++) {
      const t1 = this.trail[i];
      const t2 = this.trail[i + 1];
      const ratio = i / this.trail.length;

      ctx.beginPath();
      ctx.moveTo(t1.x, t1.y);
      ctx.lineTo(t2.x, t2.y);
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = currentAlpha * ratio * 0.6;
      ctx.lineWidth = this.size * ratio;
      ctx.stroke();
    }

    // Draw particle head
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = currentAlpha;
    ctx.fill();

    ctx.restore();
  }
}

class SmokeParticle {
  constructor(x, y) {
    this.x = x + randomRange(-15, 15);
    this.y = y + randomRange(-15, 15);
    this.vx = randomRange(-0.3, 0.3);
    this.vy = randomRange(-0.4, -0.1);
    this.size = randomRange(12, 28);
    this.alpha = randomRange(0.06, 0.12);
    this.decay = randomRange(0.0015, 0.003);
    this.dead = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.size += 0.15;
    this.alpha -= this.decay;
    if (this.alpha <= 0) {
      this.dead = true;
    }
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 175, 210, ${this.alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

class StardustParticle {
  constructor(width, height) {
    this.x = randomRange(0, width);
    this.y = randomRange(0, height);
    this.vx = randomRange(-0.25, 0.25);
    this.vy = randomRange(-0.3, -0.05);
    this.size = randomRange(0.8, 1.8);
    this.alpha = randomRange(0.2, 0.8);
    this.maxAlpha = this.alpha;
    this.flickerSpeed = randomRange(0.01, 0.03);
    this.color = getRandomItem(["#ffd700", "#ffe082", "#ffffff", "#ffca28"]);
  }

  update(width, height) {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha += Math.sin(Date.now() * this.flickerSpeed) * 0.02;

    if (this.y < -10) this.y = height + 10;
    if (this.x < -10) this.x = width + 10;
    if (this.x > width + 10) this.x = -10;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));
    ctx.fill();
    ctx.restore();
  }
}

export class FireworksEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");

    this.rockets = [];
    this.particles = [];
    this.smokeParticles = [];
    this.stardustParticles = [];

    this.isRunning = false;
    this.ambientStardustActive = false;
    this.skyFlashAlpha = 0;
    this.animationFrameId = null;

    this.onFinalRocketDetonated = null;

    this.handleResize = this.handleResize.bind(this);
    this.loop = this.loop.bind(this);
  }

  init() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.dpr = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;

    this.ctx.scale(this.dpr, this.dpr);

    // Responsive particle density multiplier
    this.isMobile = this.width < 768;
    this.densityMultiplier = this.isMobile ? 0.55 : 1.0;
  }

  start(onFinalRocketDetonated) {
    this.onFinalRocketDetonated = onFinalRocketDetonated;
    this.canvas.hidden = false;
    document.body.classList.add("is-fireworks-active");

    this.rockets = [];
    this.particles = [];
    this.smokeParticles = [];
    this.stardustParticles = [];
    this.isRunning = true;
    this.ambientStardustActive = false;

    this.runTimeline();

    if (!this.animationFrameId) {
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    document.body.classList.remove("is-fireworks-active");
    this.canvas.hidden = true;
  }

  spawnRocket(isFinal = false) {
    const palette = getRandomItem(PALETTES);
    const shellTypes = [
      "peony",
      "ring",
      "double-ring",
      "willow",
      "crossette",
      "crackling",
      "palm",
      "finale",
    ];
    const shellType = isFinal ? "final" : getRandomItem(shellTypes);

    const x = isFinal
      ? this.width / 2
      : randomRange(this.width * 0.15, this.width * 0.85);
    const startY = this.height + 10;
    const targetY = isFinal
      ? this.height * 0.25
      : randomRange(this.height * 0.18, this.height * 0.48);

    const rocket = new Rocket(x, startY, targetY, shellType, palette, isFinal);
    this.rockets.push(rocket);
  }

  explodeRocket(rocket) {
    const { x, y, shellType, palette, isFinalRocket } = rocket;

    // Trigger subtle sky ambient glow
    this.skyFlashAlpha = isFinalRocket ? 0.25 : 0.14;

    // Emit smoke
    const smokeCount = Math.floor(randomRange(5, 10) * this.densityMultiplier);
    for (let i = 0; i < smokeCount; i++) {
      this.smokeParticles.push(new SmokeParticle(x, y));
    }

    if (isFinalRocket) {
      this.createFinalGoldExplosion(x, y);
      if (typeof this.onFinalRocketDetonated === "function") {
        this.onFinalRocketDetonated();
      }
      return;
    }

    switch (shellType) {
      case "ring":
        this.createRingBurst(x, y, palette);
        break;
      case "double-ring":
        this.createDoubleRingBurst(x, y, palette);
        break;
      case "willow":
        this.createWillowBurst(x, y, palette);
        break;
      case "crossette":
        this.createCrossetteBurst(x, y, palette);
        break;
      case "crackling":
        this.createCracklingBurst(x, y, palette);
        break;
      case "palm":
        this.createPalmBurst(x, y, palette);
        break;
      case "finale":
        this.createFinaleBurst(x, y, palette);
        break;
      case "peony":
      default:
        this.createPeonyBurst(x, y, palette);
        break;
    }
  }

  createPeonyBurst(x, y, palette) {
    const count = Math.floor(100 * this.densityMultiplier);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(1.8, 6.5);
      const color = getRandomItem(palette.primary);

      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: randomRange(1.5, 2.6),
          decay: randomRange(0.012, 0.02),
          friction: 0.965,
          gravity: 0.06,
        })
      );
    }
  }

  createRingBurst(x, y, palette) {
    const count = Math.floor(65 * this.densityMultiplier);
    const color = getRandomItem(palette.primary);
    const speed = randomRange(4.5, 5.8);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 2.2,
          decay: 0.016,
          friction: 0.97,
          gravity: 0.045,
        })
      );
    }
  }

  createDoubleRingBurst(x, y, palette) {
    const outerCount = Math.floor(55 * this.densityMultiplier);
    const innerCount = Math.floor(35 * this.densityMultiplier);
    const outerColor = palette.primary[0];
    const innerColor = palette.secondary ? palette.secondary[0] : "#ffffff";

    // Outer ring
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2;
      const speed = 5.8;
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: outerColor,
          size: 2.2,
          decay: 0.015,
          friction: 0.97,
          gravity: 0.045,
        })
      );
    }

    // Inner ring
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2;
      const speed = 3.2;
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: innerColor,
          size: 1.8,
          decay: 0.018,
          friction: 0.97,
          gravity: 0.045,
        })
      );
    }
  }

  createWillowBurst(x, y, palette) {
    const count = Math.floor(85 * this.densityMultiplier);
    const color = palette.primary[0] || "#ffd700";

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(2.2, 7.2);
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: randomRange(1.4, 2.2),
          decay: randomRange(0.006, 0.01), // Linger longer
          friction: 0.96,
          gravity: 0.038,
          isWillow: true,
          trailLength: 8,
        })
      );
    }
  }

  createCrossetteBurst(x, y, palette) {
    const count = Math.floor(16 * this.densityMultiplier);
    const color = getRandomItem(palette.primary);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = randomRange(4.5, 6.0);
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 2.8,
          decay: 0.015,
          friction: 0.965,
          gravity: 0.05,
          isCrossette: true,
          crossetteTimer: Math.floor(randomRange(22, 28)),
        })
      );
    }
  }

  createCracklingBurst(x, y, palette) {
    const count = Math.floor(90 * this.densityMultiplier);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(2.0, 6.8);
      const color = getRandomItem(["#ffffff", "#ffeb3b", "#ffd700"]);

      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: randomRange(1.2, 2.2),
          decay: randomRange(0.014, 0.024),
          friction: 0.96,
          gravity: 0.055,
          flicker: true,
        })
      );
    }
  }

  createPalmBurst(x, y, palette) {
    const count = Math.floor(24 * this.densityMultiplier);
    const color = palette.primary[0] || "#ffd700";

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = randomRange(5.5, 7.8);
      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: 3.2,
          decay: 0.009,
          friction: 0.97,
          gravity: 0.04,
          trailLength: 7,
        })
      );
    }
  }

  createFinaleBurst(x, y, palette) {
    this.createPeonyBurst(x, y, palette);
    this.createWillowBurst(x, y, palette);
    this.createCracklingBurst(x, y, palette);
  }

  createFinalGoldExplosion(x, y) {
    const goldPalette = {
      primary: ["#ffd700", "#ffe066", "#fff4b8", "#ffffff"],
    };
    const count = Math.floor(160 * this.densityMultiplier);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(2.0, 8.5);
      const color = getRandomItem(goldPalette.primary);

      this.particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: randomRange(1.8, 3.2),
          decay: randomRange(0.007, 0.012),
          friction: 0.965,
          gravity: 0.038,
          isWillow: i % 3 === 0,
          flicker: i % 4 === 0,
          trailLength: 8,
        })
      );
    }
  }

  triggerCrossetteSplits() {
    const newParticles = [];
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.isCrossette && p.crossetteTimer <= 0 && !p.dead) {
        p.dead = true;
        // Split into 4 cross particles
        const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
        angles.forEach((angle) => {
          newParticles.push(
            new Particle({
              x: p.x,
              y: p.y,
              vx: Math.cos(angle) * 3.5,
              vy: Math.sin(angle) * 3.5,
              color: "#ffffff",
              size: 1.8,
              decay: 0.025,
              friction: 0.95,
              gravity: 0.05,
              flicker: true,
            })
          );
        });
      }
    }
    if (newParticles.length > 0) {
      this.particles.push(...newParticles);
    }
  }

  enableAmbientStardust() {
    this.ambientStardustActive = true;
    const stardustCount = this.isMobile ? 35 : 60;
    for (let i = 0; i < stardustCount; i++) {
      this.stardustParticles.push(new StardustParticle(this.width, this.height));
    }
  }

  disableAmbientStardust() {
    this.ambientStardustActive = false;
    this.stardustParticles = [];
  }

  runTimeline() {
    this.activeTimers = [];
    this.isDarkPause = false;

    const scheduleInterval = (fn, ms, startAfterMs, durationMs) => {
      const startTimer = window.setTimeout(() => {
        if (!this.isRunning) return;
        const intervalId = window.setInterval(() => {
          if (!this.isRunning) {
            clearInterval(intervalId);
            return;
          }
          fn();
        }, ms);
        this.activeTimers.push(intervalId);

        if (durationMs) {
          const stopTimer = window.setTimeout(() => clearInterval(intervalId), durationMs);
          this.activeTimers.push(stopTimer);
        }
      }, startAfterMs);
      this.activeTimers.push(startTimer);
    };

    // 0 – 4s: INTRO (first elegant rockets, controlled pace)
    this.spawnRocket();
    scheduleInterval(() => this.spawnRocket(), 1500, 1000, 3000);

    // 4 – 10s: BUILD (more rockets, varied launch positions, colors, shell types)
    scheduleInterval(() => this.spawnRocket(), 850, 4000, 6000);

    // 10 – 18s: CELEBRATION (increasing frequency, overlapping bursts, simultaneous rockets)
    scheduleInterval(() => {
      this.spawnRocket();
      if (Math.random() < 0.5) {
        window.setTimeout(() => this.spawnRocket(), 180);
      }
    }, 550, 10000, 8000);

    // 18 – 24s: PEAK (larger and more frequent fireworks, multiple launches, layered explosions)
    scheduleInterval(() => {
      this.spawnRocket();
      this.spawnRocket();
    }, 420, 18000, 6000);

    // 24 – 27s: GRAND FINALE (biggest fireworks, several rockets, large finale moment)
    scheduleInterval(() => {
      this.spawnRocket();
      this.spawnRocket();
      if (Math.random() < 0.6) {
        this.spawnRocket();
      }
    }, 320, 24000, 3000);

    // At ~27.0s: STOP MAIN SHOW & AUDIO -> GRADUAL CINEMATIC FADE
    const finishTimer = window.setTimeout(() => {
      if (!this.isRunning) return;

      // Clear all active launch timers
      this.activeTimers.forEach((id) => {
        clearInterval(id);
        clearTimeout(id);
      });

      // Stop audio completely
      stopFireworksAudio();

      // Begin gradual fade: increase background darkening alpha over time
      this.isFadingOut = true;
      this.fadeAlpha = 0.18; // Start from normal trail alpha
      this.fadeStartTime = performance.now();
      this.fadeDuration = 2000; // 2 seconds of gradual darkening

      // Launch final rocket 1.2s into the fade (screen is ~60% darker)
      const finalRocketTimer = window.setTimeout(() => {
        if (!this.isRunning) return;
        this.spawnRocket(true); // isFinalRocket = true
      }, 1200);

      this.activeTimers.push(finalRocketTimer);

    }, 27000);

    this.activeTimers.push(finishTimer);
  }

  loop() {
    if (!this.isRunning && this.particles.length === 0 && this.rockets.length === 0 && !this.ambientStardustActive && !this.isFadingOut) {
      this.animationFrameId = null;
      return;
    }

    this.ctx.save();

    // Gradual fade: increase darkening alpha over time during fade-out
    let trailAlpha = 0.18;
    if (this.isFadingOut) {
      const elapsed = performance.now() - this.fadeStartTime;
      const progress = Math.min(elapsed / this.fadeDuration, 1);
      // Ease from 0.18 to 0.55 — screen gets progressively darker
      trailAlpha = 0.18 + progress * 0.37;
    }

    this.ctx.fillStyle = `rgba(5, 5, 6, ${trailAlpha})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render sky ambient flash on explosion
    if (this.skyFlashAlpha > 0) {
      this.ctx.fillStyle = `rgba(255, 235, 200, ${this.skyFlashAlpha})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.skyFlashAlpha -= 0.015;
    }

    this.ctx.restore();

    // Update & draw smoke particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const s = this.smokeParticles[i];
      s.update();
      s.draw(this.ctx);
      if (s.dead) {
        this.smokeParticles.splice(i, 1);
      }
    }

    // Update & draw rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.update();
      r.draw(this.ctx);
      if (r.dead) {
        this.explodeRocket(r);
        this.rockets.splice(i, 1);
      }
    }

    // Check crossette splits
    this.triggerCrossetteSplits();

    // Update & draw explosion particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(this.ctx);
      if (p.dead) {
        this.particles.splice(i, 1);
      }
    }

    // Update & draw ambient stardust if active
    if (this.ambientStardustActive) {
      this.stardustParticles.forEach((sp) => {
        sp.update(this.width, this.height);
        sp.draw(this.ctx);
      });
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }
}
