"use client";

import { useEffect, useRef, useState } from "react";

function FadeCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visibleRatio, setVisibleRatio] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibleRatio(entry.intersectionRatio);
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // 👇 최소 0.5, 최대 1
  const opacity = Math.max(0.5, visibleRatio);

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transition: "opacity 0.25s ease-out",
      }}
    >
      {children}
    </div>
  );
}