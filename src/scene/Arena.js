/**
 * Floating Sci-Fi Arena, Vibrant Cyberpunk Floor, Animated Grid, Cosmic Nebulae & Starfield
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
    this.nebulae = [];

    this.pulseTime = 0;
    this.warningIntensity = 0;
    this.arenaEnergy = 1.0;

    this.initPlatform();
    this.initGridFloor();
    this.initPerimeterAura();
    this.initLaserWalls();
    this.initCornerPylons();
    this.initCosmicSky();
  }

  initPlatform() {
    const size = GRID_SIZE * CELL_SIZE;
    const thickness = 1.4;

    // Platform base (dark futuristic metallic chassis with beveled cyber edging)
    const baseGeo = new THREE.BoxGeometry(size + 0.8, thickness, size + 0.8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x050818,
      metalness: 0.9,
      roughness: 0.25
    });
    const platformBase = new THREE.Mesh(baseGeo, baseMat);
    platformBase.position.y = -thickness / 2;
    this.arenaGroup.add(platformBase);

    // Glowing dual-tone neon perimeter bezel (Cyan & Hot Pink)
    const rimGeo = new THREE.BoxGeometry(size + 1.1, 0.16, size + 1.1);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x0a1030,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.8,
      metalness: 0.95,
      roughness: 0.15
    });
    this.rimMesh = new THREE.Mesh(rimGeo, rimMat);
    this.rimMesh.position.y = 0.02;
    this.arenaGroup.add(this.rimMesh);

    // Sub-platform floating exhaust glow (glowing cyber reactor beneath the arena)
    const engineGeo = new THREE.CylinderGeometry(size * 0.42, size * 0.48, 0.7, 24);
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x020410,
      emissive: 0x7b1fa2,
      emissiveIntensity: 1.2,
      metalness: 0.9
    });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.y = -thickness - 0.35;
    this.arenaGroup.add(engine);

    // Ion reactor glow ring
    const thrusterRingGeo = new THREE.TorusGeometry(size * 0.35, 0.12, 12, 32);
    thrusterRingGeo.rotateX(Math.PI / 2);
    const thrusterMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });
    const thruster = new THREE.Mesh(thrusterRingGeo, thrusterMat);
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
      roughness: 0.16, // High gloss for beautiful reflections!
      metalness: 0.82,
      transparent: false
    });

    const floor = new THREE.Mesh(floorGeo, this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01;
    this.arenaGroup.add(floor);

    this.drawGrid(0);
  }

  initPerimeterAura() {
    // Soft outer neon glow aura framing the arena
    const size = GRID_SIZE * CELL_SIZE + 0.4;
    const auraGeo = new THREE.RingGeometry(size / 2 - 0.2, size / 2 + 1.2, 4, 1);
    auraGeo.rotateX(-Math.PI / 2);
    auraGeo.rotateY(Math.PI / 4);

    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.auraMesh.position.y = 0.04;
    this.arenaGroup.add(this.auraMesh);
  }

  /**
   * Vibrant Cyberpunk Ground Texture Generation:
   * Deep Purple -> Electric Blue -> Radiant Cyan Gradient
   * Pulsing neon grid lines, circuit nodes, and traveling energy pulses
   */
  drawGrid(time) {
    const ctx = this.gridCtx;
    const w = this.gridCanvas.width;
    const h = this.gridCanvas.height;
    const cells = GRID_SIZE;
    const step = w / cells;

    // 1. Vibrant Cyberpunk Multi-stop Gradient Background
    // Deep Indigo/Purple -> Electric Blue -> Radiant Cyan accents
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.72);
    bgGrad.addColorStop(0, '#1c0038');     // Vivid deep royal purple core
    bgGrad.addColorStop(0.35, '#120042');  // Electric indigo
    bgGrad.addColorStop(0.70, '#001a5e');  // Deep electric blue
    bgGrad.addColorStop(1.0, '#000c28');   // Cyber navy edge
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle diagonal energy sheen
    const sheenGrad = ctx.createLinearGradient(0, 0, w, h);
    sheenGrad.addColorStop(0, 'rgba(157, 0, 255, 0.18)'); // Purple glow
    sheenGrad.addColorStop(0.5, 'rgba(0, 102, 255, 0.12)'); // Blue glow
    sheenGrad.addColorStop(1, 'rgba(0, 240, 255, 0.18)'); // Cyan glow
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Soft Under-glow Grid Lines
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
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

    // 3. Crisp Core Neon Grid Lines (Alternating Cyan & Violet)
    for (let i = 0; i <= cells; i++) {
      const pos = i * step;
      ctx.lineWidth = (i % 5 === 0) ? 2.5 : 1.4;
      ctx.strokeStyle = (i % 2 === 0) ? 'rgba(0, 240, 255, 0.65)' : 'rgba(180, 0, 255, 0.50)';

      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(w, pos);
      ctx.stroke();
    }

    // 4. Multi-directional Animated Energy Waves
    // Horizontal cyan pulse
    const wave1 = (time * 0.9) % 1.0;
    const waveX = wave1 * w;
    const pulseGradX = ctx.createLinearGradient(waveX - 90, 0, waveX + 90, 0);
    pulseGradX.addColorStop(0, 'rgba(0, 240, 255, 0)');
    pulseGradX.addColorStop(0.5, 'rgba(0, 240, 255, 0.75)');
    pulseGradX.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = pulseGradX;
    ctx.fillRect(waveX - 90, 0, 180, h);

    // Vertical magenta pulse
    const wave2 = (time * 0.65 + 0.4) % 1.0;
    const waveY = wave2 * h;
    const pulseGradY = ctx.createLinearGradient(0, waveY - 80, 0, waveY + 80);
    pulseGradY.addColorStop(0, 'rgba(255, 0, 160, 0)');
    pulseGradY.addColorStop(0.5, 'rgba(255, 0, 160, 0.65)');
    pulseGradY.addColorStop(1, 'rgba(255, 0, 160, 0)');
    ctx.fillStyle = pulseGradY;
    ctx.fillRect(0, waveY - 80, w, 160);

    // 5. Glowing Intersection Circuit Dots & Crosshairs
    for (let i = 0; i <= cells; i++) {
      for (let j = 0; j <= cells; j++) {
        const cx = i * step;
        const cy = j * step;

        if (i % 2 === 0 && j % 2 === 0) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255, 0, 128, 0.35)';
          ctx.beginPath();
          ctx.arc(cx, cy, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 6. Perimeter Glowing Border Aura
    const borderGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.42, w / 2, h / 2, w * 0.50);
    borderGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    borderGrad.addColorStop(0.85, 'rgba(0, 240, 255, 0.45)');
    borderGrad.addColorStop(1.0, 'rgba(255, 0, 128, 0.8)');
    ctx.lineWidth = 10;
    ctx.strokeStyle = borderGrad;
    ctx.strokeRect(5, 5, w - 10, h - 10);

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
        opacity: 0.38,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.wallMaterials.push(mat);
      return mat;
    };

    const wallDefs = [
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [0, wallHeight / 2, -half], rot: [0, 0, 0], col: 0x00f0ff, glow: 0x00aaff },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [0, wallHeight / 2, half], rot: [0, Math.PI, 0], col: 0xff0088, glow: 0xff00aa },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [-half, wallHeight / 2, 0], rot: [0, Math.PI / 2, 0], col: 0x9d00ff, glow: 0x6e00ff },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [half, wallHeight / 2, 0], rot: [0, -Math.PI / 2, 0], col: 0x00f0ff, glow: 0x00e5ff }
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
      { pos: [-half, -half], color: 0x00f0ff, name: 'cyan' },
      { pos: [half, -half], color: 0xff0088, name: 'pink' },
      { pos: [half, half], color: 0xffea00, name: 'yellow' },
      { pos: [-half, half], color: 0x9d00ff, name: 'purple' }
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

      // Rotating faceted beacon crystal
      const crystalMat = new THREE.MeshStandardMaterial({
        color: corner.color,
        emissive: corner.color,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.8
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 0.95;
      group.add(crystal);

      // Vertical neon light beam
      const beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 6, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: corner.color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 3.9;
      group.add(beam);

      this.pylonLights.push({ crystal, beam, color: corner.color });
      this.arenaGroup.add(group);
    });
  }

  initCosmicSky() {
    // 1. Multi-colored starry galaxy
    const starCount = 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xff00aa), // Hot pink
      new THREE.Color(0xffea00), // Electric yellow
      new THREE.Color(0xaa44ff), // Lavender
      new THREE.Color(0xffffff), // Diamond white
      new THREE.Color(0x3388ff)  // Royal blue
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 65 + Math.random() * 95;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.max(4, radius * Math.cos(phi));
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const picked = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = picked.r;
      colors[i * 3 + 1] = picked.g;
      colors[i * 3 + 2] = picked.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(geometry, starMaterial);
    this.scene.add(this.stars);

    // 2. Distant Cosmic Nebulae Clouds (glowing purple and cyan gas clouds)
    const nebulaeColors = [0x9d00ff, 0x00f0ff, 0xff0088];
    nebulaeColors.forEach((col, idx) => {
      const nGeo = new THREE.SphereGeometry(18, 16, 16);
      const nMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.035,
        wireframe: true,
        blending: THREE.AdditiveBlending
      });
      const nebula = new THREE.Mesh(nGeo, nMat);
      nebula.position.set(
        Math.cos(idx * 2.1) * 60,
        15 + idx * 8,
        Math.sin(idx * 2.1) * 60
      );
      this.scene.add(nebula);
      this.nebulae.push(nebula);
    });
  }

  setWarning(intensity) {
    this.warningIntensity = THREE.MathUtils.clamp(intensity, 0, 1);
  }

  setIntensity(level = 1) {
    this.arenaEnergy = 1.0 + (level - 1) * 0.15;
  }

  update(time, deltaTime) {
    // Redraw grid pulse at smooth 25 FPS
    this.pulseTime += deltaTime;
    if (this.pulseTime > 0.04) {
      this.drawGrid(time);
      this.pulseTime = 0;
    }

    // Slowly rotate celestial starfield & nebulae
    if (this.stars) {
      this.stars.rotation.y = time * 0.02;
    }
    this.nebulae.forEach((neb, i) => {
      neb.rotation.y = time * 0.03 * (i % 2 === 0 ? 1 : -1);
      neb.rotation.x = Math.sin(time * 0.2 + i) * 0.1;
    });

    // Rotate corner beacon crystals & beams
    this.pylonLights.forEach((pylon, idx) => {
      pylon.crystal.rotation.y = time * 2.5 + idx;
      pylon.crystal.rotation.x = Math.sin(time * 1.5 + idx) * 0.4;
      pylon.beam.scale.x = Math.sin(time * 4 + idx) * 0.3 + 1.0;
      pylon.beam.scale.z = pylon.beam.scale.x;
    });

    // Animate perimeter aura
    if (this.auraMesh) {
      this.auraMesh.material.opacity = 0.20 + Math.sin(time * 4) * 0.08;
    }

    // Animate walls & warning pulse
    const baseOpacity = 0.35 + Math.sin(time * 3.5) * 0.1;
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
