---
name: design-system
description: Apple-level UI/UX design system for motion, animation, components, and visual hierarchy. Use when creating UI components, choosing animation curves, implementing motion, or making design decisions.
---

# Design System Skill

Comprehensive design system for achieving Apple-level UI/UX quality.

## Reference Files

For detailed specifications, load these files:
- **Core foundations**: `.claude/design-system/core.yaml` (color, typography, spacing, shadows)
- **Animation curves**: `.claude/design-system/animation-decision-tree.yaml` (when to use each curve)
- **UI patterns**: `.claude/design-system/patterns.yaml` (component implementations)
- **MagicPath prompts**: `.claude/design-system/magicpath-prompting-guide.yaml` (prototyping)

## Quick Reference: Animation Decision Tree

```
Does element change state?
  └─ Yes → Has clear start/finish?
      ├─ No → Use spring (bouncy, playful)
      └─ Yes → Represents time/progress?
          ├─ Yes → Use linear (constant speed)
          └─ No → Transitioning?
              ├─ Yes → Use ease-in-out (smooth transition)
              └─ No → Entering?
                  ├─ Yes → Use ease-out (snappy response)
                  └─ No → Use ease-in (smooth exit)
```

## Animation Timing

| Interaction Type | Duration | Curve |
|-----------------|----------|-------|
| Micro (hover, focus) | 200ms | ease-out |
| State change | 300ms | ease-in-out |
| Page transition | 400-500ms | ease-in-out |
| Loading spinner | continuous | linear |

## Motion Constraints

**ALWAYS:**
- Only animate `transform` and `opacity` (GPU-accelerated)
- Honor `prefers-reduced-motion`
- Use 200ms for micro-interactions
- Add subtle 1px blur during rapid motion

**NEVER:**
- Animate layout properties (width, height, top, left)
- Skip motion entirely (provides essential feedback)
- Exceed 500ms for state mutations

## Visual Hierarchy

- **Typography**: Extreme contrasts (3x+ size jumps, not gradual)
- **Colors**: Dominant with sharp accents (60-30-10 rule)
- **Shadows**: Layered (ambient + direct) for depth
- **Alignment**: Optical beats mathematical

## Accessibility (Non-Negotiable)

- Full keyboard navigation (Tab, Enter, Escape, Arrows)
- Visible focus indicators (`:focus-visible`)
- Minimum 44px touch targets (mobile), 24px (desktop)
- APCA contrast compliance
- Semantic HTML before ARIA

## CSS Light-Dark Pattern

```css
html { color-scheme: light dark; }
[data-theme=light] { color-scheme: light; }
[data-theme=dark] { color-scheme: dark; }
.element { color: light-dark(#FF3B30, #FF453A); }
```

## Quality Checklist

Before shipping UI work:

**Motion:**
- [ ] Only transform/opacity animated
- [ ] 200ms for micro-interactions
- [ ] prefers-reduced-motion honored
- [ ] 60fps on target devices

**Visual:**
- [ ] Extreme typography contrasts
- [ ] Consistent spacing rhythm
- [ ] Layered shadows (not single)
- [ ] Optical alignment applied

**Accessibility:**
- [ ] Full keyboard navigation
- [ ] Visible focus indicators
- [ ] 44px touch targets (mobile)
- [ ] APCA contrast compliance

**Performance:**
- [ ] < 500ms mutations
- [ ] Virtualized long lists
- [ ] Lazy loaded images
- [ ] Tested on low-end devices

## Reference Inspirations

- https://benji.org/family-values - Motion design excellence
- https://motion.dev/blog/web-animation-performance-tier-list - Performance guidance
