"use client";

import type { ReactNode } from "react";

export default function HomeDesignSandbox({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="[&_a]:pointer-events-none [&_button]:pointer-events-none">
      {children}
    </div>
  );
}
