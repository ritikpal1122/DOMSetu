"use client";

import React, { useState, useEffect } from "react";
import { useActivity } from "@/context/ActivityContext";

// ─────────────────────────────────────────────────────────────────────────────
// Chrome Preferences Data (mirrors chrome://version fields)
// ─────────────────────────────────────────────────────────────────────────────
interface ChromePref {
    key: string;
    label: string;
    description: string;
    type: "text" | "select" | "toggle" | "textarea" | "number";
    defaultValue: string;
    options?: string[];
    group: string;
}

const CHROME_PREFS: ChromePref[] = [
    // ── Application Info ──
    { key: "google-chrome", label: "Google Chrome", description: "Chrome browser version string", type: "text", defaultValue: "131.0.6778.109 (Official Build) (arm64)", group: "Application Info" },
    { key: "revision", label: "Revision", description: "Chromium source revision hash", type: "text", defaultValue: "a881a3b0538f81cf1b2dd0e1e83e06de4dd44b71-refs/branch-heads/6778@{#1500}", group: "Application Info" },
    { key: "os", label: "OS", description: "Operating system platform and version", type: "text", defaultValue: "macOS Version 15.2 (Build 24C101)", group: "Application Info" },
    { key: "javascript", label: "JavaScript", description: "V8 JavaScript engine version", type: "text", defaultValue: "V8 13.1.201.18", group: "Application Info" },
    { key: "user-agent", label: "User Agent", description: "Full user-agent string sent with HTTP requests", type: "textarea", defaultValue: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36", group: "Application Info" },
    { key: "command-line", label: "Command Line", description: "Command line flags used to launch Chrome", type: "textarea", defaultValue: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --flag-switches-begin --flag-switches-end", group: "Application Info" },

    // ── Paths ──
    { key: "executable-path", label: "Executable Path", description: "Path to Chrome binary executable", type: "text", defaultValue: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", group: "Paths" },
    { key: "profile-path", label: "Profile Path", description: "Path to active Chrome user profile directory", type: "text", defaultValue: "/Users/user/Library/Application Support/Google/Chrome/Default", group: "Paths" },

    // ── Features & Flags ──
    { key: "safe-browsing", label: "Safe Browsing", description: "Enable Google Safe Browsing protection", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "hardware-acceleration", label: "Hardware Acceleration", description: "Use GPU for page rendering and compositing", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "webrtc", label: "WebRTC", description: "Enable real-time communication (video/audio calls)", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "webgl", label: "WebGL", description: "Enable hardware-accelerated 3D graphics in browser", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "webgpu", label: "WebGPU", description: "Enable next-generation GPU API for the web", type: "toggle", defaultValue: "disabled", group: "Features & Flags" },
    { key: "v8-sparkplug", label: "V8 Sparkplug", description: "V8 baseline JIT compiler for faster startup", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "v8-maglev", label: "V8 Maglev", description: "V8 mid-tier optimizing JIT compiler", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "v8-turbofan", label: "V8 TurboFan", description: "V8 top-tier optimizing JIT compiler", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "back-forward-cache", label: "Back-Forward Cache", description: "Cache pages for instant back/forward navigation", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "prerender2", label: "Prerender2", description: "Prerender pages for instant navigation", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "site-isolation", label: "Site Isolation", description: "Run each site in its own process for security", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "vulkan", label: "Vulkan", description: "Use Vulkan graphics API for rendering", type: "toggle", defaultValue: "disabled", group: "Features & Flags" },
    { key: "skia-graphite", label: "Skia Graphite", description: "Next-generation Skia GPU rendering backend", type: "toggle", defaultValue: "disabled", group: "Features & Flags" },
    { key: "parallel-downloading", label: "Parallel Downloading", description: "Split downloads into multiple streams", type: "toggle", defaultValue: "disabled", group: "Features & Flags" },
    { key: "smooth-scrolling", label: "Smooth Scrolling", description: "Enable animated smooth scrolling behavior", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },
    { key: "lazy-loading", label: "Lazy Frame Loading", description: "Defer loading of off-screen iframes", type: "toggle", defaultValue: "enabled", group: "Features & Flags" },

    // ── Network & Protocol ──
    { key: "quic-protocol", label: "QUIC Protocol", description: "Enable QUIC/HTTP3 experimental transport protocol", type: "toggle", defaultValue: "enabled", group: "Network & Protocol" },
    { key: "dns-over-https", label: "DNS over HTTPS", description: "Encrypt DNS queries using HTTPS", type: "select", defaultValue: "automatic", options: ["off", "automatic", "secure", "custom"], group: "Network & Protocol" },
    { key: "dns-prefetching", label: "DNS Prefetching", description: "Prefetch DNS for links on current page", type: "toggle", defaultValue: "enabled", group: "Network & Protocol" },
    { key: "preconnect", label: "Preconnect", description: "Pre-establish connections to likely navigations", type: "toggle", defaultValue: "enabled", group: "Network & Protocol" },
    { key: "proxy-server", label: "Proxy Server", description: "HTTP proxy server address (host:port)", type: "text", defaultValue: "", group: "Network & Protocol" },
    { key: "proxy-bypass-list", label: "Proxy Bypass List", description: "Comma-separated list of hosts to bypass proxy", type: "textarea", defaultValue: "", group: "Network & Protocol" },

    // ── Privacy & Security ──
    { key: "do-not-track", label: "Do Not Track", description: "Send DNT header with HTTP requests", type: "toggle", defaultValue: "disabled", group: "Privacy & Security" },
    { key: "third-party-cookies", label: "Block Third-Party Cookies", description: "Block cookies from third-party domains", type: "toggle", defaultValue: "disabled", group: "Privacy & Security" },
    { key: "tracking-prevention", label: "Tracking Prevention", description: "Intelligent Tracking Prevention level", type: "select", defaultValue: "standard", options: ["off", "standard", "strict"], group: "Privacy & Security" },
    { key: "password-manager", label: "Password Manager", description: "Chrome built-in password manager", type: "toggle", defaultValue: "enabled", group: "Privacy & Security" },
    { key: "autofill-addresses", label: "Autofill Addresses", description: "Auto-fill saved addresses in forms", type: "toggle", defaultValue: "enabled", group: "Privacy & Security" },
    { key: "autofill-payments", label: "Autofill Payments", description: "Auto-fill saved payment methods in forms", type: "toggle", defaultValue: "enabled", group: "Privacy & Security" },
    { key: "certificate-transparency", label: "Certificate Transparency", description: "Enforce Certificate Transparency for HTTPS", type: "toggle", defaultValue: "enabled", group: "Privacy & Security" },

    // ── Content Settings ──
    { key: "javascript-enabled", label: "JavaScript Enabled", description: "Allow websites to run JavaScript", type: "toggle", defaultValue: "enabled", group: "Content Settings" },
    { key: "images-enabled", label: "Images Enabled", description: "Allow websites to display images", type: "toggle", defaultValue: "enabled", group: "Content Settings" },
    { key: "popups", label: "Popups", description: "Allow websites to open popup windows", type: "toggle", defaultValue: "disabled", group: "Content Settings" },
    { key: "notifications", label: "Notifications", description: "Allow websites to send push notifications", type: "select", defaultValue: "ask", options: ["allow", "ask", "block"], group: "Content Settings" },
    { key: "location", label: "Location Access", description: "Allow websites to access geographic location", type: "select", defaultValue: "ask", options: ["allow", "ask", "block"], group: "Content Settings" },
    { key: "camera", label: "Camera Access", description: "Allow websites to access camera", type: "select", defaultValue: "ask", options: ["allow", "ask", "block"], group: "Content Settings" },
    { key: "microphone", label: "Microphone Access", description: "Allow websites to access microphone", type: "select", defaultValue: "ask", options: ["allow", "ask", "block"], group: "Content Settings" },
    { key: "clipboard", label: "Clipboard Access", description: "Allow websites to read clipboard contents", type: "select", defaultValue: "ask", options: ["allow", "ask", "block"], group: "Content Settings" },
    { key: "default-zoom", label: "Default Zoom Level", description: "Default page zoom percentage", type: "number", defaultValue: "100", group: "Content Settings" },
    { key: "minimum-font-size", label: "Minimum Font Size", description: "Minimum font size in pixels", type: "number", defaultValue: "0", group: "Content Settings" },
    { key: "default-encoding", label: "Default Encoding", description: "Default text encoding for pages", type: "select", defaultValue: "UTF-8", options: ["UTF-8", "ISO-8859-1", "Windows-1252", "Shift_JIS", "EUC-JP", "GBK", "Big5"], group: "Content Settings" },

    // ── Performance ──
    { key: "memory-saver", label: "Memory Saver", description: "Free up memory from inactive tabs", type: "toggle", defaultValue: "enabled", group: "Performance" },
    { key: "energy-saver", label: "Energy Saver", description: "Limit background activity when on battery", type: "select", defaultValue: "on-battery", options: ["off", "on-battery", "always"], group: "Performance" },
    { key: "renderer-process-limit", label: "Renderer Process Limit", description: "Max number of renderer processes (0 = unlimited)", type: "number", defaultValue: "0", group: "Performance" },
    { key: "tile-size", label: "Default Tile Size", description: "GPU rasterization tile size in pixels", type: "number", defaultValue: "256", group: "Performance" },

    // ── Experimental ──
    { key: "experimental-web-features", label: "Experimental Web Features", description: "Enable experimental web platform features", type: "toggle", defaultValue: "disabled", group: "Experimental" },
    { key: "wasm-lazy-compilation", label: "WebAssembly Lazy Compilation", description: "Lazily compile WebAssembly modules", type: "toggle", defaultValue: "disabled", group: "Experimental" },
    { key: "wasm-simd", label: "WebAssembly SIMD", description: "Enable SIMD instructions in WebAssembly", type: "toggle", defaultValue: "enabled", group: "Experimental" },
    { key: "wasm-threads", label: "WebAssembly Threads", description: "Enable threading support in WebAssembly", type: "toggle", defaultValue: "enabled", group: "Experimental" },
    { key: "force-dark-mode", label: "Force Dark Mode", description: "Force dark mode on all web content", type: "toggle", defaultValue: "disabled", group: "Experimental" },
    { key: "reader-mode", label: "Reader Mode", description: "Enable reader mode for article pages", type: "toggle", defaultValue: "disabled", group: "Experimental" },
    { key: "overlay-scrollbars", label: "Overlay Scrollbars", description: "Use overlay-style thin scrollbars", type: "toggle", defaultValue: "disabled", group: "Experimental" },
    { key: "tab-groups-save", label: "Tab Groups Save", description: "Save and restore tab groups", type: "toggle", defaultValue: "enabled", group: "Experimental" },

    // ── Command Line Flags (chrome://version → Command Line) ──
    // Automation & Testing
    { key: "no-sandbox", label: "--no-sandbox", description: "Disable the sandbox for all process types (required in some CI environments)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "headless", label: "--headless", description: "Run Chrome in headless mode (no visible UI window)", type: "select", defaultValue: "disabled", options: ["disabled", "old", "new"], group: "Command Line Flags" },
    { key: "disable-gpu", label: "--disable-gpu", description: "Disable GPU hardware acceleration (often used with headless)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "remote-debugging-port", label: "--remote-debugging-port", description: "Enable remote debugging on specified port (e.g. 9222)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "remote-debugging-address", label: "--remote-debugging-address", description: "IP address to bind remote debugging (e.g. 0.0.0.0)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "disable-extensions", label: "--disable-extensions", description: "Disable all Chrome extensions", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-infobars", label: "--disable-infobars", description: "Disable the 'Chrome is being controlled by automated software' infobar", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "enable-automation", label: "--enable-automation", description: "Enable automation-related features (set by ChromeDriver)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-blink-features", label: "--disable-blink-features", description: "Comma-separated list of Blink features to disable (e.g. AutomationControlled)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "enable-features", label: "--enable-features", description: "Comma-separated list of Chromium features to enable", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "disable-features", label: "--disable-features", description: "Comma-separated list of Chromium features to disable", type: "text", defaultValue: "", group: "Command Line Flags" },

    // Window & Display
    { key: "start-maximized", label: "--start-maximized", description: "Start Chrome with the window maximized", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "start-fullscreen", label: "--start-fullscreen", description: "Start Chrome in fullscreen mode", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "window-size", label: "--window-size", description: "Set initial window size (e.g. 1920,1080)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "window-position", label: "--window-position", description: "Set initial window position (e.g. 0,0)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "force-device-scale-factor", label: "--force-device-scale-factor", description: "Override device scale factor (e.g. 1, 1.5, 2)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "hide-scrollbars", label: "--hide-scrollbars", description: "Hide scrollbars in the browser viewport", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "kiosk", label: "--kiosk", description: "Run Chrome in kiosk mode (fullscreen, no UI chrome)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },

    // Profile & Data
    { key: "user-data-dir", label: "--user-data-dir", description: "Path to the user data directory (profile location)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "profile-directory", label: "--profile-directory", description: "Profile directory name within user-data-dir (e.g. Default, Profile 1)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "incognito", label: "--incognito", description: "Start Chrome in incognito/private mode", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-session-crashed-bubble", label: "--disable-session-crashed-bubble", description: "Disable the 'Chrome didn't shut down correctly' bubble", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "no-first-run", label: "--no-first-run", description: "Skip first-run welcome dialogs and default browser check", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "no-default-browser-check", label: "--no-default-browser-check", description: "Don't check if Chrome is the default browser on startup", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-default-apps", label: "--disable-default-apps", description: "Disable installation of default apps on first run", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },

    // Security & Permissions
    { key: "disable-web-security", label: "--disable-web-security", description: "Disable same-origin policy and web security features", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "allow-running-insecure-content", label: "--allow-running-insecure-content", description: "Allow loading HTTP resources on HTTPS pages", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "ignore-certificate-errors", label: "--ignore-certificate-errors", description: "Ignore SSL/TLS certificate errors", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-site-isolation-trials", label: "--disable-site-isolation-trials", description: "Disable site isolation (process-per-site)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "allow-file-access-from-files", label: "--allow-file-access-from-files", description: "Allow file:// URLs to access other file:// URLs", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-popup-blocking", label: "--disable-popup-blocking", description: "Disable the popup blocker", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-translate", label: "--disable-translate", description: "Disable the built-in translation feature", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-notifications", label: "--disable-notifications", description: "Disable all desktop notifications", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },

    // Rendering & Performance
    { key: "disable-dev-shm-usage", label: "--disable-dev-shm-usage", description: "Write shared memory to /tmp instead of /dev/shm (fixes crashes in Docker)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-software-rasterizer", label: "--disable-software-rasterizer", description: "Disable the software fallback for GPU compositing", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-background-networking", label: "--disable-background-networking", description: "Disable background network requests (safe browsing, etc.)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-background-timer-throttling", label: "--disable-background-timer-throttling", description: "Don't throttle timers in background tabs", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-renderer-backgrounding", label: "--disable-renderer-backgrounding", description: "Prevent renderer process from being lowered in priority when backgrounded", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-backgrounding-occluded-windows", label: "--disable-backgrounding-occluded-windows", description: "Prevent backgrounding of occluded (hidden) windows", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-hang-monitor", label: "--disable-hang-monitor", description: "Disable the hang monitor (page unresponsive dialog)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-ipc-flooding-protection", label: "--disable-ipc-flooding-protection", description: "Disable IPC flooding protection (useful for automation)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-component-update", label: "--disable-component-update", description: "Disable automatic component updates (Widevine, etc.)", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "disable-domain-reliability", label: "--disable-domain-reliability", description: "Disable domain reliability monitoring", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },

    // Logging & Debugging
    { key: "enable-logging", label: "--enable-logging", description: "Enable logging to stderr or a file", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "v", label: "--v", description: "Verbose logging level (0=default, 1=verbose, 2=very verbose)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "log-level", label: "--log-level", description: "Set logging level (0=INFO, 1=WARNING, 2=ERROR, 3=FATAL)", type: "select", defaultValue: "", options: ["", "0", "1", "2", "3"], group: "Command Line Flags" },
    { key: "enable-crash-reporter", label: "--enable-crash-reporter", description: "Enable the crash reporter", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "crash-dumps-dir", label: "--crash-dumps-dir", description: "Directory to store crash dump files", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "auto-open-devtools-for-tabs", label: "--auto-open-devtools-for-tabs", description: "Automatically open DevTools for every new tab", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },

    // Network
    { key: "proxy-server-flag", label: "--proxy-server", description: "Specify proxy server (e.g. http://proxy:8080, socks5://proxy:1080)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "proxy-bypass-list-flag", label: "--proxy-bypass-list", description: "Semicolon-separated list of hosts to bypass proxy", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "proxy-pac-url", label: "--proxy-pac-url", description: "URL to proxy auto-config (PAC) file", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "host-resolver-rules", label: "--host-resolver-rules", description: "Custom host resolver rules (e.g. MAP * 127.0.0.1)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "auth-server-allowlist", label: "--auth-server-allowlist", description: "Allowlist for servers that can use integrated authentication", type: "text", defaultValue: "", group: "Command Line Flags" },

    // Origin Trials & Feature Overrides
    { key: "origin-trial-disabled-features", label: "--origin-trial-disabled-features", description: "Pipe-separated features to disable from origin trials (e.g. CanvasTextNg|WebAssemblyCustomDescriptors)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "origin-trial-public-key", label: "--origin-trial-public-key", description: "Override the public key for origin trial token validation", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "disable-field-trial-config", label: "--disable-field-trial-config", description: "Disable field trial (A/B testing) configuration from the server", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "force-fieldtrials", label: "--force-fieldtrials", description: "Force specific field trials (e.g. TrialName/GroupName)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "force-fieldtrial-params", label: "--force-fieldtrial-params", description: "Force field trial parameters", type: "text", defaultValue: "", group: "Command Line Flags" },

    // Media & Hardware
    { key: "use-fake-ui-for-media-stream", label: "--use-fake-ui-for-media-stream", description: "Auto-grant camera/mic permissions without prompts", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "use-fake-device-for-media-stream", label: "--use-fake-device-for-media-stream", description: "Use fake (synthetic) audio/video for getUserMedia", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },
    { key: "autoplay-policy", label: "--autoplay-policy", description: "Autoplay policy for media", type: "select", defaultValue: "", options: ["", "no-user-gesture-required", "user-gesture-required", "document-user-activation-required"], group: "Command Line Flags" },
    { key: "use-gl", label: "--use-gl", description: "Select GL implementation (desktop, egl, swiftshader)", type: "select", defaultValue: "", options: ["", "desktop", "egl", "swiftshader"], group: "Command Line Flags" },
    { key: "mute-audio", label: "--mute-audio", description: "Mute all audio output from the browser", type: "toggle", defaultValue: "disabled", group: "Command Line Flags" },

    // User Agent & Language
    { key: "user-agent-flag", label: "--user-agent", description: "Override the default User-Agent string", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "lang", label: "--lang", description: "Set browser locale/language (e.g. en-US, ja, de)", type: "text", defaultValue: "", group: "Command Line Flags" },
    { key: "accept-lang", label: "--accept-lang", description: "Override the Accept-Language header value", type: "text", defaultValue: "", group: "Command Line Flags" },
];

const GROUPS = [...new Set(CHROME_PREFS.map(p => p.group))];

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ChromePrefsPage() {
    const { logAction, clearActivity } = useActivity();

    useEffect(() => { clearActivity(); }, []);

    const log = (msg: string) => logAction(msg, "Chrome Prefs");

    // State: map of key → current value
    const [values, setValues] = useState<Record<string, string>>(() => {
        const init: Record<string, string> = {};
        CHROME_PREFS.forEach(p => { init[p.key] = p.defaultValue; });
        return init;
    });

    const [search, setSearch] = useState("");
    const [activeGroup, setActiveGroup] = useState<string | null>(null);
    const [validationResults, setValidationResults] = useState<Record<string, "pass" | "fail" | "warn"> | null>(null);
    const [statusFilter, setStatusFilter] = useState<"pass" | "fail" | "warn" | null>(null);

    const setValue = (key: string, val: string) => {
        setValues(prev => ({ ...prev, [key]: val }));
        const pref = CHROME_PREFS.find(p => p.key === key);
        log(`${pref?.label || key}: "${val}"`);
    };

    const resetAll = () => {
        const init: Record<string, string> = {};
        CHROME_PREFS.forEach(p => { init[p.key] = p.defaultValue; });
        setValues(init);
        setValidationResults(null);
        setStatusFilter(null);
        log("Reset all preferences to defaults");
    };

    const resetGroup = (group: string) => {
        const updated = { ...values };
        CHROME_PREFS.filter(p => p.group === group).forEach(p => { updated[p.key] = p.defaultValue; });
        setValues(updated);
        log(`Reset "${group}" group to defaults`);
    };

    const validate = () => {
        const results: Record<string, "pass" | "fail" | "warn"> = {};
        CHROME_PREFS.forEach(p => {
            const val = values[p.key];
            if (p.type === "toggle") {
                // Toggles: pass if matches default, warn if deviates
                results[p.key] = val === p.defaultValue ? "pass" : "warn";
            } else if (p.type === "text" || p.type === "textarea") {
                // Text: fail if required field is empty (version/path fields)
                if (["google-chrome", "revision", "os", "javascript", "user-agent", "executable-path", "profile-path"].includes(p.key)) {
                    results[p.key] = val.trim() ? "pass" : "fail";
                } else {
                    results[p.key] = "pass";
                }
            } else if (p.type === "number") {
                const num = Number(val);
                results[p.key] = !isNaN(num) && num >= 0 ? "pass" : "fail";
            } else {
                results[p.key] = val ? "pass" : "warn";
            }
        });
        setValidationResults(results);
        const passed = Object.values(results).filter(r => r === "pass").length;
        const warned = Object.values(results).filter(r => r === "warn").length;
        const failed = Object.values(results).filter(r => r === "fail").length;
        log(`Validation complete: ${passed} passed, ${warned} warnings, ${failed} failed`);
    };

    // Filter prefs
    const filteredPrefs = CHROME_PREFS.filter(p => {
        const matchesSearch = !search ||
            p.label.toLowerCase().includes(search.toLowerCase()) ||
            p.key.toLowerCase().includes(search.toLowerCase()) ||
            p.description.toLowerCase().includes(search.toLowerCase());
        const matchesGroup = !activeGroup || p.group === activeGroup;
        const matchesStatus = !statusFilter || !validationResults || validationResults[p.key] === statusFilter;
        return matchesSearch && matchesGroup && matchesStatus;
    });

    const filteredGroups = GROUPS.filter(g => filteredPrefs.some(p => p.group === g));

    // Stats
    const modifiedCount = CHROME_PREFS.filter(p => values[p.key] !== p.defaultValue).length;

    return (
        <>
            <ChromePrefsSideNav />
            <div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: '1100px' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 className="h1" style={{ marginBottom: '1rem' }}>Chrome Prefs Validator</h1>
                    <p className="body-sm" style={{ maxWidth: '40rem', margin: '0 auto', fontSize: '1rem' }}>
                        Validate Chrome browser preference flags for automation runs. All fields from <code style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: '13px' }}>chrome://version</code> and key <code style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: '13px' }}>chrome://flags</code>.
                    </p>
                </div>

                {/* Toolbar */}
                <div id="section-toolbar" style={{
                    display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
                    marginBottom: '2rem', padding: '16px 20px', borderRadius: '16px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            data-testid="prefs-search"
                            placeholder="Search preferences..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); log(`Search: "${e.target.value}"`); }}
                            style={{
                                width: '100%', height: '40px', paddingLeft: '38px', paddingRight: '12px',
                                borderRadius: '10px', border: 'none',
                                boxShadow: 'inset 0 0 0 1px var(--border-light)',
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                fontSize: '14px', outline: 'none',
                            }}
                        />
                    </div>

                    {/* Stats badge */}
                    <div style={{
                        padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                        background: modifiedCount > 0 ? 'var(--accent-surface, var(--bg-secondary))' : 'var(--bg-secondary)',
                        color: modifiedCount > 0 ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                        boxShadow: 'inset 0 0 0 1px var(--border-light)',
                    }}>
                        {modifiedCount} modified
                    </div>

                    {/* Actions */}
                    <button data-testid="prefs-validate" onClick={validate} style={{
                        height: '40px', padding: '0 20px', borderRadius: '10px', border: 'none',
                        background: 'var(--accent-primary)', color: '#fff',
                        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                        Validate All
                    </button>
                    <button data-testid="prefs-reset-all" onClick={resetAll} style={{
                        height: '40px', padding: '0 16px', borderRadius: '10px', border: 'none',
                        background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        boxShadow: 'inset 0 0 0 1px var(--border-light)',
                    }}>
                        Reset All
                    </button>
                </div>

                {/* Group Filter Chips */}
                <div id="section-filters" style={{
                    display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem',
                }}>
                    <button
                        data-testid="filter-all"
                        onClick={() => { setActiveGroup(null); log('Filter: All groups'); }}
                        style={{
                            padding: '6px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 600, transition: 'all 0.2s',
                            background: !activeGroup ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                            color: !activeGroup ? '#fff' : 'var(--text-secondary)',
                            boxShadow: !activeGroup ? 'none' : 'inset 0 0 0 1px var(--border-light)',
                        }}
                    >
                        All ({CHROME_PREFS.length})
                    </button>
                    {GROUPS.map(g => {
                        const count = CHROME_PREFS.filter(p => p.group === g).length;
                        const isActive = activeGroup === g;
                        return (
                            <button
                                key={g}
                                data-testid={`filter-${g.toLowerCase().replace(/[&\s]+/g, '-')}`}
                                onClick={() => { setActiveGroup(isActive ? null : g); log(`Filter: ${isActive ? 'All' : g}`); }}
                                style={{
                                    padding: '6px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: 600, transition: 'all 0.2s',
                                    background: isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                    boxShadow: isActive ? 'none' : 'inset 0 0 0 1px var(--border-light)',
                                }}
                            >
                                {g} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Validation Summary */}
                {validationResults && (
                    <div id="section-summary" data-testid="validation-summary" style={{
                        display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '2rem',
                        padding: '20px', borderRadius: '16px',
                        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                    }}>
                        {[
                            { label: "Passed", key: "pass" as const, color: "#22c55e" },
                            { label: "Warnings", key: "warn" as const, color: "#f59e0b" },
                            { label: "Failed", key: "fail" as const, color: "#ef4444" },
                        ].map(({ label, key, color }) => {
                            const count = Object.values(validationResults).filter(r => r === key).length;
                            const isActive = statusFilter === key;
                            return (
                                <div
                                    key={key}
                                    data-testid={`summary-${key}`}
                                    onClick={() => {
                                        const next = isActive ? null : key;
                                        setStatusFilter(next);
                                        log(`Filter: ${next ? label : 'All results'}`);
                                    }}
                                    style={{
                                        flex: 1, minWidth: '120px', padding: '16px', borderRadius: '12px',
                                        background: `${color}${isActive ? '22' : '11'}`,
                                        border: `2px solid ${isActive ? color : `${color}33`}`,
                                        textAlign: 'center', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        transform: isActive ? 'scale(1.03)' : 'scale(1)',
                                    }}
                                >
                                    <div style={{ fontSize: '28px', fontWeight: 800, color }}>{count}</div>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {isActive ? `Showing ${label}` : label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pref Groups */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {filteredGroups.map(group => (
                        <PrefGroup
                            key={group}
                            group={group}
                            prefs={filteredPrefs.filter(p => p.group === group)}
                            values={values}
                            setValue={setValue}
                            resetGroup={() => resetGroup(group)}
                            validationResults={validationResults}
                            log={log}
                        />
                    ))}
                </div>

                {filteredPrefs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>?</div>
                        <div style={{ fontSize: '16px', fontWeight: 500 }}>No preferences match your search</div>
                    </div>
                )}

                {/* Generated Command Line */}
                <GeneratedCommandLine values={values} log={log} />
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preference Group
// ─────────────────────────────────────────────────────────────────────────────
const GROUP_COLORS: Record<string, string> = {
    "Application Info": "#6366f1",
    "Paths": "#0ea5e9",
    "Features & Flags": "#8b5cf6",
    "Network & Protocol": "#f59e0b",
    "Privacy & Security": "#ef4444",
    "Content Settings": "#22c55e",
    "Performance": "#14b8a6",
    "Experimental": "#ec4899",
    "Command Line Flags": "#f43f5e",
};

function PrefGroup({ group, prefs, values, setValue, resetGroup, validationResults, log }: {
    group: string;
    prefs: ChromePref[];
    values: Record<string, string>;
    setValue: (key: string, val: string) => void;
    resetGroup: () => void;
    validationResults: Record<string, "pass" | "fail" | "warn"> | null;
    log: (msg: string) => void;
}) {
    const color = GROUP_COLORS[group] || '#6366f1';
    const groupId = `section-${group.toLowerCase().replace(/[&\s]+/g, '-')}`;

    return (
        <section id={groupId} style={{
            background: 'var(--bg-card)', borderRadius: '20px', padding: '28px 32px',
            boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
        }} data-testid={`group-${group.toLowerCase().replace(/[&\s]+/g, '-')}`}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '24px', flexWrap: 'wrap', gap: '8px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2" style={{ margin: 0 }}>{group}</h2>
                    <span style={{
                        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        padding: '4px 10px', borderRadius: '99px', background: color,
                        color: '#fff', letterSpacing: '0.05em',
                    }}>{prefs.length} prefs</span>
                </div>
                <button
                    data-testid={`reset-${group.toLowerCase().replace(/[&\s]+/g, '-')}`}
                    onClick={resetGroup}
                    style={{
                        padding: '6px 14px', borderRadius: '8px', border: 'none',
                        background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        boxShadow: 'inset 0 0 0 1px var(--border-light)',
                    }}
                >
                    Reset Group
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {prefs.map(pref => (
                    <PrefRow key={pref.key} pref={pref} value={values[pref.key]} setValue={setValue} validationResult={validationResults?.[pref.key] ?? null} />
                ))}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single Preference Row
// ─────────────────────────────────────────────────────────────────────────────
function PrefRow({ pref, value, setValue, validationResult }: {
    pref: ChromePref;
    value: string;
    setValue: (key: string, val: string) => void;
    validationResult: "pass" | "fail" | "warn" | null;
}) {
    const isModified = value !== pref.defaultValue;
    const borderColor = validationResult === "fail" ? "#ef4444" : validationResult === "warn" ? "#f59e0b" : validationResult === "pass" ? "#22c55e" : "var(--border-light)";

    return (
        <div
            data-testid={`pref-${pref.key}`}
            style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '14px 18px', borderRadius: '12px',
                background: isModified ? 'var(--accent-surface, var(--bg-secondary))' : 'var(--bg-secondary)',
                border: `1px solid ${borderColor}`,
                transition: 'all 0.2s',
                flexWrap: 'wrap',
            }}
        >
            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{pref.label}</span>
                    {isModified && (
                        <span style={{
                            fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 6px', borderRadius: '4px',
                            background: 'var(--accent-primary)', color: '#fff',
                        }}>Modified</span>
                    )}
                    {validationResult && (
                        <span style={{
                            fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 6px', borderRadius: '4px',
                            background: validationResult === "pass" ? "#22c55e" : validationResult === "warn" ? "#f59e0b" : "#ef4444",
                            color: '#fff',
                        }}>{validationResult}</span>
                    )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{pref.description}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'monospace' }}>
                    {pref.key}
                </div>
            </div>

            {/* Control */}
            <div style={{ minWidth: '180px', flexShrink: 0 }}>
                {pref.type === "toggle" && (
                    <ToggleSwitch
                        testId={`toggle-${pref.key}`}
                        checked={value === "enabled"}
                        onChange={(checked) => setValue(pref.key, checked ? "enabled" : "disabled")}
                    />
                )}
                {pref.type === "select" && (
                    <select
                        data-testid={`select-${pref.key}`}
                        value={value}
                        onChange={(e) => setValue(pref.key, e.target.value)}
                        style={{
                            width: '100%', height: '36px', padding: '0 10px',
                            borderRadius: '8px', border: 'none',
                            boxShadow: 'inset 0 0 0 1px var(--border-light)',
                            background: 'var(--input-bg, var(--bg-card))',
                            color: 'var(--text-primary)', fontSize: '13px',
                            outline: 'none', cursor: 'pointer',
                        }}
                    >
                        {pref.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                )}
                {pref.type === "text" && (
                    <input
                        data-testid={`input-${pref.key}`}
                        value={value}
                        onChange={(e) => setValue(pref.key, e.target.value)}
                        style={{
                            width: '100%', height: '36px', padding: '0 10px',
                            borderRadius: '8px', border: 'none',
                            boxShadow: 'inset 0 0 0 1px var(--border-light)',
                            background: 'var(--input-bg, var(--bg-card))',
                            color: 'var(--text-primary)', fontSize: '13px',
                            outline: 'none',
                        }}
                    />
                )}
                {pref.type === "textarea" && (
                    <textarea
                        data-testid={`textarea-${pref.key}`}
                        value={value}
                        onChange={(e) => setValue(pref.key, e.target.value)}
                        rows={2}
                        style={{
                            width: '100%', padding: '8px 10px',
                            borderRadius: '8px', border: 'none',
                            boxShadow: 'inset 0 0 0 1px var(--border-light)',
                            background: 'var(--input-bg, var(--bg-card))',
                            color: 'var(--text-primary)', fontSize: '12px',
                            outline: 'none', resize: 'vertical', fontFamily: 'monospace',
                        }}
                    />
                )}
                {pref.type === "number" && (
                    <input
                        data-testid={`number-${pref.key}`}
                        type="number"
                        value={value}
                        onChange={(e) => setValue(pref.key, e.target.value)}
                        min={0}
                        style={{
                            width: '100%', height: '36px', padding: '0 10px',
                            borderRadius: '8px', border: 'none',
                            boxShadow: 'inset 0 0 0 1px var(--border-light)',
                            background: 'var(--input-bg, var(--bg-card))',
                            color: 'var(--text-primary)', fontSize: '13px',
                            outline: 'none',
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle Switch
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Generated Command Line
// ─────────────────────────────────────────────────────────────────────────────
function GeneratedCommandLine({ values, log }: { values: Record<string, string>; log: (msg: string) => void }) {
    const [copied, setCopied] = useState(false);

    const cliFlags = CHROME_PREFS
        .filter(p => p.group === "Command Line Flags")
        .filter(p => {
            const val = values[p.key];
            if (p.type === "toggle") return val === "enabled";
            if (p.type === "select") return val !== "" && val !== "disabled";
            if (p.type === "text") return val.trim() !== "";
            return false;
        })
        .map(p => {
            const val = values[p.key];
            if (p.type === "toggle") return p.label;
            if (p.type === "select" && p.key === "headless") return val === "new" ? "--headless=new" : "--headless";
            if (p.type === "select") return `${p.label}=${val}`;
            return `${p.label}=${val}`;
        });

    const chromePath = values["executable-path"] || "/path/to/chrome";
    const fullCommand = cliFlags.length > 0
        ? `${chromePath} ${cliFlags.join(' ')}`
        : `${chromePath}`;

    const enabledCount = cliFlags.length;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(fullCommand).then(() => {
            setCopied(true);
            log("Copied command line to clipboard");
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <section id="section-generated-cli" style={{
            marginTop: '32px', background: 'var(--bg-card)', borderRadius: '20px', padding: '28px 32px',
            boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
        }} data-testid="generated-cli-section">
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '16px', flexWrap: 'wrap', gap: '8px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 className="h2" style={{ margin: 0 }}>Generated Command Line</h2>
                    <span style={{
                        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        padding: '4px 10px', borderRadius: '99px',
                        background: enabledCount > 0 ? '#f43f5e' : 'var(--bg-secondary)',
                        color: enabledCount > 0 ? '#fff' : 'var(--text-tertiary)',
                        letterSpacing: '0.05em',
                    }}>{enabledCount} flags</span>
                </div>
                <button
                    data-testid="copy-cli"
                    onClick={copyToClipboard}
                    style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                        background: copied ? '#22c55e' : 'var(--accent-primary)', color: '#fff',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'background 0.2s',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {copied
                            ? <path d="M20 6L9 17l-5-5" />
                            : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>
                        }
                    </svg>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <p className="body-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                This is the generated command line based on your enabled flags above. Toggle flags in the Command Line Flags section to build your launch command.
            </p>
            <div data-testid="generated-cli-output" style={{
                padding: '16px 20px', borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.7,
                color: 'var(--text-primary)', wordBreak: 'break-all',
                whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto',
            }}>
                {fullCommand}
            </div>
        </section>
    );
}

function ToggleSwitch({ testId, checked, onChange }: { testId: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <button
            data-testid={testId}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            style={{
                width: '48px', height: '26px', borderRadius: '99px', border: 'none',
                background: checked ? 'var(--accent-primary)' : 'var(--bg-tertiary, #555)',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            }}
        >
            <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', position: 'absolute', top: '3px',
                left: checked ? '25px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Side Navigation
// ─────────────────────────────────────────────────────────────────────────────
function ChromePrefsSideNav() {
    const sections = [
        { id: 'section-toolbar', label: 'Search' },
        ...GROUPS.map(g => ({
            id: `section-${g.toLowerCase().replace(/[&\s]+/g, '-')}`,
            label: g.replace(' & ', ' / ').replace('Command Line Flags', 'CLI Flags'),
        })),
        { id: 'section-generated-cli', label: 'Generated CLI' },
    ];

    const scrollTo = (id: string) => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="fade-in side-nav-container" style={{
            position: 'fixed', left: '1.875rem', top: '8rem',
            display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 100,
        }}>
            <div style={{
                fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-tertiary)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                marginBottom: '-0.5rem', marginLeft: '0.375rem',
            }}>
                Navigation
            </div>
            {sections.map(item => (
                <div
                    key={item.id}
                    className="nav-dot-wrapper"
                    onClick={() => scrollTo(item.id)}
                    style={{
                        position: 'relative', display: 'flex', alignItems: 'center',
                        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    <div className="nav-label" style={{
                        position: 'absolute', left: '1.75rem',
                        background: 'var(--bg-card)', padding: '0.375rem 0.875rem',
                        borderRadius: '1.25rem', border: '1px solid var(--border-light)',
                        fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.05em', whiteSpace: 'nowrap', opacity: 0.8,
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)',
                    }}>
                        {item.label}
                    </div>
                    <div className="nav-dot" style={{
                        width: '0.75rem', height: '0.75rem', borderRadius: '50%',
                        background: 'var(--text-tertiary)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        opacity: 0.6, zIndex: 2, border: '2px solid transparent',
                    }} />
                    <div className="nav-halo" style={{
                        position: 'absolute', left: '0.375rem', top: '50%',
                        transform: 'translate(-50%, -50%) scale(0)',
                        width: '2rem', height: '2rem', borderRadius: '50%',
                        background: 'var(--accent-primary)', opacity: 0,
                        filter: 'blur(0.5rem)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 1,
                    }} />
                    <style jsx>{`
                        .nav-dot-wrapper:hover { transform: scale(1.05) !important; }
                        .nav-dot-wrapper:hover .nav-dot {
                            background: #fff; border-color: var(--accent-primary);
                            box-shadow: 0 0 15px var(--accent-primary), inset 0 0 5px var(--accent-primary);
                            opacity: 1;
                        }
                        .nav-dot-wrapper:hover .nav-halo { transform: translate(-50%, -50%) scale(1.2); opacity: 0.25; }
                        .nav-dot-wrapper:hover .nav-label { color: var(--text-primary); border-color: var(--accent-primary); opacity: 1; }
                    `}</style>
                </div>
            ))}
        </div>
    );
}
