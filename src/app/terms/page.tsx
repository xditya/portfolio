import type { Metadata } from "next";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for freelance and bot service purchases by Aditya.",
};

// Legal copy. Never reworded here; the numbering is a real sequence.
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
    <div className={`container-x ${s.page}`}>
      <header className={s.head}>
        <h1 className="display-lg">Terms</h1>
        <p className={`body-lg ${s.lede}`}>Freelance &amp; bot services</p>
      </header>

      <p className={`body-lg ${s.intro}`}>
        These terms apply to purchases made via{" "}
        <a
          href="https://t.me/BuyYourBots"
          target="_blank"
          rel="noopener noreferrer"
          className="link-u"
        >
          @BuyYourBots
        </a>{" "}
        and{" "}
        <a
          href="https://t.me/Bots4Sale"
          target="_blank"
          rel="noopener noreferrer"
          className="link-u"
        >
          @Bots4Sale
        </a>
        . Please read carefully before purchasing.
      </p>

      {/* role="list" because list-style: none drops the list semantics in Safari */}
      <ol className={s.list} role="list">
        {TERMS.map(({ title, description }, i) => (
          <li key={title} className={s.clause}>
            <span className={`mono-sm ${s.num}`} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className={s.title}>{title}</h2>
              <p className={`body-lg ${s.body}`}>{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={s.closing}>
        <p className={`body-lg ${s.agree}`}>
          By purchasing, you agree to the terms and conditions outlined above.
        </p>
        <p className={`mono-sm ${s.note}`}>* Terms are subject to change.</p>
      </div>
    </div>
  );
}
