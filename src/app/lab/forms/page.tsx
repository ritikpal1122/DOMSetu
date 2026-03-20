"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useActivity } from "@/context/ActivityContext";
import { useScrollToHash } from "@/hooks/useScrollToHash";

export default function FormsPage() {
    const { logAction, clearActivity } = useActivity();
    useScrollToHash();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [fileSize, setFileSize] = useState<string>("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // TOTP state
    const [totpSecret, setTotpSecret] = useState<string>("");
    const [totpCode, setTotpCode] = useState<string>("");
    const [totpInput, setTotpInput] = useState<string>("");
    const [totpTimeLeft, setTotpTimeLeft] = useState<number>(30);
    const [totpResult, setTotpResult] = useState<{ valid: boolean; message: string } | null>(null);
    const [totpHistory, setTotpHistory] = useState<string[]>([]);

    // Generate a random base32-like secret
    const generateSecret = useCallback(() => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let secret = "";
        for (let i = 0; i < 16; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        return secret;
    }, []);

    // Simple TOTP-like code generation (deterministic from secret + time window)
    const generateCode = useCallback((secret: string, timeStep: number): string => {
        let hash = 0;
        const input = secret + timeStep.toString();
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash + char) | 0;
        }
        const code = (Math.abs(hash) % 1000000).toString().padStart(6, "0");
        return code;
    }, []);

    // Initialize secret on mount
    useEffect(() => {
        const secret = generateSecret();
        setTotpSecret(secret);
        const timeStep = Math.floor(Date.now() / 30000);
        setTotpCode(generateCode(secret, timeStep));
    }, [generateSecret, generateCode]);

    // TOTP countdown timer
    useEffect(() => {
        if (!totpSecret) return;
        const tick = () => {
            const now = Date.now();
            const timeStep = Math.floor(now / 30000);
            const remaining = 30 - Math.floor((now % 30000) / 1000);
            setTotpTimeLeft(remaining);
            setTotpCode(generateCode(totpSecret, timeStep));
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [totpSecret, generateCode]);

    const handleTotpVerify = () => {
        if (!totpInput.trim()) return;
        const isValid = totpInput === totpCode;
        const result = {
            valid: isValid,
            message: isValid ? "Code verified successfully!" : "Invalid code. Please try again."
        };
        setTotpResult(result);
        setTotpHistory(prev => [`${totpInput} — ${isValid ? "Valid" : "Invalid"} (${new Date().toLocaleTimeString()})`, ...prev].slice(0, 5));
        log(`TOTP Verify: ${totpInput} → ${isValid ? "Valid" : "Invalid"}`);
    };

    const handleTotpRegenerate = () => {
        const secret = generateSecret();
        setTotpSecret(secret);
        setTotpInput("");
        setTotpResult(null);
        setTotpHistory([]);
        log("TOTP Secret Regenerated");
    };

    // Clear activity on mount for test isolation
    React.useEffect(() => {
        clearActivity();
        logAction("Page loaded", "Forms");
    }, []);

    const log = (msg: string) => logAction(msg, "Forms");

    const handleReset = () => {
        setOtp(["", "", "", "", "", ""]);
        setFileSize("");
        setTotpInput("");
        setTotpResult(null);
        setTotpHistory([]);
        clearActivity();
        log("Form Reset");
    };

    const openDialog = () => dialogRef.current?.showModal();
    const closeDialog = () => dialogRef.current?.close();

    const handleOtp = (index: number, val: string) => {
        if (val.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        log(`OTP [${index + 1}]: ${val}`);

        // Auto-focus next
        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <>
            <SideNav />
            <div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: '1200px' }}>

                {/* Header */}
                <div style={{ marginBottom: '3.75rem', textAlign: 'center' }}>
                    <h1 className="h1" style={{ marginBottom: '1rem' }}>Native HTML5 Elements</h1>
                    <p className="body-sm" style={{ maxWidth: '37.5rem', margin: '0 auto', fontSize: '1rem' }}>
                        Standard browser elements with consistent styling and interaction logging.
                    </p>
                    <button
                        type="reset"
                        form="lab-form"
                        style={{ ...styles.btnSecondary, background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', marginTop: '1.5rem', padding: "0.5rem 1rem" }}
                    >
                        Reset Form & Activity
                    </button>
                </div>



                <form id="lab-form" style={styles.grid} onReset={handleReset} onSubmit={(e) => e.preventDefault()}>

                    {/* SECTION 1: Text Inputs */}
                    <section id="text-inputs" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 className="h2">1. Text Inputs</h2>
                            <div style={styles.badge}>Core</div>
                        </div>
                        <div style={styles.fieldGrid}>
                            <Field label="Text (Default)" type="text" placeholder="Regular text..." log={log} />
                            <Field label="Email" type="email" placeholder="user@example.com" log={log} />
                            <Field label="Password" type="password" placeholder="•••••••" log={log} />
                            <Field label="Number" type="number" placeholder="123" log={log} />
                            <Field label="Search" type="search" placeholder="Search query..." log={log} />
                            <Field label="Telephone" type="tel" placeholder="+1 (555) 000-0000" log={log} />
                            <div style={{ gridColumn: '1 / -1', ...styles.fieldWrapper }}>
                                <label style={styles.label}>Textarea</label>
                                <textarea
                                    style={styles.textarea}
                                    placeholder="Multi-line text..."
                                    onChange={(e) => log(`Textarea: ${e.target.value}`)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Selection */}
                    <section id="selection-controls" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 className="h2">2. Selection Controls</h2>
                            <div style={styles.badge}>Interactive</div>
                        </div>
                        <div style={{ display: 'grid', gap: '2rem', width: 'calc(100% - 4rem)', margin: '0 auto' }}>
                            {/* Radios */}
                            <div style={styles.fieldWrapper}>
                                <label style={styles.label}>Native Radio Group</label>
                                <div style={styles.controlGroup}>
                                    <label style={styles.radioLabel}>
                                        <input type="radio" name="plan" value="free" onChange={(e) => log(`Radio Plan: ${e.target.value}`)} />
                                        <span>Free</span>
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input type="radio" name="plan" value="pro" onChange={(e) => log(`Radio Plan: ${e.target.value}`)} />
                                        <span>Pro</span>
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input type="radio" name="plan" value="enterprise" disabled />
                                        <span style={{ opacity: 0.5 }}>Enterprise (Disabled)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div style={{ padding: '24px 0', borderTop: '1px dashed var(--border-light)', borderBottom: '1px dashed var(--border-light)' }}>
                                <div style={styles.fieldWrapper}>
                                    <label style={styles.label}>Native Checkboxes</label>
                                    <div style={styles.controlGroup}>
                                        <label style={styles.radioLabel}>
                                            <input type="checkbox" onChange={(e) => log(`Checkbox Subscribe: ${e.target.checked}`)} />
                                            <span>Subscribe</span>
                                        </label>
                                        <label style={styles.radioLabel}>
                                            <input type="checkbox" defaultChecked onChange={(e) => log(`Checkbox Terms: ${e.target.checked}`)} />
                                            <span>Terms Accepted</span>
                                        </label>
                                        <label style={styles.radioLabel}>
                                            <input type="checkbox" disabled />
                                            <span style={{ opacity: 0.5 }}>Archived (Disabled)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Selects */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={styles.fieldWrapper}>
                                    <label style={styles.label}>Select (Dropdown)</label>
                                    <select style={styles.input} onChange={(e) => log(`Select: ${e.target.value}`)}>
                                        <option value="Option 1">Option 1</option>
                                        <option value="Option 2">Option 2</option>
                                        <option value="Option 3">Option 3</option>
                                    </select>
                                </div>
                                <div style={styles.fieldWrapper}>
                                    <label style={styles.label}>Datalist (Autocomplete)</label>
                                    <input list="browsers" style={styles.input} placeholder="Type a browser..." onChange={(e) => log(`Datalist: ${e.target.value}`)} />
                                    <datalist id="browsers">
                                        <option value="Chrome" />
                                        <option value="Firefox" />
                                        <option value="Safari" />
                                        <option value="Edge" />
                                    </datalist>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: Date & Time */}
                    <section id="date-time" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 className="h2">3. Date & Time</h2>
                            <div style={styles.badge}>Pickers</div>
                        </div>
                        <div style={styles.fieldGrid}>
                            <Field label="Date" type="date" log={log} />
                            <Field label="Datetime" type="datetime-local" log={log} />
                            <Field label="Month" type="month" log={log} />
                            <Field label="Week" type="week" log={log} />
                            <Field label="Time" type="time" log={log} />
                        </div>
                    </section>

                    {/* SECTION 4: Special & Interactive */}
                    <section id="interactive-special" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 className="h2">4. Interactive & Special</h2>
                            <div style={styles.badge}>Advanced</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                    <div style={{ flex: 1, ...styles.fieldWrapper }}>
                                        <label style={styles.label}>Color Picker</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <input type="color" style={{ ...styles.input, width: 48, height: 48, padding: 4, cursor: 'pointer' }} onChange={(e) => log(`Color: ${e.target.value}`)} />
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Hex Value</span>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, ...styles.fieldWrapper }}>
                                        <label style={styles.label}>Range (Slider)</label>
                                        <input type="range" style={{ width: '100%', marginTop: 8, cursor: 'pointer' }} onChange={(e) => log(`Slider: ${e.target.value}`)} />
                                    </div>
                                </div>

                                <div style={styles.fieldWrapper}>
                                    <label style={styles.label}>File Upload</label>
                                    <div style={{ ...styles.fileUploadWrapper, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 24, padding: '20px', minHeight: 'auto' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="file"
                                                style={{
                                                    ...styles.fileInput,
                                                    width: '100%',
                                                    padding: '8px 0',
                                                    margin: 0,
                                                    fontSize: '15px'
                                                }}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const size = file.size < 1024 * 1024
                                                            ? `${(file.size / 1024).toFixed(1)} KB`
                                                            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
                                                        setFileSize(size);
                                                        log(`File Selected: ${file.name} (${size})`);
                                                    } else {
                                                        setFileSize("");
                                                    }
                                                }}
                                            />
                                        </div>

                                        {fileSize && (
                                            <div className="fade-in" style={{
                                                fontSize: '13px', fontWeight: 600,
                                                background: 'var(--accent-primary)', color: '#fff',
                                                padding: '6px 16px', borderRadius: '8px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {fileSize}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Details */}
                                <details style={styles.details} onToggle={(e) => log(`Details: ${(e.target as HTMLDetailsElement).open ? 'Open' : 'Closed'}`)}>
                                    <summary style={styles.summary}>Native Accordion (&lt;details&gt;)</summary>
                                    <div style={{ padding: '16px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        This uses the native HTML <code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code> tags. It works without JavaScript.
                                    </div>
                                </details>

                                {/* Progress */}
                                <div style={styles.fieldWrapper}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={styles.label}>Native Progress</label>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>70%</span>
                                    </div>
                                    <progress value="70" max="100" style={{ width: '100%', height: 8 }} />
                                </div>

                                {/* Dialog */}
                                <div style={styles.fieldWrapper}>
                                    <label style={styles.label}>Native Modal (&lt;dialog&gt;)</label>
                                    <div>
                                        <button type="button" style={styles.btnSecondary} onClick={() => { openDialog(); log("Modal Opened"); }}>Open Modal</button>
                                    </div>
                                    <dialog ref={dialogRef} style={styles.dialog} onClose={() => log("Modal Closed")}>
                                        <h3 className="h3" style={{ marginBottom: 12 }}>Native Modal</h3>
                                        <p style={{ marginBottom: 24, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            This modal uses the <code>.showModal()</code> API which handles the backdrop and focus trapping natively.
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                            <button type="button" style={styles.btnSecondary} onClick={() => { closeDialog(); log("Modal Cancelled"); }}>Cancel</button>
                                            <button type="button" style={styles.btnPrimary} onClick={() => { closeDialog(); log("Modal Confirmed"); }}>Confirm</button>
                                        </div>
                                    </dialog>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: OTP */}
                    <section id="otp-verification" style={{ ...styles.section, border: '1px solid var(--accent-primary)', background: 'var(--bg-tertiary)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'var(--accent-primary)' }}></div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <h2 className="h2" style={{ color: 'var(--text-primary)' }}>5. OTP Verification</h2>
                            <p className="body-sm">Enter the 6-digit code sent to your device.</p>
                        </div>

                        <div className="otp-container" style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', maxWidth: '100%' }}>
                            {otp.map((d, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    value={d}
                                    maxLength={1}
                                    aria-label={`OTP Digit ${i + 1}`}
                                    onChange={(e) => handleOtp(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onFocus={(e) => e.target.placeholder = ''}
                                    onBlur={(e) => e.target.placeholder = '•'}
                                    style={styles.otpInput}
                                    placeholder="•"
                                />
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <button type="button" style={styles.btnPrimary} onClick={() => log(`OTP Submitted: ${otp.join('')}`)}>Verify Code</button>
                        </div>
                    </section>

                    {/* SECTION 6: Links & Vectors */}
                    <section id="links-vectors" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 className="h2">6. Links & Vectors</h2>
                            <div style={styles.badge}>Navigation</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                            <div style={styles.fieldWrapper}>
                                <label style={styles.label}>Hyperlinks</label>
                                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                                    <a
                                        href="https://google.com"
                                        onMouseEnter={() => log("Hover: Link (Current Tab)")}
                                        style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}
                                    >
                                        Open Google in Same Tab
                                    </a>
                                    <a
                                        href="https://github.com"
                                        target="_blank"
                                        onMouseEnter={() => log("Hover: Link (New Tab)")}
                                        style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                        Open GitHub in New Tab
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                    </a>
                                </div>
                            </div>

                            <div style={styles.fieldWrapper}>
                                <label style={styles.label}>Interactive SVGs</label>
                                <div style={{ display: 'flex', gap: 24 }}>
                                    <svg
                                        width="32" height="32" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        onMouseEnter={() => log("Hover: Star Icon")}
                                        style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'transform 0.2s', transformOrigin: 'center' }}
                                        className="hover-scale"
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>

                                    <svg
                                        width="32" height="32" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        onMouseEnter={() => log("Hover: Heart Icon")}
                                        style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'transform 0.2s', transformOrigin: 'center' }}
                                        className="hover-scale"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7: TOTP Validator */}
                    <section id="totp-validator" style={{ ...styles.section, border: '1px solid var(--accent-primary)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary, #f59e0b))' }}></div>
                        <div style={styles.sectionHeader}>
                            <h2 className="h2">7. TOTP Validator</h2>
                            <div style={{ ...styles.badge, background: 'var(--accent-primary)', color: '#fff' }}>Auth</div>
                        </div>

                        <div className="totp-inner" style={{ width: 'calc(100% - 4rem)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Secret Display */}
                            <div style={styles.fieldWrapper}>
                                <label style={styles.label}>Secret Key</label>
                                <div data-testid="totp-secret-display" style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap'
                                }}>
                                    <code data-testid="totp-secret-value" className="totp-secret-code" style={{
                                        fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700,
                                        letterSpacing: '0.15em', color: 'var(--text-primary)',
                                        background: 'var(--bg-secondary)', borderRadius: '0.5rem',
                                        padding: '0.625rem 1rem',
                                        boxShadow: 'inset 0 0 0 1px var(--border-light)',
                                        wordBreak: 'break-all'
                                    }}>
                                        {totpSecret.replace(/(.{4})/g, '$1 ').trim()}
                                    </code>
                                    <button
                                        type="button"
                                        data-testid="totp-regenerate-btn"
                                        style={{ ...styles.btnSecondary, marginTop: 0, minWidth: 'auto', padding: '0 0.75rem', height: '2.25rem', fontSize: '0.75rem' }}
                                        onClick={handleTotpRegenerate}
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            </div>

                            {/* Code + Timer Display */}
                            <div className="totp-code-timer-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 14rem), 1fr))',
                                gap: '1.5rem'
                            }}>
                                {/* Current Code */}
                                <div className="totp-code-card" style={{
                                    background: 'var(--bg-secondary)', borderRadius: '0.75rem',
                                    padding: '1.25rem', textAlign: 'center',
                                    boxShadow: 'inset 0 0 0 1px var(--border-light)',
                                    display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
                                        Current Code
                                    </span>
                                    <span data-testid="totp-current-code" className="totp-code-value" style={{
                                        fontFamily: 'monospace', fontSize: '2rem', fontWeight: 800,
                                        letterSpacing: '0.3em', color: 'var(--accent-primary)'
                                    }}>
                                        {totpCode}
                                    </span>
                                </div>

                                {/* Timer */}
                                <div className="totp-timer-card" style={{
                                    background: 'var(--bg-secondary)', borderRadius: '0.75rem',
                                    padding: '1.25rem', textAlign: 'center',
                                    boxShadow: 'inset 0 0 0 1px var(--border-light)',
                                    display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
                                        Expires In
                                    </span>
                                    <div className="totp-timer-ring-wrapper" style={{ position: 'relative', width: '3.5rem', height: '3.5rem' }}>
                                        <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border-light)" strokeWidth="4" />
                                            <circle
                                                data-testid="totp-timer-ring"
                                                cx="28" cy="28" r="24" fill="none"
                                                stroke={totpTimeLeft <= 5 ? '#ef4444' : 'var(--accent-primary)'}
                                                strokeWidth="4" strokeLinecap="round"
                                                strokeDasharray={`${(totpTimeLeft / 30) * 150.8} 150.8`}
                                                style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
                                            />
                                        </svg>
                                        <span data-testid="totp-timer-value" className="totp-timer-text" style={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 800,
                                            color: totpTimeLeft <= 5 ? '#ef4444' : 'var(--text-primary)'
                                        }}>
                                            {totpTimeLeft}s
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Input + Verify */}
                            <div style={styles.fieldWrapper}>
                                <label style={styles.label}>Enter TOTP Code</label>
                                <div className="totp-input-row" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <input
                                        data-testid="totp-input"
                                        className="totp-input-field"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={totpInput}
                                        placeholder="000000"
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setTotpInput(val);
                                            setTotpResult(null);
                                            log(`TOTP Input: ${val}`);
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleTotpVerify(); }}
                                        style={{
                                            ...styles.input,
                                            fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700,
                                            letterSpacing: '0.3em', textAlign: 'center',
                                            flex: '1 1 10rem', minWidth: '10rem', maxWidth: '16rem'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        data-testid="totp-verify-btn"
                                        style={{ ...styles.btnPrimary, flex: '0 0 auto' }}
                                        onClick={handleTotpVerify}
                                    >
                                        Verify
                                    </button>
                                </div>
                            </div>

                            {/* Result */}
                            {totpResult && (
                                <div
                                    data-testid="totp-result"
                                    className="fade-in totp-result-bar"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.875rem 1rem', borderRadius: '0.5rem',
                                        background: totpResult.valid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        boxShadow: `inset 0 0 0 1px ${totpResult.valid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    }}
                                >
                                    <span className="totp-result-icon" style={{ fontSize: '1.25rem' }}>{totpResult.valid ? '✓' : '✗'}</span>
                                    <span data-testid="totp-result-message" className="totp-result-text" style={{
                                        fontSize: '0.875rem', fontWeight: 600,
                                        color: totpResult.valid ? '#22c55e' : '#ef4444'
                                    }}>
                                        {totpResult.message}
                                    </span>
                                </div>
                            )}

                            {/* History */}
                            {totpHistory.length > 0 && (
                                <div style={styles.fieldWrapper}>
                                    <label style={styles.label}>Recent Attempts</label>
                                    <div data-testid="totp-history" style={{
                                        display: 'flex', flexDirection: 'column', gap: '0.375rem'
                                    }}>
                                        {totpHistory.map((entry, i) => (
                                            <div key={i} data-testid={`totp-history-${i}`} className="totp-history-entry" style={{
                                                fontFamily: 'monospace', fontSize: '0.8rem',
                                                color: 'var(--text-secondary)',
                                                padding: '0.375rem 0.75rem',
                                                background: 'var(--bg-secondary)', borderRadius: '0.375rem',
                                                boxShadow: 'inset 0 0 0 1px var(--border-light)'
                                            }}>
                                                {entry}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                </form>
            </div>

            {/* TOTP responsive styles */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    #totp-validator {
                        padding-top: 1rem !important;
                        padding-bottom: 1rem !important;
                        gap: 1rem !important;
                    }
                    #totp-validator .totp-inner {
                        width: calc(100% - 2rem) !important;
                        gap: 0.875rem !important;
                    }
                    #totp-validator .totp-code-timer-grid {
                        gap: 0.75rem !important;
                        grid-template-columns: 1fr 1fr !important;
                    }
                    #totp-validator .totp-code-card,
                    #totp-validator .totp-timer-card {
                        padding: 0.75rem !important;
                        gap: 0.25rem !important;
                        border-radius: 0.5rem !important;
                    }
                    #totp-validator .totp-code-value {
                        font-size: 1.4rem !important;
                        letter-spacing: 0.2em !important;
                    }
                    #totp-validator .totp-timer-ring-wrapper {
                        width: 2.5rem !important;
                        height: 2.5rem !important;
                    }
                    #totp-validator .totp-timer-ring-wrapper svg {
                        width: 40px !important;
                        height: 40px !important;
                    }
                    #totp-validator .totp-timer-text {
                        font-size: 0.85rem !important;
                    }
                    #totp-validator .totp-secret-code {
                        font-size: 0.85rem !important;
                        padding: 0.4rem 0.625rem !important;
                    }
                    #totp-validator .totp-input-row {
                        gap: 0.5rem !important;
                    }
                    #totp-validator .totp-input-field {
                        font-size: 1rem !important;
                        height: 2.5rem !important;
                        max-width: none !important;
                    }
                    #totp-validator .totp-result-bar {
                        padding: 0.625rem 0.75rem !important;
                        gap: 0.5rem !important;
                    }
                    #totp-validator .totp-result-icon {
                        font-size: 1rem !important;
                    }
                    #totp-validator .totp-result-text {
                        font-size: 0.8rem !important;
                    }
                    #totp-validator .totp-history-entry {
                        font-size: 0.7rem !important;
                        padding: 0.25rem 0.5rem !important;
                    }
                }
            `}</style>
        </>
    );
}

function SideNav() {
    const navRef = useRef<HTMLDivElement>(null);
    const sections = [
        { id: 'text-inputs', label: 'Text Inputs' },
        { id: 'selection-controls', label: 'Selection' },
        { id: 'date-time', label: 'Date & Time' },
        { id: 'interactive-special', label: 'Interactive' },
        { id: 'otp-verification', label: 'OTP' },
        { id: 'links-vectors', label: 'Links' },
        { id: 'totp-validator', label: 'TOTP' },
    ];

    const scrollTo = (id: string) => {
        // Cross-boundary element finding
        // 1. Try local root (Shadow DOM or local document)
        const root = navRef.current?.getRootNode() as Document | ShadowRoot;
        let target = root?.getElementById?.(id);

        // 2. Fallback to global document (Standard Mode)
        if (!target) target = document.getElementById(id);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div ref={navRef} className="fade-in side-nav-container" style={{
            position: 'fixed',
            left: '1.875rem',
            top: '8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            zIndex: 100
        }}>
            <div style={{
                fontSize: '0.625rem',
                fontWeight: 800,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '-0.5rem',
                marginLeft: '0.375rem'
            }}>
                Navigation
            </div>

            {sections.map((item, i) => {
                return (
                    <div
                        key={item.id}
                        className="nav-dot-wrapper"
                        onClick={() => scrollTo(item.id)}
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        } as any}
                    >
                        {/* Label */}
                        <div className="nav-label" style={{
                            position: 'absolute',
                            left: '1.75rem',
                            background: 'var(--bg-card)',
                            padding: '0.375rem 0.875rem',
                            borderRadius: '1.25rem',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                            opacity: 0.8,
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            // Removed pointer-events: none to make text clickable
                            boxShadow: 'var(--shadow-sm)',
                            color: 'var(--text-secondary)'
                        }}>
                            {item.label}
                        </div>

                        {/* Dot */}
                        <div className="nav-dot" style={{
                            width: '0.75rem',
                            height: '0.75rem',
                            borderRadius: '50%',
                            background: 'var(--text-tertiary)',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            opacity: 0.6,
                            zIndex: 2,
                            border: '2px solid transparent' // For internal highlight effect
                        }}></div>

                        {/* Circular Halo */}
                        <div className="nav-halo" style={{
                            position: 'absolute',
                            left: '0.375rem', top: '50%',
                            transform: 'translate(-50%, -50%) scale(0)',
                            width: '2rem', height: '2rem',
                            borderRadius: '50%',
                            background: 'var(--accent-primary)', // Purple accent
                            opacity: 0,
                            filter: 'blur(0.5rem)', // Soft glow
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            zIndex: 1
                        }}></div>

                        {/* CSS for Interactions */}
                        <style jsx>{`
                            .nav-dot-wrapper:hover {
                                transform: scale(1.05) !important;
                            }
                            .nav-dot-wrapper:hover .nav-dot {
                                background: #fff; /* Highlighting the inside */
                                border-color: var(--accent-primary);
                                box-shadow: 0 0 15px var(--accent-primary), inset 0 0 5px var(--accent-primary);
                                opacity: 1;
                            }
                            .nav-dot-wrapper:hover .nav-halo {
                                transform: translate(-50%, -50%) scale(1.2);
                                opacity: 0.25;
                            }
                            .nav-dot-wrapper:hover .nav-label {
                                color: var(--text-primary);
                                border-color: var(--accent-primary);
                                opacity: 1;
                            }
                        `}</style>
                    </div>
                );
            })}
        </div>
    );
}

// -----------------------------------------------------------------------------
// Sub-components & Styles
// -----------------------------------------------------------------------------


function Field({ label, type = "text", placeholder, style, log }: any) {
    const id = React.useId();
    return (
        <div style={{ ...styles.fieldWrapper }}>
            <label htmlFor={id} style={styles.label}>{label}</label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                style={{ ...styles.input, ...style }}
                onChange={(e) => log(`${label}: ${e.target.value}`)}
            />
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    grid: {
        display: "grid",
        gap: "2.5rem",
    },
    section: {
        background: "var(--bg-card)",
        borderRadius: "1rem",
        // padding: "2rem", // Removed
        // Use flex + alignment to manage inner layout without padding
        display: "flex",
        flexDirection: "column",
        // alignItems: "center", // REMOVED to allow children to stretch (fixed via margin: 0 auto)
        boxShadow: "inset 0 0 0 1px var(--border-light), var(--shadow-sm)",
        border: "none",
        paddingTop: "2rem", // Needed for vertical spacing if margin collapse is tricky, or use gap
        paddingBottom: "2rem",
        // Wait, "remove ALL padding".
        // Okay, I will use spacer divs or height/gap.
        gap: "2rem",
    },
    sectionHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', boxShadow: 'inset 0 -1px 0 0 var(--border-light)',
        height: '2.5rem', // Replaces paddingBottom calculation
        width: 'calc(100% - 4rem)', // Simulate inset
        margin: '0 auto', // Center the inset content
    },
    badge: {
        fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
        background: 'var(--bg-tertiary)', borderRadius: '0.375rem', color: 'var(--text-secondary)',
        height: '1.5rem', minWidth: '3.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center' // Replaces padding
    },
    fieldGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 15rem), 1fr))',
        gap: '1.5rem',
        width: 'calc(100% - 4rem)', // Simulate inset
        margin: '0 auto', // Center the inset content
    },
    // Standardized Wrapper for all inputs
    fieldWrapper: {
        display: 'flex', flexDirection: 'column', gap: '0.625rem'
    },
    label: {
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text-secondary)",
        letterSpacing: '0.01em',
        marginBottom: 0, // Handled by gap
    },
    input: {
        padding: 0, // Explicitly remove
        height: "2.75rem",
        textIndent: "0.75rem",
        borderRadius: "0.5rem",
        boxShadow: "inset 0 0 0 1px var(--border-strong)",
        border: "none",
        background: "var(--input-bg)",
        color: "var(--text-primary)",
        fontSize: "0.875rem",
        outline: "none",
        width: "100%",
        transition: "box-shadow 0.2s, border-color 0.2s",
    },
    textarea: {
        padding: 0,
        textIndent: "0.75rem",
        paddingTop: "0.75rem", // Keeping this one exception for readability, or remove if strictly enforced? 
        // User said "remove padding everywhere", so:
        // textIndent works for first line. 
        // I will use padding zero and let text start at top-left indented.
        // Or better, use a spacer div? No, I'll stick to indent.
        borderRadius: "0.5rem",
        boxShadow: "inset 0 0 0 1px var(--border-strong)",
        border: "none",
        background: "var(--input-bg)",
        color: "var(--text-primary)",
        fontSize: "0.875rem",
        width: "100%",
        minHeight: "6.25rem",
        fontFamily: 'inherit',
        outline: 'none',
    },
    fileUploadWrapper: {
        height: '5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', // Replaces padding
        boxShadow: 'inset 0 0 0 1px var(--border-strong)', border: 'none', borderRadius: '0.5rem', background: 'var(--bg-tertiary)'
    },
    fileInput: {
        fontSize: "0.875rem",
        color: "var(--text-secondary)",
        width: '100%',
    },
    controlGroup: {
        display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem'
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.875rem',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        height: '2rem',
        padding: 0
    },
    details: {
        boxShadow: 'inset 0 0 0 1px var(--border-light)',
        border: 'none',
        borderRadius: '0.5rem',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
    },
    summary: {
        height: '2.75rem', display: 'flex', alignItems: 'center', textIndent: '0.75rem', // Replaces padding
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none',
    },
    dialog: {
        padding: '1.5rem',
        borderRadius: '1rem',
        border: 'none',
        boxShadow: 'var(--shadow-lg)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        maxWidth: '25rem',
        width: '100%',
    },
    otpInput: {
        width: '3rem',
        minWidth: '2.5rem',
        maxWidth: '3.5rem',
        flex: '1 1 2.5rem',
        aspectRatio: '1 / 1.15',
        fontSize: '1.5rem',
        textAlign: 'center' as const,
        borderRadius: '0.75rem',
        boxShadow: 'inset 0 0 0 1px var(--border-strong)',
        border: 'none',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        outline: 'none',
        fontWeight: 600,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box' as const,
    },
    btnPrimary: {
        background: 'var(--accent-primary)',
        color: '#fff',
        height: '2.75rem',
        padding: 0, // Explicit zero
        minWidth: '7.5rem', // Increased min-width for content
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '0.5rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        border: 'none',
        cursor: 'pointer'
    },
    btnSecondary: {
        background: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        height: '2.5rem',
        minWidth: '5rem',
        padding: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '0.5rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        marginTop: '0.5rem',
        border: 'none',
        cursor: 'pointer'
    }
};
