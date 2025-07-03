# Suggested Commands

## Development Commands
- `npm run dev` - Start development server with hot reload
- `npm run dev 2>&1 | tee -a dev.log` - Start dev server with logging
- `npm run dev >> dev.log 2>&1 &` - Start dev server in background with logging
- `tail -f dev.log` - Watch development logs

## Code Quality Commands
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint and fix code issues with ESLint
- `npm run format` - Format code with Prettier

## Testing Commands
- `npm run test` - Run tests using Vitest
- `npm run test:ui` - Run tests with UI interface
- `npm run test:browser` - Run browser tests
- `npm run test:unit` - Run unit tests
- `npm run test:components` - Run component tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode

## Build Commands
- `npm run build` - Full production build with type checking
- `npm run build-only` - Build without type checking
- `npm run staging` - Build for staging environment
- `npm run production` - Build for production environment
- `npm run preview` - Preview built application

## Deployment Commands
- `gulp vue` - Copy built components from dist folder to webapp assets

## System Commands (Darwin/macOS)
- `ls` - List files and directories
- `grep` - Search text patterns
- `find` - Find files and directories
- `git` - Version control operations
- `cd` - Change directory
- `pwd` - Print working directory
- `cp` - Copy files
- `mv` - Move/rename files
- `rm` - Remove files (use with caution)

## Git Commands
- `git status` - Check repository status
- `git add` - Stage changes
- `git commit` - Commit changes
- `git push` - Push to remote
- `git pull` - Pull from remote
- `git branch` - List/create branches
- `git checkout` - Switch branches