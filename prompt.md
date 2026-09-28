Build a complete, polished **3D Snake Game that runs directly in a web browser**.

The goal is to create something that feels much more impressive than the classic Snake game — a futuristic, highly polished **3D arcade experience** with smooth animations, glowing effects, dynamic lighting, satisfying sound effects, particles, camera movement, and a beautiful responsive UI.

## 1. TECHNOLOGY

Use modern browser technologies.

Preferred stack:

* HTML5
* CSS3
* JavaScript / TypeScript
* Three.js for the 3D rendering
* WebGL through Three.js
* Use Vite if a build system is needed

The project must run locally in a browser with a simple command such as:

npm install
npm run dev

Do NOT require a backend.

Everything should work entirely client-side.

Keep the project organized into logical files and folders rather than putting the entire application into one enormous file.

---

# 2. CORE GAME CONCEPT

Create a **3D Snake game on a futuristic floating arena**.

The player controls a glowing snake that moves around a 3D grid.

The snake starts small and grows whenever it collects an energy orb.

The objective is to:

* Collect as many energy orbs as possible
* Grow the snake
* Avoid hitting the walls
* Avoid hitting the snake's own body
* Achieve the highest possible score

The game should feel like a mixture of:

* Classic Snake
* Cyberpunk arcade game
* Futuristic holographic interface
* 3D sci-fi environment

---

# 3. 3D WORLD

Create a large square futuristic game arena.

The arena should look like a floating sci-fi platform suspended in space.

Use a dark environment with:

* Deep black/navy background
* Neon blue lighting
* Purple lighting
* Cyan glowing elements
* Subtle red warning effects
* Floating particles
* Stars in the distance

The arena should have a futuristic grid floor.

The grid should glow subtly and have animated energy flowing through some grid lines.

Add a slightly reflective floor so that the snake and lights produce subtle reflections.

The arena should feel like it exists in a huge empty digital space.

---

# 4. CAMERA

Use a perspective 3D camera.

The camera should be positioned above the arena at a slight angle so the player can clearly see the entire game board.

Do NOT use a completely flat top-down camera.

The game should clearly look 3D.

Add subtle camera effects:

* Small camera movement when collecting an orb
* Slight camera shake when the snake crashes
* Smooth camera transitions
* Slight zoom effect as the snake grows

Do not make the camera movement excessive or uncomfortable.

The entire game board should remain visible.

---

# 5. SNAKE DESIGN

The snake should NOT look like simple flat squares.

Create a futuristic 3D snake made from glowing 3D segments.

Each segment can be:

* Rounded cube
* Sphere
* Capsule
* Futuristic energy module

The head should be visually different from the body.

### Snake head

Create an impressive futuristic snake head with:

* Glowing eyes
* Metallic/dark surface
* Neon cyan or blue highlights
* Small energy effects
* Slight emissive glow

The eyes should clearly indicate the direction the snake is moving.

### Snake body

Each body segment should have:

* Neon material
* Slight glow
* Metallic surface
* Smooth rounded geometry

Connect the segments visually so the snake feels like one continuous creature.

As the snake grows, the body should become longer.

---

# 6. SNAKE MOVEMENT

Use grid-based movement like classic Snake, but visually interpolate the movement so it looks smooth.

The snake should move continuously from one grid cell to the next.

Controls:

### Keyboard

Arrow Up:
Move forward/up

Arrow Down:
Move backward/down

Arrow Left:
Turn left

Arrow Right:
Turn right

Also support:

W = Up
S = Down
A = Left
D = Right

Do not allow the player to instantly reverse direction into the snake's own body.

For example:

If moving right, pressing left should be ignored.

---

# 7. GAME SPEED

Start at a comfortable speed.

As the player collects more energy orbs:

* Increase the snake's speed gradually
* Make the game progressively harder

Do not make the game become impossibly fast.

Create a sensible maximum speed.

Add a small UI indicator showing:

SPEED

and display the current speed level.

---

# 8. ENERGY ORBS

Instead of ordinary food, create glowing futuristic **energy orbs**.

The orb should be a beautiful 3D object.

Possible design:

* Glowing sphere
* Small rotating rings around it
* Cyan/purple emissive material
* Particle effects
* Pulsating glow

The orb should slowly rotate and float slightly above the ground.

When the snake collects it:

* Play a collection sound
* Create a particle burst
* Create a brief flash
* Increase score
* Increase snake length
* Slightly increase speed
* Trigger a subtle camera effect

Then spawn a new orb at another valid location.

Never spawn the orb inside the snake.

---

# 9. PARTICLE EFFECTS

Add polished particle effects.

Use particles for:

### Energy orb

Constant:

* Small floating particles
* Glow
* Pulsating effect

When collected:

* Particle explosion
* Small energy shockwave
* Spark particles

### Snake

Add subtle particles behind the snake.

The trail should be very subtle and should not overwhelm the game.

### Crash

When the snake dies:

* Red/orange particle explosion
* Energy fragments
* Screen shake
* Brief flash
* Body segments scatter or dissolve

---

# 10. LIGHTING

Use Three.js lighting to create a premium appearance.

Use a combination of:

* Ambient light
* Directional light
* Point lights
* Emissive materials

Add colored point lights around the arena.

For example:

* Cyan lights
* Blue lights
* Purple lights

The snake should emit a subtle glow.

The energy orb should emit a strong glow.

If appropriate, use post-processing such as:

* Bloom
* Vignette
* Film grain
* Chromatic aberration used very subtly

Do NOT overdo post-processing.

The final result should remain clean and playable.

---

# 11. GAME GRID

The arena should use a logical grid.

For example:

20 × 20 cells.

Each cell should correspond to a valid snake position.

The visual grid should match the logical grid.

Make the grid clearly visible but not distracting.

The arena boundary should have glowing walls or energy barriers.

The walls should visually communicate that the snake cannot leave the arena.

---

# 12. COLLISION SYSTEM

Implement reliable collision detection.

The snake dies when:

1. The snake hits the arena boundary.

OR

2. The snake's head hits its own body.

Make collision detection based on the logical grid rather than unreliable floating-point visual positions.

The player should never lose because of tiny rendering inaccuracies.

---

# 13. SCORE SYSTEM

Create a score system.

Example:

Each energy orb:

+10 points

Display:

SCORE
000000

Also track:

* Current score
* Current length
* High score
* Speed level

Store the high score using localStorage so it remains after refreshing the browser.

Example:

HIGH SCORE
001240

---

# 14. UI DESIGN

Create a futuristic HUD overlay.

The UI should look like a premium sci-fi game interface.

Top-left:

SCORE
000000

Top-center:

3D SNAKE

Top-right:

HIGH SCORE
000000

Below it:

LENGTH: 05
SPEED: 03

Use:

* Glassmorphism
* Thin borders
* Neon glow
* Transparent panels
* Futuristic typography
* Smooth animations

Avoid generic Bootstrap-looking UI.

The interface should feel custom-designed.

---

# 15. START SCREEN

Before the game starts, show a beautiful title screen.

Large title:

NEON SNAKE

Subtitle:

3D CYBER ARCADE

Background:

Animated 3D arena.

The snake should slowly move in the background as a visual demonstration.

Show a large glowing button:

START GAME

Below it:

ARROW KEYS / WASD TO MOVE

Also show:

HIGH SCORE: XXXX

The Start button should have a hover animation.

---

# 16. PAUSE SYSTEM

Press:

P

to pause/unpause.

When paused, show a translucent overlay:

GAME PAUSED

RESUME

Controls

Press P to continue.

The game should completely stop while paused.

---

# 17. GAME OVER SCREEN

When the snake crashes, show a dramatic game-over screen.

Display:

GAME OVER

SCORE
000000

HIGH SCORE
000000

LENGTH
00

Then buttons:

PLAY AGAIN

MAIN MENU

The game-over screen should have an animated background.

Use red/orange warning lighting during the crash.

If the player achieves a new high score, display:

NEW HIGH SCORE!

with a special animation.

---

# 18. SOUND

Add optional sound effects.

Use browser-compatible audio.

Sounds should include:

* Button hover
* Button click
* Energy orb collection
* Snake movement/ambient sound
* Crash
* Game over
* New high score

Add a mute button to the HUD.

The game must still work if audio cannot be loaded.

Do not allow audio errors to break the game.

If external audio files are needed, keep them in an organized assets folder.

Prefer generated/simple Web Audio API sounds if practical so the project doesn't depend on copyrighted assets.

---

# 19. ANIMATIONS

Everything should feel alive.

Add:

* Button hover animations
* Glowing UI animations
* Pulsating energy orb
* Rotating orb rings
* Floating particles
* Smooth snake movement
* Smooth camera movement
* Score animation when collecting food
* Crash animation
* Game-over transition
* Menu transitions

Avoid abrupt visual changes.

---

# 20. RESPONSIVE DESIGN

The game must work on:

* Desktop
* Laptop
* Tablet
* Mobile browser

Desktop keyboard controls should be the primary controls.

For mobile/tablet, add an on-screen directional control.

Create a futuristic virtual D-pad:

```
↑
```

← ↓ →

The buttons should be large enough to comfortably press.

Only show the virtual controls on smaller screens.

The 3D canvas should resize automatically.

---

# 21. PERFORMANCE

Optimize the game carefully.

Target:

60 FPS on normal modern computers.

Avoid creating unnecessary objects every frame.

Reuse particle objects where possible.

Avoid memory leaks.

Properly dispose of Three.js resources when necessary.

Use efficient geometries and materials.

The game should remain smooth when the snake becomes very long.

---

# 22. VISUAL QUALITY

The most important requirement is that the game should look **WOW-level**.

Do not create something that looks like a basic beginner Three.js tutorial.

Aim for:

"An indie developer made a polished futuristic 3D Snake game."

Use:

* Neon lighting
* Glow
* Depth
* Particles
* 3D geometry
* Reflections
* Animated environment
* Beautiful UI
* Smooth transitions

The first impression should be impressive.

---

# 23. EXTRA FEATURES

Add these if they can be implemented cleanly:

### Combo system

If the player collects multiple orbs quickly:

COMBO ×2
COMBO ×3
COMBO ×4

Higher combo = more points.

### Special energy orb

Occasionally spawn a rare golden/purple orb.

It gives:

+50 points

and a temporary effect.

### Speed boost

Occasionally spawn a special power-up that temporarily increases speed.

### Slow motion

Allow a rare power-up that temporarily slows the game.

### Arena effects

As the score increases, gradually make the environment more intense.

For example:

* More particles
* Brighter grid
* Stronger lighting
* More background activity

Do not make the game visually distracting.

---

# 24. GAME STATES

Structure the game using clear states:

MENU
PLAYING
PAUSED
GAME_OVER

Make sure transitions between states are reliable.

Do not allow:

* Multiple game loops running simultaneously
* Multiple keyboard listeners
* Duplicate timers
* Duplicate animation frames

---

# 25. CODE ARCHITECTURE

Keep the code clean and maintainable.

Separate responsibilities.

For example:

src/
main.js
game/
Game.js
Snake.js
Food.js
Collision.js
Input.js
Score.js
scene/
SceneManager.js
Lighting.js
Particles.js
Camera.js
ui/
UI.js
Menu.js
HUD.js
GameOver.js
audio/
AudioManager.js
styles/
main.css

The exact structure can be changed if there is a better architecture.

Use classes/modules where appropriate.

Add comments around important systems.

Avoid unnecessary complexity.

---

# 26. ERROR HANDLING

The application must fail gracefully.

If WebGL is unavailable, show:

"Your browser does not support WebGL. Please use a modern browser."

If audio fails, the game should still work.

If an optional visual effect fails, the core game should continue working.

Do not let optional features crash the game.

---

# 27. BROWSER COMPATIBILITY

Make it work in modern:

* Chrome
* Edge
* Firefox
* Safari

Avoid browser-specific APIs unless necessary.

---

# 28. FINAL POLISH

Before considering the project finished, test all of the following:

* Start game
* Movement
* WASD
* Arrow keys
* Direction restrictions
* Food spawning
* Food collection
* Snake growth
* Score
* High score
* Wall collision
* Self collision
* Increasing difficulty
* Pause
* Resume
* Game over
* Restart
* Main menu
* Mute
* Responsive resizing
* Mobile controls
* Browser refresh
* High-score persistence
* No console errors
* No memory leaks
* Stable 60 FPS where possible

Fix any bugs you encounter.

Do not stop after creating the basic prototype.

---

# 29. IMPORTANT IMPLEMENTATION INSTRUCTION

Work on the project iteratively.

First create the functional 3D Snake game.

Then add:

1. 3D environment
2. Snake visuals
3. Energy orb
4. Collision
5. Score system
6. UI
7. Particles
8. Lighting
9. Sound
10. Animations
11. Responsive controls
12. Final visual polish

After implementation, run the project and test it in the browser.

If you encounter errors, debug and fix them yourself.

Do not simply tell me that something is broken.

Actually modify the code until the game works.

---

# 30. FINAL GOAL

The finished result should feel like a **real playable 3D browser game**, not a coding demo.

When I open the website, I should immediately see:

A dark futuristic 3D environment.

A glowing neon snake.

A beautiful floating arena.

Animated energy particles.

A glowing energy orb.

A premium futuristic HUD.

Smooth animations.

And an impressive title screen.

The overall aesthetic should be:

**NEON + CYBERPUNK + 3D + FUTURISTIC + ARCADE + PREMIUM**

Prioritize gameplay reliability first, then visual quality and polish.

Build the complete project now.
