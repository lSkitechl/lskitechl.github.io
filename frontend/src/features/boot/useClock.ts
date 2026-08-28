"use client";

import { useEffect, useState } from "react";

function formatUtcClock(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds} UTC`;
}

// Ticking UTC clock shown in the boot screen header.
// Starts blank so server-rendered and first-client-render markup match (no hydration mismatch),
// then fills in the real time once mounted in the browser.
export function useClock(): string {
  const [time, setTime] = useState("00:00:00 UTC");

  useEffect(() => {
    // Intentional: fills in the real client time once mounted (SSR renders a static placeholder).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(formatUtcClock(new Date()));
    const id = window.setInterval(() => setTime(formatUtcClock(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}
