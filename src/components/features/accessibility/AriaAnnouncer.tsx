"use client";

import { useState, useEffect } from "react";

export type AnnounceLevel = "polite" | "assertive";

export interface AnnounceEvent {
  message: string;
  level?: AnnounceLevel;
}

export default function AriaAnnouncer() {
  const [announcement, setAnnouncement] = useState<AnnounceEvent | null>(null);

  useEffect(() => {
    const handleAnnounce = (e: CustomEvent<AnnounceEvent>) => {
      setAnnouncement(e.detail);
      // Clear after a short delay to allow re-announcing same message
      setTimeout(() => setAnnouncement(null), 1000);
    };

    window.addEventListener("announce", handleAnnounce as EventListener);
    return () => window.removeEventListener("announce", handleAnnounce as EventListener);
  }, []);

  return (
    <div 
      aria-live={announcement?.level || "polite"} 
      aria-atomic="true" 
      className="sr-only"
    >
      {announcement?.message}
    </div>
  );
}

export function announce(message: string, level: AnnounceLevel = "polite") {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<AnnounceEvent>("announce", {
    detail: { message, level }
  });
  window.dispatchEvent(event);
}
