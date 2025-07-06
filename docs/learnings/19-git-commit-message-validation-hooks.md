# Learning #19: Git Commit Message Validation Hooks

## Issue Encountered
**Error:** `Commit message validation failed!` with multiple validation errors:
- ❌ Co-authored commits are not allowed per project rules
- ❌ Remove Claude signature from commit messages  
- ❌ Add blank line after commit message summary

**Context:** Attempting to commit EPDS Toast fixes but git hooks blocked the commit due to message format violations.

## Root Cause Analysis
1. **Project-Specific Rules**: The repository had custom git hooks that enforce specific commit message formats
2. **Default Commit Patterns**: I was using standard commit patterns that included Claude signatures and co-author information
3. **Format Requirements**: The project required specific formatting (blank line after summary, no AI signatures)
4. **Hook Location**: Validation hook was located at `.dev/.claude/hooks/validate-git-commit.py`

## Solution Implemented
**Failed Attempts:**
```bash
# First attempt - included co-author signature
git commit -m "fix: resolve EPDS component Toast injection error

- Add missing ToastService import and registration in epds.ts
- Include Toast component in EPDSScore.vue template  
- Add error boundary configuration for enhanced error handling
- Ensure consistent Toast service setup across all calculators

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Successful Format:**
```bash
git commit -m "Fix EPDS component Toast injection error

Add missing ToastService import and registration in epds.ts
Include Toast component in EPDSScore.vue template  
Add error boundary configuration for enhanced error handling
Ensure consistent Toast service setup across all calculators"
```

## Debugging Approach That Worked
1. **Read Error Messages Carefully**: The hook provided specific feedback about what was wrong
2. **Iterative Fixing**: Fixed one validation error at a time
3. **Format Analysis**: Understood that the blank line after summary was critical
4. **Capitalization**: Ensured the summary line started with a capital letter

## Prevention Strategies
1. **Project Commit Template**: Create a template for this specific project:
   ```bash
   # Commit message template for this project:
   # 
   # Summary line starting with capital letter
   # (blank line required)
   # Detailed explanation line 1
   # Detailed explanation line 2
   # Detailed explanation line 3
   #
   # Rules:
   # - Start with capital letter
   # - Blank line after summary
   # - No co-author signatures
   # - No AI tool signatures
   ```

2. **Hook Documentation**: Document the commit rules in project documentation:
   ```markdown
   ## Commit Message Format
   - Summary must start with capital letter
   - Blank line required after summary
   - No co-authored commits allowed
   - No AI tool signatures
   - Use conventional commit format when possible
   ```

3. **Pre-commit Testing**: Test commit messages locally before attempting to commit:
   ```bash
   # Test the commit message format
   echo "Test commit message

   With proper formatting" | .dev/.claude/hooks/validate-git-commit.py
   ```

## Hook Analysis
The validation hook checks for:
- Co-authored commits (blocked)
- AI tool signatures (blocked)  
- Blank line after summary (required)
- Capital letter at start (warning)

## Key Takeaways
- **Project-Specific Rules**: Each project may have custom git hooks with specific requirements
- **Hook Feedback**: Git hooks often provide detailed feedback about what's wrong
- **Iterative Fixing**: Fix validation errors one at a time based on specific feedback
- **Format Consistency**: Consistent commit message formatting is important for project maintenance
- **Documentation**: Commit message rules should be documented for all contributors

## Best Practices for Future Commits
1. **Check Hook Location**: Look for `.git/hooks/` or custom hook locations like `.dev/.claude/hooks/`
2. **Read Project Documentation**: Check for commit message guidelines in README or docs
3. **Test Before Committing**: If unsure, test the message format first
4. **Follow Feedback**: Use hook error messages as guidance for fixing format issues
5. **Keep It Simple**: Avoid complex signatures or formatting that might trigger validation errors

## Related Files
- `.dev/.claude/hooks/validate-git-commit.py` - Validation hook script
- `.git/hooks/` - Standard git hooks location (if used)
- Project documentation about commit guidelines