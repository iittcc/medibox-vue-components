# Learning #31: Git Commit Hook Compliance

## Issue
Repository has strict commit message validation hooks that block commits if messages don't follow specific formatting rules, causing failed commit attempts during development.

## Context
Multiple commit attempts failed due to:
- Missing blank line after commit summary
- Capitalization requirements for commit message start
- Line length limits (72 characters)
- Specific formatting requirements enforced by validation hooks

## Root Cause
- Unfamiliarity with repository-specific commit message standards
- Automated validation hooks not clearly documented
- Standard git commit patterns didn't match project requirements

## Solution Applied
1. **Follow Hook Requirements**: Adjust commit messages to match validation rules
2. **Proper Formatting**: Use capital letter start and blank line after summary
3. **Line Length Management**: Keep lines under 72 characters
4. **Multi-line Format**: Use proper heredoc syntax for complex messages

## Code Example
```bash
# Failed format
git commit -m "feat: migrate PUQE calculator to use framework architecture
- Migrate PUQEScore component from direct Vue refs to framework..."

# Successful format  
git commit -m "Feat: migrate PUQE calculator to use framework architecture

- Migrate PUQEScore component from direct Vue refs to framework
- Update component to use framework-based data binding patterns
- Implement proper framework configuration with pregnancy defaults"
```

## Hook Requirements Learned
- First line must start with capital letter
- Blank line required after summary line
- Lines should not exceed 72 characters
- Proper conventional commit format expected

## Prevention Strategy
- Study repository's git hooks and documentation
- Test commit message format before making changes
- Use shorter, more focused commit summaries
- Prepare commit messages in advance for complex changes

## Impact
- Successful commits after understanding requirements
- Cleaner commit history following project standards
- Avoided multiple failed commit attempts

## Tags
`git`, `commit-hooks`, `validation`, `formatting`, `development-workflow`