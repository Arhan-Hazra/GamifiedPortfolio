# Cinematic 3D Interactive Portfolio

An award-winning, highly immersive, narrative-driven developer portfolio built with **Next.js**, **Three.js (React Three Fiber)**, **GSAP**, and **Tailwind CSS**.

This portfolio breaks away from traditional static grids, transforming the browser into an interactive 3D cinematic experience complete with procedural physics, custom cursor state machines, and a dramatic sci-fi window reveal.

---

## ✨ Key Features

* **Interactive 3D Altar Torch Field:** Powered by React Three Fiber, rendering custom local altar torch models across a dynamic ground grid.
* **Wind & Cyclone Physics:** Tracking mouse velocity and rotational movement. Rotating the cursor in rapid circles spawns a semi-transparent **cyclone cursor** that dynamically blows out torches in its radius.
* **Smart Torch State Machine:** Extinguished torches automatically reignite after a **3-second timer**. However, hovering the mouse directly over a blown-out torch pauses its timer and keeps it dark until the cursor moves away.
* **Cinematic Scroll-Jacking:** Custom GSAP ScrollTrigger engine that bends and rotates the viewport like a continuous internal cylinder as you navigate through sections.
* **Environmental Atmospheric Shifts:** Smooth transitions from standard ambient lighting to deep crimson red shifts and stormy weather particle effects across sections.
* **The Window Reveal (Final Act):** Heavy sci-fi window doors physically swing open on scroll, knocking down and scattering the remaining torches to reveal a stunning eco-city video loop backdrop and glassmorphic contact UI.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **3D Graphics & WebGL:** [Three.js](https://threejs.org/), [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
* **Animation & Scroll Physics:** [GSAP (GreenSock)](https://greensock.com/gsap/) & ScrollTrigger
* **State Management:** [Zustand](https://github.com/pmndrs/zustand)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm installed on your local machine (optimized for Linux/Ubuntu/macOS environments).

### 1. Clone the Repository

```bash
git clone https://github.com/Arhan-Hazra/portfolio.git
cd portfolio

```

### 2. Install Dependencies

```bash
npm install

```

*(Note: Ensure Three.js, React Three Fiber, Drei, GSAP, and Zustand are included in your `package.json`).*

### 3. Add 3D Assets

Make sure your local 3D torch model files are properly linked or placed inside your project's public asset pipeline:

* **OBJ / Mesh Directory:** Pointing to your local altar torch files.
* **Textures Directory:** Linked to your material texture maps.

### 4. Run the Development Server

```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the live 3D experience.

---

## 👤 Author

**Arhan Kumar Hazra**

* **Focus:** IoT, Robotics, & Edge AI Engineering
* **GitHub:** [Arhan-Hazra](https://www.google.com/search?q=https://github.com/Arhan-Hazra)
* **LinkedIn:** [arhanhazra](https://www.google.com/search?q=https://linkedin.com/in/arhanhazra)
