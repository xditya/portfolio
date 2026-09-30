"use client";

import { profile } from "@/content";
import s from "./Avatar.module.css";

// The initial is painted behind the picture (Avatar.module.css), so hiding
// a picture that failed to load is all the fallback needs.
function hide(img: HTMLImageElement) {
  img.style.display = "none";
}

/** The round profile picture, with the first letter of the name behind it. */
export default function Avatar() {
  return (
    <span className={s.avatar} data-initial={profile.name[0]}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={s.img}
        src="/logo.png"
        alt={profile.name}
        width={88}
        height={88}
        // A picture that failed before hydration never fires onError here.
        ref={(img) => {
          if (img?.complete && img.naturalWidth === 0) hide(img);
        }}
        onError={(e) => hide(e.currentTarget)}
      />
    </span>
  );
}
