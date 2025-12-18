"use client";

import React, { createContext, useContext, useState } from "react";

export type ComplexityMode =
  | "standard"
  | "shadow"
  | "iframe"
  | "nested-shadow"
  | "nested-iframe"
  | "shadow-in-iframe"
  | "iframe-in-shadow";

interface ComplexityContextType {
  mode: ComplexityMode;
  setMode: (mode: ComplexityMode) => void;
}

const ComplexityContext = createContext<ComplexityContextType | undefined>(undefined);

export function ComplexityProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ComplexityMode>("standard");

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
