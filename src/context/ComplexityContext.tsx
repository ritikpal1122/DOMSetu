"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export type ComplexityMode =
  | "standard"
  | "shadow"
  | "iframe"
  | "nested-shadow"
  | "nested-iframe"
  | "shadow-in-iframe"
  | "iframe-in-shadow";

const VALID_MODES: ComplexityMode[] = [
  "standard", "shadow", "iframe",
  "nested-shadow", "nested-iframe",
  "shadow-in-iframe", "iframe-in-shadow",
];

interface ComplexityContextType {
  mode: ComplexityMode;
  setMode: (mode: ComplexityMode) => void;
}

const ComplexityContext = createContext<ComplexityContextType | undefined>(undefined);

export function ComplexityProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getInitialMode = (): ComplexityMode => {
    const param = searchParams.get("domComplexity");
    if (param && VALID_MODES.includes(param as ComplexityMode)) {
      return param as ComplexityMode;
    }
    return "standard";
  };

  const [mode, setModeState] = useState<ComplexityMode>(getInitialMode);

  const setMode = useCallback((newMode: ComplexityMode) => {
    setModeState(newMode);
    const params = new URLSearchParams(searchParams.toString());
    if (newMode === "standard") {
      params.delete("domComplexity");
    } else {
      params.set("domComplexity", newMode);
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const param = searchParams.get("domComplexity");
    if (param && VALID_MODES.includes(param as ComplexityMode)) {
      setModeState(param as ComplexityMode);
    } else if (!param) {
      setModeState("standard");
    }
  }, [searchParams]);

  return (
    <ComplexityContext.Provider value={{ mode, setMode }}>
      {children}
    </ComplexityContext.Provider>
  );
}

export function useComplexity() {
  const context = useContext(ComplexityContext);
  if (!context) {
    throw new Error("useComplexity must be used within a ComplexityProvider");
  }
  return context;
}
