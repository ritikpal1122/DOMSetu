"use client";

import React, { useState, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Global type declaration
// ---------------------------------------------------------------------------
declare global {
    interface Window {
        loginCheckerState: {
            state: "login" | "success" | "error";
            errorMsg: string;
            validUsername: string;
            validPassword: string;
        };
    }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const VALID_USERNAME = "Admin";
const VALID_PASSWORD = "Admin@LT1234";

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function LoginChecker() {
    const [state, setState] = useState<"login" | "success" | "error">("login");
    const [errorMsg, setErrorMsg] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Focus username on mount
    useEffect(() => {
        usernameRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const username = usernameRef.current?.value || "";
        const password = passwordRef.current?.value || "";

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            setErrorMsg("");
            // Trigger Chrome's save password popup by performing a navigation-like state change.
            // Chrome detects successful login when:
            //   1. A form with autocomplete username + password fields is submitted
            //   2. The page transitions (we simulate by changing state)
            //
            // However, the MOST reliable trigger is an actual page navigation.
            // We use history.pushState + state change to simulate this.
            window.history.pushState({}, "", "/login-checker?success=true");
            setState("success");
        } else {
            setErrorMsg("Invalid credentials. Please try again.");
            setState("error");
        }
    };

    const handleLogout = () => {
        window.history.pushState({}, "", "/login-checker");
        setState("login");
        setErrorMsg("");
        // Reset form values so Chrome detects fresh inputs next time
        setTimeout(() => {
            if (usernameRef.current) usernameRef.current.value = "";
            if (passwordRef.current) passwordRef.current.value = "";
            usernameRef.current?.focus();
        }, 50);
    };

    // Expose state for CDP
    useEffect(() => {
        window.loginCheckerState = {
            state,
            errorMsg,
            validUsername: VALID_USERNAME,
            validPassword: VALID_PASSWORD,
        };
    }, [state, errorMsg]);

    if (state === "success") {
        return (
            <main style={S.page}>
                <div style={S.card}>
                    <div style={S.successIcon}>✅</div>
                    <h1 style={S.heading}>Login Successful</h1>
                    <p style={S.successText}>
                        Welcome, <strong>{VALID_USERNAME}</strong>! You are now logged in.
                    </p>
                    <p style={S.hint}>
                        If Chrome&apos;s password manager is enabled, the &quot;Save password?&quot; popup should appear now.
                    </p>
                    <button
                        style={S.btnPrimary}
                        onClick={handleLogout}
                        data-testid="logout-btn"
                    >
                        ← Back to Login
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main style={S.page}>
            <div style={S.card}>
                <div style={S.lockIcon}>🔒</div>
                <h1 style={S.heading}>Login Checker</h1>
                <p style={S.subheading}>
                    Chrome Password Manager Detection
                </p>

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    autoComplete="on"
                    method="post"
                    style={S.form}
                    data-testid="login-form"
                >
                    <div style={S.fieldGroup}>
                        <label htmlFor="username" style={S.label}>Username</label>
                        <input
                            ref={usernameRef}
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Enter username"
                            required
                            style={S.input}
                            data-testid="username-input"
                        />
                    </div>

                    <div style={S.fieldGroup}>
                        <label htmlFor="password" style={S.label}>Password</label>
                        <input
                            ref={passwordRef}
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter password"
                            required
                            style={S.input}
                            data-testid="password-input"
                        />
                    </div>

                    {errorMsg && (
                        <div style={S.errorBox} data-testid="error-message">
                            {errorMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={S.btnSubmit}
                        data-testid="login-btn"
                    >
                        Log In
                    </button>
                </form>

                <div style={S.credBox} data-testid="credentials-hint">
                    <p style={S.credTitle}>Test Credentials</p>
                    <div style={S.credRow}>
                        <span style={S.credLabel}>Username:</span>
                        <code style={S.credValue} data-testid="hint-username">{VALID_USERNAME}</code>
                    </div>
                    <div style={S.credRow}>
                        <span style={S.credLabel}>Password:</span>
                        <code style={S.credValue} data-testid="hint-password">{VALID_PASSWORD}</code>
                    </div>
                </div>

                <div style={S.infoBox}>
                    <p style={S.infoTitle}>How this works</p>
                    <p style={S.infoText}>
                        Enter the correct credentials and click &quot;Log In&quot;. Chrome should trigger the
                        native &quot;Save password?&quot; popup if the password manager is enabled.
                        Use OpenCV or screenshot comparison to assert whether the popup appeared.
                    </p>
                </div>
            </div>
        </main>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const S: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
    },
    card: {
        width: "100%",
        maxWidth: 420,
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-lg)",
        padding: "40px 36px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 8,
    },
    lockIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    successIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    heading: {
        fontSize: 24,
        fontWeight: 700,
        color: "var(--text-primary)",
        margin: 0,
        textAlign: "center" as const,
    },
    subheading: {
        fontSize: 13,
        color: "var(--text-tertiary)",
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
        fontWeight: 500,
        marginBottom: 16,
    },
    form: {
        width: "100%",
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-secondary)",
    },
    input: {
        width: "100%",
        padding: "10px 14px",
        fontSize: 14,
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-light)",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        outline: "none",
        transition: "border-color 0.2s",
        boxSizing: "border-box" as const,
    },
    errorBox: {
        padding: "10px 14px",
        borderRadius: "var(--radius-sm)",
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "var(--error)",
        fontSize: 13,
        fontWeight: 500,
    },
    btnSubmit: {
        width: "100%",
        padding: "12px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--accent-primary)",
        color: "var(--accent-text)",
        fontWeight: 600,
        fontSize: 15,
        border: "none",
        cursor: "pointer",
        transition: "opacity 0.2s",
        marginTop: 4,
    },
    btnPrimary: {
        padding: "10px 24px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--accent-primary)",
        color: "var(--accent-text)",
        fontWeight: 600,
        fontSize: 14,
        border: "none",
        cursor: "pointer",
        transition: "opacity 0.2s",
        marginTop: 8,
    },
    successText: {
        fontSize: 15,
        color: "var(--text-secondary)",
        textAlign: "center" as const,
        lineHeight: 1.5,
        margin: "8px 0",
    },
    hint: {
        fontSize: 13,
        color: "var(--text-tertiary)",
        textAlign: "center" as const,
        lineHeight: 1.5,
        padding: "10px 16px",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-sm)",
        width: "100%",
        boxSizing: "border-box" as const,
    },
    credBox: {
        width: "100%",
        padding: "14px 16px",
        background: "rgba(99, 102, 241, 0.08)",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        borderRadius: "var(--radius-sm)",
        boxSizing: "border-box" as const,
        marginTop: 8,
    },
    credTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: "var(--accent-primary)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        margin: "0 0 10px",
    },
    credRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    credLabel: {
        fontSize: 13,
        color: "var(--text-tertiary)",
        fontWeight: 500,
        minWidth: 80,
    },
    credValue: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)",
        background: "var(--bg-secondary)",
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
    },
    infoBox: {
        marginTop: 16,
        padding: "14px 16px",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-sm)",
        width: "100%",
        boxSizing: "border-box" as const,
    },
    infoTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: "var(--text-tertiary)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        margin: "0 0 6px",
    },
    infoText: {
        fontSize: 13,
        color: "var(--text-tertiary)",
        lineHeight: 1.5,
        margin: 0,
    },
};
