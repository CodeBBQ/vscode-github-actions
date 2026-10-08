# Repository Agent Guidance

Project: GitHub Actions for VS Code (fork: `CodeBBQ/vscode-github-actions`; upstream: `github/vscode-github-actions`).

## Authority and contribution boundary

1. Read this file, `PROJECT_MEMORY.md`, and the relevant live issue/PR before substantive work. Inspect current source, `package.json`, `CONTRIBUTING.md`, and `docs/project-architecture.md` where applicable.
2. Current code, live issue/PR discussion, and accepted decisions take precedence over stale chat history or unverified assumptions. Report conflicts and distinguish evidence from proposals.
3. This is an upstream-oriented fork: keep changes generic, compatible with existing VS Code/GitHub Actions APIs, and suitable for focused upstream contributions. Upstream `CONTRIBUTING.md` requests issue discussion and a go-ahead before community feature PRs. A fork issue is **not** upstream approval.

## Work modes

- **Investigation/specification:** Read and compare viable approaches, tradeoffs, API limits, auth, UX, and tests; document findings and an explicit decision gate. Do not silently ship feature code.
- **Implementation:** Work from a scoped, sufficiently specified issue on a dedicated branch; reuse existing extension infrastructure, keep unrelated behavior unchanged, and add focused regression tests. When a critical design choice remains open, investigate first.
- **Independent review:** Verify issue requirements against exact base/head SHAs, diffs, tests, and runtime evidence. Report blocking and non-blocking findings. Do not modify production code, tests, or decisions in a review-only run.
- **Release/operations:** Distinguish local verification, Extension Development Host validation, GitHub API integration, and any upstream acceptance. Never infer one from another.

## Branches, validation, and handoff

- Never commit directly to `main` for new work. Use descriptive topic branches, small coherent commits, and push the branch. Prefer separate changes and PRs for independent features.
- Follow `CONTRIBUTING.md` for the TypeScript/webpack development loop, tests, lint, formatting, and Extension Development Host. Run relevant checks and report their exact outcome; if unavailable, say so.
- Preserve existing GitHub authentication, commands, and UI behavior unless the issue explicitly requires changing them. Do not introduce repository-specific semantics or expose credentials. Treat network/API rate limits and missing/incomplete CI results explicitly.
- Keep `PROJECT_MEMORY.md` concise and update it when a decision is accepted or project status materially changes; link to the authoritative issue/PR rather than duplicating full discussions.
- Do not merge PRs, close issues, rewrite history, force-push, publish an extension, or perform destructive operations without explicit user authorization or a clearly applicable repository rule.
- In handoffs, give branch/head, changed scope, verification evidence, unresolved decisions, external/manual acceptance still needed, and the next concrete action.
