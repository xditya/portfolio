"use client";

import { useEffect, useState, useCallback } from "react";

interface StatusData {
  key: string;
  url: string;
  data: { [key: string]: number | null; upTime: number | null } | null;
}

const getStatusColor = (v: number | null | undefined) => {
  if (v === null || v === undefined) return "nodata";
  if (v === 1) return "success";
  if (v < 0.3) return "failure";
  return "partial";
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  success: { label: "Operational", color: "#4ade80", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", dot: "#4ade80" },
  failure: { label: "Major Outage", color: "#f87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", dot: "#f87171" },
  partial: { label: "Partial Outage", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", dot: "#fbbf24" },
  nodata: { label: "No Data", color: "var(--text-muted)", bg: "var(--bg-elevated)", border: "var(--border)", dot: "var(--text-muted)" },
};

const BAR_COLORS: Record<string, string> = {
  success: "rgba(34,197,94,0.7)",
  failure: "rgba(239,68,68,0.7)",
  partial: "rgba(251,191,36,0.7)",
  nodata: "rgba(48,54,61,0.6)",
};

function ServiceCard({ service }: { service: StatusData }) {
  const today = service.data?.[0];
  const statusKey = getStatusColor(today);
  const meta = STATUS_META[statusKey];
  const uptime = service.data?.upTime;
  const serviceName = service.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="card" style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{serviceName}</h2>
          <a href={service.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace", cursor: "pointer", transition: "color 200ms ease" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}>
            {service.url}
          </a>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "999px", background: meta.bg, border: `1px solid ${meta.border}`, fontSize: "12px", fontWeight: 500, color: meta.color }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
            {meta.label}
          </span>
          {uptime !== null && uptime !== undefined && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>{uptime}% uptime</span>
          )}
        </div>
      </div>

      {/* 30-day chart */}
      {service.data && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontFamily: "'JetBrains Mono',monospace" }}>
            <span>30d ago</span>
            <span>Today</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(30, 1fr)", gap: "3px" }}>
            {Array.from({ length: 30 }, (_, i) => {
              const dayIndex = 29 - i;
              const val = service.data?.[dayIndex];
              const color = getStatusColor(val);
              const date = new Date(Date.now() - dayIndex * 24 * 60 * 60 * 1000);
              return (
                <div
                  key={i}
                  title={`${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${STATUS_META[color].label}`}
                  style={{
                    height: "28px",
                    borderRadius: "3px",
                    background: BAR_COLORS[color],
                    cursor: "help",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scaleY(1.15)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scaleY(1)"; }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      if (data.status === "success") {
        setStatusData(data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const overallStatus = statusData.length > 0
    ? statusData.every((s) => getStatusColor(s.data?.[0]) === "success") ? "success"
    : statusData.some((s) => getStatusColor(s.data?.[0]) === "failure") ? "failure"
    : "partial"
    : "nodata";

  return (
    <div style={{ paddingTop: "80px" }}>
      <div className="container-wide" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="badge badge-muted" style={{ marginBottom: "16px" }}>Monitoring</span>
            <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: "12px" }}>Website Status</h1>
            {!loading && statusData.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_META[overallStatus].dot, flexShrink: 0 }}
                  className={overallStatus === "success" ? "pulse" : ""} />
                <span style={{ fontSize: "15px", color: STATUS_META[overallStatus].color, fontWeight: 500 }}>
                  {overallStatus === "success" ? "All systems operational" : overallStatus === "failure" ? "Major outage detected" : "Partial outage"}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <button
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              aria-label="Refresh status"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                border: "1px solid var(--border)", background: "var(--bg-surface)",
                color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
                transition: "all 200ms ease", fontFamily: "'Space Grotesk',sans-serif",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}>
                <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            {lastUpdated && (
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "16px" }}>
            <div style={{ width: "32px", height: "32px", border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Fetching status data...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {statusData.map((service) => (
              <ServiceCard key={service.key} service={service} />
            ))}
          </div>
        )}

        {/* Legend */}
        {!loading && (
          <div style={{ display: "flex", gap: "20px", marginTop: "32px", flexWrap: "wrap" }}>
            {(["success", "partial", "failure", "nodata"] as const).map((key) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: BAR_COLORS[key], flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{STATUS_META[key].label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
