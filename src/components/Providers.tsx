"use client";

import React, { Suspense } from "react";
import { ComplexityProvider } from "@/context/ComplexityContext";
import { ActivityProvider } from "@/context/ActivityContext";
import { ThemeProvider } from "@/context/ThemeContext"; // Assuming ThemeProvider is in ThemeContext

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <Suspense fallback={null}>
                <ComplexityProvider>
                    <ActivityProvider>
                        {children}
                    </ActivityProvider>
                </ComplexityProvider>
            </Suspense>
        </ThemeProvider>
    );
}
