"use client";

import React, { useEffect, useState } from "react";
import { useActivity } from "@/context/ActivityContext";

export default function ActivityCapsule() {
    const { lastEvent } = useActivity();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (lastEvent) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(true), 100); // Keep visible
            return () => clearTimeout(timer);
        }
    }, [lastEvent]);

    if (!lastEvent) return null;

    return (
        <div style={styles.container} className={`activity-capsule ${visible ? 'visible' : ''}`}>
            <div style={styles.dot} />
            <span style={styles.text} data-testid="activity-tracker-message">
                <span style={styles.source}>{lastEvent.source}:</span> {lastEvent.message}
            </span>
            <span style={styles.time}>
                {lastEvent.timestamp.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: "fixed",
        top: "12px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#18181B",
        color: "#FFFFFF",
        padding: "8px 20px",
        borderRadius: "var(--radius-pill)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 9999,
        maxWidth: "90vw",
        whiteSpace: "nowrap",
        animation: "islandPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        border: "1px solid rgba(255,255,255,0.1)",
        height: "40px",
    },
    dot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#4ADE80", // Bright Green
        boxShadow: "0 0 10px rgba(74, 222, 128, 0.5)",
    },
    text: {
        fontSize: "13px",
        color: "#FFFFFF",
        fontWeight: 500,
        fontFamily: "Inter, sans-serif",
    },
    source: {
        color: "rgba(255,255,255,0.6)",
        fontWeight: 400,
        marginRight: "4px",
    },
    time: {
        fontSize: "11px",
        color: "rgba(255,255,255,0.4)",
        marginLeft: "8px",
        fontVariantNumeric: "tabular-nums",
    },
};
