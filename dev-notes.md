# Copilot Development Context for Ballistic Front

This project is a 2D artillery/tank game built with:

- React 18 + TypeScript
- PixiJS 8 (WebGL)
- Vite
- Zustand (HUD state only)
- Deterministic physics engine (src/game/physics)
- Destructible terrain (RenderTexture + heightmap)
- Turn-based gameplay (src/game/systems/turnManager)

The game loop, physics, terrain and entities live in src/game/.
React is only for UI (HUD, menus, shop, results).

## Multiplayer goals

- Simple, reliable, PHP + MySQL backend (no WebSockets needed)
- Server stores and syncs game state in JSON
- Clients run physics locally (deterministic)
- Turn-based flow: after firing, send angle/power/wind to server
- Other client fetches state and simulates the shot
- No server-side physics, no anti-cheat for now

## What to generate

- TypeScript modules for multiplayer client
- PHP endpoints for lobby and state sync
- Zustand store for multiplayer lobby
- Integration points inside Game engine (mode: "single" | "multi")
- Clean, modular code, no React inside game engine
- Data-driven definitions for upgrades and projectiles

## What NOT to generate

- No server-side physics
- No WebSocket implementation (v1)
- No monolithic classes; prefer small modules
- No mixing UI and game logic
