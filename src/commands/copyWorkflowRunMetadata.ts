import * as vscode from "vscode";
import type {WorkflowRunCommandArgs} from "../treeViews/shared/workflowRunNode";
import {copyWorkflowRunMetadata} from "./workflowRunMetadata";
import type {RunMetadataField} from "./workflowRunMetadata";

const actions: {command: string; field: RunMetadataField; label: string}[] = [
  {command: "github-actions.workflow.run.copy-commit-hash", field: "head_sha", label: "Commit hash"},
  {command: "github-actions.workflow.run.copy-branch-name", field: "head_branch", label: "Branch name"},
  {command: "github-actions.workflow.run.copy-run-id", field: "id", label: "Run ID"},
  {command: "github-actions.workflow.run.copy-run-number", field: "run_number", label: "Run number"}
];

export function registerCopyWorkflowRunMetadata(context: vscode.ExtensionContext) {
  for (const {command, field, label} of actions) {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, async (args?: WorkflowRunCommandArgs) => {
        const copied =
          args?.run?.run &&
          (await copyWorkflowRunMetadata(args.run.run, field, vscode.env.clipboard));

        if (!copied) {
          await vscode.window.showWarningMessage(`${label} is unavailable for this workflow run.`);
          return;
        }

        vscode.window.setStatusBarMessage(`${label} copied`, 2000);
      })
    );
  }
}
