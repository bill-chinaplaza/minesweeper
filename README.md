# Minesweeper

A classic Minesweeper experience built with React, TypeScript, and Vite. Choose a difficulty, race against the clock, and clear the board without detonating a mine.

## Features

- Three preset difficulties (Beginner, Intermediate, Expert) plus a customizable option
- First click safety with procedural mine placement
- Flag counter and timer with best-time tracking for preset difficulties
- Flood fill reveal for empty cells and chord/double-click reveals for numbered cells
- Keyboard accessible controls, mobile-friendly long-press to flag, and responsive layout
- Visual feedback for game states with expressive face button and exploded mine styling

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm (bundled with Node.js)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This starts the Vite development server. Open the printed URL (typically http://localhost:5173/) in your browser.

### Production Build

```bash
npm run build
```

This runs the TypeScript compiler and produces an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm run test
```

Executes the Vitest test suite in a Node + JSDOM environment.

## How to Play

- **Left click / Enter / Space** – Reveal a cell.
- **Right click / `F` key / long-press (touch)** – Cycle between flag, question mark, and clear states.
- **Double click / Middle click / Left + Right click / Enter or Space on a revealed number** – Chord to reveal surrounding cells when the correct number of flags are present.
- **Arrow keys** – Move focus between cells for keyboard play.

The timer begins on the first revealed cell and stops when you win or hit a mine. The face button shows the current game state and lets you quickly reset the board while keeping the selected difficulty.

## Project Structure

```
src/
├── components/    # Presentational components (Board, Cell, Header, Timer, etc.)
├── lib/           # Game logic utilities (board creation, reveal logic, helpers)
├── styles/        # Global stylesheet
├── App.tsx        # Main game container
└── main.tsx       # Entry point
```

## Styling

Styling is handled via a shared CSS module located at `src/styles/index.module.css`. Global resets are applied with `:global` selectors while component-specific classes remain scoped, preserving the classic Minesweeper aesthetic with responsive tweaks for smaller screens.

## License

This project is provided as part of a coding exercise and does not include a specific license.
