"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useActivity } from "@/context/ActivityContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type FlagCategory =
    | "Automation & Testing"
    | "Window & Display"
    | "Startup Behavior"
    | "Security & Privacy"
    | "Network & Proxy"
    | "Performance"
    | "Logging & Debugging"
    | "Extensions & Media"
    | "Platform & Environment";

type FlagStatus = "expected" | "optional" | "unknown";

interface KnownFlagInfo {
    description: string;
    category: FlagCategory;
    status: FlagStatus;
}

interface ParsedFlag {
    raw: string;
    name: string;
    value: string | null;
    description: string;
    category: FlagCategory;
    status: FlagStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Version Info Fields (mirrors chrome://version layout)
// ─────────────────────────────────────────────────────────────────────────────
interface VersionField {
    key: string;
    label: string;
    multiline?: boolean;
}

// Browser label is dynamic — determined at runtime from the User Agent
const VERSION_FIELDS_TEMPLATE: VersionField[] = [
    { key: "browser", label: "" }, // label set dynamically
    { key: "revision", label: "Revision" },
    { key: "os", label: "OS" },
    { key: "javascript", label: "JavaScript" },
    { key: "user-agent", label: "User Agent", multiline: true },
    { key: "command-line", label: "Command Line", multiline: true },
    { key: "executable-path", label: "Executable Path" },
    { key: "profile-path", label: "Profile Path" },
    { key: "variations-seed-type", label: "Variations Seed Type" },
    { key: "command-line-variations", label: "Command-line Variations", multiline: true },
];

function detectBrowserName(ua: string): string {
    // Order matters — check specific variants before generic Chrome
    if (ua.includes("Edg/")) return "Microsoft Edge";
    if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Brave")) return "Brave";
    if (ua.includes("Vivaldi")) return "Vivaldi";
    if (ua.includes("SamsungBrowser")) return "Samsung Internet";
    if (ua.includes("Firefox/")) return "Mozilla Firefox";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Apple Safari";
    // Chrome variants — CFT (Chrome for Testing) includes "HeadlessChrome" or specific markers
    if (ua.includes("HeadlessChrome")) return "Google Chrome for Testing";
    if (ua.includes("Chrome/")) return "Google Chrome";
    return "Browser";
}

const EMPTY_VERSION_DATA: Record<string, string> = {
    "browser": "",
    "revision": "",
    "os": "",
    "javascript": "",
    "user-agent": "",
    "command-line": "",
    "executable-path": "",
    "profile-path": "",
    "variations-seed-type": "",
    "command-line-variations": "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Known Automation Flags Database
// ─────────────────────────────────────────────────────────────────────────────
const KNOWN_FLAGS: Record<string, KnownFlagInfo> = {
    "--remote-debugging-port": { description: "Port for Chrome DevTools Protocol (CDP) remote debugging", category: "Automation & Testing", status: "expected" },
    "--test-type": { description: "Sets test type (e.g., webdriver) — suppresses error dialogs", category: "Automation & Testing", status: "expected" },
    "--disable-blink-features": { description: "Disable specified Blink features (e.g., AutomationControlled)", category: "Automation & Testing", status: "expected" },
    "--allow-pre-commit-input": { description: "Allow input before compositor commit for testing", category: "Automation & Testing", status: "expected" },

    "--window-size": { description: "Set initial browser window dimensions (width,height)", category: "Window & Display", status: "expected" },
    "--window-position": { description: "Set initial browser window position (x,y)", category: "Window & Display", status: "optional" },
    "--ozone-platform": { description: "Select Ozone platform backend (x11, wayland, headless)", category: "Window & Display", status: "optional" },

    "--no-first-run": { description: "Skip first-run experience / welcome page", category: "Startup Behavior", status: "expected" },
    "--no-default-browser-check": { description: "Skip default browser check on startup", category: "Startup Behavior", status: "expected" },
    "--disable-default-apps": { description: "Don't install default apps on first run", category: "Startup Behavior", status: "expected" },
    "--disable-infobars": { description: "Suppress infobars (e.g., 'Chrome is being controlled')", category: "Startup Behavior", status: "expected" },
    "--disable-prompt-on-repost": { description: "Suppress repost form confirmation dialog", category: "Startup Behavior", status: "expected" },

    "--no-sandbox": { description: "Disable OS-level sandbox (required in containers/CI)", category: "Security & Privacy", status: "expected" },
    "--disable-dev-shm-usage": { description: "Use /tmp instead of /dev/shm (avoids shared memory issues in Docker)", category: "Security & Privacy", status: "expected" },
    "--disable-client-side-phishing-detection": { description: "Disable built-in phishing detection", category: "Security & Privacy", status: "expected" },
    "--safebrowsing-disable-auto-update": { description: "Disable Safe Browsing list auto-updates", category: "Security & Privacy", status: "expected" },
    "--ignore-certificate-errors": { description: "Ignore TLS/SSL certificate errors", category: "Security & Privacy", status: "optional" },
    "--password-store": { description: "Set password storage backend (basic, gnome, kwallet)", category: "Security & Privacy", status: "expected" },
    "--use-mock-keychain": { description: "Use mock keychain to prevent OS keychain popups", category: "Security & Privacy", status: "expected" },

    "--proxy-server": { description: "Route traffic through specified proxy server", category: "Network & Proxy", status: "optional" },
    "--proxy-bypass-list": { description: "Comma-separated list of hosts to bypass proxy", category: "Network & Proxy", status: "optional" },
    "--disable-background-networking": { description: "Disable background network requests (updates, Safe Browsing)", category: "Network & Proxy", status: "expected" },

    "--disable-hang-monitor": { description: "Disable page hang/unresponsive detection", category: "Performance", status: "expected" },
    "--disable-popup-blocking": { description: "Allow all popups (no popup blocker)", category: "Performance", status: "expected" },
    "--disable-sync": { description: "Disable Chrome Sync (profile/bookmarks/etc.)", category: "Performance", status: "expected" },
    "--disable-translate": { description: "Disable built-in Google Translate feature", category: "Performance", status: "expected" },
    "--metrics-recording-only": { description: "Record metrics but don't report them", category: "Performance", status: "expected" },
    "--disable-backgrounding-occluded-windows": { description: "Don't throttle occluded (hidden) windows", category: "Performance", status: "expected" },
    "--disable-background-timer-throttling": { description: "Don't throttle timers in background tabs", category: "Performance", status: "expected" },
    "--disable-notifications": { description: "Disable web notification permission prompts", category: "Performance", status: "expected" },

    "--enable-logging": { description: "Enable Chrome's internal logging output", category: "Logging & Debugging", status: "optional" },
    "--v": { description: "Set verbosity level for logging (0-3)", category: "Logging & Debugging", status: "optional" },

    "--load-extension": { description: "Load unpacked extension from specified path", category: "Extensions & Media", status: "optional" },
    "--user-data-dir": { description: "Set custom user data directory (profile isolation)", category: "Platform & Environment", status: "expected" },
    "--flag-switches-begin": { description: "Marker — start of chrome://flags switches", category: "Platform & Environment", status: "optional" },
    "--flag-switches-end": { description: "Marker — end of chrome://flags switches", category: "Platform & Environment", status: "optional" },
};

const ALL_CATEGORIES: FlagCategory[] = [
    "Automation & Testing",
    "Window & Display",
    "Startup Behavior",
    "Security & Privacy",
    "Network & Proxy",
    "Performance",
    "Logging & Debugging",
    "Extensions & Media",
    "Platform & Environment",
];

// ─────────────────────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────────────────────
function parseCommandLine(commandLine: string): ParsedFlag[] {
    const trimmed = commandLine.trim();
    if (!trimmed) return [];

    // Split by whitespace, but keep --flag=value together
    const tokens: string[] = [];
    let current = "";
    let i = 0;
    while (i < trimmed.length) {
        const ch = trimmed[i];
        if (ch === " " || ch === "\t") {
            if (current) tokens.push(current);
            current = "";
            i++;
            while (i < trimmed.length && (trimmed[i] === " " || trimmed[i] === "\t")) i++;
        } else {
            current += ch;
            i++;
        }
    }
    if (current) tokens.push(current);

    // First token is executable path — skip it
    const flagTokens = tokens.slice(1).filter(t => t.startsWith("--"));

    const seen = new Set<string>();
    const flags: ParsedFlag[] = [];

    for (const token of flagTokens) {
        // Deduplicate
        if (seen.has(token)) continue;
        seen.add(token);

        const eqIdx = token.indexOf("=");
        const name = eqIdx >= 0 ? token.substring(0, eqIdx) : token;
        const value = eqIdx >= 0 ? token.substring(eqIdx + 1) : null;

        const known = KNOWN_FLAGS[name];
        flags.push({
            raw: token,
            name,
            value,
            description: known?.description ?? "Unknown flag — not in automation database",
            category: known?.category ?? "Platform & Environment",
            status: known?.status ?? "unknown",
        });
    }

    return flags;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ChromeVersionValidatorPage() {
    const { logAction } = useActivity();

    const [versionData, setVersionData] = useState<Record<string, string>>(EMPTY_VERSION_DATA);
    const [commandLineInput, setCommandLineInput] = useState("");
    const [isParsed, setIsParsed] = useState(false);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<FlagCategory | null>(null);
    const [statusFilter, setStatusFilter] = useState<FlagStatus | null>(null);
    const [expandedField, setExpandedField] = useState<string | null>(null);
    const [browserLabel, setBrowserLabel] = useState("Browser");

    // Store browser-detected data so Reset returns to detected state
    const detectedDataRef = useRef<Record<string, string>>(EMPTY_VERSION_DATA);

    // Compute VERSION_FIELDS with dynamic browser label
    const VERSION_FIELDS = useMemo(() =>
        VERSION_FIELDS_TEMPLATE.map(f =>
            f.key === "browser" ? { ...f, label: browserLabel } : f
        ),
    [browserLabel]);

    // Auto-detect browser info from the current Chrome instance
    useEffect(() => {
        const detected: Record<string, string> = { ...EMPTY_VERSION_DATA };
        const ua = navigator.userAgent;

        // Detect browser name
        const name = detectBrowserName(ua);
        setBrowserLabel(name);

        // User Agent
        detected["user-agent"] = ua;

        // Browser version from UA
        const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
        const edgeMatch = ua.match(/Edg\/([\d.]+)/);
        const firefoxMatch = ua.match(/Firefox\/([\d.]+)/);
        const safariMatch = ua.match(/Version\/([\d.]+).*Safari/);

        const versionMatch = edgeMatch || chromeMatch || firefoxMatch || safariMatch;
        if (versionMatch) {
            const arch = ua.includes("WOW64") || ua.includes("Win64") || ua.includes("x86_64") || ua.includes("x64") || ua.includes("aarch64") ? "64-bit" : "32-bit";
            detected["browser"] = `${versionMatch[1]} (${arch})`;
        }

        // OS — use User-Agent Client Hints API for accurate version (UA string is frozen on macOS 10.15.7+ and Windows 10+)
        const uaData = (navigator as Navigator & { userAgentData?: { getHighEntropyValues: (hints: string[]) => Promise<{ platform: string; platformVersion: string; architecture: string; bitness: string }> } }).userAgentData;
        if (uaData) {
            uaData.getHighEntropyValues(["platform", "platformVersion", "architecture", "bitness"]).then(hints => {
                let osStr = hints.platform;
                if (hints.platformVersion) {
                    if (hints.platform === "macOS") {
                        // platformVersion is the real macOS version (e.g., "26.0.0")
                        const major = parseInt(hints.platformVersion.split(".")[0], 10);
                        osStr = `macOS ${major >= 16 ? hints.platformVersion : hints.platformVersion}`;
                    } else if (hints.platform === "Windows") {
                        // Windows platformVersion: major >= 13 means Windows 11, else Windows 10
                        const major = parseInt(hints.platformVersion.split(".")[0], 10);
                        osStr = major >= 13 ? `Windows 11 (${hints.platformVersion})` : `Windows 10 (${hints.platformVersion})`;
                    } else {
                        osStr = `${hints.platform} ${hints.platformVersion}`;
                    }
                }
                if (hints.architecture) {
                    osStr += ` ${hints.architecture}`;
                    if (hints.bitness) osStr += `_${hints.bitness}`;
                }
                setVersionData(prev => {
                    const updated = { ...prev, os: osStr };
                    detectedDataRef.current = updated;
                    return updated;
                });
            }).catch(() => { /* fallback to UA-based detection below */ });
        }

        // Fallback OS from UA (used if Client Hints not available, or until the promise resolves)
        if (ua.includes("Windows NT")) {
            const ntMatch = ua.match(/Windows NT ([\d.]+)/);
            detected["os"] = `Windows NT ${ntMatch ? ntMatch[1] : ""}`;
        } else if (ua.includes("Mac OS X")) {
            detected["os"] = "macOS (detecting version...)";
        } else if (ua.includes("CrOS")) {
            detected["os"] = "Chrome OS";
        } else if (ua.includes("Linux")) {
            detected["os"] = "Linux";
        } else if (navigator.platform) {
            detected["os"] = navigator.platform;
        }

        // JavaScript engine version
        if (firefoxMatch) {
            detected["javascript"] = `SpiderMonkey (Firefox ${firefoxMatch[1]})`;
        } else if (chromeMatch) {
            const parts = chromeMatch[1].split(".");
            detected["javascript"] = `V8 ${parts[0]}.${parts[1]}.${parts[2] || "0"}.${parts[3] || "0"}`;
        } else if (safariMatch) {
            detected["javascript"] = "JavaScriptCore";
        }

        // Screen dimensions as a helpful reference
        detected["variations-seed-type"] = `${window.screen.width}x${window.screen.height} (screen), ${window.innerWidth}x${window.innerHeight} (viewport)`;

        detectedDataRef.current = detected;
        setVersionData(detected);
        logAction(`Auto-detected ${name} version info`, "ChromeVersionValidator");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Parse flags
    const parsedFlags = useMemo(() => {
        if (!isParsed) return [];
        return parseCommandLine(commandLineInput);
    }, [commandLineInput, isParsed]);

    // Counts
    const counts = useMemo(() => {
        const c = { expected: 0, optional: 0, unknown: 0 };
        parsedFlags.forEach(f => c[f.status]++);
        return c;
    }, [parsedFlags]);

    // Filtered flags
    const filteredFlags = useMemo(() => {
        let result = parsedFlags;
        if (statusFilter) result = result.filter(f => f.status === statusFilter);
        if (activeCategory) result = result.filter(f => f.category === activeCategory);
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(f => f.name.toLowerCase().includes(s) || f.description.toLowerCase().includes(s) || (f.value && f.value.toLowerCase().includes(s)));
        }
        return result;
    }, [parsedFlags, statusFilter, activeCategory, search]);

    // Group filtered flags by category
    const groupedFlags = useMemo(() => {
        const groups: Record<string, ParsedFlag[]> = {};
        for (const f of filteredFlags) {
            if (!groups[f.category]) groups[f.category] = [];
            groups[f.category].push(f);
        }
        return groups;
    }, [filteredFlags]);

    // Handlers
    const handleParse = () => {
        setIsParsed(true);
        setStatusFilter(null);
        setActiveCategory(null);
        setSearch("");
        const flags = parseCommandLine(commandLineInput);
        logAction(`Parsed command line (${flags.length} flags extracted)`, "ChromeVersionValidator");
    };

    const handleClear = () => {
        setCommandLineInput("");
        setIsParsed(false);
        setStatusFilter(null);
        setActiveCategory(null);
        setSearch("");
        logAction("Cleared command line input", "ChromeVersionValidator");
    };

    const handleResetAll = () => {
        setVersionData(detectedDataRef.current);
        setCommandLineInput("");
        setIsParsed(false);
        setStatusFilter(null);
        setActiveCategory(null);
        setSearch("");
        setExpandedField(null);
        logAction("Reset to browser-detected values", "ChromeVersionValidator");
    };

    const handleFieldChange = (key: string, value: string) => {
        setVersionData(prev => ({ ...prev, [key]: value }));
        if (key === "command-line") {
            setCommandLineInput(value);
            setIsParsed(false);
        }
    };

    const handleSummaryClick = (status: FlagStatus) => {
        const next = statusFilter === status ? null : status;
        setStatusFilter(next);
        logAction(next ? `Filter: ${status} flags` : "Cleared status filter", "ChromeVersionValidator");
    };

    const handleCategoryClick = (cat: FlagCategory | null) => {
        setActiveCategory(cat);
        logAction(cat ? `Filter category: ${cat}` : "Show all categories", "ChromeVersionValidator");
    };

    // Side nav sections
    const sideNavSections = [
        { id: "version-info", label: "Version Info" },
        { id: "command-input", label: "Command Line" },
        { id: "flag-summary", label: "Flag Summary" },
        { id: "parsed-flags", label: "Parsed Flags" },
    ];

    return (
        <div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: "1200px" }}>
            <div style={{ display: "flex", gap: 32 }}>
                {/* Side Nav */}
                <nav className="side-nav-container" style={S.sideNav}>
                    <p style={S.sideNavTitle}>Sections</p>
                    {sideNavSections.map(s => (
                        <a key={s.id} href={`#${s.id}`} style={S.sideNavLink} data-testid={`nav-${s.id}`}>
                            {s.label}
                        </a>
                    ))}
                </nav>

                {/* Main Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header */}
                    <div style={{ marginBottom: 32 }}>
                        <h1 className="h1" style={{ marginBottom: 8 }}>Chrome Version Validator</h1>
                        <p className="body-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                            Mirrors <code style={S.code}>chrome://version</code> — validate browser info and command-line flags from Kane AI automation runs.
                        </p>
                        <button style={S.resetBtn} onClick={handleResetAll} data-testid="prefs-reset-all">Reset All</button>
                    </div>

                    {/* Version Info Table */}
                    <section id="version-info" style={{ marginBottom: 40 }}>
                        <h2 className="h3" style={{ marginBottom: 16 }}>Browser Version Info</h2>
                        <div style={S.versionTable} data-testid="version-info-table">
                            {VERSION_FIELDS.filter(field => versionData[field.key]).map(field => {
                                const val = versionData[field.key];
                                const isExpanded = expandedField === field.key;
                                const isLong = val.length > 120;
                                return (
                                    <div key={field.key} style={S.versionRow} data-testid={`version-field-${field.key}`}>
                                        <div style={S.versionLabel}>{field.label}</div>
                                        <div style={S.versionValue}>
                                            {field.multiline ? (
                                                <div>
                                                    <div
                                                        style={{
                                                            ...S.valueText,
                                                            ...(isLong && !isExpanded ? { maxHeight: 44, overflow: "hidden" } : {}),
                                                        }}
                                                        data-testid={`version-value-${field.key}`}
                                                    >
                                                        {val}
                                                    </div>
                                                    {isLong && (
                                                        <button
                                                            style={S.expandBtn}
                                                            onClick={() => {
                                                                setExpandedField(isExpanded ? null : field.key);
                                                                logAction(`${isExpanded ? "Collapsed" : "Expanded"} ${field.label}`, "ChromeVersionValidator");
                                                            }}
                                                            data-testid={`expand-${field.key}`}
                                                        >
                                                            {isExpanded ? "Show less" : "Show more"}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={S.valueText} data-testid={`version-value-${field.key}`}>{val}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Command Line Input */}
                    <section id="command-input" style={{ marginBottom: 40 }}>
                        <h2 className="h3" style={{ marginBottom: 12 }}>Paste Command Line</h2>
                        <p className="body-sm" style={{ color: "var(--text-tertiary)", marginBottom: 12 }}>
                            Paste the <strong>Command Line</strong> value from <code style={S.code}>chrome://version</code> to parse and validate individual flags.
                        </p>
                        <textarea
                            value={commandLineInput}
                            onChange={e => {
                                setCommandLineInput(e.target.value);
                                setIsParsed(false);
                            }}
                            style={S.textarea}
                            rows={5}
                            placeholder="Paste your chrome://version Command Line here..."
                            data-testid="command-line-input"
                        />
                        <div style={S.btnRow}>
                            <button style={S.primaryBtn} onClick={handleParse} data-testid="parse-command-line-btn">
                                Parse &amp; Validate
                            </button>
<button style={S.secondaryBtn} onClick={handleClear} data-testid="clear-input-btn">
                                Clear
                            </button>
                        </div>
                    </section>

                    {/* Flag Summary */}
                    {isParsed && parsedFlags.length > 0 && (
                        <>
                            <section id="flag-summary" style={{ marginBottom: 32 }}>
                                <h2 className="h3" style={{ marginBottom: 16 }}>Flag Summary</h2>
                                <div style={S.summaryGrid}>
                                    <SummaryCard
                                        label="Expected"
                                        count={counts.expected}
                                        color="var(--success)"
                                        active={statusFilter === "expected"}
                                        onClick={() => handleSummaryClick("expected")}
                                        testId="flag-summary-expected"
                                    />
                                    <SummaryCard
                                        label="Optional"
                                        count={counts.optional}
                                        color="var(--warning)"
                                        active={statusFilter === "optional"}
                                        onClick={() => handleSummaryClick("optional")}
                                        testId="flag-summary-optional"
                                    />
                                    <SummaryCard
                                        label="Unknown"
                                        count={counts.unknown}
                                        color="var(--error)"
                                        active={statusFilter === "unknown"}
                                        onClick={() => handleSummaryClick("unknown")}
                                        testId="flag-summary-unknown"
                                    />
                                </div>
                            </section>

                            {/* Category Filter + Search */}
                            <section id="parsed-flags" style={{ marginBottom: 32 }}>
                                <h2 className="h3" style={{ marginBottom: 16 }}>
                                    Parsed Flags
                                    <span style={{ fontWeight: 400, fontSize: 14, color: "var(--text-tertiary)", marginLeft: 8 }}>
                                        ({filteredFlags.length} of {parsedFlags.length})
                                    </span>
                                </h2>

                                {/* Category chips */}
                                <div style={S.chipRow}>
                                    <button
                                        style={{ ...S.chip, ...(activeCategory === null ? S.chipActive : {}) }}
                                        onClick={() => handleCategoryClick(null)}
                                        data-testid="flag-filter-all"
                                    >
                                        All
                                    </button>
                                    {ALL_CATEGORIES.map(cat => {
                                        const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                                        const hasFlags = parsedFlags.some(f => f.category === cat);
                                        if (!hasFlags) return null;
                                        return (
                                            <button
                                                key={cat}
                                                style={{ ...S.chip, ...(activeCategory === cat ? S.chipActive : {}) }}
                                                onClick={() => handleCategoryClick(cat)}
                                                data-testid={`flag-filter-${slug}`}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search */}
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        logAction(`Search flags: "${e.target.value}"`, "ChromeVersionValidator");
                                    }}
                                    placeholder="Search flags..."
                                    style={S.searchInput}
                                    data-testid="flags-search"
                                />

                                {/* Flag groups */}
                                {Object.entries(groupedFlags).map(([category, flags]) => (
                                    <div key={category} style={{ marginBottom: 24 }}>
                                        <h4 style={S.categoryHeader}>{category}</h4>
                                        {flags.map(flag => (
                                            <FlagRow key={flag.raw} flag={flag} />
                                        ))}
                                    </div>
                                ))}

                                {filteredFlags.length === 0 && (
                                    <p style={{ color: "var(--text-tertiary)", textAlign: "center", padding: 32 }}>
                                        No flags match the current filters.
                                    </p>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .chrome-flag-row:hover {
                    background: var(--bg-secondary) !important;
                }
                @media (max-width: 768px) {
                    .cv-summary-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .cv-chip-row {
                        flex-wrap: wrap !important;
                    }
                    .cv-version-row {
                        flex-direction: column !important;
                        gap: 4px !important;
                    }
                    .cv-version-label {
                        min-width: unset !important;
                        text-align: left !important;
                    }
                }
            `}</style>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────
function SummaryCard({ label, count, color, active, onClick, testId }: {
    label: string; count: number; color: string; active: boolean; onClick: () => void; testId: string;
}) {
    return (
        <button
            style={{
                ...S.summaryCard,
                borderColor: active ? color : "var(--border-light)",
                background: active ? `color-mix(in srgb, ${color} 8%, var(--bg-card))` : "var(--bg-card)",
            }}
            onClick={onClick}
            data-testid={testId}
        >
            <span style={{ fontSize: 28, fontWeight: 700, color }}>{count}</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        </button>
    );
}

function FlagRow({ flag }: { flag: ParsedFlag }) {
    const statusColors: Record<FlagStatus, string> = {
        expected: "var(--success)",
        optional: "var(--warning)",
        unknown: "var(--error)",
    };
    const color = statusColors[flag.status];
    const slug = flag.name.replace(/^--/, "");

    return (
        <div className="chrome-flag-row" style={S.flagRow} data-testid={`parsed-flag-${slug}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <code style={S.flagName}>{flag.name}</code>
                {flag.value !== null && (
                    <span style={S.flagValue}>= {flag.value}</span>
                )}
                <span style={{ ...S.statusBadge, color, borderColor: color }}>
                    {flag.status}
                </span>
            </div>
            <p style={S.flagDesc}>{flag.description}</p>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
    sideNav: {
        position: "sticky",
        top: 90,
        alignSelf: "flex-start",
        minWidth: 170,
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    sideNavTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 8,
    },
    sideNavLink: {
        fontSize: 13,
        color: "var(--text-secondary)",
        padding: "6px 10px",
        borderRadius: "var(--radius-sm)",
        textDecoration: "none",
        transition: "background 0.15s",
    },
    code: {
        fontSize: 12,
        padding: "2px 6px",
        borderRadius: 4,
        background: "var(--bg-secondary)",
        color: "var(--accent-primary)",
        fontFamily: "monospace",
    },
    resetBtn: {
        marginTop: 12,
        padding: "6px 16px",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-light)",
        background: "var(--bg-secondary)",
        color: "var(--text-secondary)",
        cursor: "pointer",
    },

    // Version table
    versionTable: {
        background: "var(--bg-card)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-light)",
        overflow: "hidden",
    },
    versionRow: {
        display: "flex",
        borderBottom: "1px solid var(--border-light)",
        padding: "12px 16px",
        gap: 16,
        alignItems: "flex-start",
    },
    versionLabel: {
        minWidth: 180,
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-tertiary)",
        textAlign: "right" as const,
        flexShrink: 0,
        paddingTop: 1,
    },
    versionValue: {
        flex: 1,
        minWidth: 0,
    },
    valueText: {
        fontSize: 13,
        fontFamily: "monospace",
        color: "var(--text-primary)",
        lineHeight: 1.6,
        wordBreak: "break-all" as const,
    },
    expandBtn: {
        fontSize: 12,
        color: "var(--accent-primary)",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 0",
        fontWeight: 500,
    },

    // Textarea
    textarea: {
        width: "100%",
        padding: "12px 14px",
        fontSize: 13,
        fontFamily: "monospace",
        lineHeight: 1.6,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-light)",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        resize: "vertical" as const,
        outline: "none",
        boxSizing: "border-box" as const,
    },
    btnRow: {
        display: "flex",
        gap: 8,
        marginTop: 12,
        flexWrap: "wrap" as const,
    },
    primaryBtn: {
        padding: "8px 20px",
        fontSize: 13,
        fontWeight: 600,
        borderRadius: "var(--radius-sm)",
        border: "none",
        background: "var(--accent-primary)",
        color: "var(--accent-text)",
        cursor: "pointer",
    },
    secondaryBtn: {
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-light)",
        background: "var(--bg-secondary)",
        color: "var(--text-secondary)",
        cursor: "pointer",
    },

    // Summary
    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
    },
    summaryCard: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 4,
        padding: "20px 16px",
        borderRadius: "var(--radius-md)",
        border: "2px solid var(--border-light)",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
    },

    // Chips
    chipRow: {
        display: "flex",
        gap: 6,
        marginBottom: 12,
        flexWrap: "wrap" as const,
    },
    chip: {
        padding: "5px 12px",
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 20,
        border: "1px solid var(--border-light)",
        background: "var(--bg-secondary)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s",
    },
    chipActive: {
        background: "var(--accent-primary)",
        color: "var(--accent-text)",
        borderColor: "var(--accent-primary)",
    },

    // Search
    searchInput: {
        width: "100%",
        padding: "8px 14px",
        fontSize: 13,
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-light)",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        outline: "none",
        marginBottom: 20,
        boxSizing: "border-box" as const,
    },

    // Category header
    categoryHeader: {
        fontSize: 12,
        fontWeight: 700,
        color: "var(--text-tertiary)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: "1px solid var(--border-light)",
    },

    // Flag row
    flagRow: {
        padding: "10px 14px",
        borderRadius: "var(--radius-sm)",
        marginBottom: 4,
        transition: "background 0.15s",
    },
    flagName: {
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "monospace",
        color: "var(--text-primary)",
    },
    flagValue: {
        fontSize: 12,
        fontFamily: "monospace",
        color: "var(--text-tertiary)",
        wordBreak: "break-all" as const,
    },
    statusBadge: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
        padding: "2px 8px",
        borderRadius: 10,
        border: "1px solid",
    },
    flagDesc: {
        fontSize: 12,
        color: "var(--text-tertiary)",
        margin: "4px 0 0",
        lineHeight: 1.4,
    },
};
