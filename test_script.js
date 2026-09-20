
    /* Master Configuration */
    const AQUARIUM_CONFIG = {
      businessName: "Taylor'd Aquatics",
      owner: "Nikki Taylor",
      phone: "07909 901541",
      phoneRaw: "07909901541",
      whatsapp: "447909901541",
      whatsappMessage: "Hello Nikki, I'm visiting the Taylor'd Aquatics living aquarium and would like to enquire about maintenance services in Brighton & Hove.",
      facebook: "https://www.facebook.com/TaylordAquatics",
      address: "92 Lower Chalvington Place, Brighton, East Sussex, BN2 5GZ",
      
      social: {
        instagram: {
          enabled: false,
          url: "https://www.instagram.com/taylordaquatics"
        }
      },

      testimonials: [
        { quote: '"The only man I trust with my marine reef tanks. Brilliant work!"', author: "Mark S., Hove" },
        { quote: '"Honest advice, zero snake oil, and my Discus have never looked healthier."', author: "Sarah L., Brighton" },
        { quote: '"Looked after our tanks for two weeks in Italy. Total peace of mind!"', author: "David P., East Sussex" },
        { quote: '"Rescued my aquarium from hair algae and tuned the skimmer perfectly."', author: "James M., Shoreham" }
      ],

      bubbleTopics: [
        {
          tag: "✦ SPECIALIST REEF CARE ✦",
          title: "Saltwater & Living Reefs",
          desc: "Expert coral husbandry, ICP water testing, and quiet sump plumbing across Brighton & Hove.",
          cta: "View Full Specs →",
          action: "drawer"
        },
        {
          tag: "✦ DISCUS AQUASCAPING ✦",
          title: "Tropical Planted Tanks",
          desc: "Bespoke care for delicate Discus, CO2 pressurised equipment, and lush aquascaping layouts.",
          cta: "Explore Care Details →",
          action: "drawer"
        },
        {
          tag: "✦ PEACE OF MIND ✦",
          title: "Holiday Tank Sitting",
          desc: "Scheduled check-ins while you travel to prevent catastrophic pump or feeder failures.",
          cta: "Book Holiday Cover →",
          action: "whatsapp"
        },
        {
          tag: "✦ LOCAL EXPERTISE ✦",
          title: "Brighton & Hove Area",
          desc: "Prompt on-site maintenance covering Brighton, Hove, Shoreham, Lewes and Sussex.",
          cta: "Chat on WhatsApp →",
          action: "whatsapp"
        },
        {
          tag: "✦ OUTDOOR LIVING ✦",
          title: "Garden Koi Ponds",
          desc: "Seasonal filtration overhauls, UV clarifier cleaning, and coldwater fish health checks.",
          cta: "View Pond Services →",
          action: "drawer"
        }
      ]
    };

    /* Bind contacts to DOM */
    const waUrl = `https://wa.me/${AQUARIUM_CONFIG.whatsapp}?text=${encodeURIComponent(AQUARIUM_CONFIG.whatsappMessage)}`;
    document.getElementById('stoneWhatsapp').href = waUrl;
    document.getElementById('drawerWhatsappBtn').href = waUrl;
    document.getElementById('stoneFacebook').href = AQUARIUM_CONFIG.facebook;

    if (AQUARIUM_CONFIG.social.instagram.enabled) {
      const insta = document.getElementById('stoneInstagram');
      insta.style.display = 'flex';
      insta.href = AQUARIUM_CONFIG.social.instagram.url;
    }

    /* ==========================================================================
       B. HIGH-FIDELITY WEB AUDIO DSP ENGINE (PHYSICAL UNDERWATER SYNTHESIS)
       ========================================================================== */
    class StudioAudioEngine {
      constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.ambientGain = null;
        this.noiseNode = null;
      }

      init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        this.master = this.ctx.createGain();
        this.master.gain.value = 0.85;
        this.master.connect(this.ctx.destination);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = 0.0;
        this.ambientGain.connect(this.master);
      }

      toggle() {
        this.init();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        this.isMuted = !this.isMuted;
        if (!this.isMuted) {
          this.startAmbient();
          this.playBubblePop(720);
        } else {
          this.stopAmbient();
        }
        return !this.isMuted;
      }

      startAmbient() {
        if (this.noiseNode) return;
        const bufferSize = this.ctx.sampleRate * 2.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.15;
          b2 = 0.85 * b2 + white * 0.3;
          data[i] = (b0 + b1 + b2) * 0.05;
        }

        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = buffer;
        this.noiseNode.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 450;
        filter.Q.value = 3.5;

        this.noiseNode.connect(filter);
        filter.connect(this.ambientGain);
        this.noiseNode.start(0);

        this.ambientGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.ambientGain.gain.setTargetAtTime(0.32, this.ctx.currentTime, 0.8);
      }

      stopAmbient() {
        if (!this.ctx) return;
        this.ambientGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      }

      playChestGlug() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Sub-bass body
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(190, now);
        subOsc.frequency.exponentialRampToValueAtTime(56, now + 0.42);

        subGain.gain.setValueAtTime(0.6, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        subOsc.connect(subGain);
        subGain.connect(this.master);
        subOsc.start(now);
        subOsc.stop(now + 0.42);

        // Liquid chirp
        const chirpOsc = this.ctx.createOscillator();
        const chirpGain = this.ctx.createGain();
        chirpOsc.type = 'triangle';
        chirpOsc.frequency.setValueAtTime(320, now + 0.04);
        chirpOsc.frequency.exponentialRampToValueAtTime(700, now + 0.24);

        chirpGain.gain.setValueAtTime(0.01, now);
        chirpGain.gain.setValueAtTime(0.32, now + 0.05);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        chirpOsc.connect(chirpGain);
        chirpGain.connect(this.master);
        chirpOsc.start(now + 0.04);
        chirpOsc.stop(now + 0.24);

        // Micro-bubble flurry
        for (let i = 0; i < 7; i++) {
          setTimeout(() => {
            this.playBubblePop(420 + i * 75 + Math.random() * 80);
          }, 70 + i * 40);
        }
      }

      playBubblePop(frequency = 650) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = frequency + (Math.random() - 0.5) * 60;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.11);

        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.11);
      }

      playStoneClink() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.08);
      }

      playWheelClick() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    }

    const audio = new StudioAudioEngine();
    const audioToggleBtn = document.getElementById('audioToggleBtn');
    const soundIconOn = document.getElementById('soundIconOn');
    const soundIconOff = document.getElementById('soundIconOff');

    audioToggleBtn.addEventListener('click', () => {
      const active = audio.toggle();
      if (active) {
        audioToggleBtn.classList.remove('muted');
        soundIconOn.style.display = 'block';
        soundIconOff.style.display = 'none';
      } else {
        audioToggleBtn.classList.add('muted');
        soundIconOn.style.display = 'none';
        soundIconOff.style.display = 'block';
      }
    });

    /* ==========================================================================
       C. KINEMATIC MARINE FAUNA & WATER FX ENGINE (CANVAS 60 FPS)
       ========================================================================== */
    const canvas = document.getElementById('waterFxCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const pointer = {
      x: width * 0.5,
      y: height * 0.5,
      prevX: width * 0.5,
      prevY: height * 0.5,
      speed: 0,
      active: false
    };

    /* Water Ripple Effect */
    class Ripple {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.maxRadius = 75 + Math.random() * 40;
        this.alpha = 0.65;
        this.speed = 2.4;
      }
      update() {
        this.radius += this.speed;
        this.alpha *= 0.945;
      }
      draw(c) {
        if (this.alpha <= 0.01) return;
        c.save();
        c.strokeStyle = `rgba(56, 189, 248, ${this.alpha})`;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.stroke();

        c.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.6})`;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(this.x, this.y, this.radius * 0.85, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }

    const ripples = [];

    /* Floating Micro-Plankton & Pearl Bubbles */
    class PlanktonBubble {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.radius = 1.5 + Math.random() * 4.5;
        this.speedY = 0.6 + Math.random() * 1.5;
        this.driftX = (Math.random() - 0.5) * 0.6;
        this.phase = Math.random() * Math.PI * 2;
        this.alpha = 0.2 + Math.random() * 0.5;
      }
      update() {
        this.y -= this.speedY;
        this.phase += 0.04;
        this.x += this.driftX + Math.sin(this.phase) * 0.35;
        if (this.y < -20) this.reset();
      }
      draw(c) {
        c.save();
        c.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = `rgba(45, 212, 191, ${this.alpha * 0.75})`;
        c.lineWidth = 0.8;
        c.stroke();
        c.restore();
      }
    }

    const planktons = Array.from({ length: 32 }, () => new PlanktonBubble());

    /* ==========================================================================
       SUPERLATIVE MONOTONIC SPINE FISH ENGINE (CANNOT INVERT OR GLITCH)
       ========================================================================== */
    class OrganicFish {
      constructor(species, depthLayer) {
        this.species = species; // 'clownfish', 'bluetang', 'yellowtang'
        this.depth = depthLayer; // 'fg' (1.1), 'mid' (0.75), 'bg' (0.5)
        this.scale = depthLayer === 'fg' ? 1.05 : (depthLayer === 'mid' ? 0.72 : 0.48);
        this.opacity = depthLayer === 'bg' ? 0.62 : 0.96;

        this.x = Math.random() * width;
        this.y = height * 0.18 + Math.random() * (height * 0.55);
        this.vx = (Math.random() > 0.5 ? 1 : -1) * (1.1 + Math.random() * 1.2);
        this.vy = (Math.random() - 0.5) * 0.35;
        this.angle = Math.atan2(this.vy, this.vx);

        this.wavePhase = Math.random() * Math.PI * 2;
        this.swimSpeed = 0.13;
        this.panicTimer = 0;
        this.bubbleTimer = 100 + Math.random() * 200;

        // Monotonic spine structure: 9 vertebrae spaced along local -X axis
        this.numBones = 9;
        this.boneDist = 6.2 * this.scale;
      }

      update() {
        // Margin containment
        const marginX = 80;
        const marginY = 90;
        if (this.x < marginX) this.vx += 0.07;
        if (this.x > width - marginX) this.vx -= 0.07;
        if (this.y < marginY) this.vy += 0.05;
        if (this.y > height - marginY - 110) this.vy -= 0.05;

        // Interaction with pointer
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 130 && pointer.active) {
          if (pointer.speed > 8) {
            // Dart away with quick tail flutter
            this.vx -= (dx / dist) * 1.5;
            this.vy -= (dy / dist) * 1.5;
            this.panicTimer = 45;
          } else if (dist > 50 && this.panicTimer <= 0) {
            // Gentle curiosity
            this.vx += (dx / dist) * 0.035;
            this.vy += (dy / dist) * 0.035;
          }
        }

        if (this.panicTimer > 0) {
          this.panicTimer--;
          this.swimSpeed = 0.28;
        } else {
          this.swimSpeed = 0.13;
        }

        const currentSpeed = Math.hypot(this.vx, this.vy);
        const maxSpeed = this.panicTimer > 0 ? 5.2 : 2.2;
        if (currentSpeed > maxSpeed) {
          this.vx = (this.vx / currentSpeed) * maxSpeed;
          this.vy = (this.vy / currentSpeed) * maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.angle = Math.atan2(this.vy, this.vx);
        this.wavePhase += this.swimSpeed;

        // Intermittent tiny gill bubble
        this.bubbleTimer--;
        if (this.bubbleTimer <= 0) {
          this.bubbleTimer = 180 + Math.random() * 250;
          planktons.push(new PlanktonBubble());
        }
      }

      draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);

        // If swimming leftward, flip Y so dorsal fin stays on top
        if (Math.cos(this.angle) < 0) {
          c.scale(1, -1);
        }

        c.globalAlpha = this.opacity;

        // Compute local spine node positions
        const spine = [];
        for (let i = 0; i < this.numBones; i++) {
          const x = -i * this.boneDist;
          // Traveling sine wave with increasing amplitude toward the tail
          const y = Math.sin(this.wavePhase - i * 0.52) * (i * 1.15) * this.scale;
          spine.push({ x, y });
        }

        if (this.species === 'clownfish') {
          this.renderClownfish(c, spine);
        } else if (this.species === 'bluetang') {
          this.renderBlueTang(c, spine);
        } else {
          this.renderYellowTang(c, spine);
        }

        c.restore();
      }

      renderClownfish(c, spine) {
        // Half-widths along spine (0 = snout, 8 = tail peduncle)
        const widths = [2, 8, 13, 14, 13, 10, 7, 4, 3].map(w => w * this.scale);

        // 1. Pectoral Fin (fluttering)
        const finSway = Math.sin(this.wavePhase * 1.5) * 0.35;
        c.save();
        c.translate(spine[2].x, spine[2].y + 4 * this.scale);
        c.rotate(0.3 + finSway);
        c.fillStyle = 'rgba(255, 107, 53, 0.85)';
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1 * this.scale;
        c.beginPath();
        c.ellipse(0, 0, 8 * this.scale, 4.5 * this.scale, 0.4, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.restore();

        // 2. Tail Fin (Caudal)
        const tailNode = spine[spine.length - 1];
        c.save();
        c.translate(tailNode.x, tailNode.y);
        c.fillStyle = '#ff6b35';
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.4 * this.scale;
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(-12 * this.scale, -10 * this.scale, -20 * this.scale, -11 * this.scale);
        c.quadraticCurveTo(-16 * this.scale, 0, -20 * this.scale, 11 * this.scale);
        c.quadraticCurveTo(-12 * this.scale, 10 * this.scale, 0, 0);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();

        // 3. Smooth Body Contour
        c.save();
        const grad = c.createLinearGradient(0, -15 * this.scale, 0, 15 * this.scale);
        grad.addColorStop(0, '#ff7d44');
        grad.addColorStop(0.6, '#ff5722');
        grad.addColorStop(1, '#d84315');
        c.fillStyle = grad;

        c.beginPath();
        c.moveTo(spine[0].x, spine[0].y);

        // Top contour
        for (let i = 0; i < spine.length; i++) {
          c.lineTo(spine[i].x, spine[i].y - widths[i]);
        }
        // Bottom contour (reverse)
        for (let i = spine.length - 1; i >= 0; i--) {
          c.lineTo(spine[i].x, spine[i].y + widths[i]);
        }
        c.closePath();
        c.fill();

        // 4. White Stripes with Dark Borders
        [1, 4, 7].forEach(idx => {
          c.save();
          c.fillStyle = '#ffffff';
          c.strokeStyle = '#1e293b';
          c.lineWidth = 1 * this.scale;
          c.beginPath();
          c.ellipse(spine[idx].x, spine[idx].y, 3.2 * this.scale, widths[idx] * 0.95, 0, 0, Math.PI * 2);
          c.fill();
          c.stroke();
          c.restore();
        });

        // 5. Glossy 3D Eye
        c.fillStyle = '#0f172a';
        c.beginPath();
        c.arc(spine[1].x + 2 * this.scale, spine[1].y - 4 * this.scale, 3 * this.scale, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(spine[1].x + 3 * this.scale, spine[1].y - 4.8 * this.scale, 1.2 * this.scale, 0, Math.PI * 2);
        c.fill();

        c.restore();
      }

      renderBlueTang(c, spine) {
        const widths = [2, 9, 15, 16, 15, 12, 8, 5, 3].map(w => w * this.scale);

        // 1. Bright Yellow Tail
        const tailNode = spine[spine.length - 1];
        c.save();
        c.translate(tailNode.x, tailNode.y);
        c.fillStyle = '#fbbf24';
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-18 * this.scale, -12 * this.scale);
        c.lineTo(-14 * this.scale, 0);
        c.lineTo(-18 * this.scale, 12 * this.scale);
        c.closePath();
        c.fill();
        c.strokeStyle = '#0f172a';
        c.lineWidth = 1.2 * this.scale;
        c.stroke();
        c.restore();

        // 2. Royal Blue Body
        c.save();
        const grad = c.createLinearGradient(0, -18 * this.scale, 0, 18 * this.scale);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(0.5, '#1d4ed8');
        grad.addColorStop(1, '#0f2b7a');
        c.fillStyle = grad;

        c.beginPath();
        c.moveTo(spine[0].x, spine[0].y);
        for (let i = 0; i < spine.length; i++) {
          c.lineTo(spine[i].x, spine[i].y - widths[i]);
        }
        for (let i = spine.length - 1; i >= 0; i--) {
          c.lineTo(spine[i].x, spine[i].y + widths[i]);
        }
        c.closePath();
        c.fill();

        // 3. Black Palette Marking
        c.fillStyle = '#0f172a';
        c.beginPath();
        c.ellipse(spine[3].x, spine[3].y - 3 * this.scale, 11 * this.scale, 6 * this.scale, -0.15, 0, Math.PI * 2);
        c.fill();

        // 4. Eye
        c.fillStyle = '#0f172a';
        c.beginPath();
        c.arc(spine[1].x + 3 * this.scale, spine[1].y - 5 * this.scale, 3.2 * this.scale, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#38bdf8';
        c.beginPath();
        c.arc(spine[1].x + 4 * this.scale, spine[1].y - 5.8 * this.scale, 1.4 * this.scale, 0, Math.PI * 2);
        c.fill();

        c.restore();
      }

      renderYellowTang(c, spine) {
        // High Sailfin profile
        const widths = [2, 11, 18, 20, 18, 14, 9, 5, 3].map(w => w * this.scale);

        // 1. Canary Yellow Tail
        const tailNode = spine[spine.length - 1];
        c.save();
        c.translate(tailNode.x, tailNode.y);
        c.fillStyle = '#facc15';
        c.strokeStyle = '#eab308';
        c.lineWidth = 1 * this.scale;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-16 * this.scale, -9 * this.scale);
        c.lineTo(-14 * this.scale, 0);
        c.lineTo(-16 * this.scale, 9 * this.scale);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();

        // 2. Disc Body
        c.save();
        const grad = c.createLinearGradient(0, -22 * this.scale, 0, 22 * this.scale);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.4, '#facc15');
        grad.addColorStop(1, '#ca8a04');
        c.fillStyle = grad;

        c.beginPath();
        c.moveTo(spine[0].x, spine[0].y);
        for (let i = 0; i < spine.length; i++) {
          c.lineTo(spine[i].x, spine[i].y - widths[i]);
        }
        for (let i = spine.length - 1; i >= 0; i--) {
          c.lineTo(spine[i].x, spine[i].y + widths[i]);
        }
        c.closePath();
        c.fill();

        // 3. Eye
        c.fillStyle = '#0f172a';
        c.beginPath();
        c.arc(spine[1].x + 4 * this.scale, spine[1].y - 5 * this.scale, 3.2 * this.scale, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(spine[1].x + 4.8 * this.scale, spine[1].y - 5.8 * this.scale, 1.2 * this.scale, 0, Math.PI * 2);
        c.fill();

        c.restore();
      }
    }

    // Spawn 5 carefully calibrated fish (foreground & midground)
    const school = [
      new OrganicFish('clownfish', 'fg'),
      new OrganicFish('bluetang', 'fg'),
      new OrganicFish('yellowtang', 'mid'),
      new OrganicFish('clownfish', 'mid'),
      new OrganicFish('bluetang', 'bg')
    ];

    /* Animation Loop */
    function render() {
      ctx.clearRect(0, 0, width, height);

      // 1. Plankton Bubbles
      planktons.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      // 2. Kinematic Living Fish
      school.forEach(fish => {
        fish.update();
        fish.draw(ctx);
      });

      // 3. Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.update();
        r.draw(ctx);
        if (r.alpha <= 0.01) ripples.splice(i, 1);
      }

      requestAnimationFrame(render);
    }
    render();

    /* Pointer Tracking */
    function trackPointer(x, y) {
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = x;
      pointer.y = y;
      pointer.speed = Math.hypot(pointer.x - pointer.prevX, pointer.y - pointer.prevY);
      pointer.active = true;

      if (Math.random() < 0.16) {
        ripples.push(new Ripple(x, y));
      }
    }

    window.addEventListener('mousemove', (e) => trackPointer(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) trackPointer(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('click', (e) => {
      ripples.push(new Ripple(e.clientX, e.clientY));
      audio.playBubblePop();
    });

    /* ==========================================================================
       D. LIVE ROTATING CHALKBOARD SLATE (DIVER TESTIMONIALS)
       ========================================================================== */
    let quoteIndex = 0;
    const quoteEl = document.getElementById('liveQuoteText');
    const authorEl = document.getElementById('liveAuthorName');
    const diverAnchor = document.getElementById('diverSlateAnchor');

    function advanceQuote() {
      quoteEl.style.opacity = '0';
      authorEl.style.opacity = '0';

      setTimeout(() => {
        quoteIndex = (quoteIndex + 1) % AQUARIUM_CONFIG.testimonials.length;
        const item = AQUARIUM_CONFIG.testimonials[quoteIndex];
        quoteEl.textContent = item.quote;
        authorEl.textContent = `— ${item.author}`;
        quoteEl.style.opacity = '1';
        authorEl.style.opacity = '1';
      }, 350);
    }

    setInterval(advanceQuote, 7000);
    diverAnchor.addEventListener('click', () => {
      advanceQuote();
      audio.playStoneClink();
    });

    /* ==========================================================================
       E. ARTICULATED SUNKEN CHEST & RISING KNOWLEDGE BUBBLE
       ========================================================================== */
    const treasureChest = document.getElementById('treasureChest');
    const bubbleColumn = document.getElementById('bubbleColumn');
    let bubbleIndex = 0;
    let chestOpenTimeout = null;

    function openChestAndReleaseBubble() {
      treasureChest.classList.add('is-open');
      audio.playChestGlug();

      bubbleColumn.innerHTML = '';
      const topic = AQUARIUM_CONFIG.bubbleTopics[bubbleIndex];
      bubbleIndex = (bubbleIndex + 1) % AQUARIUM_CONFIG.bubbleTopics.length;

      const bubble = document.createElement('div');
      bubble.className = 'living-knowledge-bubble';
      bubble.innerHTML = `
        <span class="bubble-badge">${topic.tag}</span>
        <h3 class="bubble-title">${topic.title}</h3>
        <p class="bubble-desc">${topic.desc}</p>
        <span class="bubble-cta">${topic.cta}</span>
      `;

      bubble.addEventListener('click', () => {
        audio.playBubblePop(780);
        if (topic.action === 'drawer') {
          openDrawer();
        } else if (topic.action === 'whatsapp') {
          window.open(waUrl, '_blank');
        }
      });

      bubbleColumn.appendChild(bubble);

      clearTimeout(chestOpenTimeout);
      chestOpenTimeout = setTimeout(() => {
        treasureChest.classList.remove('is-open');
      }, 4500);
    }

    let chestCycle = setInterval(openChestAndReleaseBubble, 14000);
    setTimeout(openChestAndReleaseBubble, 1800);

    treasureChest.addEventListener('click', () => {
      clearInterval(chestCycle);
      openChestAndReleaseBubble();
      chestCycle = setInterval(openChestAndReleaseBubble, 14000);
    });

    /* ==========================================================================
       F. SLIDE-OUT SERVICES DRAWER & SHIP HELM
       ========================================================================== */
    const drawerScrim = document.getElementById('drawerScrim');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const shipHelm = document.getElementById('shipHelm');
    const pebbleBrand = document.getElementById('pebbleBrand');

    function openDrawer() {
      drawerScrim.classList.add('active');
      audio.playWheelClick();
    }

    function closeDrawer() {
      drawerScrim.classList.remove('active');
    }

    shipHelm.addEventListener('click', openDrawer);
    pebbleBrand.addEventListener('click', openDrawer);
    btnCloseDrawer.addEventListener('click', closeDrawer);

    drawerScrim.addEventListener('click', (e) => {
      if (e.target === drawerScrim) closeDrawer();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });

    document.querySelectorAll('.stone-contact-spot').forEach(st => {
      st.addEventListener('click', () => {
        audio.playStoneClink();
      });
    });
  