/**
 * High Performance Particle System for Visual FX
 * Zero-allocation pools for 60 FPS rendering
 */

import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    // Ambient floating dust particles
    this.initAmbientDust();

    // Collection & burst particle pool
    this.burstPoolSize = 300;
    this.initBurstParticles();

    // Shockwave rings pool
    this.shockwaves = [];
    this.initShockwaves();

    // Snake thruster trail pool
    this.trailPoolSize = 100;
    this.initTrailParticles();
  }

  initAmbientDust() {
    const count = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.dustVelocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 4 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      this.dustVelocities.push({
        vx: (Math.random() - 0.5) * 0.2,
        vy: Math.random() * 0.15 + 0.05,
        vz: (Math.random() - 0.5) * 0.2
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.25,
      transparent: true,
      opacity: 0.45,
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
      positions[i * 3 + 1] = -100; // Offscreen
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
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    this.burstPoints = new THREE.Points(geo, this.burstMaterial);
    this.scene.add(this.burstPoints);
  }

  initShockwaves() {
    const ringGeo = new THREE.RingGeometry(0.1, 0.25, 32);
    ringGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < 5; i++) {
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
        opacity: 1,
        maxScale: 6,
        color: new THREE.Color(0x00f0ff)
      });
    }
  }

  initTrailParticles() {
    this.trailParticles = [];
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.trailPoolSize * 3);

    for (let i = 0; i < this.trailPoolSize; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;

      this.trailParticles.push({
        active: false,
        x: 0, y: -100, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0,
        maxLife: 0.4
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.trailMat = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.18,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.trailPoints = new THREE.Points(geo, this.trailMat);
    this.scene.add(this.trailPoints);
  }

  /**
   * Spawn explosion/burst at position
   */
  spawnBurst(position, colorHex = 0x00f0ff, count = 40, speedMultiplier = 1.0) {
    const color = new THREE.Color(colorHex);
    let spawned = 0;

    for (let i = 0; i < this.burstPoolSize && spawned < count; i++) {
      const p = this.burstParticles[i];
      if (!p.active) {
        p.active = true;
        p.x = position.x;
        p.y = position.y;
        p.z = position.z;

        // Spherical explosion velocity
        const speed = (Math.random() * 4 + 2) * speedMultiplier;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        p.vx = speed * Math.sin(phi) * Math.cos(theta);
        p.vy = Math.abs(speed * Math.cos(phi)) * 0.8 + 0.5; // Upward bias
        p.vz = speed * Math.sin(phi) * Math.sin(theta);

        p.life = 0;
        p.maxLife = Math.random() * 0.4 + 0.4;
        p.color.copy(color);

        spawned++;
      }
    }

    // Trigger ground shockwave
    this.spawnShockwave(position, colorHex);
  }

  spawnShockwave(position, colorHex = 0x00f0ff) {
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) {
        sw.active = true;
        sw.mesh.visible = true;
        sw.mesh.position.set(position.x, 0.06, position.z);
        sw.scale = 0.5;
        sw.opacity = 0.9;
        sw.mesh.material.color.setHex(colorHex);
        sw.mesh.material.opacity = 0.9;
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
        p.x = position.x + (Math.random() - 0.5) * 0.2;
        p.y = position.y + (Math.random() - 0.5) * 0.2;
        p.z = position.z + (Math.random() - 0.5) * 0.2;
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = Math.random() * 0.2 + 0.1;
        p.vz = (Math.random() - 0.5) * 0.3;
        p.life = 0;
        p.maxLife = 0.35;
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

        // Reset if float too high
        if (pos[i * 3 + 1] > 4.5) {
          pos[i * 3 + 1] = 0.2;
          pos[i * 3] = (Math.random() - 0.5) * 20;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
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
          // Gravity and friction
          p.vy -= 9.8 * deltaTime * 0.8;
          p.x += p.vx * deltaTime;
          p.y += p.vy * deltaTime;
          p.z += p.vz * deltaTime;

          // Ground bounce
          if (p.y < 0.1) {
            p.y = 0.1;
            p.vy = -p.vy * 0.4;
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
        sw.scale += deltaTime * 12;
        sw.opacity -= deltaTime * 1.8;
        sw.mesh.scale.set(sw.scale, sw.scale, sw.scale);
        sw.mesh.material.opacity = Math.max(0, sw.opacity);

        if (sw.opacity <= 0) {
          sw.active = false;
          sw.mesh.visible = false;
        }
      }
    }

    // 4. Update snake trail
    const tPos = this.trailPoints.geometry.attributes.position.array;
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
        }
      }
    }
    this.trailPoints.geometry.attributes.position.needsUpdate = true;
  }
}
