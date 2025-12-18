"use client";

import React from "react";
import { ComplexityProvider } from "@/context/ComplexityContext";
import { ActivityProvider } from "@/context/ActivityContext";
import { ThemeProvider } from "@/context/ThemeContext"; // Assuming ThemeProvider is in ThemeContext

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ComplexityProvider>
                <ActivityProvider>
                    {children}
                </ActivityProvider>
            </ComplexityProvider>
        </ThemeProvider>
    );
}
