/**
 * Floating Sci-Fi Arena with Living Animated Rainbow Floor
 * Soft flowing energy field, crystal-clear center visibility, no harsh stripes,
 * and massive cosmic universe with distant rotating neon megastructures
 */

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, ARENA_HALF_SIZE, PALETTE } from '../game/Constants.js';

export class Arena {
  constructor(scene) {
    this.scene = scene;
    this.arenaGroup = new THREE.Group();
    this.scene.add(this.arenaGroup);

    this.gridTexture = null;
    this.gridCanvas = null;
    this.gridCtx = null;
    this.wallMaterials = [];
    this.pylonLights = [];
    this.stars = null;
    this.megastructures = [];
    this.shockwaves = [];

    this.pulseTime = 0;
    this.warningIntensity = 0;
    this.arenaEnergy = 1.0;
    this.isOverdrive = false;

    this.initPlatform();
    this.initGridFloor();
    this.initPerimeterAura();
    this.initLaserWalls();
    this.initCornerPylons();
    this.initMegastructures();
    this.initCosmicSky();
  }

  initPlatform() {
    const size = GRID_SIZE * CELL_SIZE;
    const thickness = 1.4;

    // Platform base chassis (dark metallic futuristic alloy)
    const baseGeo = new THREE.BoxGeometry(size + 0.8, thickness, size + 0.8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x050714,
      metalness: 0.92,
      roughness: 0.22
    });
    const platformBase = new THREE.Mesh(baseGeo, baseMat);
    platformBase.position.y = -thickness / 2;
    this.arenaGroup.add(platformBase);

    // Glowing neon border bezel
    const rimGeo = new THREE.BoxGeometry(size + 1.1, 0.16, size + 1.1);
    this.rimMat = new THREE.MeshStandardMaterial({
      color: 0x090e24,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.9,
      metalness: 0.95,
      roughness: 0.15
    });
    this.rimMesh = new THREE.Mesh(rimGeo, this.rimMat);
    this.rimMesh.position.y = 0.02;
    this.arenaGroup.add(this.rimMesh);

    // Floating reactor core underneath
    const engineGeo = new THREE.CylinderGeometry(size * 0.42, size * 0.48, 0.7, 24);
    this.engineMat = new THREE.MeshStandardMaterial({
      color: 0x020410,
      emissive: 0x7b1fa2,
      emissiveIntensity: 1.4,
      metalness: 0.9
    });
    const engine = new THREE.Mesh(engineGeo, this.engineMat);
    engine.position.y = -thickness - 0.35;
    this.arenaGroup.add(engine);

    // Ion thruster ring
    const thrusterRingGeo = new THREE.TorusGeometry(size * 0.35, 0.12, 12, 32);
    thrusterRingGeo.rotateX(Math.PI / 2);
    this.thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const thruster = new THREE.Mesh(thrusterRingGeo, this.thrusterMat);
    thruster.position.y = -thickness - 0.7;
    this.arenaGroup.add(thruster);
  }

  initGridFloor() {
    const canvasSize = 1024;
    this.gridCanvas = document.createElement('canvas');
    this.gridCanvas.width = canvasSize;
    this.gridCanvas.height = canvasSize;
    this.gridCtx = this.gridCanvas.getContext('2d');

    this.gridTexture = new THREE.CanvasTexture(this.gridCanvas);
    this.gridTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.gridTexture.wrapT = THREE.ClampToEdgeWrapping;

    const floorGeo = new THREE.PlaneGeometry(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    this.floorMat = new THREE.MeshStandardMaterial({
      map: this.gridTexture,
      roughness: 0.16,
      metalness: 0.85,
      transparent: false
    });

    const floor = new THREE.Mesh(floorGeo, this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01;
    this.arenaGroup.add(floor);

    this.drawLivingRainbow(0);
  }

  initPerimeterAura() {
    const size = GRID_SIZE * CELL_SIZE + 0.4;
    const auraGeo = new THREE.RingGeometry(size / 2 - 0.2, size / 2 + 1.4, 4, 1);
    auraGeo.rotateX(-Math.PI / 2);
    auraGeo.rotateY(Math.PI / 4);

    this.auraMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.auraMesh = new THREE.Mesh(auraGeo, this.auraMat);
    this.auraMesh.position.y = 0.04;
    this.arenaGroup.add(this.auraMesh);
  }

  /**
   * Living Animated Rainbow Floor
   * Smooth, flowing color transitions without harsh stripes or distracting lines
   * Center area maintains deep contrast so the snake and food POP brilliantly!
   */
  drawLivingRainbow(time) {
    const ctx = this.gridCtx;
    const w = this.gridCanvas.width;
    const h = this.gridCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const cells = GRID_SIZE;
    const step = w / cells;

    // 1. Base Dark Cyber Canvas
    ctx.fillStyle = '#060916';
    ctx.fillRect(0, 0, w, h);

    // 2. Flowing Living Rainbow Radial & Angular Energy Field
    // Cycle smoothly through HSL spectrum: Cyan -> Blue -> Purple -> Pink -> Magenta -> Red -> Orange -> Yellow -> Green -> Cyan
    const baseHue = (time * 18) % 360;

    // Multi-ring flowing rainbow ripples
    const maxRadius = Math.sqrt(cx * cx + cy * cy);
    const ringCount = 5;

    for (let r = ringCount; r >= 1; r--) {
      const radius = (r / ringCount) * maxRadius;
      const ringHue = (baseHue + r * 45) % 360;

      const radGrad = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, radius);
      radGrad.addColorStop(0, `hsla(${ringHue}, 85%, 16%, 0.10)`);
      radGrad.addColorStop(0.7, `hsla(${(ringHue + 30) % 360}, 90%, 26%, 0.25)`);
      radGrad.addColorStop(1.0, `hsla(${(ringHue + 60) % 360}, 95%, 45%, 0.05)`);

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Clear Center Playfield Zone for 100% Snake Visibility
    const centerGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.38);
    centerGrad.addColorStop(0, 'rgba(4, 7, 18, 0.88)');
    centerGrad.addColorStop(0.65, 'rgba(8, 14, 32, 0.65)');
    centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // 4. Subtle, Clean Minimal Grid Lines (NO harsh stripes!)
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.20)';

    for (let i = 0; i <= cells; i++) {
      const pos = i * step;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(w, pos);
      ctx.stroke();
    }

    // 5. Subtle Intersection Dots (Clean spatial references)
    for (let i = 0; i <= cells; i++) {
      for (let j = 0; j <= cells; j++) {
        const px = i * step;
        const py = j * step;
        ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Glowing Rainbow Edge Aura
    const borderHue = (baseHue + 120) % 360;
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0, `hsla(${baseHue}, 100%, 55%, 0.85)`);
    borderGrad.addColorStop(0.5, `hsla(${(baseHue + 90) % 360}, 100%, 60%, 0.85)`);
    borderGrad.addColorStop(1, `hsla(${borderHue}, 100%, 55%, 0.85)`);

    ctx.lineWidth = 7;
    ctx.strokeStyle = borderGrad;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    this.gridTexture.needsUpdate = true;
  }

  initLaserWalls() {
    const size = GRID_SIZE * CELL_SIZE;
    const wallHeight = 0.9;
    const half = ARENA_HALF_SIZE;

    const createWallMat = (baseHex, glowHex) => {
      const mat = new THREE.MeshStandardMaterial({
        color: baseHex,
        emissive: glowHex,
        emissiveIntensity: 1.1,
        transparent: true,
        opacity: 0.36,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.wallMaterials.push(mat);
      return mat;
    };

    const wallDefs = [
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [0, wallHeight / 2, -half], rot: [0, 0, 0], col: 0x00f0ff, glow: 0x0088ff },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [0, wallHeight / 2, half], rot: [0, Math.PI, 0], col: 0xff0088, glow: 0xff00aa },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [-half, wallHeight / 2, 0], rot: [0, Math.PI / 2, 0], col: 0x9d00ff, glow: 0x6e00ff },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [half, wallHeight / 2, 0], rot: [0, -Math.PI / 2, 0], col: 0x00ff88, glow: 0x00ffaa }
    ];

    wallDefs.forEach((def) => {
      const mesh = new THREE.Mesh(def.geo, createWallMat(def.col, def.glow));
      mesh.position.set(...def.pos);
      mesh.rotation.set(...def.rot);
      this.arenaGroup.add(mesh);
    });

    // Glowing Neon Top Laser Railings
    const hRailGeo = new THREE.CylinderGeometry(0.045, 0.045, size, 8);
    const railMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const railMat2 = new THREE.MeshBasicMaterial({ color: 0xff00aa });

    const railN = new THREE.Mesh(hRailGeo, railMat1);
    railN.rotation.z = Math.PI / 2;
    railN.position.set(0, wallHeight, -half);
    this.arenaGroup.add(railN);

    const railS = new THREE.Mesh(hRailGeo, railMat2);
    railS.rotation.z = Math.PI / 2;
    railS.position.set(0, wallHeight, half);
    this.arenaGroup.add(railS);

    const railW = new THREE.Mesh(hRailGeo, railMat2);
    railW.rotation.x = Math.PI / 2;
    railW.position.set(-half, wallHeight, 0);
    this.arenaGroup.add(railW);

    const railE = new THREE.Mesh(hRailGeo, railMat1);
    railE.rotation.x = Math.PI / 2;
    railE.position.set(half, wallHeight, 0);
    this.arenaGroup.add(railE);
  }

  initCornerPylons() {
    const half = ARENA_HALF_SIZE;
    const corners = [
      { pos: [-half, -half], color: 0x00f0ff },
      { pos: [half, -half], color: 0xff0088 },
      { pos: [half, half], color: 0xffea00 },
      { pos: [-half, half], color: 0x00ff88 }
    ];

    const pylonGeo = new THREE.CylinderGeometry(0.22, 0.38, 1.4, 8);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x0a1030,
      metalness: 0.95,
      roughness: 0.15
    });

    const crystalGeo = new THREE.OctahedronGeometry(0.22, 0);

    corners.forEach((corner, idx) => {
      const group = new THREE.Group();
      group.position.set(corner.pos[0], 0.7, corner.pos[1]);

      const base = new THREE.Mesh(pylonGeo, pylonMat);
      group.add(base);

      const crystalMat = new THREE.MeshStandardMaterial({
        color: corner.color,
        emissive: corner.color,
        emissiveIntensity: 1.6,
        roughness: 0.1,
        metalness: 0.8
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 0.95;
      group.add(crystal);

      const beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 7, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: corner.color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 4.4;
      group.add(beam);

      this.pylonLights.push({ crystal, beam, color: corner.color });
      this.arenaGroup.add(group);
    });
  }

  /**
   * Distant Megastructures giving the world a massive, colossal scale!
   */
  initMegastructures() {
    // 1. Massive rotating orbital neon rings far outside the arena
    const ringColors = [0x00f0ff, 0xff00aa, 0x9d00ff, 0xffea00];
    ringColors.forEach((col, idx) => {
      const ringGeo = new THREE.TorusGeometry(32 + idx * 8, 0.35, 12, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.28,
        wireframe: (idx % 2 === 1)
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, -6 + idx * 4, 0);
      ring.rotation.x = Math.PI / 4 + idx * 0.3;
      ring.rotation.y = idx * 0.5;
      this.scene.add(ring);
      this.megastructures.push({ mesh: ring, rotSpeed: 0.08 * (idx % 2 === 0 ? 1 : -1) });
    });

    // 2. Distant Cyber Monoliths silhouetted in deep space
    for (let i = 0; i < 8; i++) {
      const mGeo = new THREE.BoxGeometry(3, 35, 3);
      const mMat = new THREE.MeshStandardMaterial({
        color: 0x050818,
        emissive: (i % 2 === 0 ? 0x002244 : 0x220033),
        metalness: 0.95,
        roughness: 0.2
      });
      const monolith = new THREE.Mesh(mGeo, mMat);
      const angle = (i / 8) * Math.PI * 2;
      const dist = 42 + (i % 3) * 6;
      monolith.position.set(Math.cos(angle) * dist, -12, Math.sin(angle) * dist);
      this.scene.add(monolith);
    }
  }

  initCosmicSky() {
    const starCount = 2600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xff00aa),
      new THREE.Color(0xffea00),
      new THREE.Color(0x00ff88),
      new THREE.Color(0xaa44ff),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 70 + Math.random() * 110;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.max(5, radius * Math.cos(phi));
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const picked = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = picked.r;
      colors[i * 3 + 1] = picked.g;
      colors[i * 3 + 2] = picked.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(geometry, starMaterial);
    this.scene.add(this.stars);
  }

  setWarning(intensity) {
    this.warningIntensity = THREE.MathUtils.clamp(intensity, 0, 1);
  }

  setIntensity(level = 1, isOverdrive = false) {
    this.arenaEnergy = 1.0 + (level - 1) * 0.15;
    this.isOverdrive = isOverdrive;
  }

  triggerShockwave(pos = { x: 0, z: 0 }, colorHex = 0x00f0ff) {
    const geo = new THREE.RingGeometry(0.2, 0.7, 32);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, 0.08, pos.z);
    this.scene.add(mesh);
    this.shockwaves.push({ mesh, mat, geo, radius: 0.4, maxRadius: 14, opacity: 0.9, speed: 20 });
  }

  update(time, deltaTime) {
    // Redraw smooth living rainbow floor at 30 FPS
    this.pulseTime += deltaTime;
    const updateRate = this.isOverdrive ? 0.025 : 0.033;
    if (this.pulseTime > updateRate) {
      this.drawLivingRainbow(time * (this.isOverdrive ? 1.6 : 1.0));
      this.pulseTime = 0;
    }

    // Animate floor shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * deltaTime;
      const progress = sw.radius / sw.maxRadius;
      sw.mesh.scale.set(sw.radius, 1, sw.radius);
      sw.mat.opacity = Math.max(0, sw.opacity * (1.0 - progress));
      if (progress >= 1 || sw.mat.opacity <= 0.01) {
        this.scene.remove(sw.mesh);
        sw.mat.dispose();
        sw.geo.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // Slowly rotate celestial starfield
    if (this.stars) {
      this.stars.rotation.y = time * 0.025;
    }

    // Animate distant rotating megastructure rings
    this.megastructures.forEach((ms) => {
      ms.mesh.rotation.z += ms.rotSpeed * deltaTime;
      ms.mesh.rotation.y += ms.rotSpeed * 0.5 * deltaTime;
    });

    // Animate corner beacon crystals & vertical laser beams
    this.pylonLights.forEach((pylon, idx) => {
      pylon.crystal.rotation.y = time * 2.8 + idx;
      pylon.crystal.rotation.x = Math.sin(time * 1.5 + idx) * 0.4;
      pylon.beam.scale.x = Math.sin(time * 4 + idx) * 0.3 + 1.0;
      pylon.beam.scale.z = pylon.beam.scale.x;
    });

    // Animate outer aura
    if (this.auraMesh) {
      const hue = (time * 25) % 360;
      this.auraMat.color.setHSL(hue / 360, 1.0, 0.5);
      this.auraMat.opacity = 0.22 + Math.sin(time * 4) * 0.08;
    }

    // Animate walls & warning pulse
    const baseOpacity = 0.35 + Math.sin(time * 3.5) * 0.08;
    this.wallMaterials.forEach((mat) => {
      if (this.warningIntensity > 0.1) {
        mat.color.setHex(PALETTE.RED_ALERT);
        mat.emissive.setHex(PALETTE.RED_ALERT);
        mat.opacity = 0.45 + this.warningIntensity * 0.45 * (Math.sin(time * 14) * 0.5 + 0.5);
      } else {
        mat.opacity = baseOpacity;
      }
    });
  }
}
