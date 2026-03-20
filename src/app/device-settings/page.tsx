"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useActivity } from "@/context/ActivityContext";
import { useScrollToHash } from "@/hooks/useScrollToHash";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SettingResult {
    label: string;
    value: string;
    status: "detected" | "unavailable" | "pending" | "denied";
    category: string;
}

type CategoryKey =
    | "device"
    | "network"
    | "location"
    | "orientation"
    | "locale"
    | "permissions"
    | "hardware";

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
    { key: "device", label: "Device Info", icon: "📱" },
    { key: "network", label: "Network", icon: "📡" },
    { key: "location", label: "GPS Location", icon: "📍" },
    { key: "orientation", label: "Orientation", icon: "🔄" },
    { key: "locale", label: "Timezone & Language", icon: "🌍" },
    { key: "permissions", label: "Permissions", icon: "🔐" },
    { key: "hardware", label: "Hardware", icon: "⚙️" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Detection helpers
// ─────────────────────────────────────────────────────────────────────────────
function detectPlatform(ua: string): string {
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac OS/i.test(ua)) return "macOS";
    if (/Linux/i.test(ua)) return "Linux";
    return "Unknown";
}

function detectBrowser(ua: string): string {
    if (/Edg\//i.test(ua)) return "Edge";
    if (/OPR\//i.test(ua)) return "Opera";
    if (/Chrome\//i.test(ua)) return "Chrome";
    if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
    if (/Firefox\//i.test(ua)) return "Firefox";
    return "Unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function DeviceSettingsPage() {
    const { logAction, clearActivity } = useActivity();
    useScrollToHash();

    const [settings, setSettings] = useState<SettingResult[]>([]);
    const [geoRequested, setGeoRequested] = useState(false);
    const detectedRef = useRef(false);

    const addSetting = useCallback((s: SettingResult) => {
        setSettings(prev => {
            const exists = prev.find(p => p.label === s.label);
            if (exists) return prev.map(p => p.label === s.label ? s : p);
            return [...prev, s];
        });
    }, []);

    // Auto-detect everything on mount
    useEffect(() => {
        if (detectedRef.current) return;
        detectedRef.current = true;
        clearActivity();
        logAction("Page loaded", "DeviceSettings");
        detectAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const detectAll = useCallback(() => {
        const ua = navigator.userAgent;
        const platform = detectPlatform(ua);
        const browser = detectBrowser(ua);

        // ── Device Info ──
        const deviceSettings: SettingResult[] = [
            { label: "Platform", value: platform, status: "detected", category: "device" },
            { label: "Browser", value: browser, status: "detected", category: "device" },
            { label: "User Agent", value: ua, status: "detected", category: "device" },
            { label: "Screen Resolution", value: `${screen.width}x${screen.height}`, status: "detected", category: "device" },
            { label: "Viewport Size", value: `${window.innerWidth}x${window.innerHeight}`, status: "detected", category: "device" },
            { label: "Device Pixel Ratio", value: String(window.devicePixelRatio), status: "detected", category: "device" },
            { label: "Touch Support", value: navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} points)` : "No", status: "detected", category: "device" },
            { label: "Color Depth", value: `${screen.colorDepth}-bit`, status: "detected", category: "device" },
            { label: "Online Status", value: navigator.onLine ? "Online" : "Offline", status: "detected", category: "device" },
            { label: "Cookies Enabled", value: navigator.cookieEnabled ? "Yes" : "No", status: "detected", category: "device" },
            { label: "Do Not Track", value: navigator.doNotTrack === "1" ? "Enabled" : "Disabled", status: "detected", category: "device" },
        ];

        // ── Network ──
        const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const networkSettings: SettingResult[] = conn ? [
            { label: "Connection Type", value: conn.effectiveType || "Unknown", status: "detected", category: "network" },
            { label: "Downlink Speed", value: conn.downlink ? `${conn.downlink} Mbps` : "Unknown", status: "detected", category: "network" },
            { label: "RTT (Latency)", value: conn.rtt !== undefined ? `${conn.rtt} ms` : "Unknown", status: "detected", category: "network" },
            { label: "Data Saver", value: conn.saveData ? "Enabled" : "Disabled", status: "detected", category: "network" },
        ] : [
            { label: "Network Info", value: "Network Information API not supported", status: "unavailable", category: "network" },
        ];

        // ── Orientation ──
        const orientationSettings: SettingResult[] = [];
        if (screen.orientation) {
            orientationSettings.push(
                { label: "Orientation Type", value: screen.orientation.type, status: "detected", category: "orientation" },
                { label: "Orientation Angle", value: `${screen.orientation.angle}°`, status: "detected", category: "orientation" },
            );
        } else {
            orientationSettings.push(
                { label: "Orientation", value: window.innerWidth > window.innerHeight ? "landscape" : "portrait", status: "detected", category: "orientation" },
            );
        }

        // ── Locale ──
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzOffset = new Date().getTimezoneOffset();
        const tzOffsetStr = `UTC${tzOffset <= 0 ? "+" : "-"}${String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0")}:${String(Math.abs(tzOffset) % 60).padStart(2, "0")}`;
        const localeSettings: SettingResult[] = [
            { label: "Timezone", value: tz, status: "detected", category: "locale" },
            { label: "UTC Offset", value: tzOffsetStr, status: "detected", category: "locale" },
            { label: "Language", value: navigator.language, status: "detected", category: "locale" },
            { label: "All Languages", value: navigator.languages?.join(", ") || navigator.language, status: "detected", category: "locale" },
        ];

        // ── GPS (pending until requested) ──
        const geoSettings: SettingResult[] = [
            {
                label: "Geolocation",
                value: "geolocation" in navigator ? "Supported (click Detect to request)" : "Not supported",
                status: "geolocation" in navigator ? "pending" : "unavailable",
                category: "location",
            },
        ];

        // ── Hardware ──
        const hardwareSettings: SettingResult[] = [
            { label: "CPU Cores", value: navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : "Unknown", status: navigator.hardwareConcurrency ? "detected" : "unavailable", category: "hardware" },
            { label: "Device Memory", value: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : "Unknown", status: (navigator as any).deviceMemory ? "detected" : "unavailable", category: "hardware" },
        ];

        // GPU via WebGL
        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (gl) {
                const dbg = (gl as any).getExtension("WEBGL_debug_renderer_info");
                if (dbg) {
                    hardwareSettings.push(
                        { label: "GPU Vendor", value: (gl as any).getParameter(dbg.UNMASKED_VENDOR_WEBGL), status: "detected", category: "hardware" },
                        { label: "GPU Renderer", value: (gl as any).getParameter(dbg.UNMASKED_RENDERER_WEBGL), status: "detected", category: "hardware" },
                    );
                }
            }
        } catch {
            hardwareSettings.push({ label: "GPU", value: "Could not detect", status: "unavailable", category: "hardware" });
        }

        const all = [...deviceSettings, ...networkSettings, ...orientationSettings, ...localeSettings, ...geoSettings, ...hardwareSettings];
        setSettings(all);

        // Log all detected values
        const detected = all.filter(s => s.status === "detected");
        detected.forEach(s => {
            logAction(`${s.label}: ${s.value}`, "DeviceSettings");
        });

        logAction(`Detected ${detected.length} settings across ${CATEGORIES.length} categories`, "DeviceSettings");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Detect permissions
    useEffect(() => {
        if (typeof navigator === "undefined" || !navigator.permissions) return;

        const permNames = ["geolocation", "notifications", "camera", "microphone", "accelerometer", "gyroscope", "magnetometer"];

        permNames.forEach(name => {
            navigator.permissions.query({ name: name as PermissionName }).then(result => {
                addSetting({
                    label: `Permission: ${name}`,
                    value: result.state,
                    status: result.state === "denied" ? "denied" : "detected",
                    category: "permissions",
                });
                logAction(`Permission ${name}: ${result.state}`, "DeviceSettings");
            }).catch(() => {
                // Permission not supported for query
            });
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const requestGeolocation = () => {
        if (!("geolocation" in navigator)) return;
        setGeoRequested(true);
        logAction("Requesting GPS location", "DeviceSettings");

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                const acc = pos.coords.accuracy.toFixed(0);
                addSetting({ label: "Geolocation", value: `${lat}, ${lng} (±${acc}m)`, status: "detected", category: "location" });
                addSetting({ label: "Latitude", value: lat, status: "detected", category: "location" });
                addSetting({ label: "Longitude", value: lng, status: "detected", category: "location" });
                addSetting({ label: "Accuracy", value: `${acc}m`, status: "detected", category: "location" });
                if (pos.coords.altitude !== null) {
                    addSetting({ label: "Altitude", value: `${pos.coords.altitude.toFixed(1)}m`, status: "detected", category: "location" });
                }
                logAction(`GPS: ${lat}, ${lng} (±${acc}m)`, "DeviceSettings");
            },
            (err) => {
                addSetting({ label: "Geolocation", value: `Error: ${err.message}`, status: "denied", category: "location" });
                logAction(`GPS error: ${err.message}`, "DeviceSettings");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Listen for orientation changes
    useEffect(() => {
        const handler = () => {
            if (screen.orientation) {
                addSetting({ label: "Orientation Type", value: screen.orientation.type, status: "detected", category: "orientation" });
                addSetting({ label: "Orientation Angle", value: `${screen.orientation.angle}°`, status: "detected", category: "orientation" });
                logAction(`Orientation changed: ${screen.orientation.type} (${screen.orientation.angle}°)`, "DeviceSettings");
            }
        };
        screen.orientation?.addEventListener("change", handler);
        return () => screen.orientation?.removeEventListener("change", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for online/offline
    useEffect(() => {
        const onOnline = () => {
            addSetting({ label: "Online Status", value: "Online", status: "detected", category: "device" });
            logAction("Network: Back online", "DeviceSettings");
        };
        const onOffline = () => {
            addSetting({ label: "Online Status", value: "Offline", status: "detected", category: "device" });
            logAction("Network: Went offline", "DeviceSettings");
        };
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getByCategory = (cat: string) => settings.filter(s => s.category === cat);

    const statusColor = (status: SettingResult["status"]) => {
        switch (status) {
            case "detected": return "var(--success, #22c55e)";
            case "unavailable": return "var(--text-tertiary)";
            case "pending": return "var(--accent-primary)";
            case "denied": return "var(--error, #ef4444)";
        }
    };

    const statusLabel = (status: SettingResult["status"]) => {
        switch (status) {
            case "detected": return "Detected";
            case "unavailable": return "Unavailable";
            case "pending": return "Pending";
            case "denied": return "Denied";
        }
    };

    const detectedCount = settings.filter(s => s.status === "detected").length;
    const totalCount = settings.length;

    return (
        <>
            <DeviceSettingsSideNav />
            <div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: "1200px" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 className="h1" style={{ marginBottom: "12px" }}>Device Settings Detector</h1>
                    <p className="body-sm" style={{ maxWidth: "640px", margin: "0 auto 20px", fontSize: "16px" }}>
                        Detects browser capabilities and device settings that mirror KaneAI advanced session configuration.
                        All detected values are logged to the activity tracker.
                    </p>

                    {/* Summary badges */}
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <div style={summaryBadgeStyle("var(--success, #22c55e)")}>
                            {detectedCount} Detected
                        </div>
                        <div style={summaryBadgeStyle("var(--text-tertiary)")}>
                            {totalCount - detectedCount} Unavailable / Pending
                        </div>
                    </div>
                </div>

                {/* Category sections */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {CATEGORIES.map(cat => {
                        const items = getByCategory(cat.key);
                        if (items.length === 0) return null;
                        return (
                            <section key={cat.key} id={`section-${cat.key}`} className="device-setting-section" style={sectionStyle} data-testid={`section-${cat.key}`}>
                                <div style={sectionHeaderStyle}>
                                    <h2 className="h2" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span>{cat.icon}</span> {cat.label}
                                    </h2>
                                    {cat.key === "location" && "geolocation" in navigator && (
                                        <button
                                            onClick={requestGeolocation}
                                            disabled={geoRequested}
                                            style={geoRequested ? btnDisabledStyle : btnPrimaryStyle}
                                            data-testid="detect-gps-btn"
                                        >
                                            {geoRequested ? "Requested" : "Detect GPS"}
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {items.map(item => (
                                        <div
                                            key={item.label}
                                            className="device-setting-row"
                                            style={rowStyle}
                                            data-testid={`setting-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                                        >
                                            <div className="setting-label-group" style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "180px" }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(item.status), flexShrink: 0 }} />
                                                <span style={labelStyle}>{item.label}</span>
                                            </div>
                                            <span className="setting-value" style={valueStyle} data-testid={`value-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                                                {item.value}
                                            </span>
                                            <span style={{ ...badgeStyle, color: statusColor(item.status), borderColor: statusColor(item.status) }}>
                                                {statusLabel(item.status)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* KaneAI mapping note */}
                <section style={{ ...sectionStyle, marginTop: "32px", background: "var(--bg-secondary)" }}>
                    <h3 className="h3" style={{ marginBottom: "12px" }}>KaneAI Settings Mapping</h3>
                    <p className="body-sm" style={{ lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: "16px" }}>
                        Settings that can only be configured at the native/device level and are not detectable from a webpage:
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {[
                            "Auto-Grant Permissions (Android)",
                            "Enable Keyboard (Android)",
                            "Ignore Unimportant Views (Android)",
                            "Disable UI Idle Wait (Android)",
                            "Auto-Accept Alerts (iOS)",
                            "Auto-Dismiss Alerts (iOS)",
                            "Upload File (iOS)",
                            "Auto-login through Google (Android)",
                        ].map(s => (
                            <span key={s} style={nativeOnlyBadge}>{s}</span>
                        ))}
                    </div>
                </section>

                <style jsx global>{`
                    @media (max-width: 768px) {
                        .device-setting-row {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            gap: 6px !important;
                            padding: 12px 10px !important;
                            border-bottom: 1px solid var(--border-light);
                            border-radius: 0 !important;
                        }
                        .device-setting-row .setting-label-group {
                            min-width: unset !important;
                        }
                        .device-setting-row .setting-value {
                            text-align: left !important;
                            font-size: 12px !important;
                            word-break: break-word !important;
                        }
                        .device-setting-section {
                            padding: 20px 16px !important;
                        }
                    }
                `}</style>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Side Navigation
// ─────────────────────────────────────────────────────────────────────────────
function DeviceSettingsSideNav() {
    const navRef = useRef<HTMLDivElement>(null);

    const scrollTo = (id: string) => {
        const root = navRef.current?.getRootNode() as Document | ShadowRoot;
        let target = root?.getElementById?.(id);
        if (!target) target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <div ref={navRef} className="fade-in side-nav-container" style={{
            position: "fixed", left: "1.875rem", top: "8rem",
            display: "flex", flexDirection: "column", gap: "2rem", zIndex: 100,
        }}>
            <div style={{
                fontSize: "0.625rem", fontWeight: 800, color: "var(--text-tertiary)",
                letterSpacing: "0.15em", textTransform: "uppercase",
                marginBottom: "-0.5rem", marginLeft: "0.375rem",
            }}>
                Navigation
            </div>
            {CATEGORIES.map(cat => (
                <div
                    key={cat.key}
                    className="nav-dot-wrapper"
                    onClick={() => scrollTo(`section-${cat.key}`)}
                    data-testid={`nav-${cat.key}`}
                    style={{
                        position: "relative", display: "flex", alignItems: "center",
                        cursor: "pointer", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    <div className="nav-label" style={{
                        position: "absolute", left: "1.75rem",
                        background: "var(--bg-card)", padding: "0.375rem 0.875rem",
                        borderRadius: "1.25rem", border: "1px solid var(--border-light)",
                        fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.05em", whiteSpace: "nowrap", opacity: 0.8,
                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        boxShadow: "var(--shadow-sm)", color: "var(--text-secondary)",
                    }}>
                        {cat.label}
                    </div>
                    <div className="nav-dot" style={{
                        width: "0.75rem", height: "0.75rem", borderRadius: "50%",
                        background: "var(--text-tertiary)",
                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        opacity: 0.6, zIndex: 2, border: "2px solid transparent",
                    }} />
                    <div className="nav-halo" style={{
                        position: "absolute", left: "0.375rem", top: "50%",
                        transform: "translate(-50%, -50%) scale(0)",
                        width: "2rem", height: "2rem", borderRadius: "50%",
                        background: "var(--accent-primary)", opacity: 0,
                        filter: "blur(0.5rem)",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", zIndex: 1,
                    }} />
                    <style jsx>{`
                        .nav-dot-wrapper:hover { transform: scale(1.05) !important; }
                        .nav-dot-wrapper:hover .nav-dot {
                            background: #fff; border-color: var(--accent-primary);
                            box-shadow: 0 0 15px var(--accent-primary), inset 0 0 5px var(--accent-primary);
                            opacity: 1;
                        }
                        .nav-dot-wrapper:hover .nav-halo {
                            transform: translate(-50%, -50%) scale(1) !important;
                            opacity: 0.3;
                        }
                        .nav-dot-wrapper:hover .nav-label {
                            opacity: 1; color: var(--accent-primary);
                            border-color: var(--accent-primary);
                        }
                    `}</style>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const sectionStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "20px",
    padding: "28px 32px",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--border-light)",
};

const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
};

const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "10px 12px",
    borderRadius: "10px",
    transition: "background 0.15s",
};

const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
};

const valueStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-primary)",
    flex: 1,
    textAlign: "right",
    wordBreak: "break-all",
};

const badgeStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "3px 8px",
    borderRadius: "6px",
    border: "1px solid",
    whiteSpace: "nowrap",
    flexShrink: 0,
};

const btnPrimaryStyle: React.CSSProperties = {
    padding: "8px 20px",
    borderRadius: "10px",
    border: "none",
    background: "var(--accent-primary)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
};

const btnDisabledStyle: React.CSSProperties = {
    ...btnPrimaryStyle,
    background: "var(--text-tertiary)",
    cursor: "default",
};

const nativeOnlyBadge: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "8px",
    background: "var(--bg-tertiary, rgba(0,0,0,0.05))",
    color: "var(--text-tertiary)",
    border: "1px solid var(--border-light)",
};

function summaryBadgeStyle(color: string): React.CSSProperties {
    return {
        fontSize: "13px",
        fontWeight: 600,
        padding: "6px 16px",
        borderRadius: "20px",
        color,
        border: `1px solid ${color}`,
        background: "var(--bg-card)",
    };
}
