"use client";
import { useEffect } from "react";

export default function UpdateBackground({ color }: { color: string }) {
  useEffect(() => {
    const og = document.body.style.getPropertyValue("--page-background");
    document.body.style.setProperty("--page-background", color);

    return () => {
      document.body.style.setProperty("--page-background", og);
    };
  }, [color]);

  return null;
}
