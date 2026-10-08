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
  it("shows the branch beside a valid abbreviated SHA when enabled", () => {
    expect(formatWorkflowRunLabel(213, undefined, SHA, true, "main")).toBe("#213 (abcdef; main)");
    expect(formatWorkflowRunLabel(212, "Android CI", SHA, true, "feature/new-ui")).toBe(
      "Android CI #212 (abcdef; feature/new-ui)"
    );
  });

  it("crops only overlong branch names using a stable prefix", () => {
    expect(formatWorkflowRunLabel(212, undefined, SHA, true, "this/is/my/feature-branch")).toBe(
      "#212 (abcdef; this/is/my/feat...)"
    );
    expect(formatWorkflowRunLabel(212, undefined, SHA, true, "abcdefghijklmnopqr")).toBe(
      "#212 (abcdef; abcdefghijklmnopqr)"
    );
    expect(formatWorkflowRunLabel(212, undefined, SHA, true, "abcdefghijklmnopqrs")).toBe(
      "#212 (abcdef; abcdefghijklmno...)"
    );
  });

  it("omits an unavailable branch while retaining a valid commit SHA", () => {
    for (const branch of [undefined, null, "", "  ", 123, false, "\n\r"]) {
      expect(formatWorkflowRunLabel(213, undefined, SHA, true, branch)).toBe("#213 (abcdef)");
    }
  });

  it("requires a valid SHA even if a branch is present", () => {
    for (const sha of [undefined, null, "", "abcdef", "g".repeat(40), SHA + "0", " " + SHA, 123]) {
      expect(formatWorkflowRunLabel(213, undefined, sha, true, "main")).toBe("#213");
    }
  });

  it("cleans control characters and bidi formatting in branch names", () => {
    expect(formatWorkflowRunLabel(213, undefined, SHA, true, "feature/\nmain\u202e")).toBe(
      "#213 (abcdef; feature/ main)"
    );
  });

  it("truncates Unicode branch names without splitting surrogate pairs", () => {
    expect(formatWorkflowRunLabel(213, undefined, SHA, true, "feature/" + "🚀".repeat(12))).toBe(
      "#213 (abcdef; feature/🚀🚀🚀🚀🚀🚀🚀...)"
    );
  });

  it("preserves the setting semantics across refreshes and branch updates", () => {
    expect(formatWorkflowRunLabel(213, undefined, SHA, false, "main")).toBe("#213");
    expect(formatWorkflowRunLabel(213, undefined, SHA, true, "main")).toBe("#213 (abcdef; main)");
    expect(formatWorkflowRunLabel(213, undefined, SHA, true, "release")).toBe("#213 (abcdef; release)");
    expect(formatWorkflowRunLabel(213, undefined, SHA, false, "release")).toBe("#213");
  });
});
