---
name: design-techniques
description: Implementation patterns for animations, gestures, and UI polish. Use when coding interactions with HTMX/Tailwind/vanilla JS.
---

# Design Techniques

**When to trigger**: Implementing interactions, animations, or UI polish. Patterns for HTMX/Tailwind/vanilla JS (NOT React).

---

## Spring Animation

### Motion Library (Vanilla JS)

```javascript
import { animate, spring } from "motion";

animate(element, { transform: "translateX(100px)" }, {
  easing: spring({ stiffness: 250, damping: 25 })
});
```

### Spring Config Mental Model
- `stiffness` ↑ = faster movement
- `damping` ↓ = more bounce/overshoot
- `mass` = rarely use (makes movement lethargic)

### Base Spring (Start Here)
```javascript
{ stiffness: 200, damping: 20 }  // Then tune per-animation
```

### When to Bounce
- **Bouncy** (damping: 10-15): Swipes, throws, momentum-driven
- **Not bouncy** (damping: 25+): Hovers, presses, mechanical actions

### Spring Configs by Use Case

| Use Case | Config |
|----------|--------|
| Base (start here) | `{ stiffness: 200, damping: 20 }` |
| Snappy response | `{ stiffness: 350, damping: 34 }` |
| Fast micro-interaction | `{ stiffness: 500, damping: 50 }` |
| Smooth following | `{ stiffness: 400, damping: 40, mass: 0.1 }` |
| Bouncy gesture | `{ stiffness: 300, damping: 25 }` |
| Morphing text | `{ stiffness: 350, damping: 55 }` |

---

## Stagger Animation

### CSS Variables Approach

```javascript
document.querySelectorAll('.item').forEach((el, i) => {
  el.style.setProperty('--stagger-delay', `${i * 0.05}s`);
});
```

```css
.item {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  transition-delay: var(--stagger-delay, 0s);
}

.item.loaded {
  opacity: 1;
  transform: translateY(0);
}
```

### HTMX Stagger

```html
<div hx-get="/items" hx-swap="innerHTML"
     hx-on::after-swap="this.querySelectorAll('.item').forEach((el,i) => {
       el.style.transitionDelay = (i * 0.05) + 's';
       el.classList.add('loaded');
     })">
</div>
```

---

## Core Utility Functions

```javascript
// Linear Interpolation
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Value Clamping
function clamp(val, [min, max]) {
  return Math.min(Math.max(val, min), max);
}

// Rubber Banding (iOS-style damping at bounds)
function dampen(val, [min, max], factor = 2) {
  if (val > max) return max + Math.sqrt(Math.abs(val - max)) * factor;
  if (val < min) return min - Math.sqrt(Math.abs(min - val)) * factor;
  return val;
}

// Velocity Projection (iOS UIScrollView deceleration)
function project(velocity, decelerationRate = 0.998) {
  return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
}

// Range Mapping
function interpolate(value, [inMin, inMax], [outMin, outMax]) {
  const progress = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * progress;
}

// Proximity Effect (macOS dock-style scaling)
function transformScale(distance, initialValue, baseValue, intensity) {
  const DISTANCE_LIMIT = 48;
  if (Math.abs(distance) > DISTANCE_LIMIT) return initialValue;
  const normalized = initialValue - Math.abs(distance) / DISTANCE_LIMIT;
  return baseValue + intensity * (normalized * normalized);
}
```

---

## Gesture Containment

### CSS During Drag

```css
.gesture-grabbing {
  cursor: grabbing;
  user-select: none;
  -webkit-user-select: none;
}

.gesture-grabbing * {
  pointer-events: none;
}
```

### JS Utility

```javascript
const grab = {
  start: () => document.body.classList.add('gesture-grabbing'),
  end: () => document.body.classList.remove('gesture-grabbing'),
};
```

### Pointer Capture

```javascript
element.addEventListener('pointerdown', (e) => {
  element.setPointerCapture(e.pointerId);
});

element.addEventListener('pointerup', (e) => {
  element.releasePointerCapture(e.pointerId);
});
```

### Touch Action

```css
.draggable { touch-action: none; }
.horizontal-slider { touch-action: pan-x; }
.vertical-slider { touch-action: pan-y; }
```

### Gesture State Machine (Click vs Drag Conflict)

```javascript
let gestureState = 'idle'; // 'idle' | 'press' | 'drag' | 'drag-end'
let origin = { x: 0, y: 0 };
const DRAG_THRESHOLD = 10; // pixels before drag triggers

element.addEventListener('pointerdown', (e) => {
  gestureState = 'press';
  origin = { x: e.clientX, y: e.clientY };
  element.setPointerCapture(e.pointerId);
  grab.start();
});

element.addEventListener('pointermove', (e) => {
  if (gestureState === 'press') {
    const distance = Math.hypot(e.clientX - origin.x, e.clientY - origin.y);
    if (distance >= DRAG_THRESHOLD) gestureState = 'drag';
  }
  if (gestureState === 'drag') {
    // Update position
  }
});

element.addEventListener('pointerup', (e) => {
  element.releasePointerCapture(e.pointerId);
  grab.end();
  if (gestureState === 'drag') {
    gestureState = 'drag-end';
  } else {
    gestureState = 'idle';
  }
});

element.addEventListener('click', (e) => {
  if (gestureState === 'drag-end') {
    e.preventDefault();
    e.stopPropagation();
    gestureState = 'idle';
    return; // Don't execute click
  }
  // Normal click handling
});
```

---

## Grid Stacking

```css
.stack-container {
  display: grid;
  place-items: center;
}

.stack-container > * {
  grid-area: 1 / 1;
}
```

---

## Focus Ring Pattern

```css
.interactive:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 2px;
}
```

---

## Input Icon Pattern

```html
<label class="input-wrapper">
  <span class="icon">🔍</span>
  <input type="text" />
</label>
```

```css
.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 12px;
}

.input-wrapper:focus-within {
  outline: 2px solid #0066ff;
  outline-offset: 2px;
}

.input-wrapper input {
  border: none;
  outline: none;
  flex: 1;
}
```

---

## Hit Area Expansion

```css
.small-target {
  position: relative;
}

.small-target::after {
  content: "";
  position: absolute;
  inset: -10px;  /* Expand clickable area */
}
```

---

## Blur Crossfade

```css
.crossfade-exit {
  opacity: 0;
  transform: scale(0.5);
  filter: blur(7px);
  transition: all 0.2s ease;
}

.crossfade-enter {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
  transition: all 0.2s ease;
}
```

---

## Clip Path Reveal

```css
.reveal {
  clip-path: inset(0 100% 0 0 round 12px);
  animation: unclip 1.5s ease-in-out forwards;
}

@keyframes unclip {
  to { clip-path: inset(0 0 0 0 round 12px); }
}
```

---

## Progressive Blur Layer

```css
.blur-layer {
  mask-image: linear-gradient(to left, #000 90%, transparent);
  backdrop-filter: blur(10px);
}
```

---

## Transition End Sync

```javascript
element.addEventListener('transitionend', callback, { once: true });
element.addEventListener('animationend', callback, { once: true });
```

---

## Menu Pattern (Instant Open, Animated Close)

```css
.menu.closing {
  opacity: 0;
  transition: opacity 0.15s ease;
}
```

```javascript
function openMenu() {
  menu.classList.remove('closing');
  menu.style.display = 'block';
}

function closeMenu() {
  menu.classList.add('closing');
  setTimeout(() => menu.style.display = 'none', 150);
}
```

---

## Icon Sizing

```css
/* Standalone icon (buttons, navigation) */
.icon-standalone { width: 16px; height: 16px; }

/* Inline with text (labels, paragraphs) */
.icon-inline { width: 18px; height: 18px; }
```

### Theme-Aware Icons
- **Light mode**: Stroked (outline) icons
- **Dark mode**: Filled icons

---

## Blur Fade (Progressive Reveal)

```css
.blur-fade {
  mask-image: linear-gradient(to right, transparent, #000 20%);
  backdrop-filter: blur(10px);
  animation: blur-fade-in 0.6s ease-out forwards;
}

@keyframes blur-fade-in {
  from {
    opacity: 0;
    filter: blur(8px);
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}
```

---

## Scroll-Driven Animation

### Map Vertical Scroll to Horizontal Translation

```javascript
// Set scrollable height based on content width
const scrollWidth = carousel.scrollWidth - carousel.offsetWidth;
document.body.style.height = `calc(100vh + ${scrollWidth}px)`;

// Fixed carousel follows scroll
carousel.style.position = 'fixed';
window.addEventListener('scroll', () => {
  carousel.style.transform = `translateX(${-window.scrollY}px)`;
});
```

### Scroll-Driven Index

```javascript
const SNAP_DISTANCE = 50; // pixels per item
window.addEventListener('scroll', () => {
  const index = Math.floor(window.scrollY / SNAP_DISTANCE);
  setActiveIndex(clamp(index, [0, items.length - 1]));
});
```

---

## SVG Line Animation

```css
.line {
  stroke-dasharray: var(--length);
  stroke-dashoffset: var(--length);
  transition: stroke-dashoffset 0.5s ease;
}

.line.revealed {
  stroke-dashoffset: 0;
}
```

```javascript
// Set line length from path
const path = document.querySelector('.line');
const length = path.getTotalLength();
path.style.setProperty('--length', length);
```

---

## Image Preloading

```javascript
// Preload next image before visible
const preloadIndex = activeIndex + VISIBLE_FRAMES;
if (preloadIndex < images.length) {
  const img = new Image();
  img.src = images[preloadIndex];
}
```

**Important**: Use `opacity: 0` not `display: none` for preload images—browsers won't load `display: none` images.

---

## mousedown + click Pattern

```javascript
// Prefetch on mousedown, navigate on click
button.addEventListener('mousedown', () => {
  prefetchNextPage(); // Start loading early
});

button.addEventListener('click', () => {
  navigateToNextPage(); // User can still cancel by moving away
});
```

---

## Choreography Rules

1. **Exit faster than enter**: Exit duration = enter duration / 2
2. **Scale + blur for crossfade**: Scale to 0.5 (not 0), blur 4-7px
3. **Never delay response**: Blur overlapping layers instead
4. **Stagger delay**: `index * 0.05s` typical for groups

---

## Morph Surface Pattern

**Problem**: When inner contents grow along with container, too many transitions layer → visual clutter.

**Solution**: Container morphs, inner content crossfades (doesn't move).

```css
.morph-container {
  position: relative;
  overflow: hidden;
  transition: width 0.3s ease, height 0.3s ease, border-radius 0.3s ease;
}

.dock-content {
  transition: opacity 0.15s ease;
}

.form-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 360px;
  height: 200px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.morph-container.expanded {
  width: 360px;
  height: 200px;
  border-radius: 14px;
}

.morph-container.expanded .dock-content {
  opacity: 0;
  pointer-events: none;
}

.morph-container.expanded .form-content {
  opacity: 1;
  pointer-events: auto;
}
```

**Key insight**: Anchor inner content to `bottom: 0` to prevent position shift during morph.

---

## CSS Variable Interpolation

Map gesture progress to CSS custom properties for declarative secondary animations.

```javascript
element.addEventListener('pointermove', (e) => {
  const progress = clamp(currentY / maxY, [0, 1]);
  document.documentElement.style.setProperty('--sheet-progress', progress);
});
```

```css
.backdrop {
  opacity: calc(0.2 - (var(--sheet-progress, 0) * 0.2));
  filter: blur(calc((1 - var(--sheet-progress, 0)) * 12px));
  transition: none; /* Direct manipulation, no transition */
}
```

**Benefit**: Secondary elements respond to primary movement without JS calculations per element.

---

## FLIP Animation (Shared Element)

Animate element from one position to another using First-Last-Invert-Play.

```javascript
function flipAnimate(element, toRect) {
  // First: Get current position
  const from = element.getBoundingClientRect();

  // Last: Apply final position
  element.style.position = 'fixed';
  element.style.left = `${toRect.left}px`;
  element.style.top = `${toRect.top}px`;
  element.style.width = `${toRect.width}px`;
  element.style.height = `${toRect.height}px`;

  // Invert: Calculate delta and apply inverse transform
  const deltaX = from.left - toRect.left;
  const deltaY = from.top - toRect.top;
  const scaleX = from.width / toRect.width;
  const scaleY = from.height / toRect.height;

  element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;

  // Play: Animate to identity transform
  requestAnimationFrame(() => {
    element.style.transition = 'transform 0.3s ease';
    element.style.transform = 'translate(0, 0) scale(1, 1)';
  });
}
```

**Use case**: Shared element transitions (e.g., thumbnail expanding to full view, logo moving between states).

---

## Scroll Indication

**Problem**: Not obvious content is scrollable.

**Solution**: Left margin indicates content beginning, partial visibility hints at more.

```css
.scroll-container {
  padding-left: 24px;  /* Indicates content starts here */
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.scroll-container > * {
  scroll-snap-align: start;
}
```

For fade indication at edges:

```css
.scroll-container {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 24px,
    black calc(100% - 24px),
    transparent
  );
}
```

---

## Code Organization

### Visual Landmarks

Use comment dividers to create visual separation in long files:

```javascript
function Lines() {}

///////////////////////////////////

function Provider() {}
```

Builds scannable structure. Use `⌘F` to jump between sections.

---

## Naming & API Design

### Contextual Naming

Remove duplication of context in naming. The component/function name already provides context.

```python
# Bad - redundant context
class Dialog:
    def set_dialog_open(self, is_dialog_open): ...

# Good - context is implicit
class Dialog:
    def set_open(self, is_open): ...
```

```css
/* Bad */
.dialog-title { }
.dialog-content { }

/* Good - nested or scoped */
.dialog .title { }
.dialog .content { }
```

### Derived Behavior

Derive behavior from existing parameters instead of adding booleans.

```python
# Bad - redundant boolean
def render_dialog(on_close=None, is_closable=True): ...

# Good - derive from on_close existence
def render_dialog(on_close=None):
    is_closable = on_close is not None
```

**Rule:** Before adding a boolean, check if behavior can be derived from existing params.

### Enum Over Conflicting Booleans

Use enums/literals to make impossible states impossible.

```python
# Bad - conflicting booleans possible
def button(is_primary=False, is_secondary=False): ...
# button(is_primary=True, is_secondary=True)  # What now?

# Good - single enum
def button(variant: Literal["primary", "secondary"] = "primary"): ...
```

```html
<!-- Good - data attribute for styling -->
<button class="btn" data-variant="primary">Submit</button>
```

```css
.btn[data-variant="primary"] { background: blue; }
.btn[data-variant="secondary"] { background: gray; }
```

---

## UI Implementation Standards

### Keyboard & Focus
- Full keyboard support per WAI-ARIA APG patterns
- Visible focus rings (`:focus-visible`)
- Manage focus (trap, move, return) per APG patterns

### Touch Targets
- Hit target ≥24px (mobile ≥44px)
- If visual <24px, expand hit area with `::after`
- `touch-action: manipulation` to prevent double-tap zoom

### Form Behavior
- Keep submit enabled until request starts
- Enter submits text input; ⌘/Ctrl+Enter submits textarea
- Errors inline next to fields; focus first error on submit
- Trim values, allow paste, support password managers
- Warn on unsaved changes before navigation

### State & Navigation
- URL reflects state (deep-link filters/tabs/pagination)
- Back/Forward restores scroll
- Links are `<a>/<Link>` (support Cmd/Ctrl/middle-click)

### Animation
- Honor `prefers-reduced-motion`
- Animate only `transform`, `opacity` (compositor-friendly)
- Animations are interruptible and input-driven

### Layout
- Optical alignment - adjust ±1px when perception beats geometry
- Verify mobile, laptop, ultra-wide
- Respect safe areas (`env(safe-area-inset-*)`)
- Avoid unwanted scrollbars

### Content & Accessibility
- Skeletons mirror final content (avoid CLS)
- `<title>` matches current context
- No dead ends - always offer next step
- Redundant status cues (not color-only)
- Icon-only buttons have `aria-label`
- Prefer native semantics before ARIA

### Performance
- Test iOS Low Power Mode and macOS Safari
- Track and minimize re-renders
- Mutations target <500ms
- Virtualize large lists
- Preload above-fold images; lazy-load rest

### Visual Depth (3-Layer Model)
1. **Base**: Page background (neutral)
2. **Surface**: Component container (subtle tint)
3. **Elevated**: Content cards (white/off-white)

---

## Reference Files

For complete implementations, see:
- `references/examples/` - Full implementation examples (blur-fade, morphing, gestures, etc.)
- `references/components/` - Reusable component patterns (blur-reveal, drawer-panel, etc.)

