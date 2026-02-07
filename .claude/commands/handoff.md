# Session Handoff

Create a detailed handoff document for session continuation. This captures the full context of the current work so a future session can resume seamlessly.

## Arguments: $ARGUMENTS

## Instructions

**If no purpose was provided in the arguments, STOP and ask the user:** "What's the purpose of this handoff? (e.g., 'implementing auth', 'fixing deploy bug', 'refactoring components')"

Once you have a purpose, analyze the conversation chronologically and create a comprehensive handoff document.

## Handoff Document Structure

Create a markdown file at `.claude/handoffs/[YYYY-MM-DD]-[slug].md` with:

```markdown
# Handoff: [Purpose]

Created: [timestamp]
Session context: [brief description of what was being worked on]

## What Was Requested
- [Original user request/goal]
- [Any refinements or scope changes]

## Key Decisions Made
- [Decision 1]: [rationale]
- [Decision 2]: [rationale]

## Files Modified
- `path/to/file` - [what changed and why]
- `path/to/other` - [what changed and why]

## Current State
- [What's working]
- [What's partially done]
- [What's blocked or needs attention]

## Technical Context
- [Important patterns or conventions discovered]
- [Dependencies or relationships between components]
- [Any gotchas or non-obvious details]

## Next Steps
1. [Immediate next action]
2. [Following action]
3. [etc.]

## Open Questions
- [Any unresolved questions or decisions needed]
```

## After Creating the Handoff

1. Print the file path
2. Summarize what was captured
3. Tell the user: "To resume, start a new session and run `/handoff pickup [filename]`"
