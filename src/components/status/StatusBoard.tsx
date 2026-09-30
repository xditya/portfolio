"use client";

import { useEffect, useState } from "react";
import { serviceName } from "@/content";
import { RowGroup } from "@/components/index/RowHighlight";
import IndexRow, { RowList } from "@/components/index/IndexRow";
import s from "./StatusBoard.module.css";

const DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/** One service as /api/status returns it. Day 0 is today, 29 is a month ago. */
type ServiceStatus = {
  key: string;
  url: string;
  data: ({ [day: number]: number | null } & { upTime: string }) | null;
};

type DayState = "ok" | "partial" | "bad" | "none";

const DAY_LABEL: Record<DayState, string> = {
  ok: "Operational",
  partial: "Partial Outage",
  bad: "Major Outage",
  none: "No Data",
};

const OVERALL_LABEL: Record<DayState, string> = {
  ok: "All systems operational",
  partial: "Partial outage",
  bad: "Major outage detected",
  none: "No readings yet today",
};

/** The day's share of successful checks, 0 to 1, or null with no checks. */
function dayState(v: number | null | undefined): DayState {
  if (v === null || v === undefined) return "none";
  if (v === 1) return "ok";
  if (v < 0.3) return "bad";
  return "partial";
}

type View =
  | { state: "loading" }
  | { state: "failed" }
  | { state: "loaded"; at: number; services: ServiceStatus[] };

/** Never throws: a failed request is a view of its own. */
async function fetchStatus(signal?: AbortSignal): Promise<View> {
  try {
    const res = await fetch("/api/status", { signal });
    const body = await res.json();
    if (body.status !== "success") return { state: "failed" };
    return { state: "loaded", at: Date.now(), services: body.data };
  } catch {
    return { state: "failed" };
  }
}

/** Today across every service: one sentence and a dot. */
function Overall({ services }: { services: ServiceStatus[] }) {
  // A service with no reading yet says nothing about today.
  const today = services
    .map((svc) => dayState(svc.data?.[0]))
    .filter((t) => t !== "none");
  const state =
    today.length === 0
      ? "none"
      : today.every((t) => t === "ok")
        ? "ok"
        : today.some((t) => t === "bad")
          ? "bad"
          : "partial";
  return (
    <p className={s.overall} data-state={state}>
      <span className={s.dot} aria-hidden="true" />
      {OVERALL_LABEL[state]}
    </p>
  );
}

function Strip({ service, at }: { service: ServiceStatus; at: number }) {
  const days = Array.from({ length: DAYS }, (_, i) => {
    const ago = DAYS - 1 - i;
    const state = dayState(service.data?.[ago]);
    const date = new Date(at - ago * DAY_MS).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return { ago, state, text: `${date}: ${DAY_LABEL[state]}` };
  });
  const counts = days.reduce(
    (acc, d) => ({ ...acc, [d.state]: acc[d.state] + 1 }),
    { ok: 0, partial: 0, bad: 0, none: 0 },
  );
  const summary = (Object.keys(counts) as DayState[])
    .filter((k) => counts[k] > 0)
    .map((k) => `${counts[k]} ${DAY_LABEL[k].toLowerCase()}`)
    .join(", ");

  return (
    <div
      className={s.strip}
      role="img"
      aria-label={`Last ${DAYS} days: ${summary}`}
    >
      {days.map((d) => (
        <span key={d.ago} className={s.day} data-state={d.state} title={d.text} />
      ))}
    </div>
  );
}

/**
 * The seven services and their last 30 days. The server renders the loading
 * line; the data arrives in an effect and every later state, including the
 * time it was fetched, lives in `view`.
 */
export default function StatusBoard() {
  const [view, setView] = useState<View>({ state: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchStatus(ctrl.signal).then((next) => {
      if (!ctrl.signal.aborted) setView(next);
    });
    return () => ctrl.abort();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    fetchStatus().then((next) => {
      setView(next);
      setRefreshing(false);
    });
  };

  return (
    <>
      <header className={s.head}>
        <h1 className="display-lg">Website Status</h1>
        <div className={s.aside}>
          <p className={`body-lg ${s.lede}`}>Live uptime</p>
          <button
            type="button"
            className={`btn-line ${s.refresh}`}
            onClick={refresh}
            disabled={refreshing}
            aria-label="Refresh status"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {/* One live region for the summary, present from the first render. */}
      <div className={s.summary} aria-live="polite">
        {view.state === "loading" && (
          <p className={s.note}>Fetching status data...</p>
        )}
        {view.state === "failed" && (
          <p className={s.note}>
            The status data could not be loaded. Refresh to try again.
          </p>
        )}
        {view.state === "loaded" && (
          <>
            <Overall services={view.services} />
            <p className={`mono-sm ${s.updated}`}>
              Updated {new Date(view.at).toLocaleTimeString()}
            </p>
          </>
        )}
      </div>

      {view.state === "loaded" && (
        <>
          <RowGroup>
            <RowList>
              {view.services.map((svc, i) => (
                <IndexRow
                  key={svc.key}
                  id={svc.key}
                  index={i + 1}
                  title={serviceName(svc.key)}
                  subtitle={svc.url}
                  href={svc.url}
                  external
                  middle={<Strip service={svc} at={view.at} />}
                  end={
                    <span className={`mono-sm ${s.uptime}`}>
                      {svc.data?.upTime ?? "--%"} uptime
                    </span>
                  }
                />
              ))}
            </RowList>
          </RowGroup>

          <ul className={`mono-sm ${s.legend}`} aria-label="Legend">
            {(["ok", "partial", "bad", "none"] as const).map((k) => (
              <li key={k} className={s.key}>
                <span className={s.swatch} data-state={k} aria-hidden="true">
                  <span className={s.day} data-state={k} />
                </span>
                {DAY_LABEL[k]}
              </li>
            ))}
            <li className={s.axis}>
              <span>30d ago</span>
              <span aria-hidden="true">·</span>
              <span>Today</span>
            </li>
          </ul>
        </>
      )}
    </>
  );
}
