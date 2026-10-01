"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { event as trackEvent } from "@/lib/gtag";
import { EASE_OUT, INSTANT } from "@/components/nav/shared";
import { setFillOrigin } from "@/lib/fillOrigin";
import InkButton from "./InkButton";
import { SOCIAL_PLATFORMS, SocialIcon } from "./socialPlatforms";
import s from "./ContactForm.module.css";

type Values = {
  name: string;
  email: string;
  phone: string;
  socialHandle: string;
  message: string;
};
type Key = keyof Values;
type Errors = Partial<Record<Key, string>>;

const EMPTY: Values = { name: "", email: "", phone: "", socialHandle: "", message: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The same limits the API route's schema enforces, checked here first so
// the message appears under the field instead of in the result modal.
function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!v.name.trim()) errors.name = "Please enter your name";
  else if (v.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!v.email.trim()) errors.email = "Please enter your email";
  else if (!EMAIL.test(v.email.trim())) errors.email = "Invalid email address";
  if (!v.message.trim()) errors.message = "Please enter a message";
  else if (v.message.trim().length < 10) errors.message = "Message must be at least 10 characters";
  return errors;
}

const normalizeUrl = (url: string) =>
  url
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/+$/, "");

type Modal = { type: "success" | "error"; message: string };

/* ── Field · label, control, ink line, error ──
   The line draws from the side the pointer came in on (--o, set on entry
   and cleared on leave so keyboard focus draws from the left). */

// Clears the entry side; the pointer leaving does not blur the field, so
// nothing retracts here, and the next keyboard focus starts from the left.
function clearFillOrigin(e: PointerEvent<HTMLElement>): void {
  e.currentTarget.style.removeProperty("--o");
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: Key;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={s.field}
      data-invalid={error ? "" : undefined}
      onPointerEnter={setFillOrigin}
      onPointerLeave={clearFillOrigin}
    >
      <label htmlFor={id} className={s.label}>
        {label}
        {required && (
          <span className={s.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={s.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// The input and the ink line it draws on focus.
function Control({ children }: { children: ReactNode }) {
  return (
    <div className={s.control}>
      {children}
      <span className={s.line} aria-hidden="true" />
    </div>
  );
}

/* ── Result modal · success or error, copy unchanged ── */

function ResultModal({
  modal,
  onClose,
  form,
}: {
  modal: Modal | null;
  onClose: () => void;
  /** The form whose submit button takes focus back when the modal closes. */
  form: RefObject<HTMLFormElement | null>;
}) {
  const reduce = useReducedMotion() === true;
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus moves to the one button while the modal is open and back to the
  // submit button when it closes (the submit was disabled while sending,
  // which already dropped its focus, so activeElement is no guide). Esc
  // closes; Tab stays on the button.
  useEffect(() => {
    if (!modal) return;
    closeRef.current?.focus();
    // A submit disabled by a captcha failure cannot take focus; the message
    // field stands in for it then.
    const returnTo = () =>
      form.current?.querySelector<HTMLElement>('button[type="submit"]:enabled, #message');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnTo()?.focus({ preventScroll: true });
    };
  }, [modal, onClose, form]);

  const transition = reduce ? INSTANT : { duration: 0.24, ease: EASE_OUT };
  const exitTransition = reduce ? INSTANT : { duration: 0.16, ease: EASE_OUT };
  const success = modal?.type === "success";

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          key="modal"
          className={s.overlay}
          data-lenis-prevent=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: exitTransition }}
          transition={transition}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-result-title"
            aria-describedby="contact-result-text"
            className={s.dialog}
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.98, transition: exitTransition }}
            transition={transition}
            onClick={(e) => e.stopPropagation()}
          >
            <p className={`mono-sm ${s.dialogTag}`} data-type={modal.type}>
              {success ? "// message sent" : "// error"}
            </p>
            <h2 id="contact-result-title" className={s.dialogTitle}>
              {success ? "Thank you!" : "Try again"}
            </h2>
            <p id="contact-result-text" className={`body-lg ${s.dialogText}`}>
              {modal.message}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className={`${success ? "btn-fill" : "btn-line"} ${s.dialogButton}`}
              onPointerEnter={setFillOrigin}
              onPointerLeave={setFillOrigin}
            >
              {success ? "Done" : "Close"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Form ── */

export default function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [highlightedIcon, setHighlightedIcon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hcaptchaError, setHcaptchaError] = useState(false);
  const [modal, setModal] = useState<Modal | null>(null);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = validate(values);
  const shown = (key: Key) => (touched[key] || submitted ? errors[key] : undefined);

  const set = (key: Key) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const blur = (key: Key) => () => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  const closeModal = useCallback(() => setModal(null), []);

  const checkHighlight = (value: string) => {
    const n = normalizeUrl(value);
    const match = SOCIAL_PLATFORMS.find((p) => n.startsWith(p.baseUrl));
    setHighlightedIcon(match?.key ?? null);
  };

  const handleSocialIconClick = (platform: string) => {
    const p = SOCIAL_PLATFORMS.find((x) => x.key === platform);
    if (!p) return;
    const knownPrefixes = SOCIAL_PLATFORMS.map((x) => x.baseUrl);
    const isAlreadyPrefilled = knownPrefixes.some((prefix) =>
      values.socialHandle.startsWith(prefix),
    );
    if (!values.socialHandle || isAlreadyPrefilled) {
      setValues({ ...values, socialHandle: p.baseUrl });
    }
    trackEvent("contact_social_prefill_click", {
      social_platform: p.label,
      source: "contact_form",
    });
    setHighlightedIcon(platform);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const firstInvalid = (Object.keys(errors) as Key[])[0];
    if (firstInvalid) {
      setSubmitted(true);
      formRef.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
      return;
    }
    trackEvent("contact_form_submit_attempt", {
      source: "contact_page",
    });
    setIsSubmitting(true);
    try {
      if (hcaptchaRef.current) {
        const { response: token } = await hcaptchaRef.current.execute({
          async: true,
        });
        if (!token) throw new Error("Failed to verify captcha");
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, hcaptchaToken: token }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.details?.[0]?.message || data.error || "Something went wrong",
          );
        setValues(EMPTY);
        setTouched({});
        setSubmitted(false);
        setHighlightedIcon(null);
        trackEvent("contact_form_submit", {
          status: "success",
          source: "contact_page",
        });
        setModal({
          type: "success",
          message: "Your message has been sent. I'll get back to you soon.",
        });
      }
    } catch (err) {
      trackEvent("contact_form_submit", {
        status: "error",
        source: "contact_page",
      });
      setModal({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const describe = (key: Key) => ({
    "aria-invalid": shown(key) ? true : undefined,
    "aria-describedby": shown(key) ? `${key}-error` : undefined,
  });

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} noValidate className={s.form}>
        <div className={s.pair}>
          <Field id="name" label="Name" required error={shown("name")}>
            <Control>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                onChange={set("name")}
                onBlur={blur("name")}
                className="field-u"
                {...describe("name")}
              />
            </Control>
          </Field>
          <Field id="email" label="Email" required error={shown("email")}>
            <Control>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="your@email.com"
                value={values.email}
                onChange={set("email")}
                onBlur={blur("email")}
                className="field-u"
                {...describe("email")}
              />
            </Control>
          </Field>
        </div>

        <div className={`${s.pair} ${s.pairStack}`}>
          <Field id="phone" label="Phone" error={shown("phone")}>
            <Control>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (234) 567-8900"
                value={values.phone}
                onChange={set("phone")}
                onBlur={blur("phone")}
                className="field-u"
              />
            </Control>
          </Field>
          <Field id="socialHandle" label="Social handle" error={shown("socialHandle")}>
            <div className={s.withIcons}>
              <Control>
                <input
                  id="socialHandle"
                  name="socialHandle"
                  type="text"
                  autoComplete="off"
                  placeholder="twitter.com/username"
                  value={values.socialHandle}
                  onChange={(e) => {
                    set("socialHandle")(e);
                    checkHighlight(e.target.value);
                  }}
                  onBlur={blur("socialHandle")}
                  className={`field-u ${s.socialInput}`}
                />
              </Control>
              <div className={s.icons}>
                {SOCIAL_PLATFORMS.map(({ key, label, path }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSocialIconClick(key)}
                    aria-label={label}
                    title={label}
                    aria-pressed={highlightedIcon === key}
                    className={s.icon}
                  >
                    <SocialIcon path={path} />
                  </button>
                ))}
              </div>
            </div>
          </Field>
        </div>

        <Field id="message" label="Message" required error={shown("message")}>
          <Control>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Your message here..."
              value={values.message}
              onChange={set("message")}
              onBlur={blur("message")}
              className={`field-u ${s.textarea}`}
              {...describe("message")}
            />
          </Control>
        </Field>

        <div className={s.actions}>
          <InkButton
            type="submit"
            disabled={isSubmitting || hcaptchaError}
            aria-describedby={hcaptchaError ? "captcha-error" : undefined}
          >
            {isSubmitting ? (
              <>
                <span className={`spin ${s.spinner}`} aria-hidden="true" /> Sending...
              </>
            ) : (
              <>Send Message ↗</>
            )}
          </InkButton>

          <p className={`mono-sm ${s.footnote}`}>
            Protected by hCaptcha ·{" "}
            <a
              href="https://www.hcaptcha.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={`link-u ${s.footLink}`}
            >
              Privacy
            </a>
            {" & "}
            <a
              href="https://www.hcaptcha.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className={`link-u ${s.footLink}`}
            >
              Terms
            </a>
          </p>
        </div>

        {hcaptchaError && (
          <p id="captcha-error" role="alert" className={`mono-sm ${s.footnote}`}>
            The spam check could not load. Refresh the page, or email me directly.
          </p>
        )}

        {/* hCaptcha (invisible) */}
        <HCaptcha
          ref={hcaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
          size="invisible"
          onError={() => setHcaptchaError(true)}
        />
      </form>

      <ResultModal modal={modal} onClose={closeModal} form={formRef} />
    </>
  );
}
