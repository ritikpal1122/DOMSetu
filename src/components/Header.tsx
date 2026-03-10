"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useComplexity } from "@/context/ComplexityContext";
import { useTheme } from "@/context/ThemeContext";
import LogViewerModal from "@/components/LogViewerModal";
import Navbar from "@/components/Navbar";

export default function Header() {
    const { mode, setMode } = useComplexity();
    const { theme, toggleTheme } = useTheme();
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // Dynamic Width Logic
    const [width, setWidth] = useState(140);
    const textMeasureRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (textMeasureRef.current) {
            // Measure text width + padding (40px for icon/padding)
            setWidth(textMeasureRef.current.offsetWidth + 50);
        }
    }, [mode]);

    const getModeLabel = (m: string) => {
        switch (m) {
            case 'standard': return 'Standard DOM';
            case 'shadow': return 'Shadow DOM';
            case 'iframe': return 'iFrame Mode';
            case 'nested-shadow': return 'Nested Shadow';
            case 'nested-iframe': return 'Nested iFrame';
            case 'shadow-in-iframe': return 'Shadow in iFrame';
            case 'iframe-in-shadow': return 'iFrame in Shadow';
            default: return 'Complexity';
        }
    };

    return (
        <header className="glass-panel" style={{
            height: 'var(--header-height)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // Using max-width constraints on children instead of padding
        }}>
            {/* Left: Branding + Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '24px' }}>
                <Navbar />
                <Link href="/" className="nav-branding" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 'bold'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 20h16" />
                            <path d="M4 14c2-4 9-5 9-5s3 1 7 5" />
                            <path d="M8 20v-4" />
                            <path d="M16 20v-4" />
                            <path d="M12 9v11" />
                        </svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        DOM<span style={{ opacity: 0.5 }}>Setu</span>
                    </span>
                </Link>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Right: Controls */}
            <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end', marginRight: '24px', flexShrink: 0 }}>

                {/* Dynamic Width Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="complexity-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Complexity:</span>
                    <div style={{ position: 'relative', height: '36px' }}>

                        <div style={{
                            width: `${width}px`,
                            height: '100%',
                            background: 'var(--bg-secondary)',
                            borderRadius: '99px',
                            display: 'flex',
                            alignItems: 'center',
                            // padding: '0 16px', // Removed padding as requested
                            transition: 'width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            // Replace border with box-shadow to prevent layout shifts if children change
                            boxShadow: 'inset 0 0 0 1px var(--border-light)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value as any)}
                                aria-label="Switch DOM Complexity Mode"
                                style={{
                                    appearance: 'none',
                                    background: 'transparent',
                                    border: 'none',
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: '16px',
                                    // width: 'calc(100% - 32px)',
                                    // padding: '0 16px', // Removed padding as requested
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    outline: 'none',
                                    boxShadow: 'none'
                                }}
                            >
                                <option value="standard">Standard DOM</option>
                                <hr />
                                <option value="shadow">Shadow DOM</option>
                                <option value="iframe">iFrame Mode</option>
                                <hr />
                                <option value="nested-shadow">Nested Shadow</option>
                                <option value="nested-iframe">Nested iFrame</option>
                                <option value="shadow-in-iframe">Shadow in iFrame</option>
                                <option value="iframe-in-shadow">iFrame in Shadow</option>
                            </select>

                            {/* Visual Label (Behind Select) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 'calc(100% - 32px)', pointerEvents: 'none', marginLeft: '16px' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8, opacity: 0.5 }}>
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Button */}
                <button
                    onClick={() => setIsLogModalOpen(true)}
                    data-testid="view-history-btn"
                    title="View Activity History"
                    aria-label="View Activity History"
                    className="history-btn"
                    style={{
                        height: '40px',
                        padding: '0 16px',
                        borderRadius: '99px',
                        boxShadow: 'inset 0 0 0 1px var(--border-light)',
                        background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        flexShrink: 0,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8l-4 4 4 4" />
                        <path d="M16 12H8" />
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="history-btn-text">Activity History</span>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        boxShadow: 'inset 0 0 0 1px var(--border-light)',
                        background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s'
                    }}
                >
                    {/* Both icons rendered; CSS hides the wrong one based on data-theme to avoid hydration mismatch */}
                    <svg className="theme-icon-light" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    <svg className="theme-icon-dark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                </button>
            </div>

            {isLogModalOpen && (
                <LogViewerModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
            )}
        </header>
    );
}
