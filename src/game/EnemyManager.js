/**
 * Enemy Bots Manager - Autonomous Cyber Drones for ENEMY_BOTS Mode
 * AI movement, threat proximity warnings, futuristic 3D drone meshes, and dynamic scaling
 */

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, ARENA_HALF_SIZE, DIRECTIONS } from './Constants.js';

export class EnemyManager {
  constructor(scene, particles, audio, sceneManager) {
    this.scene = scene;
    this.particles = particles;
    this.audio = audio;
    this.sceneManager = sceneManager;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.enemies = [];
    this.moveTimer = 0;
    this.warningCooldown = 0;
  }

  gridToWorld(gx, gz) {
    return {
      x: (gx + 0.5) * CELL_SIZE - ARENA_HALF_SIZE,
      y: 0.44,
      z: (gz + 0.5) * CELL_SIZE - ARENA_HALF_SIZE
    };
  }

  createDroneMesh() {
    const droneGroup = new THREE.Group();

    // 1. Central faceted cyber chassis (Dark obsidian alloy)
    const chassisGeo = new THREE.OctahedronGeometry(0.32, 0);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x050814,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0x330005,
      emissiveIntensity: 0.6
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    droneGroup.add(chassis);

    // 2. Menacing Glowing Red/Orange Sensor Eye
    const eyeGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 0.05, -0.22);
    droneGroup.add(eye);

    // 3. Quad Thruster Ring (Glowing orange/red)
    const ringGeo = new THREE.TorusGeometry(0.38, 0.035, 8, 20);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff3d00,
      emissive: 0xff1744,
      emissiveIntensity: 2.2,
      metalness: 0.8,
      roughness: 0.2
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    droneGroup.add(ring);

    // 4. Ground warning aura disc
    const floorGeo = new THREE.RingGeometry(0.12, 0.48, 20);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.40;
    droneGroup.add(floorMesh);

    // 5. Dynamic Red Warning Point Light
    const light = new THREE.PointLight(0xff1744, 3.2, 5.5, 2.0);
    droneGroup.add(light);

    return {
      group: droneGroup,
      chassis,
      eye,
      ring,
      floorMesh,
      floorMat,
      light
    };
  }

  spawnEnemy(snake, food) {
    const emptyCells = [];
    const head = snake ? snake.getHeadGrid() : { x: 5, z: 10 };

    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let z = 1; z < GRID_SIZE - 1; z++) {
        if (snake && snake.isOccupied(x, z)) continue;
        if (food && food.gridPosition.x === x && food.gridPosition.z === z) continue;
        if (this.enemies.some(e => e.grid.x === x && e.grid.z === z)) continue;

        // Keep initial spawn at least 6 cells away from snake head
        const dist = Math.abs(x - head.x) + Math.abs(z - head.z);
        if (dist >= 6) {
          emptyCells.push({ x, z });
        }
      }
    }

    if (emptyCells.length === 0) return;

    const picked = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const meshObj = this.createDroneMesh();

    const world = this.gridToWorld(picked.x, picked.z);
    meshObj.group.position.set(world.x, world.y, world.z);
    this.group.add(meshObj.group);

    const enemy = {
      ...meshObj,
      grid: { ...picked },
      prevGrid: { ...picked },
      direction: { x: 1, z: 0 },
      id: Math.random().toString(36).substr(2, 9)
    };

    this.enemies.push(enemy);

    if (this.particles) {
      this.particles.spawnBurst(world, 0xff1744, 30, 1.4);
    }
  }

  reset(snake, food) {
    this.clear();
    // Start with 1 drone
    this.spawnEnemy(snake, food);
    this.moveTimer = 0;
  }

  clear() {
    for (let i = this.group.children.length - 1; i >= 0; i--) {
      const child = this.group.children[i];
      this.group.remove(child);
    }
    this.enemies = [];
  }

  update(deltaTime, time, snake, food, score) {
    if (this.enemies.length === 0) return false;

    if (this.warningCooldown > 0) {
      this.warningCooldown -= deltaTime;
    }

    // Dynamic scaling based on score
    // At score >= 50, maintain 2 enemies; at score >= 150, maintain 3 enemies
    const targetCount = score >= 150 ? 3 : (score >= 50 ? 2 : 1);
    if (this.enemies.length < targetCount) {
      this.spawnEnemy(snake, food);
    }

    // Drone movement rate (Moves every ~0.26s, scaled slightly with score)
    const moveInterval = Math.max(0.20, 0.28 - (score / 400) * 0.05);
    this.moveTimer += deltaTime;

    const head = snake ? snake.getHeadGrid() : { x: 0, z: 0 };
    let isAnyClose = false;

    if (this.moveTimer >= moveInterval) {
      this.moveTimer = 0;

      this.enemies.forEach(enemy => {
        enemy.prevGrid = { ...enemy.grid };

        // Determine next move towards player sector with safety checks
        const candidateDirs = [
          { x: 0, z: -1 }, // UP
          { x: 0, z: 1 },  // DOWN
          { x: -1, z: 0 }, // LEFT
          { x: 1, z: 0 }   // RIGHT
        ].filter(d => {
          const nx = enemy.grid.x + d.x;
          const nz = enemy.grid.z + d.z;
          if (nx < 0 || nx >= GRID_SIZE || nz < 0 || nz >= GRID_SIZE) return false;
          // Avoid stepping onto another enemy
          if (this.enemies.some(o => o.id !== enemy.id && o.grid.x === nx && o.grid.z === nz)) return false;
          return true;
        });

        if (candidateDirs.length > 0) {
          // Sort candidate directions by distance to snake head
          candidateDirs.sort((a, b) => {
            const distA = Math.abs(enemy.grid.x + a.x - head.x) + Math.abs(enemy.grid.z + a.z - head.z);
            const distB = Math.abs(enemy.grid.x + b.x - head.x) + Math.abs(enemy.grid.z + b.z - head.z);
            return distA - distB;
          });

          // 65% chance to move closer, 35% chance random patrol to remain dodgeable
          const chosen = (Math.random() < 0.65) ? candidateDirs[0] : candidateDirs[Math.floor(Math.random() * candidateDirs.length)];
          enemy.direction = chosen;
          enemy.grid.x += chosen.x;
          enemy.grid.z += chosen.z;
        }
      });
    }

    // Animate meshes and check proximity
    const alpha = Math.min(1.0, this.moveTimer / moveInterval);

    this.enemies.forEach(enemy => {
      const pWorld = this.gridToWorld(enemy.prevGrid.x, enemy.prevGrid.z);
      const cWorld = this.gridToWorld(enemy.grid.x, enemy.grid.z);

      enemy.group.position.x = THREE.MathUtils.lerp(pWorld.x, cWorld.x, alpha);
      enemy.group.position.z = THREE.MathUtils.lerp(pWorld.z, cWorld.z, alpha);

      // Sinusoidal floating hover
      const bob = Math.sin(time * 6 + enemy.grid.x) * 0.08;
      enemy.group.position.y = 0.44 + bob;

      // Animate thruster ring
      enemy.ring.rotation.z += 4.5 * deltaTime;
      enemy.chassis.rotation.y = time * 2.0;

      // Ground disc pulse
      enemy.floorMat.opacity = 0.35 + Math.sin(time * 7) * 0.15;

      // Check distance to snake head
      const dist = Math.abs(enemy.grid.x - head.x) + Math.abs(enemy.grid.z - head.z);
      if (dist <= 3) {
        isAnyClose = true;
      }
    });

    if (isAnyClose && this.warningCooldown <= 0) {
      if (this.audio) this.audio.playEnemyWarning();
      this.warningCooldown = 1.2;
    }

    return isAnyClose;
  }

  checkCollision(snakeHeadGrid) {
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (snakeHeadGrid.x === e.grid.x && snakeHeadGrid.z === e.grid.z) {
        return true;
      }
    }
    return false;
  }

  destroy() {
    this.clear();
    this.scene.remove(this.group);
  }
}
