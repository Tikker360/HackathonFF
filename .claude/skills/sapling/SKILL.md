---
name: sapling
description: Sapling SCM version control workflows for trunk-based development with atomic commits. Use when committing, pushing, creating bookmarks, or managing version control.
---

# Sapling Version Control Skill

Sapling SCM workflows for the bakery repository. Always use `sl` commands, never `git`.

## Quick Reference

```bash
sl                      # Smartlog - see commit graph
sl status               # Show working directory state
sl diff                 # Show uncommitted changes
sl book <name>          # Create bookmark for feature
sl commit -m "msg"      # Commit changes
sl push --to main       # Push to main
sl goto main            # Return to main
sl pull                 # Get latest from remote
```

## Core Principles

1. **Trunk-based development**: Push directly to main, no long-lived feature branches
2. **Atomic commits**: One bookmark = one feature (non-negotiable)
3. **Always use Sapling**: `sl` commands only, never `git`

## Daily Workflow

```bash
# Start new feature
sl pull                    # Get latest
sl book feature-name       # Create bookmark
# ... make changes ...
sl commit -m "feat: ..."   # Atomic commit
sl push --to main          # Direct to main
sl goto main               # Return to main
```

## Commit Message Format

```
<type>: <description>

[optional body]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructure
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

## Stack Management

```bash
sl absorb              # Absorb changes into existing commits
sl amend --to <rev>    # Amend specific commit in stack
sl split               # Split current commit
sl fold                # Combine commits
sl histedit            # Interactive history editing
```

## PR Workflow (GitHub)

```bash
sl pr submit           # Create/update PR from current stack
sl pr list             # List open PRs
```

## Safety Rules (Enforced by Hook)

**Blocked Operations:**
- Commits without active bookmark
- Force push to main
- `sl revert --all` (use `sl shelve` instead)
- `sl strip` or `sl prune` (use `sl hide` for recoverable removal)

## Reference

For comprehensive Sapling documentation, see `.cursor/rules/sapling.mdc`
