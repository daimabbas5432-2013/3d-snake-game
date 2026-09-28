/**
 * 3D Collectible Energy Orbs & Power-Ups
 * Distinct geometries, rotating gyroscopic rings, orbiting micro-sparkles,
 * rainbow prism effects, and magnetic attraction mechanics
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
    this.magnetActive = false;

    this.initMeshes();
  }

  initMeshes() {
    // 1. Faceted Core Crystal
    this.crystalGeo = new THREE.OctahedronGeometry(0.38, 0);
    this.crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
      metalness: 0.3,
      roughness: 0.1
    });
    this.crystalMesh = new THREE.Mesh(this.crystalGeo, this.crystalMat);
    this.group.add(this.crystalMesh);

    // Inner wireframe lattice
    const wireGeo = new THREE.OctahedronGeometry(0.42, 0);
    this.wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    this.wireMesh = new THREE.Mesh(wireGeo, this.wireMat);
    this.group.add(this.wireMesh);

    // 2. Gyroscopic outer energy rings
    const ringGeo1 = new THREE.TorusGeometry(0.56, 0.035, 8, 24);
    this.ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    this.ring1 = new THREE.Mesh(ringGeo1, this.ringMat1);
    this.group.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(0.70, 0.025, 8, 24);
    this.ringMat2 = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    this.ring2 = new THREE.Mesh(ringGeo2, this.ringMat2);
    this.group.add(this.ring2);

    // 3. Orbiting Micro-Sparkle Satellites (4 orbiting particles)
    const satGeo = new THREE.SphereGeometry(0.065, 8, 8);
    for (let i = 0; i < 4; i++) {
      const satMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const sat = new THREE.Mesh(satGeo, satMat);
      this.group.add(sat);
      this.satellites.push({
        mesh: sat,
        angleOffset: (Math.PI * 2 * i) / 4,
        speed: 3.5,
        radius: 0.88,
        heightOffset: (i % 2 === 0 ? 0.2 : -0.2)
      });
    }

    // 4. Dynamic Point Light casting colored pool onto floor
    this.light = new THREE.PointLight(0x00f0ff, 4.0, 7.0, 1.8);
    this.group.add(this.light);
  }

  gridToWorld(gx, gz) {
    return {
      x: (gx + 0.5) * CELL_SIZE - ARENA_HALF_SIZE,
      y: 0.48,
      z: (gz + 0.5) * CELL_SIZE - ARENA_HALF_SIZE
    };
  }

  worldToGrid(wx, wz) {
    return {
      x: Math.round((wx + ARENA_HALF_SIZE) / CELL_SIZE - 0.5),
      z: Math.round((wz + ARENA_HALF_SIZE) / CELL_SIZE - 0.5)
    };
  }

  spawn(snake) {
    // Pick random food type weighted by probability
    const rand = Math.random();
    let cumulative = 0;
    let selectedType = FOOD_TYPES.NORMAL;

    for (const key in FOOD_TYPES) {
      cumulative += FOOD_TYPES[key].probability;
      if (rand <= cumulative) {
        selectedType = FOOD_TYPES[key];
        break;
      }
    }

    this.currentType = selectedType;

    // Apply colors
    this.crystalMat.color.setHex(this.currentType.color);
    this.crystalMat.emissive.setHex(this.currentType.color);
    this.wireMat.color.setHex(this.currentType.secondaryColor);
    this.ringMat1.color.setHex(this.currentType.ringColor);
    this.ringMat2.color.setHex(this.currentType.secondaryColor);
    this.light.color.setHex(this.currentType.color);

    this.satellites.forEach(sat => {
      sat.mesh.material.color.setHex(this.currentType.secondaryColor);
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

    if (emptyCells.length === 0) return false;

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

  update(time, deltaTime, magnetTarget = null) {
    if (!this.group.visible) return;

    // Magnetic pull toward snake head if magnet is active
    if (magnetTarget) {
      const targetPos = new THREE.Vector3(magnetTarget.x, 0.48, magnetTarget.z);
      this.group.position.lerp(targetPos, deltaTime * 2.8);
      // Synchronize gridPosition to closest cell so logical collision detects collection
      const curGrid = this.worldToGrid(this.group.position.x, this.group.position.z);
      this.gridPosition.x = THREE.MathUtils.clamp(curGrid.x, 0, GRID_SIZE - 1);
      this.gridPosition.z = THREE.MathUtils.clamp(curGrid.z, 0, GRID_SIZE - 1);
    }

    // Sinusoidal floating bob
    const bob = Math.sin(time * 3.8) * 0.14;
    this.crystalMesh.position.y = bob;
    this.wireMesh.position.y = bob;
    this.ring1.position.y = bob;
    this.ring2.position.y = bob;
    this.light.position.y = bob;

    // Rainbow prism special color cycling
    if (this.currentType.type === 'RAINBOW') {
      const hue = (time * 90) % 360;
      this.crystalMat.color.setHSL(hue / 360, 1.0, 0.55);
      this.crystalMat.emissive.setHSL(hue / 360, 1.0, 0.55);
      this.wireMat.color.setHSL(((hue + 60) % 360) / 360, 1.0, 0.6);
      this.ringMat1.color.setHSL(((hue + 120) % 360) / 360, 1.0, 0.55);
      this.ringMat2.color.setHSL(((hue + 180) % 360) / 360, 1.0, 0.55);
      this.light.color.setHSL(hue / 360, 1.0, 0.55);
    }

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
