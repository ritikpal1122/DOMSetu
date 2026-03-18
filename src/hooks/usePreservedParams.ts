"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

/** Query param keys that should persist across page navigations */
const PERSISTENT_PARAMS = ["sessionId", "domComplexity"];

/**
 * Returns a function that appends persistent query params to any href.
 * Usage: const buildHref = usePreservedParams();
 *        <Link href={buildHref("/lab/forms")} />
 */
export function usePreservedParams() {
    const searchParams = useSearchParams();

    const buildHref = useCallback((basePath: string): string => {
        const params = new URLSearchParams();
        for (const key of PERSISTENT_PARAMS) {
            const value = searchParams.get(key);
            if (value) {
                params.set(key, value);
            }
        }
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    }, [searchParams]);

    return buildHref;
}
