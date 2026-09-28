/**
 * 3D Cyber Snake
 * Smooth interpolation, futuristic faceted head, glowing gradient segments, and death physics
 */

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, ARENA_HALF_SIZE, DIRECTIONS, PALETTE } from './Constants.js';

export class Snake {
  constructor(scene, particles) {
    this.scene = scene;
    this.particles = particles;

    this.snakeGroup = new THREE.Group();
    this.scene.add(this.snakeGroup);

    // Logical grid positions: array of {x, z}
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

    // Shared materials & geometries
    this.initGeometriesAndMaterials();
    this.reset();
  }

  initGeometriesAndMaterials() {
    // 1. Head mesh components
    this.headGeo = new THREE.BoxGeometry(0.85, 0.55, 0.95);
    this.headMat = new THREE.MeshStandardMaterial({
      color: 0x050c1e,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0x003366,
      emissiveIntensity: 0.4
    });

    // Glowing visor eyes
    this.eyeGeo = new THREE.BoxGeometry(0.2, 0.1, 0.15);
    this.eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    // 2. Body segment geometry
    this.segmentGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.65, 12);
    this.segmentGeo.rotateX(Math.PI / 2);

    this.ringGeo = new THREE.TorusGeometry(0.40, 0.05, 8, 20);

    // Dark chassis base material
    this.chassisMat = new THREE.MeshStandardMaterial({
      color: 0x0a1024,
      metalness: 0.9,
      roughness: 0.2
    });
  }

  gridToWorld(gx, gz) {
    return {
      x: (gx + 0.5) * CELL_SIZE - ARENA_HALF_SIZE,
      y: 0.35,
      z: (gz + 0.5) * CELL_SIZE - ARENA_HALF_SIZE
    };
  }

  reset(startGridX = 5, startGridZ = 10, initialLength = 3, initialDir = DIRECTIONS.RIGHT) {
    this.isDead = false;
    this.direction = initialDir;
    this.growPending = 0;

    // Clean up existing meshes
    this.clearMeshes();
    this.clearDebris();

    // Initialize logical positions
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

    // Visor nose cone (tapered)
    const noseGeo = new THREE.ConeGeometry(0.35, 0.45, 4);
    noseGeo.rotateX(-Math.PI / 2);
    noseGeo.rotateY(Math.PI / 4);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x030812,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.5
    });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.z = -0.6;
    group.add(nose);

    // Dual glowing neon eyes
    const leftEye = new THREE.Mesh(this.eyeGeo, this.eyeMat);
    leftEye.position.set(-0.25, 0.12, -0.45);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(this.eyeGeo, this.eyeMat);
    rightEye.position.set(0.25, 0.12, -0.45);
    group.add(rightEye);

    // Headlight illuminating the arena path ahead
    this.headLight = new THREE.PointLight(0x00f0ff, 2.5, 6, 2);
    this.headLight.position.set(0, 0.2, -0.6);
    group.add(this.headLight);

    return group;
  }

  createSegmentMesh(index, totalSegments) {
    const group = new THREE.Group();

    // Chassis core
    const core = new THREE.Mesh(this.segmentGeo, this.chassisMat);
    group.add(core);

    // Glowing neon ring (interpolates from cyan to magenta down the snake body)
    const progress = Math.min(1.0, index / Math.max(1, totalSegments));
    const ringColor = new THREE.Color().copy(new THREE.Color(PALETTE.CYAN)).lerp(new THREE.Color(PALETTE.MAGENTA), progress);

    const ringMat = new THREE.MeshStandardMaterial({
      color: ringColor,
      emissive: ringColor,
      emissiveIntensity: 0.85,
      metalness: 0.8,
      roughness: 0.2
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

  /**
   * Logical tick movement step
   */
  tick(nextDir) {
    if (this.isDead) return;

    if (nextDir) {
      this.direction = nextDir;
    }

    // Save previous positions for smooth visual interpolation
    this.prevBody = this.body.map(seg => ({ ...seg }));

    // New head coordinates
    const newHead = {
      x: this.body[0].x + this.direction.x,
      z: this.body[0].z + this.direction.z
    };

    // Add new head to front
    this.body.unshift(newHead);

    // If growing, don't remove tail
    if (this.growPending > 0) {
      this.growPending--;
      // Create new segment mesh
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

  /**
   * Collision Checks
   */
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

  /**
   * Explode segments on death
   */
  explode() {
    this.isDead = true;

    // Convert each mesh segment into tumbling physics debris
    this.meshes.forEach((meshItem, idx) => {
      const mesh = idx === 0 ? meshItem : meshItem.group;
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);

      // Clone mesh for debris
      const clone = mesh.clone();
      clone.position.copy(worldPos);
      this.scene.add(clone);

      const angle = Math.random() * Math.PI * 2;
      const force = Math.random() * 4 + 2;

      this.debris.push({
        mesh: clone,
        vx: Math.cos(angle) * force,
        vy: Math.random() * 5 + 3,
        vz: Math.sin(angle) * force,
        rotX: (Math.random() - 0.5) * 10,
        rotY: (Math.random() - 0.5) * 10,
        rotZ: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 1.8
      });
    });

    // Hide original snake meshes
    this.snakeGroup.visible = false;
  }

  /**
   * Visual update running at 60 FPS with smooth interpolation (alpha = 0..1)
   */
  update(alpha, time, deltaTime) {
    if (this.isDead) {
      // Animate explosion debris
      this.debris.forEach(d => {
        d.life += deltaTime;
        d.vy -= 9.8 * deltaTime * 1.5;
        d.mesh.position.x += d.vx * deltaTime;
        d.mesh.position.y += d.vy * deltaTime;
        d.mesh.position.z += d.vz * deltaTime;

        d.mesh.rotation.x += d.rotX * deltaTime;
        d.mesh.rotation.y += d.rotY * deltaTime;
        d.mesh.rotation.z += d.rotZ * deltaTime;

        if (d.mesh.position.y < 0.15) {
          d.mesh.position.y = 0.15;
          d.vy = -d.vy * 0.3;
          d.vx *= 0.8;
          d.vz *= 0.8;
        }

        const fade = Math.max(0, 1.0 - d.life / d.maxLife);
        d.mesh.scale.set(fade, fade, fade);
      });
      return;
    }

    this.snakeGroup.visible = true;

    // Smoothly interpolate visual positions between prevBody and body
    for (let i = 0; i < this.body.length && i < this.meshes.length; i++) {
      const curGrid = this.body[i];
      const prevGrid = this.prevBody[i] || curGrid;

      const pPos = this.gridToWorld(prevGrid.x, prevGrid.z);
      const cPos = this.gridToWorld(curGrid.x, curGrid.z);

      const curMesh = i === 0 ? this.headMesh : this.meshes[i].group;

      if (curMesh) {
        // Linear interpolation
        curMesh.position.x = THREE.MathUtils.lerp(pPos.x, cPos.x, alpha);
        curMesh.position.z = THREE.MathUtils.lerp(pPos.z, cPos.z, alpha);

        // Gentle breathing pulse down the body
        const pulse = Math.sin(time * 6 - i * 0.4) * 0.05 + 1.0;
        curMesh.position.y = pPos.y + (pulse - 1.0) * 0.1;

        if (i === 0) {
          // Smoothly rotate head towards movement direction
          const targetRot = this.direction.angle;
          let diff = targetRot - curMesh.rotation.y;
          // Normalize angle diff to [-PI, PI]
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          curMesh.rotation.y += diff * Math.min(1.0, deltaTime * 16);
        } else {
          // Orient segment towards predecessor
          const aheadGrid = this.body[i - 1];
          const segDirX = aheadGrid.x - curGrid.x;
          const segDirZ = aheadGrid.z - curGrid.z;
          let segAngle = 0;
          if (segDirX === 1) segAngle = -Math.PI / 2;
          else if (segDirX === -1) segAngle = Math.PI / 2;
          else if (segDirZ === 1) segAngle = Math.PI;
          curMesh.rotation.y = segAngle;
        }
      }
    }

    // Emit subtle tail thruster trail
    if (this.body.length > 0 && this.particles && Math.random() < 0.4) {
      const tailMesh = this.meshes[this.meshes.length - 1];
      const tailPos = tailMesh ? (tailMesh.group ? tailMesh.group.position : tailMesh.position) : null;
      if (tailPos) {
        this.particles.spawnTrailMote(tailPos, PALETTE.MAGENTA);
      }
    }
  }
}
