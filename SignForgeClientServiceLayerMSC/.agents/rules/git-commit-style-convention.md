---
trigger: always_on
---

## Mandatory Repository Git Commit Message Style & Invariants

Whenever staging, committing, or pushing changes to the repository via git commands, you MUST strictly adhere to the user's custom commit message convention:

1. **Mandatory Capitalized Action Prefix**:
   Every commit message MUST start with one of the following PascalCase prefixes followed immediately by a colon and space:
   - `Added: ` -> For new features, pages, endpoints, configurations, models, tables, tests, Dockerfiles, or documentation.
   - `Updated: ` -> For modifications, UI adjustments, bug enhancements, refactorings, style tweaks, or environment updates.
   - `Fixed: ` -> For bug fixes, layout issues, error resolutions, or performance optimizations.
   - `Refactored: ` (or `Refactor: `) -> For code reorganizations, naming alignments, or architectural cleanups.
   - `Revamped: ` -> For comprehensive UI/UX or full-page redesigns.
   - `Removed: ` -> For deleting deprecated code, unused files, or legacy assets.

2. **Strict Title Case / Capitalization**:
   - Capitalize the first letter of every major word in the message body.
   - Never write commit descriptions in all-lowercase or sentence-case.

3. **Multi-Action Pipe Delimiter (` | `)**:
   - If a commit spans both frontend and backend, or contains multiple distinct steps, separate them with a pipe surrounded by spaces: ` | `.
   - Use `->` to indicate direction or end-to-end connectivity (e.g. `Backend -> Frontend Connected Successfully`).

4. **Strictly Prohibited Formats**:
   - ❌ DO NOT use Conventional Commits (e.g. `feat:`, `feat(deploy):`, `fix:`, `docs:`, `chore:`, `refactor:`, `perf:`).
   - ❌ DO NOT use all-lowercase commit messages.
   - ❌ DO NOT use cryptic or unformatted single-word messages.

5. **Examples**:
   - `Added: Feature Request Page | Connected Backend -> Frontend`
   - `Added: Production Multi-Stage Dockerfile And Render Port Configuration`
   - `Updated: Splash Screen Completed | Backend -> Frontend Connected Successfully`
   - `Updated: Revamped The "Upload PDF" Custom Offer Letter Page`
   - `Fixed: Animation Snap Bug In Preview For Document`
   - `Added: Comprehensive Render Backend Deployment Guide In RENDER_BACKEND_DEPLOY_DETAILS.md`
