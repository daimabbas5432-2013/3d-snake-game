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
    // 1. Pure Bright White Inner Core (Never blends into any floor color)
    this.coreGeo = new THREE.OctahedronGeometry(0.22, 0);
    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    this.coreMesh = new THREE.Mesh(this.coreGeo, this.coreMat);
    this.group.add(this.coreMesh);

    // 2. Radiant Golden Outer Shell Crystal
    this.crystalGeo = new THREE.OctahedronGeometry(0.38, 0);
    this.crystalMat = new THREE.MeshStandardMaterial({
      color: 0xffea00,
      emissive: 0xffaa00,
      emissiveIntensity: 2.2,
      metalness: 0.3,
      roughness: 0.1
    });
    this.crystalMesh = new THREE.Mesh(this.crystalGeo, this.crystalMat);
    this.group.add(this.crystalMesh);

    // High-tech wireframe outer cage
    const wireGeo = new THREE.OctahedronGeometry(0.44, 0);
    this.wireMat = new THREE.MeshBasicMaterial({
      color: 0xfff066,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    this.wireMesh = new THREE.Mesh(wireGeo, this.wireMat);
    this.group.add(this.wireMesh);

    // 3. Multi-Axis Gyroscopic Energy Rings (Vivid Hot Pink & Electric Purple)
    const ringGeo1 = new THREE.TorusGeometry(0.58, 0.038, 8, 24);
    this.ringMat1 = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    this.ring1 = new THREE.Mesh(ringGeo1, this.ringMat1);
    this.group.add(this.ring1);

    const ringGeo2 = new THREE.TorusGeometry(0.72, 0.030, 8, 24);
    this.ringMat2 = new THREE.MeshBasicMaterial({ color: 0x9d00ff });
    this.ring2 = new THREE.Mesh(ringGeo2, this.ringMat2);
    this.group.add(this.ring2);

    // 4. Ground Target Aura Beacon (Pulsing ring disc projected on the floor under food)
    const beaconGeo = new THREE.RingGeometry(0.12, 0.52, 28);
    beaconGeo.rotateX(-Math.PI / 2);
    this.beaconMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.beaconMesh = new THREE.Mesh(beaconGeo, this.beaconMat);
    this.beaconMesh.position.y = -0.44;
    this.group.add(this.beaconMesh);

    // 5. Orbiting Micro-Sparkle Satellites (6 multi-colored particles)
    const satGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const satColors = [0xffffff, 0xffea00, 0xff00aa, 0xffffff, 0xffea00, 0x9d00ff];
    for (let i = 0; i < 6; i++) {
      const satMat = new THREE.MeshBasicMaterial({ color: satColors[i] });
      const sat = new THREE.Mesh(satGeo, satMat);
      this.group.add(sat);
      this.satellites.push({
        mesh: sat,
        baseColor: satColors[i],
        angleOffset: (Math.PI * 2 * i) / 6,
        speed: 3.2 + (i % 2) * 0.8,
        radius: 0.86 + (i % 3) * 0.08,
        heightOffset: ((i % 3) - 1) * 0.22
      });
    }

    // 6. Dynamic Point Light casting brilliant warm gold/white pool onto floor
    this.light = new THREE.PointLight(0xffea44, 5.0, 7.5, 1.8);
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

  spawn(snake, forcedType = null, excludePositions = []) {
    let selectedType = forcedType;

    if (!selectedType) {
      // Pick random food type weighted by probability
      const rand = Math.random();
      let cumulative = 0;
      selectedType = FOOD_TYPES.NORMAL;

      for (const key in FOOD_TYPES) {
        cumulative += FOOD_TYPES[key].probability;
        if (rand <= cumulative) {
          selectedType = FOOD_TYPES[key];
          break;
        }
      }
    }

    this.currentType = selectedType;

    // Apply colors while maintaining white core + gold/pink contrast signature
    this.coreMat.color.setHex(0xffffff); // Core is always brilliant pure white

    if (this.currentType.type === 'NORMAL') {
      this.crystalMat.color.setHex(0xffea00);
      this.crystalMat.emissive.setHex(0xffaa00);
      this.wireMat.color.setHex(0xfff066);
      this.ringMat1.color.setHex(0xff00aa);
      this.ringMat2.color.setHex(0x9d00ff);
      this.beaconMat.color.setHex(0xffea00);
      this.light.color.setHex(0xffea44);
    } else if (this.currentType.type === 'GOLDEN') {
      this.crystalMat.color.setHex(0xffea00);
      this.crystalMat.emissive.setHex(0xff9900);
      this.wireMat.color.setHex(0xffffff);
      this.ringMat1.color.setHex(0xffd700);
      this.ringMat2.color.setHex(0xff0088);
      this.beaconMat.color.setHex(0xffea00);
      this.light.color.setHex(0xffea00);
    } else {
      // Special abilities: retain golden/white brilliance with distinct ability accent
      this.crystalMat.color.setHex(this.currentType.secondaryColor);
      this.crystalMat.emissive.setHex(this.currentType.secondaryColor);
      this.wireMat.color.setHex(0xffea00);
      this.ringMat1.color.setHex(this.currentType.ringColor);
      this.ringMat2.color.setHex(0xff00aa);
      this.beaconMat.color.setHex(this.currentType.secondaryColor);
      this.light.color.setHex(this.currentType.secondaryColor);
    }

    // Find unoccupied cell
    const emptyCells = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        if (!snake.isOccupied(x, z)) {
          const isExcluded = excludePositions.some(p => p && p.x === x && p.z === z);
          if (!isExcluded) {
            emptyCells.push({ x, z });
          }
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
    this.coreMesh.position.y = bob;
    this.crystalMesh.position.y = bob;
    this.wireMesh.position.y = bob;
    this.ring1.position.y = bob;
    this.ring2.position.y = bob;
    this.light.position.y = bob;

    // Pulsating size & emissive intensity
    const pulse = Math.sin(time * 6.5) * 0.16 + 1.0;
    this.coreMesh.scale.set(pulse, pulse, pulse);
    this.crystalMesh.scale.set(pulse, pulse, pulse);
    this.wireMesh.scale.set(pulse * 1.08, pulse * 1.08, pulse * 1.08);
    this.crystalMat.emissiveIntensity = 2.0 + Math.sin(time * 8) * 0.6;

    // Continuous 3D rotation of crystal
    this.coreMesh.rotation.y = time * 2.2;
    this.coreMesh.rotation.x = time * 1.4;
    this.crystalMesh.rotation.y = time * 2.2;
    this.crystalMesh.rotation.x = time * 1.4;
    this.wireMesh.rotation.y = -time * 2.0;
    this.wireMesh.rotation.z = time * 1.6;

    // Gyroscopic spinning rings
    this.ring1.rotation.x = time * 2.8;
    this.ring1.rotation.y = time * 1.9;

    this.ring2.rotation.y = -time * 2.4;
    this.ring2.rotation.z = time * 2.1;

    // Ground beacon pulse
    if (this.beaconMat) {
      this.beaconMat.opacity = 0.35 + Math.sin(time * 5.0) * 0.15;
    }

    // Orbiting satellites
    this.satellites.forEach(sat => {
      const angle = time * sat.speed + sat.angleOffset;
      sat.mesh.position.set(
        Math.cos(angle) * sat.radius,
        bob + Math.sin(angle * 2.5) * 0.20 + sat.heightOffset,
        Math.sin(angle) * sat.radius
      );
    });
  }
}
