/**
 * Dynamic Sci-Fi Lighting System
 */

import * as THREE from 'three';
import { ARENA_HALF_SIZE, PALETTE } from '../game/Constants.js';

export class Lighting {
  constructor(scene) {
    this.scene = scene;
    this.cornerLights = [];
    this.alertIntensity = 0;
    this.isAlert = false;

    this.initLights();
  }

  initLights() {
    // 1. Soft atmospheric ambient light
    this.ambientLight = new THREE.AmbientLight(0x0c142b, 1.2);
    this.scene.add(this.ambientLight);

    // 2. High-tech directional key light casting cool metallic highlights
    this.dirLight = new THREE.DirectionalLight(0xa5c9ff, 1.8);
    this.dirLight.position.set(12, 25, 15);
    this.scene.add(this.dirLight);

    // 3. Rim / backlight for dramatic cyber silhouettes
    this.rimLight = new THREE.DirectionalLight(0xff0088, 0.8);
    this.rimLight.position.set(-15, 10, -15);
    this.scene.add(this.rimLight);

    // 4. Four colored neon point lights at the arena corners
    const cornerPositions = [
      { x: -ARENA_HALF_SIZE, z: -ARENA_HALF_SIZE, color: PALETTE.CYAN },
      { x: ARENA_HALF_SIZE, z: -ARENA_HALF_SIZE, color: PALETTE.MAGENTA },
      { x: ARENA_HALF_SIZE, z: ARENA_HALF_SIZE, color: PALETTE.CYAN },
      { x: -ARENA_HALF_SIZE, z: ARENA_HALF_SIZE, color: PALETTE.PURPLE }
    ];

    cornerPositions.forEach((pos) => {
      const pLight = new THREE.PointLight(pos.color, 2.5, 14, 1.8);
      pLight.position.set(pos.x, 1.5, pos.z);
      this.scene.add(pLight);
      this.cornerLights.push({ light: pLight, baseColor: pos.color, baseY: 1.5 });
    });
  }

  setAlert(isAlert) {
    this.isAlert = isAlert;
  }

  update(time, deltaTime) {
    // Pulse corner lights gently
    this.cornerLights.forEach((item, idx) => {
      const pulse = Math.sin(time * 3 + idx * 1.5) * 0.4 + 1.0;
      if (this.isAlert) {
        // Red emergency alert flashing
        const redPulse = (Math.sin(time * 12) + 1) * 2.0;
        item.light.color.setHex(PALETTE.RED_ALERT);
        item.light.intensity = redPulse + 1.0;
      } else {
        item.light.color.setHex(item.baseColor);
        item.light.intensity = 2.2 * pulse;
      }
    });

    if (this.isAlert) {
      this.ambientLight.color.setHex(0x300508);
    } else {
      this.ambientLight.color.setHex(0x0c142b);
    }
  }
}
