# ♟️ Rook's Gambit: Modular Dev Manual

This document synthesizes the modular architecture plan, known issues and solutions, and modernization enhancements for the Rook’s Gambit chess project. It serves as the **single source of truth** for current and future development.

---

## 📁 Directory Structure

```plaintext
chess/
├── chess.html
├── css/
│   └── chess.css
├── js/
│   ├── game-engine.js
│   ├── ui-controller.js
│   ├── ai-player.js
│   ├── particle-effects.js
│   ├── audio-manager.js
│   └── main.js
└── assets/
    ├── sounds/
    └── images/
```

---

## 🔧 Module Responsibilities

### `game-engine.js`
- Core game logic and rules (e.g., movement, check/checkmate, turn validation)
- No DOM interactions
- Exported class: `ChessGame`

### `ui-controller.js`
- Board and UI rendering
- Piece interaction highlighting
- Status updates, move history, and menu toggles

### `ai-player.js`
- Basic AI move selection
- Integration with game state and animation triggers

### `particle-effects.js`
- Visual feedback like mist, move sparkles, checkmate explosion
- Self-contained DOM manipulations

### `audio-manager.js`
- Music control (play/pause/fade/volume)
- Self-contained events (volume slider, toggle)

### `main.js`
- Entry point
- Coordinates all modules
- Attaches listeners for game controls (New Game, Undo, etc.)

---

## 🔄 Modularization Workflow

1. ✅ Backup `chess.js` as `chess-legacy.js`
2. ✅ Create `/js/` and placeholder modules
3. ✅ Migrate logic per module mappings
4. ✅ Refactor top-level orchestration to `main.js`
5. ✅ Update `<script>` tags or migrate to ES Modules
6. ✅ Test functionality incrementally
7. 🧪 Bonus: Implement basic error handling or EventBus pattern if needed

---

## 🧠 Shared State Management

**Option A (used now):**  
Centralized in `main.js` via `let gameState = new ChessGame();`.

**Future Option:**  
Use a `GameStateManager` class to encapsulate game state and notify subscribers.

---

## 📣 Event Ownership Matrix

| Event Type             | Owner Module      | Reason                          |
|------------------------|-------------------|----------------------------------|
| Board Square Click     | `main.js`         | Needs logic + UI + AI           |
| New Game / Undo        | `main.js`         | Cross-module coordination       |
| Music Controls         | `audio-manager.js`| Self-contained                  |
| Mobile Menu / Scroll   | `ui-controller.js`| Pure UI behavior                |
| Particle Animations    | `particle-effects.js` | Self-contained visuals     |

---

## 🛡 Error Handling Design

Add this when needed:

```js
class GameError extends Error {
  constructor(module, message, details = {}) {
    super(message);
    this.module = module;
    this.details = details;
  }
}
```

Handled in `main.js` using `handleGameError(error)` for graceful fallback.

---

## 🛰 Optional Architecture Enhancements

### ✅ ES Modules (Recommended for Phase 2)
Use `export/import` across modules and update HTML:

```html
<script type="module" src="js/main.js"></script>
```

### ✅ EventBus (Optional)
Loosely couple modules using an internal pub/sub system.

---

## ✅ Dev Checklist

- [ ] Create all module shells
- [ ] Copy and test each module in isolation
- [ ] Wire into `main.js`
- [ ] Swap script tags to module tag (if using modules)
- [ ] Test each feature incrementally
- [ ] Add error handling and fallback messaging
- [ ] Optionally migrate to ES Modules

---

## 📌 Naming & Style Suggestions

- Use `camelCase` for functions and variables
- Prefix shared methods: `init`, `render`, `update`
- Document public-facing functions in a comment block
- Add `README.md` to `/js` describing module roles

---

## 🧭 Final Thoughts

> “Organized code is like a clear mind—it sharpens your moves.”

This manual will evolve with the project. Use it as a living reference to avoid regressions, onboard collaborators, and guide your future self.
