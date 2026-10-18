const MAX_BRANCH_LENGTH = 18;

/** Format an already-loaded branch safely for a compact single-line row. */
function shortBranchName(headBranch: unknown): string | undefined {
  if (typeof headBranch !== "string") {
    return undefined;
  }

  const normalized = headBranch
    .replace(/[\p{C}\p{Zl}\p{Zp}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return undefined;
  }

  // Count Unicode code points rather than UTF-16 units.
  const characters = Array.from(normalized);
  return characters.length > MAX_BRANCH_LENGTH
    ? characters.slice(0, MAX_BRANCH_LENGTH - 3).join("") + "..."
    : normalized;
}

/**
 * Format a workflow-run label from the already loaded head SHA and branch.
 * The existing setting toggles the complete optional suffix.
 * Invalid or incomplete commit IDs deliberately omit that suffix.
 */
export function formatWorkflowRunLabel(
  runNumber: number,
  workflowName: string | undefined,
  headSha: unknown,
  showCommitHash: boolean,
  headBranch?: unknown
): string {
  const label = `${workflowName ? workflowName + " " : ""}#${runNumber}`;
  if (!showCommitHash || typeof headSha !== "string" || !/^[0-9a-f]{40}$/i.test(headSha)) {
    return label;
  }

  const branch = shortBranchName(headBranch);
  const suffix = branch ? `${headSha.slice(0, 6)}; ${branch}` : headSha.slice(0, 6);
  return `${label} (${suffix})`;
}
