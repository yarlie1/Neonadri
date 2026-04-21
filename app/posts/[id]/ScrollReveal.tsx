"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function ScrollReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visibilityRatio, setVisibilityRatio] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibilityRatio(entry.intersectionRatio);
      },
      {
        threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const opacity = Math.max(0.5, 0.5 + visibilityRatio * 0.5);
  const translateY = (1 - visibilityRatio) * 10;

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
      className={`transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform] ${className}`}
    >
      {children}
    </div>
  );
}
