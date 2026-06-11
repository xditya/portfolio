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
    <div style={{ paddingTop: "110px" }}>
      <div className="container-x" style={{ paddingBottom: "40px" }}>
        <p className="mono-label" style={{ marginBottom: "24px" }}>
          Legal — Freelance &amp; bot services
        </p>
        <h1 className="display-lg" style={{ marginBottom: "28px" }}>
          Terms
        </h1>
        <p className="body-lg" style={{ maxWidth: "620px", margin: 0 }}>
          These terms apply to purchases made via{" "}
          <a
            href="https://t.me/BuyYourBots"
            target="_blank"
            rel="noopener noreferrer"
            className="link-u"
            style={{ color: "var(--accent-soft)" }}
          >
            @BuyYourBots
          </a>{" "}
          and{" "}
          <a
            href="https://t.me/Bots4Sale"
            target="_blank"
            rel="noopener noreferrer"
            className="link-u"
            style={{ color: "var(--accent-soft)" }}
          >
            @Bots4Sale
          </a>
          . Please read carefully before purchasing.
        </p>
      </div>

      <div className="container-x" style={{ paddingTop: "32px" }}>
        <div style={{ maxWidth: "880px" }}>
          {TERMS.map(({ title, description }, i) => (
            <div
              key={title}
              className="hairline-t terms-row"
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "24px",
                paddingBlock: "28px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(24px, 3vw, 36px)",
                  lineHeight: 1,
                  color: "transparent",
                  WebkitTextStroke: "1px var(--line-strong)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2
                  style={{
                    fontSize: "clamp(17px, 2vw, 22px)",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  {title}
                </h2>
                <p className="body-lg" style={{ margin: 0 }}>
                  {description}
                </p>
              </div>
            </div>
          ))}

          <div className="hairline-t" style={{ paddingTop: "28px" }}>
            <p className="body-lg" style={{ marginTop: 0, marginBottom: "8px" }}>
              By purchasing, you agree to the terms and conditions outlined
              above.
            </p>
            <p className="mono-sm" style={{ color: "var(--muted)", margin: 0 }}>
              * Terms are subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
