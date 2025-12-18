"use client";

import React, { useState, useRef } from "react";
import { useActivity } from "@/context/ActivityContext";

export default function FormsPage() {
    const { logAction, clearActivity } = useActivity();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [fileSize, setFileSize] = useState<string>("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Clear activity on mount for test isolation
    React.useEffect(() => {
        clearActivity();
    }, []);

    const log = (msg: string) => logAction(msg, "Native Lab");

    const handleReset = () => {
        setOtp(["", "", "", "", "", ""]);
        setFileSize("");
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
                <div style={{ marginBottom: 60, textAlign: 'center' }}>
                    <h1 className="h1" style={{ marginBottom: 16 }}>Native HTML5 Elements</h1>
                    <p className="body-sm" style={{ maxWidth: 600, margin: '0 auto', fontSize: '16px' }}>
                        Standard browser elements with consistent styling and interaction logging.
                    </p>
                    <button
                        type="reset"
                        form="lab-form"
                        style={{ ...styles.btnSecondary, background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)', marginTop: 24 }}
                    >
                        Reset Form & Activity
                    </button>
                </div>



                <form id="lab-form" style={styles.grid} onReset={handleReset} onSubmit={(e) => e.preventDefault()}>

                    {/* SECTION 1: Text Inputs */}
                    <section id="section-1" style={styles.section}>
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
                    <section id="section-2" style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h2 className="h2">2. Selection Controls</h2>
                            <div style={styles.badge}>Interactive</div>
                        </div>
                        <div style={{ display: 'grid', gap: 32 }}>
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
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
                    <section id="section-3" style={styles.section}>
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
                    <section id="section-4" style={styles.section}>
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
                    <section id="section-5" style={{ ...styles.section, border: '1px solid var(--accent-primary)', background: 'var(--bg-tertiary)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'var(--accent-primary)' }}></div>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <h2 className="h2" style={{ color: 'var(--text-primary)' }}>5. OTP Verification</h2>
                            <p className="body-sm">Enter the 6-digit code sent to your device.</p>
                        </div>

                        <div className="otp-container" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            {otp.map((d, i) => (
                                <input
                                    key={i}
                                    ref={(el) => { inputRefs.current[i] = el; }}
                                    value={d}
                                    maxLength={1}
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
                    <section id="section-6" style={styles.section}>
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

                </form>
            </div>
        </>
    );
}

function SideNav() {
    const navRef = useRef<HTMLDivElement>(null);
    const sections = [
        { id: 'section-1', label: 'Text Inputs' },
        { id: 'section-2', label: 'Selection' },
        { id: 'section-3', label: 'Date & Time' },
        { id: 'section-4', label: 'Interactive' },
        { id: 'section-5', label: 'OTP' },
        { id: 'section-6', label: 'Links' },
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
            left: '30px',
            top: '128px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            zIndex: 100
        }}>
            <div style={{
                fontSize: '10px',
                fontWeight: 800,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '-8px',
                marginLeft: '6px'
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
                            left: '28px',
                            background: 'var(--bg-card)',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-light)',
                            fontSize: '11px',
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
                            width: '12px',
                            height: '12px',
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
                            left: '6px', top: '50%',
                            transform: 'translate(-50%, -50%) scale(0)',
                            width: '32px', height: '32px',
                            borderRadius: '50%',
                            background: 'var(--accent-primary)', // Purple accent
                            opacity: 0,
                            filter: 'blur(8px)', // Soft glow
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
    return (
        <div style={{ ...styles.fieldWrapper }}>
            <label style={styles.label}>{label}</label>
            <input
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
        gap: "40px",
    },
    section: {
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
    },
    sectionHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 16
    },
    badge: {
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
        background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-secondary)'
    },
    fieldGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '24px',
    },
    // Standardized Wrapper for all inputs
    fieldWrapper: {
        display: 'flex', flexDirection: 'column', gap: '10px'
    },
    label: {
        fontSize: "13px",
        fontWeight: 600,
        color: "var(--text-secondary)",
        letterSpacing: '0.01em',
        marginBottom: 0, // Handled by gap
    },
    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid var(--border-strong)",
        background: "var(--input-bg)",
        color: "var(--text-primary)",
        fontSize: "14px",
        outline: "none",
        width: "100%",
        transition: "box-shadow 0.2s, border-color 0.2s",
    },
    textarea: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid var(--border-strong)",
        background: "var(--input-bg)",
        color: "var(--text-primary)",
        fontSize: "14px",
        width: "100%",
        minHeight: "100px",
        fontFamily: 'inherit',
        outline: 'none',
    },
    fileUploadWrapper: {
        padding: '12px', border: '1px dashed var(--border-strong)', borderRadius: '8px', background: 'var(--bg-tertiary)'
    },
    fileInput: {
        fontSize: "14px",
        color: "var(--text-secondary)",
        width: '100%',
    },
    controlGroup: {
        display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px'
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: '14px',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        padding: '4px 0' // Touch target size
    },
    details: {
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
    },
    summary: {
        padding: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none',
    },
    dialog: {
        padding: '24px',
        borderRadius: '16px',
        border: 'none',
        boxShadow: 'var(--shadow-lg)',
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        maxWidth: '400px',
        width: '100%',
    },
    otpInput: {
        flex: 1,
        maxWidth: '56px',
        aspectRatio: '1 / 1.15',
        fontSize: '24px',
        textAlign: 'center',
        borderRadius: '12px',
        border: '1px solid var(--border-strong)',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        outline: 'none',
        fontWeight: 600,
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    btnPrimary: {
        background: 'var(--accent-primary)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '14px',
        border: 'none',
        cursor: 'pointer'
    },
    btnSecondary: {
        background: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '14px',
        marginTop: 8,
        border: 'none',
        cursor: 'pointer'
    }
};
