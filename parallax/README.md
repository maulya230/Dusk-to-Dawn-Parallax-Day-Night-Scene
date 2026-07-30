# Dusk to Dawn — Parallax Day/Night Scene

A single scrolling scene: sunrise, morning, noon, golden hour, dusk, and a full starry night — all driven by scroll position, with layered parallax depth (sky, sun/moon arc, drifting clouds, far skyline, near skyline with lights that turn on as it gets dark).

[Live demo →](#) https://dusk-to-dawn-parallax-day-night-sce.vercel.app/

## Features

- Sky color smoothly interpolates through 7 keyframes (sunrise → noon → golden hour → night) as you scroll — not a hard cut between states
- Sun and moon each trace a real arc across the sky (rise → peak → set) tied to scroll progress, handing off from one to the other around dusk
- ~130 stars fade in during dusk/night with individual twinkle timing
- Two independent cloud layers drift continuously (CSS animation, not scroll-tied) at different speeds for depth, dimming as night falls
- Two skyline layers — a hazy far layer and a solid near layer — move at different parallax rates as you scroll
- Windows on the near skyline light up individually, each with a random flicker/delay offset, as the sky darkens — not a uniform on/off
- A caption crossfades between phase titles ("Sunrise." → "Golden hour." → "Goodnight, city.") synced to the same keyframes as the sky
- Thin scroll-progress bar pinned to the top of the viewport

## Tech

- Plain HTML, CSS, and JavaScript — no scroll/animation libraries (no GSAP, no ScrollTrigger)
- A single `requestAnimationFrame` loop reads `window.scrollY` each frame and drives every layer from one `progress` value (0–1)
- All buildings, windows, stars, and clouds are generated procedurally in JS — nothing hardcoded per element

## Project structure

```
day-to-night-parallax/
├── index.html   → scene markup + a tall scroll spacer
├── style.css    → layer positioning, gradients, animations
└── script.js    → keyframes, color interpolation, procedural generation, render loop
```

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
```

Then just scroll — the page is 600vh tall by design; that height is what gives the day its "length."

## How the scroll-to-scene mapping works

- `.scroll-spacer` is a tall, empty div (`600vh`) that exists purely to create scrollable distance.
- `.scene` is `position: fixed`, so it stays pinned to the viewport the entire time — what changes is *what's drawn inside it*, not its position.
- Every frame, `progress = scrollY / (spacerHeight - viewportHeight)` gives a 0–1 value, and every visual property (sky color, sun/moon position, star opacity, window lights, parallax offsets) is a function of that single number.

## Tuning

- `KEYFRAMES` in `script.js` controls the sky's color journey and captions — add, remove, or re-time entries to change the pacing of the day.
- `STAR_COUNT`, cloud cluster positions, and the `buildCity()` calls at the bottom control density — increase building/window counts for a denser skyline (mind performance on lower-end devices).
- The scroll spacer height (`600vh` in `style.css`) controls how much scrolling the full day takes — shorter feels snappier, taller feels more cinematic.

---

Built by Maulya Shetty.
