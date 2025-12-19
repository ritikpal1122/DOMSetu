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
    getHistory: () => any[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: React.ReactNode }) {
    const [lastEvent, setLastEvent] = useState<ActivityEvent | null>(null);

    // Initialize background logger
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any)._activityLog = (window as any)._activityLog || [];
            (window as any).exportLogs = () => {
                console.log("Activity Logs (JSON):", JSON.stringify((window as any)._activityLog, null, 2));
                return (window as any)._activityLog;
            };
        }
    }, []);

    const logAction = useCallback((message: string, source: string = "System") => {
        const timestamp = new Date();
        const simplifiedEvent = {
            serial: ((window as any)._activityLog?.length || 0) + 1,
            message: `${source}: ${message}`,
            timestamp: timestamp.toISOString()
        };

        // Update UI state
        setLastEvent({
            id: Math.random().toString(36).substr(2, 9),
            message,
            source,
            timestamp,
        });

        // Record to background logger
        if (typeof window !== 'undefined') {
            (window as any)._activityLog = (window as any)._activityLog || [];
            (window as any)._activityLog.push(simplifiedEvent);
        }
    }, []);

    const clearActivity = useCallback(() => {
        setLastEvent(null);
        if (typeof window !== 'undefined') {
            (window as any)._activityLog = [];
        }
    }, []);

    const getHistory = useCallback(() => {
        if (typeof window !== 'undefined') {
            return (window as any)._activityLog || [];
        }
        return [];
    }, []);

    return (
        <ActivityContext.Provider value={{ lastEvent, logAction, clearActivity, getHistory }}>
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
