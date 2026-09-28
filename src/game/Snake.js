/**
 * Advanced Futuristic 3D Cyber Snake
 * Dynamic rainbow color-shifting body, unique cyber head with glowing visor eyes,
 * traveling light wave pulses, translucent energy shield bubble, and thruster trails
 */

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, ARENA_HALF_SIZE, DIRECTIONS, PALETTE } from './Constants.js';

export class Snake {
  constructor(scene, particles) {
    this.scene = scene;
    this.particles = particles;

    this.snakeGroup = new THREE.Group();
    this.scene.add(this.snakeGroup);

    this.body = [];
    this.prevBody = [];
    this.direction = DIRECTIONS.RIGHT;
    this.growPending = 0;
    this.isDead = false;

    // Power-up states
    this.hasShield = false;
    this.isTurbo = false;

    // Segment 3D Meshes
    this.meshes = [];
    this.headMesh = null;
    this.headLight = null;
    this.shieldMesh = null;

    // Scatter debris on death
    this.debris = [];

    // Visual energy surge on food collect
    this.surgeTime = 0;

    this.initGeometriesAndMaterials();
    this.reset();
  }

  initGeometriesAndMaterials() {
    // 1. Head mesh components
    this.headGeo = new THREE.BoxGeometry(0.90, 0.60, 1.02);
    this.headMat = new THREE.MeshStandardMaterial({
      color: 0x050c20,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x004488,
      emissiveIntensity: 0.7
    });

    // Visor LED eyes
    this.eyeGeo = new THREE.BoxGeometry(0.24, 0.12, 0.16);
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // Side cheek neon accents
    this.finGeo = new THREE.BoxGeometry(0.08, 0.28, 0.65);
    this.finMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });

    // 2. Body segment geometry
    this.segmentGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.70, 14);
    this.segmentGeo.rotateX(Math.PI / 2);

    this.ringGeo = new THREE.TorusGeometry(0.45, 0.07, 8, 24);

    this.chassisMat = new THREE.MeshStandardMaterial({
      color: 0x071026,
      metalness: 0.92,
      roughness: 0.18
    });

    // 3. Aegis Shield Bubble (translucent glowing sphere)
    const shieldGeo = new THREE.SphereGeometry(0.95, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
      blending: THREE.AdditiveBlending
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.visible = false;
    this.snakeGroup.add(this.shieldMesh);
  }

  gridToWorld(gx, gz) {
    return {
      x: (gx + 0.5) * CELL_SIZE - ARENA_HALF_SIZE,
      y: 0.38,
      z: (gz + 0.5) * CELL_SIZE - ARENA_HALF_SIZE
    };
  }

  reset(startGridX = 5, startGridZ = 10, initialLength = 3, initialDir = DIRECTIONS.RIGHT) {
    this.isDead = false;
    this.direction = initialDir;
    this.growPending = 0;
    this.surgeTime = 0;
    this.hasShield = false;
    this.isTurbo = false;

    if (this.shieldMesh) this.shieldMesh.visible = false;

    this.clearMeshes();
    this.clearDebris();

    this.body = [];
    this.prevBody = [];

    for (let i = 0; i < initialLength; i++) {
      const pos = { x: startGridX - i * initialDir.x, z: startGridZ - i * initialDir.z };
      this.body.push({ ...pos });
      this.prevBody.push({ ...pos });
    }

    this.buildMeshes();
  }

  clearMeshes() {
    // Keep shieldMesh in group, remove others
    for (let i = this.snakeGroup.children.length - 1; i >= 0; i--) {
      const child = this.snakeGroup.children[i];
      if (child !== this.shieldMesh) {
        this.snakeGroup.remove(child);
      }
    }
    this.meshes = [];
    this.headMesh = null;
    this.headLight = null;
  }

  clearDebris() {
    this.debris.forEach(d => this.scene.remove(d.mesh));
    this.debris = [];
  }

  createHeadMesh() {
    const group = new THREE.Group();

    // Cyber skull
    const mainHead = new THREE.Mesh(this.headGeo, this.headMat);
    group.add(mainHead);

    // Aerodynamic tapered nose cone
    const noseGeo = new THREE.ConeGeometry(0.40, 0.56, 4);
    noseGeo.rotateX(-Math.PI / 2);
    noseGeo.rotateY(Math.PI / 4);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x030818,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.0
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = -0.70;
    group.add(nose);

    // Dual glowing neon eyes
    const leftEye = new THREE.Mesh(this.eyeGeo, this.eyeMat);
    leftEye.position.set(-0.28, 0.14, -0.52);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(this.eyeGeo, this.eyeMat);
    rightEye.position.set(0.28, 0.14, -0.52);
    group.add(rightEye);

    // Side fin accents
    const leftFin = new THREE.Mesh(this.finGeo, this.finMat);
    leftFin.position.set(-0.48, 0.06, 0.05);
    group.add(leftFin);

    const rightFin = new THREE.Mesh(this.finGeo, this.finMat);
    rightFin.position.set(0.48, 0.06, 0.05);
    group.add(rightFin);

    // Dynamic headlight casting pool ahead
    this.headLight = new THREE.PointLight(0x00f0ff, 4.0, 9, 2);
    this.headLight.position.set(0, 0.35, -0.75);
    group.add(this.headLight);

    return group;
  }

  createSegmentMesh(index) {
    const group = new THREE.Group();

    // Chassis core
    const core = new THREE.Mesh(this.segmentGeo, this.chassisMat);
    group.add(core);

    // Dynamic glowing neon ring with unique material per segment
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.3,
      metalness: 0.85,
      roughness: 0.15
    });

    const ring = new THREE.Mesh(this.ringGeo, ringMat);
    group.add(ring);

    return { group, ringMat, core };
  }

  buildMeshes() {
    this.clearMeshes();

    for (let i = 0; i < this.body.length; i++) {
      if (i === 0) {
        this.headMesh = this.createHeadMesh();
        const worldPos = this.gridToWorld(this.body[0].x, this.body[0].z);
        this.headMesh.position.set(worldPos.x, worldPos.y, worldPos.z);
        this.headMesh.rotation.y = this.direction.angle;
        this.snakeGroup.add(this.headMesh);
        this.meshes.push(this.headMesh);
      } else {
        const seg = this.createSegmentMesh(i);
        const worldPos = this.gridToWorld(this.body[i].x, this.body[i].z);
        seg.group.position.set(worldPos.x, worldPos.y, worldPos.z);
        this.snakeGroup.add(seg.group);
        this.meshes.push(seg);
      }
    }
  }

  grow(count = 1) {
    this.growPending += count;
  }

  triggerSurge() {
    this.surgeTime = 0.5;
  }

  setShield(active) {
    this.hasShield = active;
    if (this.shieldMesh) {
      this.shieldMesh.visible = active;
    }
  }

  setTurbo(active) {
    this.isTurbo = active;
  }

  tick(nextDir) {
    if (this.isDead) return;

    if (nextDir) {
      this.direction = nextDir;
    }

    this.prevBody = this.body.map(seg => ({ ...seg }));

    const newHead = {
      x: this.body[0].x + this.direction.x,
      z: this.body[0].z + this.direction.z
    };

    this.body.unshift(newHead);

    if (this.growPending > 0) {
      this.growPending--;
      const newIdx = this.body.length - 1;
      const seg = this.createSegmentMesh(newIdx);
      const tailPos = this.gridToWorld(this.body[newIdx].x, this.body[newIdx].z);
      seg.group.position.set(tailPos.x, tailPos.y, tailPos.z);
      this.snakeGroup.add(seg.group);
      this.meshes.push(seg);
      this.prevBody.push({ ...this.body[newIdx] });
    } else {
      this.body.pop();
    }
  }

  checkWallCollision() {
    const head = this.body[0];
    return head.x < 0 || head.x >= GRID_SIZE || head.z < 0 || head.z >= GRID_SIZE;
  }

  checkSelfCollision() {
    const head = this.body[0];
    for (let i = 1; i < this.body.length; i++) {
      if (head.x === this.body[i].x && head.z === this.body[i].z) {
        return true;
      }
    }
    return false;
  }

  isOccupied(gx, gz) {
    return this.body.some(seg => seg.x === gx && seg.z === gz);
  }

  getHeadGrid() {
    return this.body[0] || { x: 0, z: 0 };
  }

  getHeadWorldPosition() {
    if (this.headMesh) {
      return this.headMesh.position;
    }
    const head = this.getHeadGrid();
    return this.gridToWorld(head.x, head.z);
  }

  explode() {
    this.isDead = true;

    this.meshes.forEach((meshItem, idx) => {
      const mesh = idx === 0 ? meshItem : meshItem.group;
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);

      const clone = mesh.clone();
      clone.position.copy(worldPos);
      this.scene.add(clone);

      const angle = Math.random() * Math.PI * 2;
      const force = Math.random() * 5 + 3.5;

      this.debris.push({
        mesh: clone,
        vx: Math.cos(angle) * force,
        vy: Math.random() * 6 + 3.5,
        vz: Math.sin(angle) * force,
        rotX: (Math.random() - 0.5) * 12,
        rotY: (Math.random() - 0.5) * 12,
        rotZ: (Math.random() - 0.5) * 12,
        life: 0,
        maxLife: 2.0
      });
    });

    this.snakeGroup.visible = false;
  }

  update(alpha, time, deltaTime) {
    if (this.isDead) {
      this.debris.forEach(d => {
        d.life += deltaTime;
        d.vy -= 9.8 * deltaTime * 1.6;
        d.mesh.position.x += d.vx * deltaTime;
        d.mesh.position.y += d.vy * deltaTime;
        d.mesh.position.z += d.vz * deltaTime;

        d.mesh.rotation.x += d.rotX * deltaTime;
        d.mesh.rotation.y += d.rotY * deltaTime;
        d.mesh.rotation.z += d.rotZ * deltaTime;

        if (d.mesh.position.y < 0.15) {
          d.mesh.position.y = 0.15;
          d.vy = -d.vy * 0.35;
          d.vx *= 0.75;
          d.vz *= 0.75;
        }

        const fade = Math.max(0, 1.0 - d.life / d.maxLife);
        d.mesh.scale.set(fade, fade, fade);
      });
      return;
    }

    this.snakeGroup.visible = true;

    if (this.surgeTime > 0) {
      this.surgeTime -= deltaTime;
    }

    const surgeGlow = Math.max(0, this.surgeTime * 3.5);
    const lengthGlow = Math.min(0.6, (this.body.length - 3) * 0.025);

    // Global shifting color cycle
    const baseHue = (time * 30) % 360;

    // Smoothly interpolate visual positions
    for (let i = 0; i < this.body.length && i < this.meshes.length; i++) {
      const curGrid = this.body[i];
      const prevGrid = this.prevBody[i] || curGrid;

      const pPos = this.gridToWorld(prevGrid.x, prevGrid.z);
      const cPos = this.gridToWorld(curGrid.x, curGrid.z);

      const curMesh = i === 0 ? this.headMesh : this.meshes[i].group;

      if (curMesh) {
        curMesh.position.x = THREE.MathUtils.lerp(pPos.x, cPos.x, alpha);
        curMesh.position.z = THREE.MathUtils.lerp(pPos.z, cPos.z, alpha);

        // Gentle breathing pulse down the body
        const wave = Math.sin(time * 7 - i * 0.45);
        curMesh.position.y = pPos.y + wave * 0.04;

        if (i === 0) {
          const targetRot = this.direction.angle;
          let diff = targetRot - curMesh.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          curMesh.rotation.y += diff * Math.min(1.0, deltaTime * 18);

          if (this.headLight) {
            this.headLight.intensity = (this.isTurbo ? 5.5 : 3.8) + wave * 0.6 + surgeGlow;
          }

          // Follow shield bubble to head position
          if (this.shieldMesh && this.shieldMesh.visible) {
            this.shieldMesh.position.copy(curMesh.position);
            this.shieldMesh.rotation.y = time * 2;
            this.shieldMesh.rotation.x = Math.sin(time) * 0.3;
          }
        } else {
          // Orient segment
          const aheadGrid = this.body[i - 1];
          const segDirX = aheadGrid.x - curGrid.x;
          const segDirZ = aheadGrid.z - curGrid.z;
          let segAngle = 0;
          if (segDirX === 1) segAngle = -Math.PI / 2;
          else if (segDirX === -1) segAngle = Math.PI / 2;
          else if (segDirZ === 1) segAngle = Math.PI;
          curMesh.rotation.y = segAngle;

          // DYNAMIC RAINBOW COLOR SHIFTING ALONG THE BODY
          const seg = this.meshes[i];
          if (seg && seg.ringMat) {
            const segHue = (baseHue + i * 16) % 360;
            seg.ringMat.color.setHSL(segHue / 360, 1.0, 0.55);
            seg.ringMat.emissive.setHSL(segHue / 360, 1.0, 0.55);
            seg.ringMat.emissiveIntensity = 1.1 + wave * 0.35 + surgeGlow + lengthGlow;
          }
        }
      }
    }

    // Continuous glowing thruster tail trail with matching rainbow color
    if (this.body.length > 0 && this.particles) {
      const tailIdx = this.meshes.length - 1;
      const tailMesh = this.meshes[tailIdx];
      const tailPos = tailMesh ? (tailMesh.group ? tailMesh.group.position : tailMesh.position) : null;
      if (tailPos) {
        const trailHue = (baseHue + tailIdx * 16) % 360;
        const trailColor = new THREE.Color().setHSL(trailHue / 360, 1.0, 0.55).getHex();
        this.particles.spawnTrailMote(tailPos, trailColor);

        // Extra turbo sparks if turbo is active
        if (this.isTurbo) {
          this.particles.spawnTrailMote(tailPos, 0xffea00);
        }
      }
    }
  }
}
