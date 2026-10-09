import type {WorkflowRun} from "../model";

export type RunMetadataField = "head_sha" | "head_branch" | "id" | "run_number";

type RunMetadata = Pick<WorkflowRun, RunMetadataField>;

export function getRunMetadataForCopy(run: RunMetadata, field: RunMetadataField): string | undefined {
  const value = run[field];
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) {
    return undefined;
  }
  return String(value);
}

export function getCopyableRunContextValues(run: RunMetadata): string[] {
  const values: string[] = [];
  if (getRunMetadataForCopy(run, "head_sha")) {
    values.push("copyable-commit");
  }
  if (getRunMetadataForCopy(run, "head_branch")) {
    values.push("copyable-branch");
  }
  return values;
}

export async function copyWorkflowRunMetadata(
  run: RunMetadata,
  field: RunMetadataField,
  clipboard: {writeText(value: string): PromiseLike<void>}
): Promise<boolean> {
  const value = getRunMetadataForCopy(run, field);
  if (value === undefined) {
    return false;
  }
  await clipboard.writeText(value);
  return true;
}
