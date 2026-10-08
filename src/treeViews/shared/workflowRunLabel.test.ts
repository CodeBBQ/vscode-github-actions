import {formatWorkflowRunLabel} from "./workflowRunLabel";

const SHA = "abcdef0123456789abcdef0123456789abcdef01";

describe("formatWorkflowRunLabel", () => {
  it("preserves the existing label by default", () => {
    expect(formatWorkflowRunLabel(1144, undefined, SHA, false)).toBe("#1144");
    expect(formatWorkflowRunLabel(1144, "CI", SHA, false)).toBe("CI #1144");
  });

  it("appends the first six characters when enabled", () => {
    expect(formatWorkflowRunLabel(1144, undefined, SHA, true)).toBe("#1144 (abcdef)");
    expect(formatWorkflowRunLabel(1144, "CI", SHA, true)).toBe("CI #1144 (abcdef)");
  });

  it("omits the suffix for missing commit SHAs", () => {
    expect(formatWorkflowRunLabel(1144, undefined, undefined, true)).toBe("#1144");
    expect(formatWorkflowRunLabel(1144, "CI", null, true)).toBe("CI #1144");
  });

  it("omits the suffix for malformed commit SHAs", () => {
    for (const sha of ["", "abcdef", "g".repeat(40), SHA + "0", " " + SHA, 123]) {
      expect(formatWorkflowRunLabel(1144, "CI", sha, true)).toBe("CI #1144");
    }
  });

  it("preserves the existing label text and the original SHA prefix", () => {
    expect(formatWorkflowRunLabel(7, "Build / publish", SHA.toUpperCase(), true)).toBe("Build / publish #7 (ABCDEF)");
  });

  it("updates the presentation when the setting changes", () => {
    expect(formatWorkflowRunLabel(1144, "CI", SHA, false)).toBe("CI #1144");
    expect(formatWorkflowRunLabel(1144, "CI", SHA, true)).toBe("CI #1144 (abcdef)");
    expect(formatWorkflowRunLabel(1144, "CI", SHA, false)).toBe("CI #1144");
  });
});
