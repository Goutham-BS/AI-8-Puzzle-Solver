# 8-Puzzle AI Solver

A browser-based 8-puzzle solver that uses the **A\* search algorithm** with Manhattan distance heuristic to find the optimal solution. Built with vanilla JavaScript — no libraries, no frameworks.
---

## Demo

Shuffle the board, hit **Solve with AI**, and watch the solver animate the optimal path step-by-step with a live trace panel.

---

## Features

- **A\* Search** with Manhattan distance heuristic for optimal pathfinding
- **MinHeap priority queue** for efficient node expansion
- **Step-by-step AI trace** panel showing every move with direction labels
- **Live animation** of the solution playback at 450ms per step
- **Manual play** — click tiles to move them yourself before solving
- **Start/Goal state preview** panels on either side
- Responsive layout, works on mobile

---

## How It Works

### Algorithm

The solver implements **A\* search**, which finds the shortest path from any solvable starting state to the goal state `[1,2,3,4,5,6,7,8,_]`.

**Cost function:** `f(n) = g(n) + h(n)`
- `g(n)` — number of moves taken so far
- `h(n)` — Manhattan distance heuristic (sum of each tile's distance from its goal position)

**Why Manhattan distance?** It's admissible (never overestimates) and consistent, which guarantees A\* finds the optimal solution.

### Data Structure

A custom **MinHeap** is used as the priority queue to always expand the lowest-cost node first. This gives O(log n) insertion and extraction vs O(n) for a naive sorted array.

### Solvability

Not all 8-puzzle configurations are solvable. The app uses a random walk shuffle (200 valid swaps from the goal state) which guarantees every generated puzzle is solvable.

---

## Project Structure

```
8-puzzle-solver/
├── index.html      # Layout and DOM structure
├── style.css       # Glassmorphism dark UI, CSS variables, responsive grid
└── solver.js       # A* algorithm, MinHeap, heuristic — pure logic, no DOM
    script.js       # UI rendering, animation, board interaction
```

`solver.js` is fully decoupled from the UI — `window.Solve8Puzzle(state)` takes a flat 9-element array and returns the full solution path.

---

## Getting Started

No build step needed. Just clone and open.

```bash
git clone https://github.com/Goutham-BS/8-puzzle-solver.git
cd 8-puzzle-solver
open index.html
```

Or serve it locally:

```bash
npx serve .
```

---

## Tech Stack

| Part | Details |
|---|---|
| Language | Vanilla JavaScript (ES6+) |
| Algorithm | A* Search |
| Heuristic | Manhattan Distance |
| Data Structure | Custom MinHeap |
| Styling | CSS custom properties, CSS Grid, glassmorphism |
| Fonts | Outfit + JetBrains Mono (Google Fonts) |

---

## Complexity

| | Bound |
|---|---|
| Time | O(b^d) where b = branching factor (~3), d = solution depth |
| Space | O(b^d) — all nodes stored in heap and visited set |
| Optimal | ✅ Yes, Manhattan distance is admissible |
| Complete | ✅ Yes, for all solvable states |

In practice, most random 8-puzzle configurations are solved in under 30 moves and run in milliseconds.
