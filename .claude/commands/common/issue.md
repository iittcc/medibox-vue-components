# /issue [github issue number]
Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:
1. Use 'gh issue view' to get the issue details.
2. Understand the problem described in the issue.
3. Read [Code review for implementation](../../../docs/code-review-implementation-checklist.md)
4. Search the codebase for relevant files.
5. Think hard about the implementation plan and implement the necessary changes to fix the issue.
6. Ensure the code passes linting and type checking.
7. Make sure all test are passing. If not investigate implementation. If implementation looks good fix tests.
8. Create branch
9. Create a descriptive commit message.
10. Push and create a PR.

Remember to use the GitHub CLI ('gh') for all Github-related tasks.