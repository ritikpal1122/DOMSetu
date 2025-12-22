"use client";

import React from "react";
import Link from "next/link";

export default function NotFound() {
    return (
        <main style={styles.container}>
            <div style={styles.content} className="fade-in">
                <div style={styles.glitchWrapper}>
                    <h1 style={styles.code}>404</h1>
                    <div style={styles.glitchEffect}>404</div>
                </div>
                <h2 style={styles.title} className="h2">Node Not Found</h2>
                <p style={styles.text} className="body-sm">
                    The specific DOM path or scenario you are looking for has been decoupled from the primary cluster.
                </p>
                <Link href="/" style={styles.link} className="btn-primary">
                    Return to Cluster Head
                </Link>
            </div>

            <style jsx>{`
                @keyframes glitch {
                    0% { transform: translate(0); text-shadow: 2px 2px var(--accent-primary); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); text-shadow: -2px -2px #cf32ff; }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); text-shadow: 2px -2px #32ffff; }
                    100% { transform: translate(0); }
                }
            `}</style>
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
    glitchWrapper: {
        position: 'relative',
        display: 'inline-block',
        marginBottom: '24px',
    },
    code: {
        fontSize: '120px',
        fontWeight: 900,
        margin: 0,
        color: 'var(--text-primary)',
        letterSpacing: '-0.05em',
        lineHeight: 1,
    },
    glitchEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        fontSize: '120px',
        fontWeight: 900,
        color: 'var(--accent-primary)',
        opacity: 0.3,
        animation: 'glitch 3s infinite',
        pointerEvents: 'none',
    },
    title: {
        marginBottom: '16px',
    },
    text: {
        marginBottom: '40px',
        color: 'var(--text-secondary)',
        fontSize: '18px',
        lineHeight: 1.6,
    },
    link: {
        display: 'inline-block',
        textDecoration: 'none',
        background: 'var(--accent-primary)',
        color: '#fff',
        padding: '14px 32px',
        borderRadius: '12px',
        fontWeight: 600,
        transition: 'all 0.2s',
    }
};
