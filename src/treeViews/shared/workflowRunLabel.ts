/**
 * Format a workflow-run label using the SHA already present in the run data.
 * Invalid or incomplete commit IDs are deliberately omitted.
 */
export function formatWorkflowRunLabel(
  runNumber: number,
  workflowName: string | undefined,
  headSha: unknown,
  showCommitHash: boolean
): string {
  const label = `${workflowName ? workflowName + " " : ""}#${runNumber}`;
  if (!showCommitHash || typeof headSha !== "string" || !/^[0-9a-f]{40}$/i.test(headSha)) {
    return label;
  }

  return `${label} (${headSha.slice(0, 6)})`;
}
