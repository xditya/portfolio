import type { Metadata } from "next";
import InkLayer from "@/components/ink/InkLayer";
import ContactForm from "@/components/contact/ContactForm";
import DirectContact from "@/components/contact/DirectContact";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Aditya. Usually replies within a day.",
};

// Form first in the markup so phones show it first; CSS moves it right on wide screens.
export default function ContactPage() {
  return (
    <div className={s.page}>
      <header className={s.pool}>
        {/* First drop lands clear of the centred text. */}
        <InkLayer intensity={0.5} opening={{ x: 0.22, y: 0.68 }} />
        <div className={s.ground} aria-hidden="true" />
        <div className={`container-x ${s.heading}`}>
          <h1 className={`display-lg ${s.title}`}>
            Say hi<span className={s.dot}>.</span>
          </h1>
          <p className={s.meta}>Usually replies within a day</p>
          <p className={`body-lg ${s.lede}`}>
            Send me a message and I&apos;ll respond as soon as possible.
          </p>
        </div>
      </header>

      <div className="container-x">
        <div className={s.grid}>
          <section className={s.formCol} aria-label="Send a message">
            <ContactForm />
          </section>
          <aside className={s.direct} aria-label="Direct contact">
            <DirectContact />
          </aside>
        </div>
      </div>
    </div>
  );
}
