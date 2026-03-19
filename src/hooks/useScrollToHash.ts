"use client";

import { useEffect } from "react";

/**
 * Scrolls to the element matching the URL hash on mount.
 * Works with Next.js App Router client-side navigation.
 * Usage: useScrollToHash() in any page component.
 */
export function useScrollToHash() {
    useEffect(() => {
        const hash = window.location.hash?.slice(1);
        if (!hash) return;

        // Small delay to let the DOM render fully
        const timer = setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);
}
