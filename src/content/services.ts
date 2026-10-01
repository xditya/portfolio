export type Service = {
  /** Uptime log name in the StatusPage repo. */
  key: string;
  url: string;
  /** Shown instead of the name generated from the key. */
  name?: string;
};

export const services: Service[] = [
  { key: "website", url: "https://xditya.me" },
  { key: "apis", url: "https://apis.xditya.me", name: "APIs" },
  { key: "pastebin", url: "https://pastr.xditya.me", name: "PasteBin" },
  { key: "shortener", url: "https://short.xditya.me" },
  { key: "ultroid_docs", url: "https://ultroid.tech" },
  { key: "ultroid_bans", url: "https://bans.ultroid.tech" },
  { key: "ultroid_shortener", url: "https://tiny.ultroid.tech" },
];

/** The service's own name, or "ultroid_docs" becomes "Ultroid Docs". */
export function serviceName(key: string): string {
  return (
    services.find((s) => s.key === key)?.name ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
