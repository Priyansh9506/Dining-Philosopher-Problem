<p align="center">
  <img src="public/favicon.png" alt="Dining Philosophers Logo" width="80" />
</p>

<h1 align="center">Dining Philosophers Problem</h1>

<p align="center">
  <strong>An Interactive Visualizer for Process Synchronization</strong>
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-problem-statement">Problem Statement</a> •
  <a href="#-solution-strategies">Solutions</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-references">References</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Canvas-2D-FF6347" alt="Canvas" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel" alt="Vercel" />
</p>

---

## 📖 Overview

This project is a **real-time, interactive web-based simulator** for the classic **Dining Philosophers Problem** — one of the most fundamental problems in Operating Systems and Concurrent Programming.

It provides a visual canvas where five philosophers sit around a circular table, alternating between **thinking**, **being hungry**, and **eating**. Each philosopher requires two shared forks (resources) to eat, making this problem a powerful model for understanding:

| Concept | What It Teaches |
|---|---|
| **Deadlock** | When processes wait in a circular chain for resources held by each other |
| **Mutual Exclusion** | Only one process can access a shared resource at a time |
| **Starvation** | A process may never acquire the resources it needs |
| **Resource Allocation** | How operating systems manage shared resources among competing processes |
| **Concurrency Control** | Strategies for safe parallel execution of processes |

---

## 🎯 Problem Statement

> *Proposed by [Edsger W. Dijkstra](https://en.wikipedia.org/wiki/Edsger_W._Dijkstra) in 1965 and later formalized by [Tony Hoare](https://en.wikipedia.org/wiki/Tony_Hoare).*

### Setup

Five philosophers are seated around a **circular dining table**. Between each pair of adjacent philosophers lies a single **fork** (shared resource). A bowl of food sits in front of each philosopher.

```
                    Philosopher 0 (Aristotle)
                          🤔
                    F₄ /       \ F₀
                      /         \
         Philosopher 4          Philosopher 1
            (Kant)  🤔            🤔  (Plato)
                     |            |
                  F₃ |            | F₁
                     |            |
         Philosopher 3          Philosopher 2
          (Descartes) 🤔      🤔 (Socrates)
                        \    /
                      F₂ \  /
                          \/
```

### Lifecycle

Each philosopher repeats the following cycle indefinitely:

```
┌──────────┐     Becomes      ┌──────────┐    Acquires Both    ┌──────────┐
│ THINKING │ ──────────────▶  │  HUNGRY  │ ────────────────▶   │  EATING  │
│  (idle)  │     Hungry       │(waiting) │      Forks          │ (active) │
└──────────┘                  └──────────┘                     └──────────┘
      ▲                                                              │
      │                    Releases Both Forks                       │
      └──────────────────────────────────────────────────────────────┘
```

1. **Think** — The philosopher contemplates for a random duration.
2. **Get Hungry** — The philosopher attempts to pick up the **left fork** and the **right fork**.
3. **Eat** — Once both forks are acquired, the philosopher eats for a random duration.
4. **Release** — The philosopher puts down both forks and returns to thinking.

### The Core Problem

If **all five philosophers** simultaneously pick up their **left fork**, they each hold one fork and wait forever for the right fork — which is held by their neighbor. This creates a **circular wait**, resulting in **deadlock**: no philosopher can ever eat.

```
Deadlock Condition (Circular Wait):

  P₀ holds F₀, waits for F₁
  P₁ holds F₁, waits for F₂
  P₂ holds F₂, waits for F₃
  P₃ holds F₃, waits for F₄
  P₄ holds F₄, waits for F₀    ← Circular chain!
```

---

## 🔑 Coffman's Four Conditions for Deadlock

Deadlock can occur if and only if **all four** of these conditions hold simultaneously:

| # | Condition | Meaning | In This Problem |
|:-:|---|---|---|
| 1 | **Mutual Exclusion** | A resource can be held by at most one process | A fork can be used by only one philosopher |
| 2 | **Hold and Wait** | A process holds one resource while waiting for another | A philosopher holds the left fork while waiting for the right |
| 3 | **No Preemption** | Resources cannot be forcibly taken from a process | Forks cannot be snatched away from a philosopher |
| 4 | **Circular Wait** | A circular chain of processes, each waiting for the next | P₀→P₁→P₂→P₃→P₄→P₀ |

> **Key Insight:** Breaking **any one** of these conditions prevents deadlock. Each solution strategy below targets a different condition.

---

## 💡 Solution Strategies

This simulator implements **three modes**, each demonstrating a different approach:

### 1. 🔴 Naive Mode — *Deadlock Possible*

```
Algorithm:
  1. Pick up LEFT fork
  2. Pick up RIGHT fork   ← blocks if unavailable
  3. Eat
  4. Put down both forks
```

- **Every philosopher follows the same protocol** — pick up left fork first, then right.
- If all philosophers act simultaneously, **circular wait** occurs.
- This mode exists to **demonstrate the problem** and allows forcing a deadlock on demand.

**Deadlock Scenario:**

```
Philosopher:    P₀    P₁    P₂    P₃    P₄
Holds:          F₀    F₁    F₂    F₃    F₄     (each holds LEFT)
Waits for:      F₁    F₂    F₃    F₄    F₀     (each needs RIGHT)
                 ↑                         │
                 └─────── CIRCULAR ────────┘     → DEADLOCK!
```

---

### 2. 🟢 Resource Hierarchy — *Deadlock Free*

> *Dijkstra's original solution (1965)*

```
Algorithm:
  lo = min(LEFT_FORK, RIGHT_FORK)
  hi = max(LEFT_FORK, RIGHT_FORK)

  1. Pick up fork[lo]    ← always lower-numbered first
  2. Pick up fork[hi]
  3. Eat
  4. Put down both forks
```

- **Assigns a global ordering** to all forks (F₀ < F₁ < F₂ < F₃ < F₄).
- Each philosopher **always picks up the lower-numbered fork first**.
- This **breaks the circular wait** condition (Coffman Condition #4).

**Why It Works:**

```
Philosopher:    P₀         P₁         P₂         P₃         P₄
Picks first:    F₀ (lo)    F₁ (lo)    F₂ (lo)    F₃ (lo)    F₀ (lo!)  ← NOT F₄!
Picks second:   F₁ (hi)    F₂ (hi)    F₃ (hi)    F₄ (hi)    F₄ (hi)

P₄ breaks the cycle by reaching for F₀ first instead of F₄.
Since P₀ also needs F₀, one of them must wait → no circular chain.
```

**Implementation** (from [`useSimulation.js`](src/useSimulation.js)):
```javascript
const lo = Math.min(leftFork, rightFork);
const hi = Math.max(leftFork, rightFork);
if (forks[lo].heldBy === -1) forks[lo].heldBy = i;           // acquire lower first
if (forks[lo].heldBy === i && forks[hi].heldBy === -1)
    forks[hi].heldBy = i;                                     // then acquire higher
```

---

### 3. 🟢 Arbitrator (Waiter) — *Deadlock Free*

> *Centralized coordinator approach*

```
Algorithm:
  1. Request permission from the WAITER
  2. Waiter checks: are BOTH forks free?
     - YES → grant both forks atomically
     - NO  → deny, philosopher waits
  3. Eat
  4. Put down both forks, notify waiter
```

- A **centralized mutex (waiter)** controls access to the forks.
- Permission is granted **only when both forks are simultaneously available**.
- This **breaks the Hold-and-Wait condition** (Coffman Condition #2) — a philosopher never holds one fork while waiting for the other.

**Implementation** (from [`useSimulation.js`](src/useSimulation.js)):
```javascript
if (!waiterBusy && forks[left].heldBy === -1 && forks[right].heldBy === -1) {
    waiterBusy = true;
    forks[left].heldBy = forks[right].heldBy = i;   // atomic acquisition
    waiterBusy = false;
}
```

---

### Comparison Table

| Property | Naive | Resource Hierarchy | Arbitrator |
|---|:-:|:-:|:-:|
| Deadlock-Free | ❌ | ✅ | ✅ |
| Starvation-Free | ❌ | ⚠️ Possible | ⚠️ Possible |
| Max Concurrency | 2 eating | 2 eating | 2 eating |
| Extra Overhead | None | Ordering logic | Mutex / Waiter |
| Coffman Condition Broken | None | #4 Circular Wait | #2 Hold & Wait |

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **UI Framework** | React 18.3 | Component model and state management |
| **Build Tool** | Vite 5.4 | Fast HMR development and production bundling |
| **Rendering** | HTML5 Canvas 2D | Real-time philosopher/fork animation |
| **Styling** | CSS Modules | Scoped, collision-free component styles |
| **Fonts** | DM Sans + DM Serif Display | Typography via Google Fonts |
| **Deployment** | Vercel | Static site hosting with SPA rewrites |

### Project Structure

```
dining-philosophers/
├── public/
│   └── favicon.png              # App icon
├── src/
│   ├── main.jsx                 # React DOM entry point
│   ├── App.jsx                  # Root component — UI layout, controls, stats
│   ├── App.module.css           # Scoped styles for the App component
│   ├── index.css                # Global styles, CSS variables, animations
│   ├── useSimulation.js         # Core simulation logic (state machine + strategies)
│   └── useCanvas.js             # Canvas rendering loop (table, forks, philosophers)
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── vercel.json                  # Vercel SPA rewrite rules
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

### Module Responsibilities

```
┌───────────────────────────────────────────────────────────┐
│                        App.jsx                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Mode Select │  │  Playback    │  │  Stats & Logs   │  │
│  │  (3 modes)   │  │  Controls    │  │  (meals, DL)    │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
│              │              │               ▲              │
│              ▼              ▼               │              │
│  ┌──────────────────────────────────────────┴───────────┐  │
│  │              useSimulation.js (Custom Hook)          │  │
│  │  ┌────────┐  ┌──────────┐  ┌───────────┐            │  │
│  │  │ State  │  │ Acquire  │  │ Deadlock  │            │  │
│  │  │Machine │  │ Logic    │  │ Detection │            │  │
│  │  │(T→H→E) │  │(3 modes) │  │& Recovery │            │  │
│  │  └────────┘  └──────────┘  └───────────┘            │  │
│  └──────────────────────────────────────────────────────┘  │
│              │                                             │
│              ▼                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               useCanvas.js (Custom Hook)             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │  │
│  │  │ Table    │  │  Forks   │  │   Philosophers    │  │  │
│  │  │ Renderer │  │ Renderer │  │   Renderer        │  │  │
│  │  └──────────┘  └──────────┘  └───────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### State Machine

Each philosopher is modeled as a finite-state machine with four states:

```
                    timer expires
    ┌───────────┐ ──────────────▶ ┌───────────┐
    │  THINKING │                 │  HUNGRY   │
    │    🤔     │                 │    😤     │
    └───────────┘ ◀──────────────┘───────────┘
          ▲        releases forks       │
          │                             │ acquires both forks
          │                             ▼
    ┌───────────┐                 ┌───────────┐
    │           │ ◀────────────── │  EATING   │
    │           │  timer expires  │    😋     │
    └───────────┘                 └───────────┘

                                  ┌───────────┐
                                  │ DEADLOCKED│  (Naive mode only)
                                  │    💀     │
                                  └───────────┘
```

### Color Coding

| State | Color | Hex |
|---|---|---|
| 🤔 Thinking | Blue | `#4a7cf7` |
| 😤 Hungry | Orange | `#e8960a` |
| 😋 Eating | Green | `#1faa55` |
| 💀 Deadlocked | Red | `#e03535` |

---

## 🎮 Features

- **Three solution modes** — Switch between Naive, Resource Hierarchy, and Arbitrator strategies in real time
- **Force Deadlock button** — Instantly triggers the deadlock scenario in Naive mode for demonstration
- **Automatic deadlock detection** — Detects circular wait conditions and displays a warning banner
- **Automatic deadlock recovery** — After a configurable timeout, the system releases all forks and resumes
- **Adjustable simulation speed** — 0.5× to 6× speed control via slider
- **Meal target system** — Set a target total meal count and track progress with a progress bar
- **Per-philosopher meal statistics** — Live bar chart showing meals consumed by each philosopher
- **Real-time event log** — Scrollable log of all state transitions, meals, and deadlock events
- **Beautiful canvas animation** — Richly detailed wooden table with plates, forks, and animated philosopher nodes
- **Fully responsive** — Adapts to desktop, tablet, and mobile screen sizes

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Check |
|---|---|---|
| **Node.js** | ≥ 18.x | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Priyansh9506/Dining-Philosopher-Problem.git

# 2. Navigate to the project directory
cd Dining-Philosopher-Problem

# 3. Install dependencies
npm install
```

### Development

```bash
# Start the development server with hot-reload
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## 🎓 Academic Context

### Course Information

| Field | Details |
|---|---|
| **Subject** | Operating Systems (OS) |
| **Topic** | Process Synchronization & Deadlock |
| **Assignment** | Innovative Assignment |
| **Semester** | 4th Semester, B.Tech |

### Learning Objectives

After interacting with this simulator, a student should be able to:

1. **Explain** the Dining Philosophers Problem and its relevance to OS resource allocation
2. **Identify** the four Coffman conditions for deadlock
3. **Demonstrate** how naive fork acquisition leads to circular wait and deadlock
4. **Compare** the Resource Hierarchy and Arbitrator solutions, explaining which Coffman condition each one breaks
5. **Analyze** trade-offs between concurrency, fairness, and overhead in synchronization strategies

### Related OS Concepts

| Concept | Connection to This Problem |
|---|---|
| **Semaphores** | The Arbitrator/Waiter acts as a semaphore controlling access |
| **Mutex Locks** | Each fork is analogous to a mutex protecting a shared resource |
| **Process States** | Thinking → Hungry → Eating maps to Ready → Waiting → Running |
| **Resource Allocation Graph** | The philosopher-fork relationships form a bipartite resource graph |
| **Banker's Algorithm** | A more general solution to deadlock avoidance (not simulated here) |

---

## 🧪 How to Use for Demonstrations

### Demo 1: Showing Deadlock

1. Select **Naive Mode**
2. Click **Start** to begin the simulation
3. Click **Force Deadlock** — all philosophers will instantly enter circular wait
4. Observe the **red "Deadlock Detected" banner** and the event log
5. After ~3.5 seconds, the system auto-recovers

### Demo 2: Proving Resource Hierarchy is Deadlock-Free

1. Select **Resource Hierarchy** mode
2. Set speed to **6×** and enable meal target of **500 meals**
3. Click **Start** and let the simulation run
4. Observe: **0 deadlocks** occur, all philosophers eat fairly

### Demo 3: Comparing Fairness

1. Run each mode for the same meal target (e.g., 100 meals)
2. Compare the **per-philosopher meal counts** in the bar chart
3. Discuss which mode distributes meals most evenly

---

## 📚 References

1. Dijkstra, E. W. (1965). *Co-operating Sequential Processes*. Technical Report EWD-123, Technological University, Eindhoven.
2. Hoare, C. A. R. (1985). *Communicating Sequential Processes*. Prentice Hall International.
3. Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). *Operating System Concepts* (10th ed.). Wiley. — Chapter 7: Synchronization Examples.
4. Tanenbaum, A. S., & Bos, H. (2014). *Modern Operating Systems* (4th ed.). Pearson. — Section 2.3.4: The Dining Philosophers Problem.
5. Stallings, W. (2018). *Operating Systems: Internals and Design Principles* (9th ed.). Pearson. — Chapter 6: Concurrency: Deadlock and Starvation.

---

## 🛠️ Built With

- **[React](https://react.dev/)** — Declarative UI with hooks-based state management
- **[Vite](https://vitejs.dev/)** — Next-generation frontend tooling
- **[HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** — 2D graphics and animation
- **[Vercel](https://vercel.com/)** — Deployment and hosting

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for <strong>Operating Systems</strong> — B.Tech Semester 4
</p>
