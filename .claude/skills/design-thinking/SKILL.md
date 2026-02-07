---
name: design-thinking
description: Design principles and decision frameworks for UI interactions. Use when designing user-facing features, animations, or accessibility patterns.
---

# Design Thinking

**When to trigger**: Designing UI interactions, animations, or user-facing features. Prescriptive principles to evaluate before implementation.

---

## Mandatory Design Review

Before implementing ANY interaction, animation, or UI component, you MUST evaluate against these principles. If you want to deviate, present your case—but first apply the guidelines.

---

## Core Principles

### 1. Infer Intent
**Make the layer between software and user intent as thin as possible.**

- Identify tedious manual steps and automate them
- Use available context: clipboard, location, time, velocity, recent activity
- Predict the "obvious next action"

**Before implementing**: What context can we infer? What steps can we eliminate?

### 2. Reuse Metaphors
**Learned gestures should compound across the interface.**

- Map interactions to physical world behaviors
- One learned gesture unlocks many interactions
- Respect physics: momentum, interruptibility, weight

**Before implementing**: Does this gesture match physical intuition? Will users recognize the metaphor?

### 3. Ergonomics Before Aesthetics
**Affordance (obvious how to use) + Ergonomics (ease of use) come BEFORE visual polish.**

- Reserve pure colors for interactive elements
- Let users submit forms with errors (don't disable buttons)
- Never remove focus rings without replacement
- Expand hit areas for small targets

**Before implementing**: Is it obvious this is interactive? Can users reach it easily?

### 4. Simulate Physics
**Physics properties (velocity, momentum, weight) drive believable animations.**

- Use springs over fixed durations (stiffness, damping)
- Match bounce to interaction momentum
- Scale up on hover, down on press
- Add friction for destructive actions

**Before implementing**: Does this have appropriate weight? Does bounce match the gesture?

### 5. Choreograph Motion
**Orchestrate WHEN things happen—elements move at different speeds and times.**

- Stagger group animations (school of fish effect)
- Blur overlapping layers instead of delaying response
- Exit animations faster than enter (2x velocity)
- Use distance thresholds, not just time

**Before implementing**: Is the timing choreographed? Do elements overlap during transition?

### 6. Proportional Response
**Every input expects proportional feedback—not too much, not too little.**

- Reserve exaggeration for special moments
- Reduce animation for high-frequency actions
- Don't animate when brain processes faster than animation
- Interpolate secondary elements from primary movement

**Before implementing**: Is this response proportional? Is novelty justified by benefit?

### 7. Contain Gestures
**Isolate interactions so they don't trigger surrounding elements.**

- Disable pointer-events during drag
- Use touch-action to prevent scroll conflicts
- Handle click/drag conflicts with state tracking
- Use pointer capture for edge-initiated drags

**Before implementing**: Will this gesture accidentally trigger other things?

### 8. Elevate, Don't Copy
**Draw inspiration from multiple sources, iterate beyond them.**

- Remix multiple influences
- Add constraints that force differentiation
- Attribute when output closely resembles input

**Before implementing**: What's our unique contribution? Have we iterated beyond the source?

---

## Decision Framework

### Before Every Interaction

1. **What job is the user trying to do?** (Virtue of utility)
2. **What context can we infer?** (Thin layer principle)
3. **Does this metaphor compound learning?** (Interaction metaphors)
4. **Is it ergonomic before aesthetic?** (Affordance check)
5. **Is the response proportional?** (No over/under animation)

### The Novelty Tax Question

> "There's this novelty tax when you try a new product... People just couldn't handle how much there was to learn."

- Is the audience power users or general consumers?
- Is the novelty tax justified by the benefit?
- Have we kept familiar things familiar?

---

## Quality Philosophy

> "Let's do it until there's no more that can be done." — Jony Ive

- Quality is a function of time, not team size
- Good taste = seeing further down the iteration lifecycle
- Details are care—every element is an opportunity for polish
- Trust intuition first, articulation comes later

### Articulating Intuition

The bar for giving design feedback is low (it's visual). The bar for responding well is disproportionately high.

> "Why is this layout in two columns?" won't be satisfied by "because it felt right."

**The reality:**
- Early on you'll struggle with articulating intuition
- **Do not doubt it**—it's probably right
- You just can't put a finger on it yet

No one gives vague, off-the-cuff technical feedback without being able to engineer themselves. They give functional feedback: "pressing this button gives me this error." Design doesn't get that luxury—trust your eye, articulation comes with experience.

### Robust Interaction Spammability
**Test interactions like QA: spam clicks, rapid state changes, edge cases.** There's no room for "kinda works." If you can break it by clicking fast, users will find it.

### Working With the Material
Code is the material. Constraints shape ideas—leaning into what CSS/browser does well often yields better results than fighting it.

---

## Red Flags (Stop and Reconsider)

- Disabling submit buttons with tooltips
- Removing focus rings entirely
- Animations that block user input
- Sounds that play on mobile (pauses music)
- Gestures that contradict physical intuition
- Exaggerated response for mundane actions
- Novelty for novelty's sake
- Core interactions that "kinda work" 80% of the time
- Non-interruptible animations (user must wait)
- Custom animated text caret that doesn't work 100% reliably

---

## Workflow Habits

### Long Files + ⌘F
Keep related code in long files. Use search (⌘F) to navigate. Builds contextual memory for function names over time.

### Video Scrubbing
Frame-by-frame analysis for complex motion. Pause, step forward, understand the choreography.

### Clipboard History
Use clipboard manager to snapshot entire file states. Iterate freely knowing you can roll back.

### Validation is Filtering
Try "stupid" ideas and build them to completion. Validation is filtering—bad ideas reveal themselves through execution. After exploring extremes, simplicity often wins.

### Optical Alignment
Don't hesitate to nudge elements 1-2px with `translate` if alignment feels off. Browser inconsistencies and font baselines don't always align perfectly—trust your eye.

### Try the Extreme Version
Before settling, dial the idea to 100. Build the over-the-top version. Then compare: "oh yeah, this simple one feels way better." You can't know until you've seen both.

---

## Robustness Testing Checklist

When implementing an interaction, verify:
- ☐ How long until feedback appears after click?
- ☐ Does anything shift after clicking?
- ☐ Visual glitches if click and quickly scroll?
- ☐ Can you break it by spamming clicks?
- ☐ Works while low on battery / throttled CPU?
- ☐ Navigate back and forth until no "splinters"

### The Sluggishness Test

> "I removed motion from keyboard interactions and suddenly felt like I was moving much faster."

**After a couple days of use, do animations feel sluggish? Remove them.**

High-frequency actions (command palettes, menus, keyboard shortcuts) accumulate cognitive burden. What felt delightful on first use becomes friction after the hundredth time. When in doubt, instant response beats animated response for productivity tools.


