import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for freelance and bot service purchases by Aditya.",
};

const TERMS = [
  { title: "Non-Refundable Source Codes", description: "Purchased source codes are non-refundable. Once delivered, no refunds will be issued regardless of circumstances." },
  { title: "Subscription Cancellation Policy", description: "Refunds will not be issued for subscription cancellations made after two days from the start of the subscription period." },
  { title: "Automatic Subscription Cancellation", description: "Subscriptions will be automatically canceled if the user fails to respond within 24 hours of the subscription expiry." },
  { title: "Server and Usage Issues", description: "We are not responsible for issues arising from Telegram servers or improper usage of scripts/bots. Please refrain from disputing these matters." },
  { title: "Initial Payment Refunds", description: "Refunds for initial payments cannot be issued once work has commenced and proof of work has been provided." },
  { title: "Source Code Deployment", description: "Deployment services for the source codes created are offered, with renewals on a monthly basis." },
];

export default function TermsPage() {
  return (
    <div style={{ paddingTop: "80px" }}>
      <div className="container-md" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <span className="badge badge-muted" style={{ marginBottom: "16px" }}>Legal</span>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: "16px" }}>Terms & Conditions</h1>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            These terms apply to purchases made via{" "}
            <a href="https://t.me/BuyYourBots" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", cursor: "pointer" }}>@BuyYourBots</a>
            {" "}and{" "}
            <a href="https://t.me/Bots4Sale" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", cursor: "pointer" }}>@Bots4Sale</a>.
            {" "}Please read carefully before purchasing.
          </p>
        </div>

        {/* Terms Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
          {TERMS.map(({ title, description }, i) => (
            <div
              key={title}
              className="card"
              style={{ padding: "24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "4px", padding: "2px 6px" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent)" }}>{title}</h2>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{description}</p>
            </div>
          ))}
        </div>

        {/* Footer Notice */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            By purchasing, you agree to the terms and conditions outlined above.
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>
            * Terms are subject to change.
          </p>
        </div>
      </div>
    </div>
  );
}
