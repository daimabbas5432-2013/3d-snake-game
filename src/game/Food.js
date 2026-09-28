/**
 * 3D Glowing Energy Crystal / Orb
 * Faceted rotating core, gyroscopic energy rings, orbiting satellite sparkles, and intense floor illumination
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
    this.satellites = [];

    this.initMeshes();
  }

  initMeshes() {
    // 1. Faceted Glowing Energy Crystal Core
    this.crystalGeo = new THREE.OctahedronGeometry(0.36, 0);
    this.crystalMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 1.8,
      metalness: 0.3,
      roughness: 0.1
    });
    this.crystalMesh = new THREE.Mesh(this.crystalGeo, this.crystalMat);
    this.group.add(this.crystalMesh);

    // Inner wireframe lattice for high-tech holographic effect
    const wireGeo = new THREE.OctahedronGeometry(0.40, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    this.wireMesh = new THREE.Mesh(wireGeo, wireMat);
    this.group.add(this.wireMesh);

    // 2. Gyroscopic outer energy rings
    const ringGeo1 = new THREE.TorusGeometry(0.55, 0.032, 8, 24);
    this.ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    this.ring1 = new THREE.Mesh(ringGeo1, this.ringMat1);
    this.group.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(0.68, 0.025, 8, 24);
    this.ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    this.ring2 = new THREE.Mesh(ringGeo2, this.ringMat2);
    this.group.add(this.ring2);

    // 3. Orbiting Micro-Sparkle Satellites (4 glowing particles orbiting the crystal)
    const satGeo = new THREE.SphereGeometry(0.06, 8, 8);
    for (let i = 0; i < 4; i++) {
      const satMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const sat = new THREE.Mesh(satGeo, satMat);
      this.group.add(sat);
      this.satellites.push({
        mesh: sat,
        angleOffset: (Math.PI * 2 * i) / 4,
        speed: 3.5,
        radius: 0.85,
        heightOffset: (i % 2 === 0 ? 0.2 : -0.2)
      });
    }

    // 4. Dynamic Point Light casting colored pool onto reflective floor
    this.light = new THREE.PointLight(0xff007f, 4.2, 6.5, 1.8);
    this.group.add(this.light);
  }

  gridToWorld(gx, gz) {
    return {
      x: (gx + 0.5) * CELL_SIZE - ARENA_HALF_SIZE,
      y: 0.48,
      z: (gz + 0.5) * CELL_SIZE - ARENA_HALF_SIZE
    };
  }

  spawn(snake) {
    const rand = Math.random();
    if (rand < FOOD_TYPES.CHRONO.probability) {
      this.currentType = FOOD_TYPES.CHRONO;
    } else if (rand < FOOD_TYPES.CHRONO.probability + FOOD_TYPES.HYPER.probability) {
      this.currentType = FOOD_TYPES.HYPER;
    } else {
      this.currentType = FOOD_TYPES.NORMAL;
    }

    // Update visuals based on crystal type
    this.crystalMat.color.setHex(this.currentType.color);
    this.crystalMat.emissive.setHex(this.currentType.color);
    this.wireMesh.material.color.setHex(this.currentType.glowColor);
    this.ringMat1.color.setHex(this.currentType.glowColor);
    this.ringMat2.color.setHex(this.currentType.ringColor);
    this.light.color.setHex(this.currentType.color);

    this.satellites.forEach(sat => {
      sat.mesh.material.color.setHex(this.currentType.glowColor);
    });

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
    const bob = Math.sin(time * 3.8) * 0.14;
    this.crystalMesh.position.y = bob;
    this.wireMesh.position.y = bob;
    this.ring1.position.y = bob;
    this.ring2.position.y = bob;
    this.light.position.y = bob;

    // Pulsating size & emissive intensity
    const pulse = Math.sin(time * 7) * 0.18 + 1.0;
    this.crystalMesh.scale.set(pulse, pulse, pulse);
    this.wireMesh.scale.set(pulse * 1.08, pulse * 1.08, pulse * 1.08);
    this.crystalMat.emissiveIntensity = 1.6 + Math.sin(time * 8) * 0.5;

    // Continuous 3D rotation of crystal
    this.crystalMesh.rotation.y = time * 2.2;
    this.crystalMesh.rotation.x = time * 1.4;
    this.wireMesh.rotation.y = -time * 2.0;
    this.wireMesh.rotation.z = time * 1.6;

    // Gyroscopic spinning rings
    this.ring1.rotation.x = time * 2.6;
    this.ring1.rotation.y = time * 1.8;

    this.ring2.rotation.y = -time * 2.2;
    this.ring2.rotation.z = time * 2.0;

    // Orbiting satellites
    this.satellites.forEach(sat => {
      const angle = time * sat.speed + sat.angleOffset;
      sat.mesh.position.set(
        Math.cos(angle) * sat.radius,
        bob + Math.sin(angle * 2) * 0.18 + sat.heightOffset,
        Math.sin(angle) * sat.radius
      );
    });
  }
}
