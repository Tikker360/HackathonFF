# buylow - Agent Guidelines

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/handoff` | Save session state for later continuation |
| `/pickup` | Resume from a handoff document |

**Version Control:** Sapling SCM (`sl` commands, never `git`)
**Repo:** https://github.com/Tikker360/HackathonFF.git

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** Supabase (auth, database, realtime)
- **Styling:** Tailwind CSS v4
- **Hosting:** Vercel
- **SCM:** Sapling (`sl` commands, never `git`)

## Directory Guide

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js App Router pages and layouts |
| `src/components/` | React components |
| `src/lib/` | Utilities, Supabase client, helpers |
| `.claude/` | Claude Code config |
| `public/` | Static assets |

## Non-Negotiables

**Version Control:**
- Always use `sl` (Sapling), never `git`
- One bookmark = one feature (atomic commits)
- No commits without an active bookmark
- No force push to main

**Code Quality:**
- Every commit must compile
- No disabling tests to make them pass
- No `--no-verify` to bypass hooks
- Maximum 3 attempts per issue, then reassess

**Security:**
- Never commit secrets or credentials
- No dangerous `rm -rf` operations
- Supabase keys go in `.env.local` (gitignored)

## Build Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # ESLint
```

## Commit Message Format

```
<type>: <description>

[optional body]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

## Philosophy

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Ergonomics before aesthetics** - Affordance and usability first
- **Proportional response** - Animation/feedback proportional to action importance
- **No clever tricks** - Choose the boring, obvious solution

## Design Principles

When building UI, apply these in order:
1. What job is the user trying to do?
2. What context can we infer?
3. Is it ergonomic before aesthetic?
4. Is the response proportional?
5. Does the metaphor compound learning?

See `.claude/skills/design-thinking/SKILL.md` for full framework.

## Output Guidelines

- No specific timelines or percentage-based claims
- No fabricated metrics
- Do what was asked; nothing more, nothing less
- Prefer editing existing files over creating new ones
