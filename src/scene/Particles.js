/**
 * Multi-Colored Particle System
 * Burst fireworks, ground shockwaves, continuous snake thruster wake, and cosmic floating motes
 */

import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    // Ambient floating cosmic motes
    this.initAmbientDust();

    // Collection & fireworks burst particle pool
    this.burstPoolSize = 450;
    this.initBurstParticles();

    // Shockwave rings pool
    this.shockwaves = [];
    this.initShockwaves();

    // Snake thruster energy trail pool
    this.trailPoolSize = 180;
    this.initTrailParticles();
  }

  initAmbientDust() {
    const count = 240;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.dustVelocities = [];

    const dustColors = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xff00aa), // Hot pink
      new THREE.Color(0xffea00), // Electric yellow
      new THREE.Color(0x9d00ff)  // Violet
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 4.5 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;

      const col = dustColors[Math.floor(Math.random() * dustColors.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      this.dustVelocities.push({
        vx: (Math.random() - 0.5) * 0.25,
        vy: Math.random() * 0.18 + 0.05,
        vz: (Math.random() - 0.5) * 0.25
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.ambientDust = new THREE.Points(geometry, material);
    this.scene.add(this.ambientDust);
  }

  initBurstParticles() {
    this.burstParticles = [];
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.burstPoolSize * 3);
    const colors = new Float32Array(this.burstPoolSize * 3);

    for (let i = 0; i < this.burstPoolSize; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;

      colors[i * 3] = 0;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;

      this.burstParticles.push({
        active: false,
        x: 0, y: -100, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0,
        maxLife: 1,
        color: new THREE.Color(0x00f0ff)
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.burstMaterial = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    this.burstPoints = new THREE.Points(geo, this.burstMaterial);
    this.scene.add(this.burstPoints);
  }

  initShockwaves() {
    const ringGeo = new THREE.RingGeometry(0.12, 0.32, 32);
    ringGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.position.y = 0.05;
      mesh.visible = false;
      this.scene.add(mesh);

      this.shockwaves.push({
        mesh,
        active: false,
        scale: 1,
        opacity: 1
      });
    }
  }

  initTrailParticles() {
    this.trailParticles = [];
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.trailPoolSize * 3);
    const colors = new Float32Array(this.trailPoolSize * 3);

    for (let i = 0; i < this.trailPoolSize; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;

      colors[i * 3] = 0;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;

      this.trailParticles.push({
        active: false,
        x: 0, y: -100, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0,
        maxLife: 0.45,
        color: new THREE.Color(0x00ffff)
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.trailMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.trailPoints = new THREE.Points(geo, this.trailMat);
    this.scene.add(this.trailPoints);
  }

  /**
   * Spawn energetic particle burst
   */
  spawnBurst(position, primaryColorHex = 0x00f0ff, count = 45, speedMultiplier = 1.0) {
    const baseColor = new THREE.Color(primaryColorHex);
    const accentColor = new THREE.Color(0xffffff);
    let spawned = 0;

    for (let i = 0; i < this.burstPoolSize && spawned < count; i++) {
      const p = this.burstParticles[i];
      if (!p.active) {
        p.active = true;
        p.x = position.x;
        p.y = position.y;
        p.z = position.z;

        const speed = (Math.random() * 5 + 2.5) * speedMultiplier;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        p.vx = speed * Math.sin(phi) * Math.cos(theta);
        p.vy = Math.abs(speed * Math.cos(phi)) * 0.9 + 0.6;
        p.vz = speed * Math.sin(phi) * Math.sin(theta);

        p.life = 0;
        p.maxLife = Math.random() * 0.45 + 0.35;

        // Alternate between primary color and bright white sparkle
        if (Math.random() < 0.25) {
          p.color.copy(accentColor);
        } else {
          p.color.copy(baseColor);
        }

        spawned++;
      }
    }

    this.spawnShockwave(position, primaryColorHex);
  }

  /**
   * High combo celebratory fireworks
   */
  spawnFireworks(position) {
    const colors = [0x00f0ff, 0xff0088, 0xffea00, 0x9d00ff];
    colors.forEach((col, idx) => {
      setTimeout(() => {
        const offset = new THREE.Vector3(
          position.x + (Math.random() - 0.5) * 1.5,
          position.y + 0.8 + idx * 0.3,
          position.z + (Math.random() - 0.5) * 1.5
        );
        this.spawnBurst(offset, col, 35, 1.4);
      }, idx * 100);
    });
  }

  spawnShockwave(position, colorHex = 0x00f0ff) {
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) {
        sw.active = true;
        sw.mesh.visible = true;
        sw.mesh.position.set(position.x, 0.05, position.z);
        sw.scale = 0.5;
        sw.opacity = 1.0;
        sw.mesh.material.color.setHex(colorHex);
        sw.mesh.material.opacity = 1.0;
        sw.mesh.scale.set(1, 1, 1);
        break;
      }
    }
  }

  spawnTrailMote(position, colorHex = 0x00ffff) {
    for (let i = 0; i < this.trailPoolSize; i++) {
      const p = this.trailParticles[i];
      if (!p.active) {
        p.active = true;
        p.x = position.x + (Math.random() - 0.5) * 0.25;
        p.y = position.y + (Math.random() - 0.5) * 0.15;
        p.z = position.z + (Math.random() - 0.5) * 0.25;
        p.vx = (Math.random() - 0.5) * 0.4;
        p.vy = Math.random() * 0.3 + 0.15;
        p.vz = (Math.random() - 0.5) * 0.4;
        p.life = 0;
        p.maxLife = 0.42;
        p.color.setHex(colorHex);
        break;
      }
    }
  }

  update(deltaTime) {
    // 1. Update ambient dust
    if (this.ambientDust) {
      const pos = this.ambientDust.geometry.attributes.position.array;
      for (let i = 0; i < this.dustVelocities.length; i++) {
        const v = this.dustVelocities[i];
        pos[i * 3] += v.vx * deltaTime;
        pos[i * 3 + 1] += v.vy * deltaTime;
        pos[i * 3 + 2] += v.vz * deltaTime;

        if (pos[i * 3 + 1] > 4.8) {
          pos[i * 3 + 1] = 0.2;
          pos[i * 3] = (Math.random() - 0.5) * 22;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
        }
      }
      this.ambientDust.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update burst particles
    const bPos = this.burstPoints.geometry.attributes.position.array;
    const bCol = this.burstPoints.geometry.attributes.color.array;

    for (let i = 0; i < this.burstPoolSize; i++) {
      const p = this.burstParticles[i];
      if (p.active) {
        p.life += deltaTime;
        if (p.life >= p.maxLife) {
          p.active = false;
          bPos[i * 3 + 1] = -100;
        } else {
          p.vy -= 9.8 * deltaTime * 0.9;
          p.x += p.vx * deltaTime;
          p.y += p.vy * deltaTime;
          p.z += p.vz * deltaTime;

          if (p.y < 0.1) {
            p.y = 0.1;
            p.vy = -p.vy * 0.45;
          }

          bPos[i * 3] = p.x;
          bPos[i * 3 + 1] = p.y;
          bPos[i * 3 + 2] = p.z;

          const progress = 1.0 - p.life / p.maxLife;
          bCol[i * 3] = p.color.r * progress;
          bCol[i * 3 + 1] = p.color.g * progress;
          bCol[i * 3 + 2] = p.color.b * progress;
        }
      }
    }
    this.burstPoints.geometry.attributes.position.needsUpdate = true;
    this.burstPoints.geometry.attributes.color.needsUpdate = true;

    // 3. Update shockwaves
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (sw.active) {
        sw.scale += deltaTime * 14;
        sw.opacity -= deltaTime * 1.9;
        sw.mesh.scale.set(sw.scale, sw.scale, sw.scale);
        sw.mesh.material.opacity = Math.max(0, sw.opacity);

        if (sw.opacity <= 0) {
          sw.active = false;
          sw.mesh.visible = false;
        }
      }
    }

  spawnStormMotes(count = 4) {
    const rainbowColors = [0xff0055, 0xff7700, 0xffea00, 0x00ff88, 0x00e5ff, 0x9d00ff];
    for (let i = 0; i < count; i++) {
      const pos = {
        x: (Math.random() - 0.5) * 19,
        y: Math.random() * 2.2 + 0.3,
        z: (Math.random() - 0.5) * 19
      };
      const col = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
      this.spawnTrailMote(pos, col);
    }
  }

    // 4. Update snake trail
    const tPos = this.trailPoints.geometry.attributes.position.array;
    const tCol = this.trailPoints.geometry.attributes.color.array;
    for (let i = 0; i < this.trailPoolSize; i++) {
      const p = this.trailParticles[i];
      if (p.active) {
        p.life += deltaTime;
        if (p.life >= p.maxLife) {
          p.active = false;
          tPos[i * 3 + 1] = -100;
        } else {
          p.x += p.vx * deltaTime;
          p.y += p.vy * deltaTime;
          p.z += p.vz * deltaTime;

          tPos[i * 3] = p.x;
          tPos[i * 3 + 1] = p.y;
          tPos[i * 3 + 2] = p.z;

          const fade = 1.0 - p.life / p.maxLife;
          tCol[i * 3] = p.color.r * fade;
          tCol[i * 3 + 1] = p.color.g * fade;
          tCol[i * 3 + 2] = p.color.b * fade;
        }
      }
    }
    this.trailPoints.geometry.attributes.position.needsUpdate = true;
    this.trailPoints.geometry.attributes.color.needsUpdate = true;
  }
}
