"use client";

import { profile } from "@/content";
import s from "./Avatar.module.css";

// The initial is painted behind the picture, so hiding a failed image is the fallback.
function hide(img: HTMLImageElement) {
  img.style.display = "none";
}

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
