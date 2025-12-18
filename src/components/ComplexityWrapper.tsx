"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useComplexity } from "@/context/ComplexityContext";
import { useTheme } from "@/context/ThemeContext";

// -----------------------------------------------------------------------------
// Component: ShadowContainer
// -----------------------------------------------------------------------------
function ShadowContainer({ children, label = "Shadow DOM", theme }: { children: React.ReactNode, label?: string, theme?: string }) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

    useEffect(() => {
        if (hostRef.current) {
            let root = hostRef.current.shadowRoot;
            if (!root) {
                root = hostRef.current.attachShadow({ mode: "open" });
                // Only inject styles on creation
                const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
                styleNodes.forEach((node) => root?.appendChild(node.cloneNode(true)));
            }
            setShadowRoot(root);
        }
    }, []);

    return (
        <div style={{
            padding: 'var(--wrapper-padding)',
            background: 'var(--bg-tertiary)',
            border: '1px dashed var(--accent-primary)',
            borderRadius: '12px',
            margin: '0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflow: 'hidden', // Fix overflow
            position: 'relative'
        }}>
            <div style={{ marginBottom: 8, fontSize: '10px', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
                {label}
            </div>
            <div ref={hostRef} style={{ width: '100%', flex: 1, minHeight: 0, position: 'relative' }}>
                {shadowRoot && createPortal(
                    // Wrap content in data-theme to match global selectors inside shadow DOM
                    <div className="shadow-root-content" data-theme={theme} style={{
                        height: '100%',
                        background: 'var(--bg-app)',
                        color: 'var(--text-primary)',
                        transition: 'background 0.3s',
                        overflow: 'auto', // Allow internal scrolling
                        borderRadius: '8px'
                    }}>
                        {children}
                    </div>,
                    shadowRoot as unknown as Element
                )}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Component: IFrameContainer
// -----------------------------------------------------------------------------
function IFrameContainer({ children, label = "iFrame", theme }: { children: React.ReactNode, label?: string, theme?: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const setup = () => {
            const doc = iframe.contentDocument;
            if (doc) {
                if (!doc.body.innerHTML) {
                    doc.open();
                    doc.write('<!DOCTYPE html><html><head><style>body,html{height:100%;margin:0;overflow:hidden;}</style></head><body></body></html>');
                    doc.close();
                }
                const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
                styles.forEach((node) => doc.head.appendChild(node.cloneNode(true)));
                setIframeBody(doc.body);

                // Set Theme initially
                if (theme) doc.documentElement.setAttribute('data-theme', theme);
            }
        };

        if (iframe.contentDocument?.readyState === 'complete') {
            setup();
        } else {
            iframe.onload = setup;
        }
    }, []);

    // Sync Theme Change to iFrame
    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument && theme) {
            iframe.contentDocument.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme, iframeBody]);

    return (
        <div style={{
            padding: 'var(--wrapper-padding)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            margin: '0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            <div style={{ marginBottom: 8, fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }}></span>
                {label}
            </div>
            <iframe
                ref={iframeRef}
                src="about:blank"
                style={{ width: '100%', flex: 1, border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--bg-app)', display: 'block' }}
            >
                {iframeBody && createPortal(
                    <div className="iframe-root-content" style={{ height: '100%', overflow: 'auto' }}>{children}</div>,
                    iframeBody
                )}
            </iframe>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Main Wrapper
// -----------------------------------------------------------------------------
export default function ComplexityWrapper({ children }: { children: React.ReactNode }) {
    const { mode } = useComplexity();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <>{children}</>;

    // Common wrapper
    const OuterWrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="fade-in" style={{ height: 'calc(100vh - 60px)', padding: 'var(--wrapper-padding)', boxSizing: 'border-box' }}>
            {children}
        </div>
    );

    switch (mode) {
        case "shadow":
            return <OuterWrapper key="shadow"><ShadowContainer theme={theme}>{children}</ShadowContainer></OuterWrapper>;

        case "iframe":
            return <OuterWrapper key="iframe"><IFrameContainer theme={theme}>{children}</IFrameContainer></OuterWrapper>;

        case "nested-shadow":
            return (
                <OuterWrapper key="nested-shadow">
                    <ShadowContainer label="Outer Shadow Root" theme={theme}>
                        <ShadowContainer label="Inner Shadow Root" theme={theme}>
                            {children}
                        </ShadowContainer>
                    </ShadowContainer>
                </OuterWrapper>
            );

        case "nested-iframe":
            return (
                <OuterWrapper key="nested-iframe">
                    <IFrameContainer label="Outer Frame" theme={theme}>
                        <IFrameContainer label="Inner Frame" theme={theme}>
                            {children}
                        </IFrameContainer>
                    </IFrameContainer>
                </OuterWrapper>
            );

        case "shadow-in-iframe":
            return (
                <OuterWrapper key="shadow-in-iframe">
                    <IFrameContainer label="Top Frame" theme={theme}>
                        <ShadowContainer label="Nested Shadow Root" theme={theme}>
                            {children}
                        </ShadowContainer>
                    </IFrameContainer>
                </OuterWrapper>
            );

        case "iframe-in-shadow":
            return (
                <OuterWrapper key="iframe-in-shadow">
                    <ShadowContainer label="Top Shadow Root" theme={theme}>
                        <IFrameContainer label="Nested Frame" theme={theme}>
                            {children}
                        </IFrameContainer>
                    </ShadowContainer>
                </OuterWrapper>
            );

        default:
            return <div key="standard" className="standard-root" style={{ height: '100%' }}>{children}</div>;
    }
}
