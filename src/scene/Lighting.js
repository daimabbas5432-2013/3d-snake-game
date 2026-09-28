/**
 * Dynamic Multi-Colored Sci-Fi Lighting System
 * Orbiting neon point lights, vibrant corner beacons, and atmospheric rim illumination
 */

import * as THREE from 'three';
import { ARENA_HALF_SIZE, PALETTE } from '../game/Constants.js';

export class Lighting {
  constructor(scene) {
    this.scene = scene;
    this.cornerLights = [];
    this.orbitingLights = [];
    this.isAlert = false;
    this.intensityMultiplier = 1.0;

    this.initLights();
    this.initOrbitingLights();
  }

  initLights() {
    // 1. Rich atmospheric ambient light (deep cosmic purple/blue undertone)
    this.ambientLight = new THREE.AmbientLight(0x1a0f35, 1.4);
    this.scene.add(this.ambientLight);

    // 2. High-tech directional key light casting cool metallic highlights
    this.dirLight = new THREE.DirectionalLight(0x9fc5ff, 2.0);
    this.dirLight.position.set(12, 28, 16);
    this.scene.add(this.dirLight);

    // 3. Electric magenta rim light for dramatic cyber silhouettes
    this.rimLight = new THREE.DirectionalLight(0xff0088, 1.2);
    this.rimLight.position.set(-16, 12, -16);
    this.scene.add(this.rimLight);

    // 4. Four vibrant neon point lights at the arena corners (Cyan, Magenta, Yellow, Purple)
    const cornerDefs = [
      { x: -ARENA_HALF_SIZE, z: -ARENA_HALF_SIZE, color: PALETTE.CYAN },
      { x: ARENA_HALF_SIZE, z: -ARENA_HALF_SIZE, color: PALETTE.HOT_PINK },
      { x: ARENA_HALF_SIZE, z: ARENA_HALF_SIZE, color: PALETTE.NEON_YELLOW },
      { x: -ARENA_HALF_SIZE, z: ARENA_HALF_SIZE, color: PALETTE.PURPLE }
    ];

    cornerDefs.forEach((pos) => {
      const pLight = new THREE.PointLight(pos.color, 3.2, 16, 1.6);
      pLight.position.set(pos.x, 1.8, pos.z);
      this.scene.add(pLight);
      this.cornerLights.push({ light: pLight, baseColor: pos.color });
    });
  }

  initOrbitingLights() {
    // Two dynamic orbiting point lights that travel across the arena
    const orb1 = new THREE.PointLight(0x00f0ff, 2.5, 12, 2);
    this.scene.add(orb1);
    this.orbitingLights.push({ light: orb1, speed: 0.8, radius: 8, height: 2.2, phase: 0 });

    const orb2 = new THREE.PointLight(0xff00aa, 2.2, 12, 2);
    this.scene.add(orb2);
    this.orbitingLights.push({ light: orb2, speed: -0.6, radius: 6.5, height: 2.0, phase: Math.PI });
  }

  setAlert(isAlert) {
    this.isAlert = isAlert;
  }

  setIntensity(level = 1) {
    this.intensityMultiplier = 1.0 + (level - 1) * 0.08;
  }

  update(time, deltaTime) {
    // 1. Animate corner lights with breathing neon pulse
    this.cornerLights.forEach((item, idx) => {
      const pulse = Math.sin(time * 3.5 + idx * 1.5) * 0.35 + 1.0;
      if (this.isAlert) {
        // Red emergency alert flashing
        const redPulse = (Math.sin(time * 14) + 1) * 2.5;
        item.light.color.setHex(PALETTE.RED_ALERT);
        item.light.intensity = redPulse + 1.2;
      } else {
        item.light.color.setHex(item.baseColor);
        item.light.intensity = 3.0 * pulse * this.intensityMultiplier;
      }
    });

    // 2. Animate orbiting dynamic lights
    this.orbitingLights.forEach((orb) => {
      const angle = time * orb.speed + orb.phase;
      orb.light.position.set(
        Math.cos(angle) * orb.radius,
        orb.height + Math.sin(time * 2.0 + orb.phase) * 0.4,
        Math.sin(angle) * orb.radius
      );
    });

    if (this.isAlert) {
      this.ambientLight.color.setHex(0x38050a);
    } else {
      this.ambientLight.color.setHex(0x1a0f35);
    }
  }
}
