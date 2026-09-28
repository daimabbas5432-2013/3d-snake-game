/**
 * 3D Futuristic Energy Orbs & Power-ups
 */

import * as THREE from 'three';
import { GRID_SIZE, CELL_SIZE, ARENA_HALF_SIZE, FOOD_TYPES } from './Constants.js';

export class Food {
  constructor(scene) {
    this.scene = scene;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.gridPosition = { x: 10, z: 10 };
    this.currentType = FOOD_TYPES.NORMAL;

    this.initMeshes();
  }

  initMeshes() {
    // 1. Core glowing energy sphere
    this.coreGeo = new THREE.SphereGeometry(0.32, 24, 24);
    this.coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.4,
      metalness: 0.2,
      roughness: 0.1
    });
    this.coreMesh = new THREE.Mesh(this.coreGeo, this.coreMat);
    this.group.add(this.coreMesh);

    // 2. Gyroscopic outer rings
    const ringGeo1 = new THREE.TorusGeometry(0.48, 0.03, 8, 24);
    this.ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: false });
    this.ring1 = new THREE.Mesh(ringGeo1, this.ringMat1);
    this.group.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(0.60, 0.025, 8, 24);
    this.ringMat2 = new THREE.MeshBasicMaterial({ color: 0x9d00ff, wireframe: false });
    this.ring2 = new THREE.Mesh(ringGeo2, this.ringMat2);
    this.group.add(this.ring2);

    // 3. Dynamic point light attached to the orb
    this.light = new THREE.PointLight(0x00f0ff, 3.0, 5, 2);
    this.group.add(this.light);
  }

  gridToWorld(gx, gz) {
    return {
      x: (gx + 0.5) * CELL_SIZE - ARENA_HALF_SIZE,
      y: 0.45,
      z: (gz + 0.5) * CELL_SIZE - ARENA_HALF_SIZE
    };
  }

  /**
   * Spawn a new orb at an unoccupied grid cell
   */
  spawn(snake) {
    // Pick random food type according to probabilities
    const rand = Math.random();
    if (rand < FOOD_TYPES.CHRONO.probability) {
      this.currentType = FOOD_TYPES.CHRONO;
    } else if (rand < FOOD_TYPES.CHRONO.probability + FOOD_TYPES.HYPER.probability) {
      this.currentType = FOOD_TYPES.HYPER;
    } else {
      this.currentType = FOOD_TYPES.NORMAL;
    }

    // Update visuals based on type
    this.coreMat.color.setHex(this.currentType.color);
    this.coreMat.emissive.setHex(this.currentType.glowColor);
    this.ringMat1.color.setHex(this.currentType.color);
    this.ringMat2.color.setHex(this.currentType.glowColor);
    this.light.color.setHex(this.currentType.color);

    // Find unoccupied cell
    const emptyCells = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (!snake.isOccupied(x, z)) {
          emptyCells.push({ x, z });
        }
      }
    }

    if (emptyCells.length === 0) {
      // Board full! Game won
      return false;
    }

    const picked = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.gridPosition = picked;

    const world = this.gridToWorld(picked.x, picked.z);
    this.group.position.set(world.x, world.y, world.z);
    this.group.visible = true;

    return true;
  }

  getWorldPosition() {
    return this.group.position;
  }

  update(time, deltaTime) {
    if (!this.group.visible) return;

    // Sinusoidal floating bob
    const bob = Math.sin(time * 3.5) * 0.12;
    this.coreMesh.position.y = bob;
    this.ring1.position.y = bob;
    this.ring2.position.y = bob;
    this.light.position.y = bob;

    // Pulsating emissive intensity & scale
    const pulse = Math.sin(time * 6) * 0.2 + 1.0;
    this.coreMesh.scale.set(pulse, pulse, pulse);
    this.coreMat.emissiveIntensity = 1.2 + Math.sin(time * 8) * 0.4;

    // Gyroscopic spinning rings
    this.ring1.rotation.x = time * 2.2;
    this.ring1.rotation.y = time * 1.5;

    this.ring2.rotation.y = -time * 2.0;
    this.ring2.rotation.z = time * 1.8;
  }
}
