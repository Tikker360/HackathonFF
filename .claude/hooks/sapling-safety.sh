#!/usr/bin/env bash
#
# Sapling Safety Hook - Blocks dangerous Sapling operations
#
# PreToolUse hook for Bash commands. Blocks:
# - Commits without a bookmark (enforce atomic commits pattern)
# - Force push to main
# - Destructive operations (revert --all, uncommit without care)
# - rm -rf on important paths
#
# Adapted from Mill's git-safety.sh for Sapling SCM

# Read JSON input from stdin
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Exit early if not a command we care about
if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Only check sl commands and rm commands
if ! echo "$COMMAND" | grep -qE '^sl |^rm '; then
  exit 0
fi

# 1. Block commits when not on a bookmark (enforce atomic commit pattern)
if echo "$COMMAND" | grep -qE 'sl commit'; then
  # Check if we're on a bookmark
  current_bookmark=$(sl log -r . -T '{activebookmark}' 2>/dev/null)
  if [[ -z "$current_bookmark" ]]; then
    cat << 'EOF'
{
  "decision": "block",
  "reason": "No active bookmark. Create a feature bookmark first:\n  sl book feature-name\n\nAtomic commits require one bookmark per feature.\nSee: AGENTS.md Version Control section"
}
EOF
    exit 0
  fi
fi

# 2. Block force push to main
if echo "$COMMAND" | grep -qE 'sl push.*(--force|-f).*main|sl push.*main.*(--force|-f)'; then
  cat << 'EOF'
{
  "decision": "block",
  "reason": "Force push to main is not allowed.\n\nUse sl pr submit for proper review workflow."
}
EOF
  exit 0
fi

# 3. Block sl push --to main without review (direct pushes should use PR)
# Note: Allowing for now since trunk-based dev may use direct push
# Uncomment to enforce PR workflow:
# if echo "$COMMAND" | grep -qE 'sl push --to main'; then
#   cat << 'EOF'
# {
#   "decision": "block",
#   "reason": "Direct push to main. Consider using PR workflow:\n  sl pr submit"
# }
# EOF
#   exit 0
# fi

# 4. Block destructive Sapling operations
if echo "$COMMAND" | grep -qE 'sl revert --all|sl revert -a'; then
  cat << 'EOF'
{
  "decision": "block",
  "reason": "sl revert --all can discard all uncommitted changes.\n\nUse sl shelve to save changes, or be specific about files to revert."
}
EOF
  exit 0
fi

if echo "$COMMAND" | grep -qE 'sl uncommit.*--keep|sl unamend'; then
  # These are safe operations, allow them
  exit 0
fi

if echo "$COMMAND" | grep -qE 'sl strip|sl prune'; then
  cat << 'EOF'
{
  "decision": "block",
  "reason": "sl strip/prune permanently removes commits.\n\nUse sl hide for recoverable removal, or sl absorb to fold changes."
}
EOF
  exit 0
fi

# 5. Block rm -rf on important paths
if echo "$COMMAND" | grep -qE 'rm -rf? (\.|/|apps|libs|content-factory|\.claude|ColinOS)'; then
  cat << 'EOF'
{
  "decision": "block",
  "reason": "This rm command could delete important project files.\n\nBe specific about what you want to delete."
}
EOF
  exit 0
fi

# Allow the command
exit 0
