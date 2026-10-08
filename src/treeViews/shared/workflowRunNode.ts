import * as vscode from "vscode";

import {showWorkflowRunCommitHash} from "../../configuration/configuration";
import {GitHubRepoContext} from "../../git/repository";
import {RunStore} from "../../store/store";
import {WorkflowRun} from "../../store/workflowRun";
import {getIconForWorkflowRun} from "../icons";
import {getRunHoverTooltipContent} from "./workflowRunHoverTooltip";
import {NoWorkflowJobsNode} from "./noWorkflowJobsNode";
import {PreviousAttemptsNode} from "./previousAttemptsNode";
import {WorkflowJobNode} from "./workflowJobNode";
import {formatWorkflowRunLabel} from "./workflowRunLabel";

export type WorkflowRunCommandArgs = Pick<WorkflowRunNode, "gitHubRepoContext" | "run" | "store">;

export class WorkflowRunNode extends vscode.TreeItem {
  constructor(
    public readonly store: RunStore,
    public readonly gitHubRepoContext: GitHubRepoContext,
    public run: WorkflowRun,
    public readonly workflowName?: string
  ) {
    super(WorkflowRunNode._getLabel(run, workflowName), vscode.TreeItemCollapsibleState.Collapsed);

    this.updateRun(run);
  }

  updateRun(run: WorkflowRun) {
    this.run = run;
    this.refreshLabel();

    this.contextValue = this.run.contextValue(this.gitHubRepoContext.permissionLevel);

    this.iconPath = getIconForWorkflowRun(this.run.run);
    this.tooltip = this.getTooltip();
  }

  refreshLabel(): void {
    this.label = WorkflowRunNode._getLabel(this.run, this.workflowName);
  }

  async getJobs(): Promise<(WorkflowJobNode | NoWorkflowJobsNode | PreviousAttemptsNode)[]> {
    const jobs = await this.run.jobs();

    const children: (WorkflowJobNode | NoWorkflowJobsNode | PreviousAttemptsNode)[] = jobs.map(
      job => new WorkflowJobNode(this.gitHubRepoContext, job)
    );

    if (this.run.hasPreviousAttempts) {
      children.push(new PreviousAttemptsNode(this.gitHubRepoContext, this.run));
    }

    return children;
  }

  getTooltip(): vscode.MarkdownString {
    const content = getRunHoverTooltipContent(this.run.run, this.workflowName);
    const tooltip = new vscode.MarkdownString();

    for (const [index, line] of content.lines.entries()) {
      if (index > 0) {
        tooltip.appendMarkdown("  \n");
      }
      // GitHub-provided data is escaped by appendText, never interpolated as Markdown.
      tooltip.appendText(line);
    }

    if (content.url) {
      tooltip.appendMarkdown("\n\n[Open run on GitHub](" + content.url + ")");
    }

    return tooltip;
  }

  private static _getLabel(run: WorkflowRun, workflowName?: string): string {
    return formatWorkflowRunLabel(run.run.run_number, workflowName, run.run.head_sha, showWorkflowRunCommitHash());
  }
}
