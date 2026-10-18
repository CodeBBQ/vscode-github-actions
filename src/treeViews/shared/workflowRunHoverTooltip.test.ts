import type {WorkflowRun} from "../../model";
import {getRunHoverTooltipContent} from "./workflowRunHoverTooltip";
import {formatWorkflowRunLabel} from "./workflowRunLabel";

const NOW = Date.parse("2026-10-08T12:00:00Z");
const SHA = "abcdef0123456789abcdef0123456789abcdef01";

function workflowRun(overrides: Record<string, unknown> = {}): WorkflowRun {
  return {
    id: 1234,
    name: "Android CI",
    run_number: 1144,
    status: "completed",
    conclusion: "success",
    head_commit: {message: "Fix build cache resolution\nDetailed body"},
    head_branch: "feature/cache-fix",
    head_sha: SHA,
    event: "push",
    triggering_actor: {login: "developer"},
    actor: {login: "original-author"},
    run_attempt: 1,
    created_at: "2026-10-08T11:40:00Z",
    run_started_at: "2026-10-08T11:42:00Z",
    updated_at: "2026-10-08T11:43:42Z",
    html_url: "https://github.com/example/repo/actions/runs/1234",
    ...overrides
  } as unknown as WorkflowRun;
}

describe("workflow-run native hover content", () => {
  it("presents four scan-friendly lines from one run and a validated link", () => {
    const content = getRunHoverTooltipContent(workflowRun(), undefined, NOW);
    expect(content.lines).toEqual([
      "Succeeded · Android CI #1144",
      "Fix build cache resolution",
      "feature/cache-fix · abcdef",
      "~1m 42s · 18m ago · push · @developer"
    ]);
    expect(content.url).toBe("https://github.com/example/repo/actions/runs/1234");
  });

  it.each([
    ["success", "Succeeded"],
    ["failure", "Failed"],
    ["cancelled", "Cancelled"],
    ["skipped", "Skipped"],
    ["neutral", "Neutral"],
    ["timed_out", "Timed out"],
    ["action_required", "Action required"]
  ])("renders conclusion %s accurately", (conclusion, label) => {
    const content = getRunHoverTooltipContent(workflowRun({conclusion}), undefined, NOW);
    expect(content.lines[0]).toBe(`${label} · Android CI #1144`);
  });

  it.each([
    ["queued", "Queued"],
    ["requested", "Requested"],
    ["waiting", "Waiting"],
    ["pending", "Pending"]
  ])("renders %s as not started", (status, label) => {
    const lines = getRunHoverTooltipContent(workflowRun({status, conclusion: null}), undefined, NOW).lines;
    expect(lines[0]).toBe(`${label} · Android CI #1144`);
    expect(lines).toContain("created 20m ago · push · @developer");
    expect(lines.join(" ")).not.toContain("~");
    expect(lines.join(" ")).not.toContain("Started");
  });

  it("does not report duration while in progress or when skipped", () => {
    const running = getRunHoverTooltipContent(
      workflowRun({status: "in_progress", conclusion: null}),
      undefined,
      NOW
    ).lines;
    const skipped = getRunHoverTooltipContent(workflowRun({conclusion: "skipped"}), undefined, NOW).lines;
    expect(running[0]).toBe("In progress · Android CI #1144");
    expect(running).toContain("18m ago · push · @developer");
    expect(running.join(" ")).not.toContain("~");
    expect(skipped.join(" ")).not.toContain("~");
    expect(getRunHoverTooltipContent(workflowRun({conclusion: null}), undefined, NOW).lines[0]).toBe(
      "Completed · Android CI #1144"
    );
  });

  it("omits missing commit details rather than substituting the run display title", () => {
    const content = getRunHoverTooltipContent(
      workflowRun({
        name: null,
        head_commit: null,
        display_title: "Run title is not the commit",
        head_branch: null,
        head_sha: null,
        run_started_at: null,
        created_at: null,
        event: "",
        actor: null,
        triggering_actor: null
      }),
      undefined,
      NOW
    );
    expect(content.lines).toEqual(["Succeeded · Workflow #1144"]);
  });

  it("keeps a valid SHA independent of the suffix setting and marks PR-run semantics", () => {
    expect(getRunHoverTooltipContent(workflowRun({event: "pull_request"}), undefined, NOW).lines).toContain(
      "feature/cache-fix · abcdef (PR run SHA)"
    );
    for (const sha of ["", "abc", "g".repeat(40), " " + SHA, null, 123]) {
      const lines = getRunHoverTooltipContent(workflowRun({head_sha: sha}), undefined, NOW).lines;
      expect(lines).toContain("feature/cache-fix");
      expect(lines.join(" ")).not.toContain("abcdef");
    }
    expect(getRunHoverTooltipContent(workflowRun({head_branch: null}), undefined, NOW).lines).toContain("abcdef");
  });

  it("preserves the original event and the actual triggering actor on reruns", () => {
    const rerun = getRunHoverTooltipContent(
      workflowRun({event: "workflow_dispatch", run_attempt: 3}),
      undefined,
      NOW
    ).lines;
    expect(rerun[rerun.length - 1]).toBe("~1m 42s · 18m ago · workflow_dispatch · @developer · Attempt 3");
    const fallback = getRunHoverTooltipContent(
      workflowRun({triggering_actor: null, run_attempt: 2}),
      undefined,
      NOW
    ).lines;
    expect(fallback[fallback.length - 1]).toBe("~1m 42s · 18m ago · push · actor @original-author · Attempt 2");
  });

  it("rejects malformed, future and negative timestamps without inventing durations", () => {
    for (const changes of [
      {run_started_at: "bad"},
      {run_started_at: "2026-02-30T11:00:00Z"},
      {run_started_at: "2026-10-08T13:00:00Z"},
      {run_started_at: null},
      {updated_at: "bad"},
      {updated_at: "2026-10-08T11:41:00Z"}
    ]) {
      const lines = getRunHoverTooltipContent(workflowRun(changes), undefined, NOW).lines;
      expect(lines.join(" ")).not.toContain("~1m 42s");
      expect(lines.join(" ")).not.toContain("NaN");
    }
    const created = getRunHoverTooltipContent(
      workflowRun({status: "queued", conclusion: null, run_started_at: null}),
      undefined,
      NOW
    ).lines;
    expect(created).toContain("created 20m ago · push · @developer");
  });

  it("handles multi-day duration with explicit approximate notation", () => {
    const lines = getRunHoverTooltipContent(
      workflowRun({run_started_at: "2026-10-06T10:00:00Z", updated_at: "2026-10-07T12:02:03Z"}),
      undefined,
      NOW
    ).lines;
    expect(lines).toContain("~1d 2h 2m 3s · 2d ago · push · @developer");
  });

  it("bounds every untrusted field and removes multiline/control injection", () => {
    const lines = getRunHoverTooltipContent(
      workflowRun({
        name: "CI\n# Fake Heading" + "x".repeat(300),
        head_commit: {message: "Fix [title](command:evil)\n[Second link](https://evil.test)"},
        head_branch: "branch\r\n# Spoof",
        triggering_actor: {login: "developer\u0000\n[click](https://evil.test)"}
      }),
      undefined,
      NOW
    ).lines;
    expect(lines).toHaveLength(4);
    expect(lines[0].length).toBeLessThan(95);
    expect(lines[1]).toBe("Fix [title](command:evil)");
    expect(lines.join(" ")).not.toContain("\n");
    expect(lines.join(" ")).not.toContain("\r");
    expect(lines.join(" ")).not.toContain("[Second link]");
    // These remain plain text. The TreeItem uses MarkdownString.appendText to escape them.
  });

  it("limits the commit subject even with non-BMP Unicode characters", () => {
    const lines = getRunHoverTooltipContent(
      workflowRun({head_commit: {message: "🚀".repeat(150)}}),
      undefined,
      NOW
    ).lines;
    expect(Array.from(lines[1]).length).toBe(72);
    expect(lines[1].endsWith("…")).toBe(true);
  });

  it("only includes validated direct HTTPS run links, including Enterprise hosts", () => {
    for (const url of [
      "javascript:alert(1)",
      "http://github.com/example/repo/actions/runs/1234",
      "https://u:p@github.com/example/repo/actions/runs/1234",
      "https://github.com/example/repo/actions/runs/9999",
      "https://github.com/example/repo/issues/1234",
      "https://github.com/example/repo/actions/runs/1234?redirect=evil",
      "https://github.com/example/repo/actions/runs/1234#fragment",
      "https://localhost/example/repo/actions/runs/1234",
      "https://github.com/example/repo/actions/runs/1234)\n[Fake](command:evil)"
    ]) {
      expect(getRunHoverTooltipContent(workflowRun({html_url: url}), undefined, NOW).url).toBeUndefined();
    }
    expect(
      getRunHoverTooltipContent(
        workflowRun({html_url: "https://git.enterprise.example.net/example/repo/actions/runs/1234"}),
        undefined,
        NOW
      ).url
    ).toBe("https://git.enterprise.example.net/example/repo/actions/runs/1234");
  });

  it("is independent of Issue #1 setting and recomputes updated run content", () => {
    const run = workflowRun();
    expect(formatWorkflowRunLabel(run.run_number, undefined, run.head_sha, false)).toBe("#1144");
    expect(formatWorkflowRunLabel(run.run_number, undefined, run.head_sha, true)).toBe("#1144 (abcdef)");
    expect(getRunHoverTooltipContent(run, undefined, NOW).lines).toContain("feature/cache-fix · abcdef");
    expect(getRunHoverTooltipContent(workflowRun({conclusion: "failure"}), undefined, NOW).lines[0]).toBe(
      "Failed · Android CI #1144"
    );
  });

  it("truncates long workflow, commit and branch names for compact width", () => {
    const content = getRunHoverTooltipContent(
      workflowRun({
        name: "Workflow" + "x".repeat(100),
        head_commit: {message: "A".repeat(120)},
        head_branch: "feature/" + "b".repeat(120)
      }),
      undefined,
      NOW
    );
    expect(content.lines).toHaveLength(4);
    expect(content.lines[0]).toBe(`Succeeded · ${"Workflow" + "x".repeat(43) + "…"} #1144`);
    expect(Array.from(content.lines[1]).length).toBe(72);
    expect(content.lines[1].endsWith("…")).toBe(true);
    expect(Array.from(content.lines[2].split(" · ")[0]).length).toBe(52);
    expect(content.lines[2]).toContain(" · abcdef");
  });

  it("uses compact age units and still labels queued creation time", () => {
    const minute = getRunHoverTooltipContent(
      workflowRun({run_started_at: "2026-10-08T11:59:30Z", updated_at: "2026-10-08T12:00:00Z"}),
      undefined,
      NOW
    ).lines;
    expect(minute[minute.length - 1]).toBe("~30s · now · push · @developer");

    const hour = getRunHoverTooltipContent(
      workflowRun({run_started_at: "2026-10-08T10:00:00Z", updated_at: "2026-10-08T10:02:00Z"}),
      undefined,
      NOW
    ).lines;
    expect(hour[hour.length - 1]).toBe("~2m · 2h ago · push · @developer");

    const queued = getRunHoverTooltipContent(
      workflowRun({status: "queued", conclusion: null, run_started_at: null}),
      undefined,
      NOW
    ).lines;
    expect(queued[queued.length - 1]).toBe("created 20m ago · push · @developer");
    expect(queued.join(" ")).not.toContain("~");
  });

  it("retains bounded event and actor values in the combined metadata line", () => {
    const lines = getRunHoverTooltipContent(
      workflowRun({event: "e".repeat(90), triggering_actor: {login: "a".repeat(90)}, run_attempt: 2}),
      undefined,
      NOW
    ).lines;
    expect(lines).toHaveLength(4);
    expect(lines[3]).toContain(` · ${"e".repeat(23)}… · @${"a".repeat(31)}… · Attempt 2`);
    expect(lines[3].length).toBeLessThan(100);
  });
});
