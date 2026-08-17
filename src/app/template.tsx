// Re-mounts on every route change, giving each page a subtle enter
// transition (opacity + 8px rise, strong ease-out · see .page-enter).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
