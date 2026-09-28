/**
 * Floating Sci-Fi Arena, Animated Cyber Grid, Starfield, and Laser Boundaries
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

    this.pulseTime = 0;
    this.warningIntensity = 0;

    this.initPlatform();
    this.initGridFloor();
    this.initLaserWalls();
    this.initCornerPylons();
    this.initStarfield();
  }

  initPlatform() {
    const size = GRID_SIZE * CELL_SIZE;
    const thickness = 1.2;

    // Platform base (dark futuristic metallic chassis)
    const baseGeo = new THREE.BoxGeometry(size + 0.6, thickness, size + 0.6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x050814,
      metalness: 0.85,
      roughness: 0.35
    });
    const platformBase = new THREE.Mesh(baseGeo, baseMat);
    platformBase.position.y = -thickness / 2;
    this.arenaGroup.add(platformBase);

    // Glowing rim chamfer around the platform edge
    const rimGeo = new THREE.BoxGeometry(size + 0.9, 0.15, size + 0.9);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x030611,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.2
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.02;
    this.arenaGroup.add(rimMesh);

    // Sub-platform floating exhaust glows (cyber engine underneath)
    const engineGeo = new THREE.CylinderGeometry(size * 0.4, size * 0.45, 0.6, 16);
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x02040a,
      emissive: 0x6e00ff,
      emissiveIntensity: 0.8,
      metalness: 0.9
    });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.y = -thickness - 0.3;
    this.arenaGroup.add(engine);
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
      roughness: 0.3,
      metalness: 0.7,
      transparent: false
    });

    const floor = new THREE.Mesh(floorGeo, this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.01; // Slightly above platform base
    this.arenaGroup.add(floor);

    this.drawGrid(0);
  }

  drawGrid(time) {
    const ctx = this.gridCtx;
    const w = this.gridCanvas.width;
    const h = this.gridCanvas.height;
    const cells = GRID_SIZE;
    const step = w / cells;

    // Dark cyber navy background
    ctx.fillStyle = '#060a18';
    ctx.fillRect(0, 0, w, h);

    // Subtle dark sub-grid tiles
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(16, 32, 68, 0.7)';

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

    // Dynamic animated glowing wave across grid lines
    const wave = (time * 0.8) % 1.0;
    const waveX = wave * w;
    const grad = ctx.createLinearGradient(waveX - 80, 0, waveX + 80, 0);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(waveX - 80, 0, 160, h);

    // Grid junction dots
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    for (let i = 0; i <= cells; i++) {
      for (let j = 0; j <= cells; j++) {
        ctx.beginPath();
        ctx.arc(i * step, j * step, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer border ring
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.strokeRect(3, 3, w - 6, h - 6);

    this.gridTexture.needsUpdate = true;
  }

  initLaserWalls() {
    const size = GRID_SIZE * CELL_SIZE;
    const wallHeight = 0.8;
    const half = ARENA_HALF_SIZE;

    // Custom glowing laser barrier material
    const createWallMat = () => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      this.wallMaterials.push(mat);
      return mat;
    };

    const wallDefs = [
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [0, wallHeight / 2, -half], rot: [0, 0, 0] },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [0, wallHeight / 2, half], rot: [0, Math.PI, 0] },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [-half, wallHeight / 2, 0], rot: [0, Math.PI / 2, 0] },
      { geo: new THREE.PlaneGeometry(size, wallHeight), pos: [half, wallHeight / 2, 0], rot: [0, -Math.PI / 2, 0] }
    ];

    wallDefs.forEach((def) => {
      const mesh = new THREE.Mesh(def.geo, createWallMat());
      mesh.position.set(...def.pos);
      mesh.rotation.set(...def.rot);
      this.arenaGroup.add(mesh);
    });

    // Glowing laser top railings
    const railMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const hRailGeo = new THREE.CylinderGeometry(0.04, 0.04, size, 8);

    // North & South
    const railN = new THREE.Mesh(hRailGeo, railMat);
    railN.rotation.z = Math.PI / 2;
    railN.position.set(0, wallHeight, -half);
    this.arenaGroup.add(railN);

    const railS = new THREE.Mesh(hRailGeo, railMat);
    railS.rotation.z = Math.PI / 2;
    railS.position.set(0, wallHeight, half);
    this.arenaGroup.add(railS);

    // West & East
    const railW = new THREE.Mesh(hRailGeo, railMat);
    railW.rotation.x = Math.PI / 2;
    railW.position.set(-half, wallHeight, 0);
    this.arenaGroup.add(railW);

    const railE = new THREE.Mesh(hRailGeo, railMat);
    railE.rotation.x = Math.PI / 2;
    railE.position.set(half, wallHeight, 0);
    this.arenaGroup.add(railE);
  }

  initCornerPylons() {
    const half = ARENA_HALF_SIZE;
    const corners = [
      [-half, -half],
      [half, -half],
      [half, half],
      [-half, half]
    ];

    const pylonGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.2, 8);
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x081028,
      metalness: 0.9,
      roughness: 0.2
    });

    const crystalGeo = new THREE.OctahedronGeometry(0.18, 0);

    corners.forEach(([x, z], idx) => {
      const group = new THREE.Group();
      group.position.set(x, 0.6, z);

      const base = new THREE.Mesh(pylonGeo, pylonMat);
      group.add(base);

      const crystalMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? PALETTE.CYAN : PALETTE.MAGENTA
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 0.8;
      group.add(crystal);

      this.pylonLights.push(crystal);
      this.arenaGroup.add(group);
    });
  }

  initStarfield() {
    const starCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorPalette = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xffffff), // White
      new THREE.Color(0xa0c0ff), // Pale blue
      new THREE.Color(0xff00cc)  // Magenta
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.max(5, radius * Math.cos(phi)); // Keep mostly above arena
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const picked = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = picked.r;
      colors[i * 3 + 1] = picked.g;
      colors[i * 3 + 2] = picked.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.7,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.stars = new THREE.Points(geometry, starMaterial);
    this.scene.add(this.stars);
  }

  setWarning(intensity) {
    this.warningIntensity = THREE.MathUtils.clamp(intensity, 0, 1);
  }

  update(time, deltaTime) {
    // Redraw grid pulse at a smooth interval
    this.pulseTime += deltaTime;
    if (this.pulseTime > 0.04) {
      this.drawGrid(time);
      this.pulseTime = 0;
    }

    // Slowly rotate starfield
    if (this.stars) {
      this.stars.rotation.y = time * 0.015;
    }

    // Rotate corner crystals
    this.pylonLights.forEach((crystal, idx) => {
      crystal.rotation.y = time * 2.0 + idx;
      crystal.rotation.x = Math.sin(time + idx) * 0.3;
    });

    // Animate walls & warning pulse
    const baseOpacity = 0.28 + Math.sin(time * 3) * 0.08;
    this.wallMaterials.forEach((mat) => {
      if (this.warningIntensity > 0.1) {
        mat.color.setHex(PALETTE.RED_ALERT);
        mat.emissive.setHex(PALETTE.RED_ALERT);
        mat.opacity = 0.4 + this.warningIntensity * 0.4 * (Math.sin(time * 12) * 0.5 + 0.5);
      } else {
        mat.color.setHex(PALETTE.CYAN);
        mat.emissive.setHex(PALETTE.CYAN);
        mat.opacity = baseOpacity;
      }
    });
  }
}
