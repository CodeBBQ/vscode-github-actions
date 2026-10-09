import type {WorkflowRun} from "../model";
import {copyWorkflowRunMetadata, getCopyableRunContextValues, getRunMetadataForCopy} from "./workflowRunMetadata";

const sha = "0123456789abcdef0123456789abcdef01234567";
const run: Pick<WorkflowRun, "head_sha" | "head_branch" | "id" | "run_number"> = {
  head_sha: sha,
  head_branch: "feature/multi/segment-name",
  id: 14326890123,
  run_number: 1144
};

describe("workflow-run copy metadata", () => {
  it("copies the full commit SHA, not an abbreviated label", async () => {
    const clipboard = {writeText: jest.fn().mockResolvedValue(undefined)};
    expect(await copyWorkflowRunMetadata(run, "head_sha", clipboard)).toBe(true);
    expect(clipboard.writeText).toHaveBeenCalledWith(sha);
  });

  it("copies the branch name verbatim, including slashes", async () => {
    const clipboard = {writeText: jest.fn().mockResolvedValue(undefined)};
    expect(await copyWorkflowRunMetadata(run, "head_branch", clipboard)).toBe(true);
    expect(clipboard.writeText).toHaveBeenCalledWith("feature/multi/segment-name");
  });

  it("distinguishes the run ID from the run number", async () => {
    const clipboard = {writeText: jest.fn().mockResolvedValue(undefined)};
    expect(await copyWorkflowRunMetadata(run, "id", clipboard)).toBe(true);
    expect(await copyWorkflowRunMetadata(run, "run_number", clipboard)).toBe(true);
    expect(clipboard.writeText.mock.calls).toEqual([["14326890123"], ["1144"]]);
  });

  it("does not copy absent commit or branch information", async () => {
    const clipboard = {writeText: jest.fn().mockResolvedValue(undefined)};
    const missing = {...run, head_sha: "", head_branch: null};
    expect(await copyWorkflowRunMetadata(missing, "head_sha", clipboard)).toBe(false);
    expect(await copyWorkflowRunMetadata(missing, "head_branch", clipboard)).toBe(false);
    expect(clipboard.writeText).not.toHaveBeenCalled();
    expect(getRunMetadataForCopy(missing, "head_branch")).toBeUndefined();
    expect(getCopyableRunContextValues(missing)).toEqual([]);
  });

  it("exposes optional copy commands only when their values are available", () => {
    expect(getCopyableRunContextValues(run)).toEqual(["copyable-commit", "copyable-branch"]);
    expect(getCopyableRunContextValues({...run, head_branch: null})).toEqual(["copyable-commit"]);
    expect(getCopyableRunContextValues({...run, head_sha: ""})).toEqual(["copyable-branch"]);
  });

  it("propagates clipboard errors instead of reporting a successful copy", async () => {
    const clipboard = {writeText: jest.fn().mockRejectedValue(new Error("clipboard unavailable"))};
    await expect(copyWorkflowRunMetadata(run, "id", clipboard)).rejects.toThrow("clipboard unavailable");
  });
