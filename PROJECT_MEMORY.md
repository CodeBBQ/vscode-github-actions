# Project Memory

## Identity and intent

- Repository: [CodeBBQ/vscode-github-actions](https://github.com/CodeBBQ/vscode-github-actions), a fork of [github/vscode-github-actions](https://github.com/github/vscode-github-actions).
- Product: GitHub Actions for VS Code. This fork develops small, upstream-suitable improvements; it is not the official upstream release channel.
- Authority: `AGENTS.md`, live issues/PRs and current Git state; upstream contribution and testing guidance: `CONTRIBUTING.md`.

## Accepted scope and integration boundary (2026-10-18)

- [#1 — Commit identification in workflow-run labels](https://github.com/CodeBBQ/vscode-github-actions/issues/1): owner accepted the optional six-hex SHA suffix and subsequent SHA/branch label `#213 (abcdef; main)` with safe 18-code-point branch cap. The setting is opt-in and only affects labels. Source feature branches: `feature/issue-1-commit-sha` and `feature/issue-1-sha-branch-label`.
- [#3 — Native whole-row hover details](https://github.com/CodeBBQ/vscode-github-actions/issues/3): owner accepted the compact `TreeItem.tooltip` showing relevant run metadata in Workflows and Current Branch, independent of #1's label toggle, with no tooltip-time GitHub calls. Source branch: `feature/issue-3-run-hover-tooltip`.
- Owner authorized a **single integration PR** for #1 and #3, including accepted SHA/branch presentation. The dedicated integration branch is `feature/integrate-issues-1-3-portfolio-readme`. No upstream PR or merge is implied.

## Separate work

- [#4 — Copy workflow-run metadata](https://github.com/CodeBBQ/vscode-github-actions/issues/4): implementation exists on `feature/issue-4-copy-run-metadata` in [draft PR #5](https://github.com/CodeBBQ/vscode-github-actions/pull/5), **not yet tested/accepted**. Excluded from #1/#3 integration.
- [#2 — Commit- and branch-centric CI history](https://github.com/CodeBBQ/vscode-github-actions/issues/2): proposal only, **not implemented**. Its data strategy, visualization, status aggregation, pagination and refresh need investigation.

## Working boundaries

- Preserve upstream licensing/attribution, authentication, existing views and native interactions; favor narrowly scoped, upstream-compatible improvements.
- Validate exact commit/CI and manual Extension Development Host behavior separately. Earlier local test reports do not automatically validate an integration head.
- Before any upstream contribution, follow upstream `CONTRIBUTING.md` (maintainer discussion/go-ahead). Do not merge, close issues, rewrite history or publish a release without explicit authorization.
- Technical acceptance and investigation details belong in linked issues/PRs; keep this memory concise.
