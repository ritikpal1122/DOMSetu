"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ActivityEvent {
    id: string;
    message: string;
    source: string; // e.g., "CRM", "Form"
    timestamp: Date;
}

interface ActivityContextType {
    lastEvent: ActivityEvent | null;
    logAction: (message: string, source?: string) => void;
    clearActivity: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
    const [lastEvent, setLastEvent] = useState<ActivityEvent | null>(null);

    const logAction = useCallback((message: string, source: string = "System") => {
        setLastEvent({
            id: Math.random().toString(36).substr(2, 9),
            message,
            source,
            timestamp: new Date(),
        });
    }, []);

    const clearActivity = useCallback(() => {
        setLastEvent(null);
    }, []);

    return (
        <ActivityContext.Provider value={{ lastEvent, logAction, clearActivity }}>
            {children}
        </ActivityContext.Provider>
    );
}

export function useActivity() {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error("useActivity must be used within a ActivityProvider");
    }
    return context;
}
