import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

export default function SplitText({
  text = "",
  className = "",
  delay = 100, // ms between pieces
  duration = 0.6, // seconds
  ease = "power3.out",
  splitType = "chars", // "chars" | "words"
  from = { opacity: 0, y: 24 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "left",
  onLetterAnimationComplete,
}) {
  const wrapRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const pieces = useMemo(() => {
    if (!text) return [];
    if (splitType === "words") {
      // keeps spaces as tokens too
      return text.split(/(\s+)/);
    }
    return Array.from(text);
  }, [text, splitType]);

  useEffect(() => {
    if (!wrapRef.current) return;

    const el = wrapRef.current;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (hasAnimated) return;

        setHasAnimated(true);

        const targets = el.querySelectorAll("[data-split-item='1']");
        gsap.set(targets, { ...from });

        gsap.to(targets, {
          ...to,
          duration,
          ease,
          stagger: (delay || 0) / 1000,
          onComplete: () => {
            if (typeof onLetterAnimationComplete === "function") {
              onLetterAnimationComplete();
            }
          },
        });

        obs.disconnect();
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, duration, ease, from, to, threshold, rootMargin, hasAnimated, onLetterAnimationComplete]);

  return (
    <div ref={wrapRef} className={className} style={{ textAlign }}>
      {pieces.map((piece, i) => {
        const isSpace = /^\s+$/.test(piece);
        return (
          <span
            key={`${piece}-${i}`}
            data-split-item={isSpace ? "0" : "1"}
            style={{
              display: "inline-block",
              whiteSpace: isSpace ? "pre" : "normal",
            }}
          >
            {piece}
          </span>
        );
      })}
    </div>
  );
}
