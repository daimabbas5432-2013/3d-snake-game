/**
 * 3D Cyber Snake
 * Multi-colored glowing gradient, faceted aerodynamic cyber head with illuminated eyes,
 * traveling light pulses, continuous energy thruster trail, and death physics
 */

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, ARENA_HALF_SIZE, DIRECTIONS, PALETTE } from './Constants.js';

export class Snake {
  constructor(scene, particles) {
    this.scene = scene;
    this.particles = particles;

    this.snakeGroup = new THREE.Group();
    this.scene.add(this.snakeGroup);

    // Logical grid positions
    this.body = [];
    this.prevBody = [];
    this.direction = DIRECTIONS.RIGHT;
    this.growPending = 0;
    this.isDead = false;

    // Segment 3D Meshes
    this.meshes = [];
    this.headMesh = null;
    this.headLight = null;

    // Scatter debris on death
    this.debris = [];

    // Visual energy surge on food collect
    this.surgeTime = 0;

    // Shared materials & geometries
    this.initGeometriesAndMaterials();
    this.reset();
  }

  initGeometriesAndMaterials() {
    // 1. Head mesh components
    this.headGeo = new THREE.BoxGeometry(0.88, 0.58, 0.98);
    this.headMat = new THREE.MeshStandardMaterial({
      color: 0x050c20,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x004488,
      emissiveIntensity: 0.6
    });

    // Glowing visor eyes
    this.eyeGeo = new THREE.BoxGeometry(0.24, 0.12, 0.16);
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // Side cheek neon accents
    this.finGeo = new THREE.BoxGeometry(0.08, 0.25, 0.6);
    this.finMat = new THREE.MeshBasicMaterial({ color: 0xff0088 });

    // 2. Body segment geometry
    this.segmentGeo = new THREE.CylinderGeometry(0.40, 0.40, 0.68, 14);
    this.segmentGeo.rotateX(Math.PI / 2);

    this.ringGeo = new THREE.TorusGeometry(0.43, 0.065, 8, 24);

    // Dark metallic chassis
    this.chassisMat = new THREE.MeshStandardMaterial({
      color: 0x081026,
      metalness: 0.92,
      roughness: 0.18
    });
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
    while (this.snakeGroup.children.length > 0) {
      this.snakeGroup.remove(this.snakeGroup.children[0]);
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

    // Aerodynamic nose wedge
    const noseGeo = new THREE.ConeGeometry(0.38, 0.52, 4);
    noseGeo.rotateX(-Math.PI / 2);
    noseGeo.rotateY(Math.PI / 4);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x030818,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.9
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = -0.65;
    group.add(nose);

    // Dual glowing neon visor eyes (intense cyan)
    const leftEye = new THREE.Mesh(this.eyeGeo, this.eyeMat);
    leftEye.position.set(-0.28, 0.14, -0.48);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(this.eyeGeo, this.eyeMat);
    rightEye.position.set(0.28, 0.14, -0.48);
    group.add(rightEye);

    // Neon side fins
    const leftFin = new THREE.Mesh(this.finGeo, this.finMat);
    leftFin.position.set(-0.46, 0.05, 0.05);
    group.add(leftFin);

    const rightFin = new THREE.Mesh(this.finGeo, this.finMat);
    rightFin.position.set(0.46, 0.05, 0.05);
    group.add(rightFin);

    // Dynamic headlight casting bright pool ahead of the snake
    this.headLight = new THREE.PointLight(0x00f0ff, 3.8, 8, 2);
    this.headLight.position.set(0, 0.3, -0.7);
    group.add(this.headLight);

    return group;
  }

  /**
   * Vibrant multi-stop gradient color calculation:
   * Cyan (0%) -> Electric Blue (30%) -> Purple (65%) -> Hot Magenta (100%)
   */
  getSegmentColor(index, total) {
    const p = Math.min(1.0, index / Math.max(1, total - 1));
    const c1 = new THREE.Color(0x00f0ff); // Cyan
    const c2 = new THREE.Color(0x0066ff); // Electric blue
    const c3 = new THREE.Color(0x9d00ff); // Purple
    const c4 = new THREE.Color(0xff0088); // Hot magenta

    if (p < 0.33) {
      return c1.lerp(c2, p / 0.33);
    } else if (p < 0.66) {
      return c2.lerp(c3, (p - 0.33) / 0.33);
    } else {
      return c3.lerp(c4, (p - 0.66) / 0.34);
    }
  }

  createSegmentMesh(index, totalSegments) {
    const group = new THREE.Group();

    // Chassis core
    const core = new THREE.Mesh(this.segmentGeo, this.chassisMat);
    group.add(core);

    // Glowing neon ring with vibrant color gradient
    const ringColor = this.getSegmentColor(index, totalSegments);

    const ringMat = new THREE.MeshStandardMaterial({
      color: ringColor,
      emissive: ringColor,
      emissiveIntensity: 1.2,
      metalness: 0.85,
      roughness: 0.15
    });

    const ring = new THREE.Mesh(this.ringGeo, ringMat);
    group.add(ring);

    return { group, ringMat, core, baseColor: ringColor };
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
        const seg = this.createSegmentMesh(i, this.body.length);
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
    this.surgeTime = 0.5; // Half-second energy surge
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
      const seg = this.createSegmentMesh(newIdx, this.body.length);
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
      const force = Math.random() * 5 + 3;

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

    const surgeGlow = Math.max(0, this.surgeTime * 3.0);
    const lengthGlow = Math.min(0.5, (this.body.length - 3) * 0.02);

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

        // Organic light breathing wave traveling down the body
        const wave = Math.sin(time * 7 - i * 0.45);
        curMesh.position.y = pPos.y + wave * 0.04;

        if (i === 0) {
          const targetRot = this.direction.angle;
          let diff = targetRot - curMesh.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          curMesh.rotation.y += diff * Math.min(1.0, deltaTime * 18);

          // Headlight pulse
          if (this.headLight) {
            this.headLight.intensity = 3.5 + wave * 0.6 + surgeGlow;
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

          // Segment emissive light wave pulse
          const seg = this.meshes[i];
          if (seg && seg.ringMat) {
            seg.ringMat.emissiveIntensity = 1.0 + wave * 0.4 + surgeGlow + lengthGlow;
          }
        }
      }
    }

    // Continuous glowing thruster tail trail
    if (this.body.length > 0 && this.particles) {
      const tailIdx = this.meshes.length - 1;
      const tailMesh = this.meshes[tailIdx];
      const tailPos = tailMesh ? (tailMesh.group ? tailMesh.group.position : tailMesh.position) : null;
      if (tailPos) {
        const tailColor = (tailIdx % 2 === 0) ? PALETTE.HOT_PINK : PALETTE.CYAN;
        this.particles.spawnTrailMote(tailPos, tailColor);
      }
    }
  }
}
