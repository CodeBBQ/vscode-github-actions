import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import type {WorkflowRun} from "../../model";

dayjs.extend(relativeTime);

/**
 * Compact run-row hover content using already-loaded workflow-run fields.
 * Rendering must pass each line through MarkdownString.appendText.
 */
export interface RunHoverTooltipContent {
  lines: string[];
  url?: string;
}

function shortText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return undefined;
  }

  const characters = Array.from(normalized);
  return characters.length > maxLength ? characters.slice(0, maxLength - 1).join("") + "…" : normalized;
}

function runStatus(run: WorkflowRun): string | undefined {
  const state = run.status === "completed" ? run.conclusion || run.status : run.status || run.conclusion;
  const labels: Record<string, string> = {
    action_required: "Action required",
    cancelled: "Cancelled",
    completed: "Completed",
    failure: "Failed",
    in_progress: "In progress",
    neutral: "Neutral",
    pending: "Pending",
    queued: "Queued",
    requested: "Requested",
    skipped: "Skipped",
    stale: "Stale",
    startup_failure: "Startup failure",
    success: "Succeeded",
    timed_out: "Timed out",
    waiting: "Waiting"
  };
  if (!state) {
    return undefined;
  }

  const readable = labels[state] || shortText(state.replace(/_/g, " "), 32);
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : undefined;
}

function timestamp(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  // GitHub timestamps are timezone-qualified ISO-8601, not arbitrary Date.parse input.
  const match = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d+)?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match) {
    return undefined;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return undefined;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function compactDuration(milliseconds: number): string {
  let seconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return [
    days && days + "d",
    hours && hours + "h",
    minutes && minutes + "m",
    seconds && seconds + "s"
  ]
    .filter(Boolean)
    .join(" ") || "0s";
}

/** Only direct HTTPS links to this run are exposed; works with Enterprise hostnames. */
function safeRunUrl(value: unknown, runId: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.hostname.includes(".") ||
      !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i.test(url.hostname) ||
      /(^|\.)localhost$/i.test(url.hostname)
    ) {
      return undefined;
    }

    const match = /^\/[a-z0-9_.-]+\/[a-z0-9_.-]+\/actions\/runs\/([1-9]\d*)(?:\/attempts\/[1-9]\d*)?\/?$/i.exec(
      url.pathname
    );
    if (!match || Number(match[1]) !== runId) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export function getRunHoverTooltipContent(
  run: WorkflowRun,
  workflowName?: string,
  now = Date.now()
): RunHoverTooltipContent {
  const lines: string[] = [];
  const name = shortText(workflowName, 64) || shortText(run.name, 64) || "Workflow";
  const status = runStatus(run);
  lines.push(name + " #" + run.run_number + (status ? " — " + status : ""));

  // display_title is a run title, not necessarily the subject of head_commit.
  const subject =
    typeof run.head_commit?.message === "string" ? run.head_commit.message.split(/[\r\n\u2028\u2029]/, 1)[0] : undefined;
  const commitSubject = shortText(subject, 100);
  if (commitSubject) {
    lines.push(commitSubject);
  }

  const branch = shortText(run.head_branch, 80);
  const sha = typeof run.head_sha === "string" && /^[0-9a-f]{40}$/i.test(run.head_sha) ? run.head_sha.slice(0, 6) : undefined;
  // A pull_request run SHA may be a synthetic merge commit, not the contributor's tip.
  const displayedSha = sha && run.event === "pull_request" ? sha + " (PR run SHA)" : sha;
  const revision = [branch, displayedSha].filter(Boolean).join(" · ");
  if (revision) {
    lines.push(revision);
  }

  const started = timestamp(run.run_started_at);
  const notStarted = ["queued", "requested", "waiting", "pending"].includes(run.status || "");
  if (!notStarted && started !== undefined && started <= now) {
    const timing: string[] = [];
    if (run.status === "completed" && run.conclusion && run.conclusion !== "skipped") {
      const updated = timestamp(run.updated_at);
      if (updated !== undefined && updated > started) {
        // updated_at is only an approximation of the actual completion time.
        timing.push("~" + compactDuration(updated - started));
      }
    }
    timing.push("Started " + dayjs(started).from(dayjs(now)));
    lines.push(timing.join(" · "));
  } else if (notStarted) {
    const created = timestamp(run.created_at);
    if (created !== undefined && created <= now) {
      lines.push("Created " + dayjs(created).from(dayjs(now)));
    }
  }

  const trigger: string[] = [];
  const event = shortText(run.event, 40);
  if (event) {
    trigger.push(event);
  }
  const triggeringActor = shortText(run.triggering_actor?.login, 60);
  const originalActor = shortText(run.actor?.login, 60);
  if (triggeringActor) {
    trigger.push("Triggered by @" + triggeringActor);
  } else if (originalActor) {
    trigger.push("Actor @" + originalActor);
  }
  if (Number.isInteger(run.run_attempt) && (run.run_attempt || 0) > 1) {
    trigger.push("Attempt " + run.run_attempt);
  }
  if (trigger.length) {
    lines.push(trigger.join(" · "));
  }

  return {lines, url: safeRunUrl(run.html_url, run.id)};
}
