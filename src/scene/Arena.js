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
    const canvasSize = 512;
    this.gridCanvas = document.createElement('canvas');
    this.gridCanvas.width = canvasSize;
    this.gridCanvas.height = canvasSize;
    this.gridCtx = this.gridCanvas.getContext('2d');

    this.gridTexture = new THREE.CanvasTexture(this.gridCanvas);
    this.gridTexture.wrapS = THREE.ClampToEdgeWrapping;
    this.gridTexture.wrapT = THREE.ClampToEdgeWrapping;
    this.gridTexture.minFilter = THREE.LinearMipmapLinearFilter;
    this.gridTexture.magFilter = THREE.LinearFilter;
    this.gridTexture.generateMipmaps = true;

    const floorGeo = new THREE.PlaneGeometry(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    this.floorMat = new THREE.MeshStandardMaterial({
      map: this.gridTexture,
      roughness: 0.28,
      metalness: 0.45,
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
   * Constantly Changing Dark, Elegant Living RGB Rainbow Floor
   * Smoothly cycles through Red -> Orange -> Yellow -> Green -> Cyan -> Blue -> Purple -> Pink -> Red
   * Dark luxury base + soft RGB ambient glow. Controlled brightness, never blinding or washed out.
   */
  drawLivingRainbow(time) {
    const ctx = this.gridCtx;
    const w = this.gridCanvas.width;
    const h = this.gridCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const cells = GRID_SIZE;
    const step = w / cells;

    // 1. Deep Obsidian Cyber Base
    ctx.fillStyle = '#060914';
    ctx.fillRect(0, 0, w, h);

    // Smooth, majestic HSL rainbow cycle: Red (0) -> Orange (30) -> Yellow (60) -> Green (120) -> Cyan (180) -> Blue (240) -> Purple (280) -> Pink (320) -> Red (360)
    const baseHue = (time * 16) % 360;

    // 2. Soft, controlled flowing multi-directional linear rainbow glow
    const angle = time * 0.22;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const reach = w * 0.70;
    const x0 = cx - cosA * reach;
    const y0 = cy - sinA * reach;
    const x1 = cx + cosA * reach;
    const y1 = cy + sinA * reach;

    const flowGrad = ctx.createLinearGradient(x0, y0, x1, y1);
    flowGrad.addColorStop(0.00, `hsla(${baseHue}, 65%, 12%, 0.65)`);
    flowGrad.addColorStop(0.25, `hsla(${(baseHue + 45) % 360}, 68%, 14%, 0.70)`);
    flowGrad.addColorStop(0.50, `hsla(${(baseHue + 90) % 360}, 65%, 13%, 0.68)`);
    flowGrad.addColorStop(0.75, `hsla(${(baseHue + 140) % 360}, 68%, 14%, 0.70)`);
    flowGrad.addColorStop(1.00, `hsla(${(baseHue + 200) % 360}, 65%, 12%, 0.65)`);

    ctx.fillStyle = flowGrad;
    ctx.fillRect(0, 0, w, h);

    // 3. Gentle sweeping secondary organic radial glow
    const b1X = cx + Math.sin(time * 0.35) * (w * 0.25);
    const b1Y = cy + Math.cos(time * 0.30) * (h * 0.25);
    const g1 = ctx.createRadialGradient(b1X, b1Y, 20, b1X, b1Y, w * 0.50);
    g1.addColorStop(0.0, `hsla(${(baseHue + 60) % 360}, 72%, 18%, 0.28)`);
    g1.addColorStop(0.65, `hsla(${(baseHue + 120) % 360}, 68%, 14%, 0.12)`);
    g1.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    // 4. Counter-flowing complementary wave
    const b2X = cx - Math.sin(time * 0.30) * (w * 0.24);
    const b2Y = cy - Math.cos(time * 0.40) * (h * 0.24);
    const g2 = ctx.createRadialGradient(b2X, b2Y, 15, b2X, b2Y, w * 0.52);
    g2.addColorStop(0.0, `hsla(${(baseHue + 210) % 360}, 70%, 17%, 0.24)`);
    g2.addColorStop(0.65, `hsla(${(baseHue + 270) % 360}, 65%, 13%, 0.10)`);
    g2.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    // 5. Subtle, elegant spatial grid lines (Tactical, non-distracting, ultra-clean)
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';

    for (let i = 0; i <= cells; i++) {
      const pos = Math.round(i * step);
      ctx.beginPath();
      ctx.moveTo(pos + 0.5, 0);
      ctx.lineTo(pos + 0.5, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos + 0.5);
      ctx.lineTo(w, pos + 0.5);
      ctx.stroke();
    }

    // 6. Subtle intersection micro-dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    for (let i = 0; i <= cells; i++) {
      for (let j = 0; j <= cells; j++) {
        const px = i * step;
        const py = j * step;
        ctx.fillRect(px - 1, py - 1, 2, 2);
      }
    }

    // 7. Controlled Slim Neon Edge Border Bezel
    const borderGrad = ctx.createLinearGradient(0, 0, w, h);
    borderGrad.addColorStop(0.0, `hsla(${baseHue}, 85%, 52%, 0.75)`);
    borderGrad.addColorStop(0.33, `hsla(${(baseHue + 60) % 360}, 85%, 52%, 0.75)`);
    borderGrad.addColorStop(0.66, `hsla(${(baseHue + 120) % 360}, 85%, 52%, 0.75)`);
    borderGrad.addColorStop(1.0, `hsla(${(baseHue + 180) % 360}, 85%, 52%, 0.75)`);

    ctx.lineWidth = 4;
    ctx.strokeStyle = borderGrad;
    ctx.strokeRect(2, 2, w - 4, h - 4);

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
    // Redraw smooth living rainbow floor at 60 FPS
    this.pulseTime += deltaTime;
    const updateRate = 0.016;
    if (this.pulseTime >= updateRate) {
      this.drawLivingRainbow(time * (this.isOverdrive ? 1.4 : 1.0));
      this.pulseTime = 0;
    }

    // Sync platform rim glow to current rainbow cycle
    if (this.rimMat) {
      const rimHue = (time * 26 + 120) % 360;
      this.rimMat.emissive.setHSL(rimHue / 360, 1.0, 0.55);
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
