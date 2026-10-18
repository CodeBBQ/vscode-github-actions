# GitHub Actions for VS Code — CodeBBQ fork

> **Unofficial community fork.** The original [GitHub Actions extension](https://github.com/github/vscode-github-actions) is developed by GitHub. This fork adds separately developed workflow-inspection improvements; it is **not** an official GitHub release. The [VS Code Marketplace listing](https://marketplace.visualstudio.com/items?itemName=github.vscode-github-actions) installs the **upstream version**, not these fork-specific changes.

This fork focuses on making GitHub Actions runs easier to connect to their commits, branches, and execution context without replacing the native VS Code workflow tree.

## Contributions in this fork

| Improvement | Contribution | Evidence |
| --- | --- | --- |
| **Commit/branch labels** | Optional six-character commit SHA and compact branch name on workflow-run rows (e.g. `#213 (abcdef; main)`). The `github-actions.workflows.showCommitHash` setting is **off by default**. Invalid or missing metadata is handled safely. | [Issue #1](https://github.com/CodeBBQ/vscode-github-actions/issues/1) · [Formatter and tests](src/treeViews/shared/workflowRunLabel.test.ts) |
| **Native run-hover details** | A compact whole-row tooltip with execution status, commit subject, branch/SHA, approximate timing, trigger/actor and a validated GitHub run link when available. Reuses loaded run metadata; no additional API calls on hover. | [Issue #3](https://github.com/CodeBBQ/vscode-github-actions/issues/3) · [Formatter and tests](src/treeViews/shared/workflowRunHoverTooltip.test.ts) |

Both changes reuse the shared workflow-run node and preserve existing status icons, tree hierarchy, navigation and run actions. The hover works independently of the optional row-label setting.

**Illustrative run display** (values are synthetic):

```text
✓ #47 (ccc5fe; feature/ci-improve...)
✓ #46 (c9d219; main)
```

A hover on a run row reveals the native VS Code tooltip with run details and an “Open run on GitHub” link. See the linked issues for implementation decisions, original acceptance evidence and remaining verification details.

### Implementation and engineering evidence

- **Architecture:** Small changes to the existing TypeScript TreeView and VS Code `MarkdownString` APIs rather than a separate renderer or extra network requests.
- **Boundary handling:** Validated 40-hex SHAs, bounded Unicode-aware branch labels, safe text formatting, optional metadata and guarded HTTPS run URLs.
- **Verification:** Focused Jest tests accompany the label and hover formatters. Owner-reviewed UI behavior and earlier local build/lint/test results are recorded in [#1](https://github.com/CodeBBQ/vscode-github-actions/issues/1) and [#3](https://github.com/CodeBBQ/vscode-github-actions/issues/3). These reports do **not** constitute a fresh CI pass on the integration commit.
- **Development method:** Human-directed architecture, requirements and acceptance decisions with AI-assisted implementation and technical review. Machine-generated changes are evaluated against explicit behavior and regression cases.

### Work not included in this integration

- [#4 — Copy run metadata](https://github.com/CodeBBQ/vscode-github-actions/issues/4): implemented separately in [draft PR #5](https://github.com/CodeBBQ/vscode-github-actions/pull/5), **not yet accepted/tested**. Not part of this integration.
- [#2 — Commit/branch-centric CI history](https://github.com/CodeBBQ/vscode-github-actions/issues/2): **proposed, not implemented**.

### Trying this fork

The official Marketplace installation does **not** include these changes. To inspect the fork's features, check out this repository, install dependencies and launch the **Extension Development Host** using the documented workflow in [CONTRIBUTING.md](CONTRIBUTING.md). No independent Marketplace release of this fork is claimed.

The original extension, upstream maintainers and MIT license remain attributed below. Changes developed here have not been represented as accepted upstream contributions.

---

## Upstream extension — original features and documentation

The following overview describes the original GitHub extension, not features authored by this fork. Links to the official Marketplace refer to GitHub's release.

The GitHub Actions extension lets you manage your workflows, view the workflow run history, and helps with authoring workflows.

![](./media/header.png)

### Features

#### Manage workflows and runs

* Manage your workflows and runs without leaving your editor.
* Keep track of your CI builds and deployments.
* Investigate failures and view logs.

![View workflow runs and logs](./media/workflows.png)

#### Workflow authoring

Be more confident when authoring and modifying workflows. Find errors before committing workflows with:

**Syntax highlighting** for workflows and GitHub Actions Expressions makes it clear where values are inserted at execution time:

![Syntax highlighting](media/highlight.png)

**Integrated documentation** for the workflow schema, expression functions, and even event payloads:

![Tooltip showing description for a pull_request payload](media/docs.png)

**Validation and code completion** for the YAML schema and GitHub Actions Expressions. Get instant validation and code completion for the workflow schema, expression functions, event payloads, and job or step `outputs`:

![Validation for YAML keys and expressions](media/validation.png)

**Smart validation and code completion for actions and reusable workflows**: the extension automatically parses parameters, inputs, and outputs for referenced actions and called reusable workflows for code-completion and validation.

![Video showing workflow validation and auto-completion](./media/authoring.gif)

### Getting started

1. Install the extension from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=github.vscode-github-actions).
1. Sign in with your GitHub account and when prompted allow `GitHub Actions` access to your GitHub account.
1. Open a GitHub repository.
1. You will be able to utilize the syntax features in Workflow files, and you can find the GitHub Actions icon on the left navigation to manage your Workflows.


### Supported Features

- Manage your workflows and runs 
- Edit workflows (syntax highlighting, auto-completion, hovering, and validation)
- Keep track of your CI builds and deployments
- Investigate failures and view logs
- Modify settings like Environments, Secrets, and Variables

Unfortunately, at this time we are not able to support the extension with [remote repositories](https://docs.github.com/en/get-started/getting-started-with-git/about-remote-repositories) (including [github.dev](https://github.dev/) and [vscode.dev](https://vscode.dev/)), so please use the extension with locally downloaded GitHub repositories for the best experience. Please check back here for updates in the future!

We have enabled experimental functionality to support GitHub Enterprise Server, but this feature is an experimental beta and currently unsupported. To try this out, enable the `use-enterprise` setting to authenticate with your `GitHub Enterprise Server Authentication Provider` settings
<img width="975" alt="Use-enterprise setting checkbox" src="https://github.com/github/vscode-github-actions/assets/34719884/be76adc6-64af-47ed-84d0-627786cc4eea">

We currently do not have the capability to support Operating System (OS) certificates or enterprise proxies (we plan to support pulling from the VS Code proxy settings), but we have plans for it in the future and it is on our backlog! 

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). A description of the architecture of the extension can be found [here](./docs/project-architecture.md).

### License

This project is licensed under the terms of the MIT open source license. Please refer to [MIT](LICENSE) for the full terms.
