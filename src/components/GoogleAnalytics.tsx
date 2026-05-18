"use client";

import { useEffect } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID, pageview } from "@/lib/gtag";

export default function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const handleRoute = () => {
      try {
        const url = window.location.pathname + window.location.search;
        pageview(url);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore in non-browser environments
      }
    };

    // initial pageview
    handleRoute();

    // listen to back/forward
    window.addEventListener("popstate", handleRoute);

    // monkey-patch pushState to capture client navigations
    const origPush = history.pushState;
    // @ts-expect-ignore
    history.pushState = function (...args: unknown[]) {
      const result = origPush.apply(this, args as never);
      handleRoute();
      return result;
    };

    return () => {
      window.removeEventListener("popstate", handleRoute);
      history.pushState = origPush;
    };
  }, []);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
