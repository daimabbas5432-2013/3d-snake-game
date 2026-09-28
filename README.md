# 🐍 NEON VIPER 3D — Futuristic Cyber Arcade

A futuristic, high-octane **3D Snake game** built for modern web browsers using **Three.js** and **WebGL**.

Immerse yourself in a floating digital arena in deep space, featuring glowing neon aesthetics, volumetric lighting, particle effects, procedural cyber sound synthesis, and silky 60 FPS interpolated gameplay.

---

## ✨ Features

- **Futuristic 3D Arena**: Suspended platform in deep space, dynamic canvas-rendered neon grid floor with traveling energy pulses, glowing laser barriers, and 1,400+ twinkling celestial stars.
- **Faceted Cyber Snake**: Aerodynamic faceted cyber head with twin glowing neon eyes, dynamic headlight beam, metallic segment bodies with gradient illumination (cyan to magenta), subtle pulse animations, and thruster trails.
- **Visual Interpolation**: Fixed-timestep grid logic paired with smooth delta-time interpolation (`lerp`), delivering ultra-smooth 60 FPS motion without grid stutter.
- **Energy Orbs & Power-ups**:
  - 🔵 **Plasma Orb**: Standard energy orb with gyroscopic spinning rings (+10 pts × combo).
  - 🟡 **Overcharge Core**: Rare golden orb (+50 pts, activates 2X score multiplier for 8s).
  - 🟣 **Time Distortion (Chrono)**: Rare violet orb (+30 pts, slows time down for 6s).
- **Combo Multiplier System**: Chain orb collections within 3.5s to rack up 2x, 3x, 4x, and 5x multipliers with ascending musical chime harmonics.
- **Particle System**: Reusable zero-allocation pools for ambient cosmic dust motes, orb collection bursts, ground shockwaves, tail thrusters, and explosive crash scatter physics.
- **Procedural Web Audio Engine**: 100% synthesized sound effects via the Web Audio API—no external audio files required, zero broken assets, instant loading. Includes melodic combo chimes, sub-bass crashes, powerup sweeps, and mute toggle.
- **Glassmorphic Cyber HUD**: Sleek panels with backdrop blur, holographic borders, score, high score (saved in `localStorage`), length, speed level, and interactive modals.
- **Interactive States**:
  - **Menu Screen**: Live 3D cinematic camera orbit with an autonomous AI demo snake patrolling in the background.
  - **Pause Mode**: Press `P` or click pause anytime.
  - **Game Over**: Explosive debris physics, camera shake, red alert arena lighting, and high score celebration banner.
- **Cross-Platform & Responsive**: Keyboard (WASD / Arrow Keys), touch swipe gestures, and an on-screen glowing virtual D-pad for mobile and tablet browsers.

---

## 🚀 Quick Start

### Option 1: Run with any local HTTP server (Zero install required!)

Using PowerShell (built into Windows):
```powershell
# In the project directory:
$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add("http://localhost:8080/"); $listener.Start(); Write-Host "Server running at http://localhost:8080/"; Start-Process "http://localhost:8080/"; while($listener.IsListening){$context = $listener.GetContext(); $path = Join-Path (Get-Location) $context.Request.Url.LocalPath.TrimStart('/'); if(Test-Path $path -PathType Leaf){$bytes = [IO.File]::ReadAllBytes($path); $context.Response.ContentLength64 = $bytes.Length; $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)}else{$context.Response.StatusCode = 404}; $context.Response.Close()}
```

Or using `npx`:
```bash
npx serve .
```

### Option 2: Run with Vite (Node.js)

```bash
npm install
npm run dev
```

Then navigate to `http://localhost:3000` (or `http://localhost:8080`).

---

## 🎮 Controls

| Action | Desktop / Keyboard | Mobile / Touch |
|---|---|---|
| **Steer Up** | `W` or `↑` | Swipe Up or Virtual D-Pad `▲` |
| **Steer Down** | `S` or `↓` | Swipe Down or Virtual D-Pad `▼` |
| **Steer Left** | `A` or `←` | Swipe Left or Virtual D-Pad `◀` |
| **Steer Right** | `D` or `→` | Swipe Right or Virtual D-Pad `▶` |
| **Pause / Resume** | `P` or `ESC` | Pause Button in HUD |
| **Start / Restart** | `Enter` or `Space` | "Start Mission" / "Retry" Button |
| **Toggle Mute** | Click Speaker in HUD | Click Speaker in HUD |

---

## 📁 Project Architecture

```
snake-game/
├── index.html               # Responsive HTML5 entry point & import maps
├── package.json             # NPM dependencies & scripts (Three.js & Vite)
├── vite.config.js           # Vite configuration
├── README.md                # Documentation & instructions
└── src/
    ├── main.js              # Application bootstrap & animation loop
    ├── styles/
    │   └── main.css         # Glassmorphism, neon color schemes & layout
    ├── audio/
    │   └── AudioManager.js  # Procedural Web Audio API sound synthesizer
    ├── game/
    │   ├── Constants.js     # Dimensions, palettes, tick speeds & food configs
    │   ├── Input.js         # WASD, arrows, touch swipes & input queue
    │   ├── Score.js         # Score, combos, leveling & localStorage persistence
    │   ├── Snake.js         # 3D cyber snake mesh, interpolation & debris physics
    │   ├── Food.js          # Gyroscopic 3D energy orbs & power-ups
    │   └── Game.js          # Game state machine, loop & collision detection
    ├── scene/
    │   ├── SceneManager.js  # Perspective camera, resize, shake & postprocessing
    │   ├── Arena.js         # Floating platform, animated grid & starfield
    │   ├── Lighting.js      # Sci-fi directional, ambient & corner neon lights
    │   └── Particles.js     # Pooled spark bursts, shockwaves & dust motes
    └── ui/
        └── UIManager.js     # HUD updates, popup score floaters & modals
```

---

## 🛠️ Browser Compatibility

Tested and compatible with all modern browsers supporting WebGL and ES modules:
- Google Chrome 90+
- Microsoft Edge 90+
- Mozilla Firefox 88+
- Apple Safari 14+
