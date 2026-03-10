# DOMSetu

A high-fidelity sandbox for testing AI browser automation frameworks (like KaneAI) against real-world DOM complexity. Built as an elite playground with enterprise-grade UI, activity audit logging, and multiple DOM architecture modes.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19, TypeScript
- **Styling**: Vanilla CSS with CSS Variables (no Tailwind/UI frameworks)
- **State**: React Context API (Theme, Complexity, Activity)
- **Animations**: Web Animations API

## Quick Start

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with Providers
│   ├── page.tsx                # Homepage with scenario cards
│   ├── globals.css             # Global styles + theme CSS variables
│   ├── lab/                    # Testing scenario pages
│   │   ├── forms/page.tsx      # Native HTML5 form elements
│   │   ├── scroll/page.tsx     # Scroll dynamics (infinite, virtual, nested)
│   │   ├── alerts/page.tsx     # Modals, toasts, dialogs
│   │   ├── dropdowns/page.tsx  # Select, custom dropdowns, multi-select
│   │   └── canvas/page.tsx     # Draggable elements, visual assertions
│   ├── chrome-prefs-validator/page.tsx  # Chrome browser preference flags validator
│   ├── ecommerce/checkout/page.tsx     # E-commerce checkout flow (browse→cart→shipping→payment→confirm)
│   └── login-checker/page.tsx          # Chrome password manager detection
├── components/                 # Reusable components
│   ├── Header.tsx              # Sticky header with complexity selector
│   ├── Navbar.tsx              # Hamburger nav with NAV_ITEMS array
│   ├── ComplexityWrapper.tsx   # DOM complexity provider (Shadow/iFrame)
│   ├── ActivityCapsule.tsx     # Floating activity indicator
│   ├── LogViewerModal.tsx      # Activity history modal
│   ├── MouseGlow.tsx           # Adaptive background glow effect
│   └── Providers.tsx           # Context providers wrapper
└── context/                    # React Context
    ├── ThemeContext.tsx         # Light/Dark theme toggle
    ├── ComplexityContext.tsx    # DOM complexity mode selector
    └── ActivityContext.tsx      # Activity logging system
```

## Key Concepts

### DOM Complexity Modes
The header dropdown switches how content is rendered:
- **Standard DOM** — baseline HTML
- **Shadow DOM** — open shadow roots with encapsulated styles
- **iFrame Isolation** — cross-origin frame rendering
- **Nested combos** — shadow-in-iframe, iframe-in-shadow, nested shadows/iframes

### Activity Audit Trail
All user interactions are logged with timestamps. Accessible via:
- Floating ActivityCapsule showing latest action
- "Activity History" modal with full tabular log
- `window.exportLogs()` for programmatic JSON export

### Theme System
Two themes: **Dark ("Midnight")** and **Light ("Frost")**. Persisted in `localStorage`. Uses 30+ CSS variables (`--bg-card`, `--accent-primary`, `--text-primary`, etc.).

## Coding Conventions

- `"use client"` directive on all interactive components
- PascalCase components, camelCase functions/variables, SCREAMING_SNAKE for constants
- `data-testid` attributes on all automation-relevant elements (kebab-case)
- Activity logging: `logAction("description", "ComponentName")` via `useActivity()` hook
- Inline styles via `React.CSSProperties` objects; CSS Variables for theming
- Box-shadow for borders instead of `border` property in many places

### Page Layout Pattern
- Pages use `.container` class from globals.css (`max-width: 1440px; margin: 0 auto`)
- Add `.fade-in` and `.main-container` classes alongside `.container`
- Standard padding: `60px 40px` on desktop, `40px 20px` on mobile (768px breakpoint)
- Side navigation uses `.side-nav-container` class, hidden below 1024px via `globals.css`
- Example: `<div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: '1200px' }}>`

### styled-jsx Scoping
- `<style jsx>` scopes CSS to the declaring component only — child components won't inherit
- Use `<style jsx global>` when CSS classes are used by child components (e.g., `.product-grid` in ProductsStep)
- Prefer CSS classes in `<style jsx global>` over inline styles for responsive layouts

### setState-during-render Prevention
- NEVER call `logAction()` (which triggers ActivityProvider setState) inside a state updater function
- Wrong: `setSelected(prev => { log(...); return next; })`
- Correct: Compute next from current state, call `setSelected(next)` then `log(...)` sequentially

### Reset Buttons
- Each section/page should have a Reset button
- For uncontrolled elements (native selects): use `key={resetKey}` pattern to remount
- For controlled elements: directly reset state variables
- Shared style: `resetBtnStyle` constant with secondary appearance

### Key data-testid Patterns
- `view-history-btn`, `complexity-select`, `log-viewer-modal`
- `log-row-{serial}`, `native-input-{id}`, `login-form`, `login-btn`
- E-commerce: `product-{id}`, `add-to-cart-{id}`, `cart-item-{id}`, `qty-decrease-{id}`, `shipping-{field}`, `payment-{field}`, `step-{name}`

## Global APIs (browser console)

```js
window.exportLogs()          // Export activity logs as JSON
window.loginCheckerState     // Login page state (on /login-checker)
```
