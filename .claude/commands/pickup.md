# Session Pickup

Resume work from a previous handoff document.

## Arguments: $ARGUMENTS

## Instructions

1. **If no filename provided in arguments**, list available handoffs:
   ```bash
   ls -la .claude/handoffs/
   ```
   Then ask the user which one to load.

2. **Once you have a filename**, read the handoff document:
   - Use the Read tool to load `.claude/handoffs/[filename]`

3. **Internalize the context:**
   - Understand what was being worked on
   - Note the key decisions and their rationale
   - Review the files that were modified
   - Understand the current state

4. **Present a summary to the user:**
   - "**Resuming:** [purpose]"
   - "**Last session:** [brief summary]"
   - "**Current state:** [what's done, what's pending]"
   - "**Suggested next step:** [first item from Next Steps]"

5. **Ask:** "Ready to continue, or would you like to review anything first?"
