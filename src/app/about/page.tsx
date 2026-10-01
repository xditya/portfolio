import type { Metadata } from "next";
import { experience, profile, siteStats, social } from "@/content";
import { getGithubStats } from "@/lib/github";
import Stats from "@/components/home/Stats";
import Avatar from "@/components/about/Avatar";
import TechTray from "@/components/about/TechTray";
import TimelineEntry from "@/components/about/TimelineEntry";
import s from "./page.module.css";

// The GitHub numbers are fetched when the page is built and refreshed
// every hour after that, the same as on the home page.
export const revalidate = 3600;

export const metadata: Metadata = { title: "About" };

// Email opens the mail app, so it stays in this tab.
const profileLinks = [
  { label: "GitHub", href: social("GitHub").href, newTab: true },
  { label: "Telegram", href: social("Telegram").href, newTab: true },
  { label: "Email", href: `mailto:${profile.email}`, newTab: false },
];

export default async function AboutPage() {
  const github = await getGithubStats();

  return (
    <div className={`container-x ${s.page}`}>
      <header className={s.head}>
        <div className={s.intro}>
          <h1 className="display-lg">Building things for the web &amp; Telegram</h1>
          <p className={`body-lg ${s.bio}`}>{profile.statement}</p>
        </div>

        <div className={s.profile}>
          <div className={s.who}>
            <Avatar />
            <div className={s.id}>
              <h2 className={s.name}>{profile.name}</h2>
              <p className={`mono-sm ${s.role}`}>
                <span className={s.roleLine}>{profile.role}</span>
                <span className={s.roleLine}>
                  {`${profile.location} \u00B7\u00A0${profile.age}y old`}
                </span>
              </p>
              <span className={`badge badge-accent ${s.open}`}>Open Source</span>
            </div>
          </div>

          <div className={s.actions}>
            <ul className={s.links} role="list">
              {profileLinks.map(({ label, href, newTab }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={s.link}
                    {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {label}{" "}
                    <span className={s.arrow} aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a href={profile.resume} download className="btn-down">
              Resume{" "}
              <span className="arr" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
        </div>
      </header>

      <div className={s.stats}>
        <Stats stats={siteStats(github)} />
      </div>

      <div className={s.pair}>
        {[profile.whatIDo, profile.howIWork].map(({ title, text, chips }) => (
          <section key={title} className={s.half}>
            <h2 className="display-md">{title}</h2>
            <p className={`body-lg ${s.halfText}`}>{text}</p>
            <ul className={s.tags} role="list">
              {chips.map((chip) => (
                <li key={chip} className={s.tag}>
                  {chip}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className={s.section}>
        <h2 className={`display-md ${s.heading}`}>Tech stack</h2>
        <TechTray />
      </section>

      <section className={s.section}>
        <h2 className={`display-md ${s.heading}`}>Experience</h2>
        <ol className={s.list} role="list">
          {experience.map((exp, i) => (
            <TimelineEntry
              key={`${exp.title}-${exp.company}`}
              index={i}
              className={s.entry}
            >
              <div className={s.when}>
                <p className={`mono-sm ${s.period}`}>{exp.period}</p>
                {exp.current && <span className="badge badge-accent">Now</span>}
              </div>
              <div className={s.job}>
                <h3 className={s.jobTitle}>{exp.title}</h3>
                <p className={`mono-sm ${s.company}`}>{exp.company}</p>
              </div>
              <p className={s.what}>{exp.description}</p>
            </TimelineEntry>
          ))}
        </ol>
      </section>
    </div>
  );
}
