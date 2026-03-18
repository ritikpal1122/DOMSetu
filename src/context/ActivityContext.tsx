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
    sessionId: string | null;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = "domsetu_sessionId";

/** Read sessionId: check URL first, then fall back to sessionStorage */
function getSessionId(): string | null {
    if (typeof window === "undefined") return null;
    const fromURL = new URLSearchParams(window.location.search).get("sessionId");
    if (fromURL) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, fromURL);
        return fromURL;
    }
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
}

function getCurrentPage(): string {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
    const [lastEvent, setLastEvent] = useState<ActivityEvent | null>(null);

    // Initialize background logger
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            // Seed sessionStorage from URL on first load
            getSessionId();
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

        // Fire-and-forget POST to API if sessionId is present
        const sessionId = getSessionId();
        if (sessionId) {
            fetch("/api/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    page: getCurrentPage(),
                    action: message,
                    component: source,
                }),
            }).catch((err) => {
                console.warn("Failed to persist activity log:", err);
            });
        }
    }, []);

    const clearActivity = useCallback(() => {
        setLastEvent(null);
        if (typeof window !== 'undefined') {
            (window as any)._activityLog = [];
        }
        // Only clears in-memory logs for UI reset.
        // DB logs are preserved — use DELETE /api/logs?sessionId=... to clear those explicitly.
    }, []);

    const getHistory = useCallback(() => {
        if (typeof window !== 'undefined') {
            return (window as any)._activityLog || [];
        }
        return [];
    }, []);

    return (
        <ActivityContext.Provider value={{ lastEvent, logAction, clearActivity, getHistory, sessionId: getSessionId() }}>
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
