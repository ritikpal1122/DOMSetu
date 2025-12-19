"use client";

import React, { useEffect } from "react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical DOM Error:", error);
    }, [error]);

    return (
        <main style={styles.container}>
            <div style={styles.content} className="fade-in">
                <div style={styles.iconWrapper}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h2 style={styles.title} className="h2">Node Execution Failed</h2>
                <p style={styles.text} className="body-sm">
                    A critical error occurred while attempting to render this DOM branch.
                </p>
                <div style={styles.errorBox}>
                    <code>{error.message || "Unknown internal error"}</code>
                </div>
                <button
                    onClick={reset}
                    style={styles.btn}
                    className="btn-primary"
                >
                    Reinitialize Branch
                </button>
            </div>
        </main>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
    },
    content: {
        maxWidth: '480px',
    },
    iconWrapper: {
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 32px',
    },
    title: {
        marginBottom: '16px',
    },
    text: {
        marginBottom: '24px',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
    errorBox: {
        background: 'var(--bg-secondary)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        textAlign: 'left',
        marginBottom: '40px',
        overflow: 'auto',
        maxHeight: '150px',
        fontSize: '13px',
    },
    btn: {
        padding: '14px 32px',
        borderRadius: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        border: 'none',
        background: 'var(--accent-primary)',
        color: '#fff',
    }
};
