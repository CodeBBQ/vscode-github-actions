# Project Memory

## Identity and intent

- Repository: [CodeBBQ/vscode-github-actions](https://github.com/CodeBBQ/vscode-github-actions), a fork of [github/vscode-github-actions](https://github.com/github/vscode-github-actions).
- Product: GitHub Actions for VS Code. The goal of this fork is to develop small, upstream-suitable improvements and propose them to the official repository when ready. This fork is not the upstream release channel.
- Repository guidance: `AGENTS.md`; upstream contribution/testing requirements: `CONTRIBUTING.md`; overview: `README.md` and `docs/project-architecture.md`.

## Current feature proposals (2026-10-08 snapshot; consult live issues)

- [#1 — Optional abbreviated commit hash on workflow runs](https://github.com/CodeBBQ/vscode-github-actions/issues/1): a settings-controlled six-hex-character suffix in parentheses for workflow-run labels. Preserve the existing workflow view and interactions. This is a distinct, focused change.
- [#3 — Compact native workflow-run hover](https://github.com/CodeBBQ/vscode-github-actions/issues/3): accepted 2026-10-08 as a richer whole-row native `TreeItem.tooltip` in both views. Independent of #1\'s label toggle; no SHA click, new view, popup infrastructure, or tooltip-time API calls. Implement on `feature/issue-3-run-hover-tooltip` based on #1; independent review and Development Host acceptance still required.
- [#2 — Commit- and branch-centric CI history view](https://github.com/CodeBBQ/vscode-github-actions/issues/2): an additional view showing commit/branch topology and per-commit CI status, linked to existing run details. Not a replacement for a full Git client. Investigate the data sources, visualization surface, check aggregation, pagination, refresh, and existing infrastructure before implementation.
- At this snapshot there were no pull requests in this fork. Recheck rather than assuming that remains true.

## Accepted direction and open decisions

- **Accepted project intent:** Favor generic upstream-compatible behavior, reuse the extension's existing authentication/infrastructure, and keep #1 and #2 as independent reviewable changes.
- **#1 product proposal:** Six-character hash, optional setting, no UI hierarchy redesign. Live issue remains the detailed specification.
- **#2 product direction:** A lightweight graph-like commit/branch view with CI information. **Not yet decided:** local Git vs GitHub API data strategy, TreeView vs richer renderer, precise check/status aggregation, history bounds, and refresh behavior. Resolve these with evidence before coding.
- **Upstream gate:** Follow upstream `CONTRIBUTING.md`: seek issue discussion/maintainer go-ahead before submitting significant community feature PRs upstream. Local fork planning is not that approval.

## Working agreement

- Separate investigation, implementation, independent review, and release/operations. Use scoped branches and focused checks; do not merge/close or take destructive actions without user authorization.
- Record new *accepted* decisions with date and issue/PR link here, but keep complete technical evidence and acceptance criteria in issues/PRs.
- This file is a concise navigation/decision aid, not a substitute for current repository evidence.
