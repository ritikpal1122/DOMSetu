# 🎯 DOMSetu

A high-fidelity, production-grade sandbox designed for testing modern web automation, UI/UX consistency, and complex DOM interactions. Built with **Next.js 15**, **TypeScript**, and **Vanilla CSS**, this playground provides a premium environment for mastering automation across standard and encapsulated web structures.

![Header Preview](https://img.shields.io/badge/UI-Modern%20Minimalist-blueviolet)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Theme](https://img.shields.io/badge/Themes-Light%20%2F%20Dark-orange)

## 🌟 Key Features

### 🏗️ Advanced DOM Architectures
Test your automation scripts against real-world complexity:
- **Standard DOM**: Normal HTML rendering for baseline testing.
- **Shadow DOM**: Encapsulated components using Open Shadow Roots (testing cross-boundary selectors).
- **iFrame Isolation**: Content rendered within frames to test cross-origin and frame-switching logic.
- **Complexity Nesting**: Combinations of Shadow DOMs inside iFrames for edge-case validation.

### 📝 Activity & Audit Trail
- **Live Activity Tracker**: A floating micro-capsule showing the latest user interactions in real-time.
- **Interactive History Modal**: A full audit log available via the **"Activity History"** button in the header.
- **Tabular Logs**: Detailed view with serial numbers, formatted messages, and millisecond-precise timestamps.
- **Automation Ready**: Every log entry and UI element is tagged with persistent `data-testid` attributes.

### 🌌 High-Performance Aesthetics
- **Adaptive Background Glow**: A premium, physics-based glow that follows the cursor or drifts ambiently when the user is idle.
- **Glassmorphism**: Sleek, blurred panels and adaptive borders that respond to theme changes.
- **Mobile First**: Fully responsive header and navigation that adapts gracefully from Desktop to iPhone SE.

## 🛠️ Tech Stack

- **Core**: Next.js 15 (App Router), React 18, TypeScript.
- **Styling**: Vanilla CSS with CSS Variables for theme orchestration.
- **State**: React Context API for global complexity and activity management.
- **Interactions**: Web Animations API for hardware-accelerated transitions.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd automation-playground
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Automation Guide

### Useful Locators
The playground is built with automation in mind. Use these `data-testid` attributes for reliable testing:

| Element | Test ID |
| --- | --- |
| Header History Button | `view-history-btn` |
| Complexity Dropdown | `complexity-select` |
| Activity Modal | `log-viewer-modal` |
| Log Table Row | `log-row-{id}` |
| Form Input (Native) | `native-input-{id}` |

### Global API
Access the background activity logger directly via the browser console:
```javascript
// Export all interaction history as JSON
const logs = window.exportLogs();
console.table(logs);
```

## 📜 License
Internal Project - DOMSetu © 2025.
