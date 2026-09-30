// Services monitored on /status. The API route reads the uptime log named by
// each key from the StatusPage repo; the page turns the key into a title.

export type Service = {
  key: string;
  url: string;
};

export const services: Service[] = [
  { key: "website", url: "https://xditya.me" },
  { key: "apis", url: "https://apis.xditya.me" },
  { key: "pastebin", url: "https://paste.xditya.me" },
  { key: "shortener", url: "https://short.xditya.me" },
  { key: "ultroid_docs", url: "https://ultroid.tech" },
  { key: "ultroid_bans", url: "https://bans.ultroid.tech" },
  { key: "ultroid_shortener", url: "https://tiny.ultroid.tech" },
];

/** "ultroid_docs" becomes "Ultroid Docs". */
export function serviceName(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
