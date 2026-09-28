/**
 * Portal Mode Manager - 3D Dual Warp Portals
 * Teleportation mechanics, gyroscopic rotating vortex rings, dynamic lights, and safe routing
 */

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, ARENA_HALF_SIZE } from './Constants.js';

export class PortalManager {
  constructor(scene, particles, audio, sceneManager) {
    this.scene = scene;
    this.particles = particles;
    this.audio = audio;
    this.sceneManager = sceneManager;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.portals = [];
    this.cooldown = 0;
    this.relocateTimer = 26; // Relocate every 26 seconds
    this.teleportCount = 0;

    this.initPortals();
  }

  gridToWorld(gx, gz) {
    return {
      x: (gx + 0.5) * CELL_SIZE - ARENA_HALF_SIZE,
      y: 0.52,
      z: (gz + 0.5) * CELL_SIZE - ARENA_HALF_SIZE
    };
  }

  createPortalMesh(colorHex, name) {
    const portalGroup = new THREE.Group();

    // 1. Gyroscopic Outer Torus
    const ringGeo = new THREE.TorusGeometry(0.52, 0.055, 12, 28);
    const ringMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 2.2,
      metalness: 0.85,
      roughness: 0.15
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    portalGroup.add(ringMesh);

    // 2. Swirling Inner Energy Vortex Disc
    const vortexGeo = new THREE.RingGeometry(0.04, 0.46, 24);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.70,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
    portalGroup.add(vortexMesh);

    // 3. Ground Projector Disc
    const floorGeo = new THREE.RingGeometry(0.15, 0.65, 24);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.48;
    portalGroup.add(floorMesh);

    // 4. Orbiting Micro Motes
    const motes = [];
    const moteGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const moteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 3; i++) {
      const mote = new THREE.Mesh(moteGeo, moteMat);
      portalGroup.add(mote);
      motes.push({ mesh: mote, offset: (Math.PI * 2 * i) / 3 });
    }

    // 5. Dynamic Light
    const light = new THREE.PointLight(colorHex, 4.0, 7.0, 1.8);
    portalGroup.add(light);

    return {
      group: portalGroup,
      ringMesh,
      ringMat,
      vortexMesh,
      vortexMat,
      floorMesh,
      floorMat,
      motes,
      light,
      colorHex,
      name,
      grid: { x: 0, z: 0 }
    };
  }

  initPortals() {
    // Portal A: Electric Cyan (0x00f0ff)
    const portalA = this.createPortalMesh(0x00f0ff, 'ALPHA');
    this.group.add(portalA.group);
    this.portals.push(portalA);

    // Portal B: Neon Magenta / Hot Pink (0xff00aa)
    const portalB = this.createPortalMesh(0xff00aa, 'OMEGA');
    this.group.add(portalB.group);
    this.portals.push(portalB);

    this.spawnPortals();
  }

  spawnPortals(snake = null, food = null) {
    const emptyCells = [];
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let z = 1; z < GRID_SIZE - 1; z++) {
        if (snake && snake.isOccupied(x, z)) continue;
        if (food && food.gridPosition.x === x && food.gridPosition.z === z) continue;
        emptyCells.push({ x, z });
      }
    }

    if (emptyCells.length < 2) return;

    // Pick cell A
    const idxA = Math.floor(Math.random() * emptyCells.length);
    const posA = emptyCells.splice(idxA, 1)[0];

    // Pick cell B separated by at least 7 units
    let posB = null;
    for (let i = 0; i < emptyCells.length; i++) {
      const candidate = emptyCells[i];
      const dist = Math.abs(candidate.x - posA.x) + Math.abs(candidate.z - posA.z);
      if (dist >= 7) {
        posB = candidate;
        break;
      }
    }
    if (!posB) posB = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    this.portals[0].grid = { ...posA };
    const wA = this.gridToWorld(posA.x, posA.z);
    this.portals[0].group.position.set(wA.x, wA.y, wA.z);

    this.portals[1].grid = { ...posB };
    const wB = this.gridToWorld(posB.x, posB.z);
    this.portals[1].group.position.set(wB.x, wB.y, wB.z);

    // Poof particles on spawn
    if (this.particles) {
      this.particles.spawnBurst(wA, this.portals[0].colorHex, 25, 1.2);
      this.particles.spawnBurst(wB, this.portals[1].colorHex, 25, 1.2);
    }
  }

  checkTeleport(headGrid, currentDir, snake) {
    if (this.cooldown > 0) return null;

    for (let i = 0; i < this.portals.length; i++) {
      const p = this.portals[i];
      if (headGrid.x === p.grid.x && headGrid.z === p.grid.z) {
        const otherPortal = this.portals[1 - i];
        const destGrid = { ...otherPortal.grid };

        // Determine safe exit direction
        let safeDir = currentDir;
        const testNext = { x: destGrid.x + currentDir.x, z: destGrid.z + currentDir.z };
        const wouldHitSelf = snake && snake.isOccupied(testNext.x, testNext.z);
        const wouldHitWall = testNext.x < 0 || testNext.x >= GRID_SIZE || testNext.z < 0 || testNext.z >= GRID_SIZE;

        if (wouldHitSelf || wouldHitWall) {
          // Find open direction
          const allDirs = [
            { x: 0, z: -1 }, // UP
            { x: 0, z: 1 },  // DOWN
            { x: -1, z: 0 }, // LEFT
            { x: 1, z: 0 }   // RIGHT
          ];
          const valid = allDirs.filter(d => {
            const nx = destGrid.x + d.x;
            const nz = destGrid.z + d.z;
            return nx >= 0 && nx < GRID_SIZE && nz >= 0 && nz < GRID_SIZE && (!snake || !snake.isOccupied(nx, nz));
          });
          if (valid.length > 0) {
            safeDir = valid[0];
          }
        }

        // Set cooldown (e.g. 2 full moves)
        this.cooldown = 0.35;
        this.teleportCount++;

        // Effects
        const fromPos = this.gridToWorld(p.grid.x, p.grid.z);
        const toPos = this.gridToWorld(destGrid.x, destGrid.z);

        if (this.particles) {
          this.particles.spawnBurst(fromPos, p.colorHex, 45, 1.5);
          this.particles.spawnBurst(toPos, otherPortal.colorHex, 50, 1.8);
        }
        if (this.sceneManager) {
          this.sceneManager.triggerShake(0.35);
          this.sceneManager.triggerPunch();
        }
        if (this.audio) {
          this.audio.playPortalTeleport();
        }

        return {
          teleported: true,
          from: p.name,
          to: otherPortal.name,
          destGrid,
          exitDir: safeDir
        };
      }
    }

    return null;
  }

  update(time, deltaTime, snake = null, food = null) {
    if (this.cooldown > 0) {
      this.cooldown -= deltaTime;
    }

    // Relocation countdown
    this.relocateTimer -= deltaTime;
    if (this.relocateTimer <= 0) {
      this.spawnPortals(snake, food);
      this.relocateTimer = 26;
    }

    // Animate portals
    this.portals.forEach((p, idx) => {
      const dir = idx === 0 ? 1 : -1;
      p.ringMesh.rotation.z += 2.2 * dir * deltaTime;
      p.ringMesh.rotation.y = Math.sin(time * 2 + idx) * 0.25;

      p.vortexMesh.rotation.z -= 3.5 * dir * deltaTime;
      const pulse = 1.0 + Math.sin(time * 6 + idx * 2) * 0.12;
      p.vortexMesh.scale.set(pulse, pulse, pulse);

      p.floorMesh.rotation.z += 0.8 * dir * deltaTime;
      p.floorMat.opacity = 0.35 + Math.sin(time * 5 + idx) * 0.15;

      p.light.intensity = 3.6 + Math.sin(time * 7 + idx) * 0.8;

      // Orbiting micro motes
      p.motes.forEach(m => {
        const ang = time * 3.5 * dir + m.offset;
        m.mesh.position.set(Math.cos(ang) * 0.65, Math.sin(ang) * 0.65, Math.sin(ang * 2) * 0.12);
      });
    });
  }

  destroy() {
    for (let i = this.group.children.length - 1; i >= 0; i--) {
      const child = this.group.children[i];
      this.group.remove(child);
    }
    this.scene.remove(this.group);
    this.portals = [];
  }
}
