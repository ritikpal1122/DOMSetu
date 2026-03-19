"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useActivity } from '@/context/ActivityContext';

export default function ScrollPage() {
    const { logAction, clearActivity } = useActivity();

    // Clear activity on mount
    useEffect(() => {
        clearActivity();
        logAction("Page loaded", "Scroll");
    }, []);

    // Ref for finding the actual scroll container (handles iframe mode)
    const containerRef = useRef<HTMLDivElement>(null);

    // Using a ref to track throttle times to avoid re-renders
    const throttleRef = useRef<{ [key: string]: number }>({});
    const prevScrollRef = useRef<{ [key: string]: number }>({});

    // Helper to log scroll events with throttling
    const hoverTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

    // Helper to log scroll events with throttling + trailing edge
    const trackScroll = (
        name: string,
        current: number,
        max: number,
        axis: 'vertical' | 'horizontal'
    ) => {
        const now = Date.now();
        const lastTime = throttleRef.current[name] || 0;
        const prevPos = prevScrollRef.current[name] || 0;

        // Function to perform the log
        const performLog = (val: number) => {
            const percentage = Math.round((val / max) * 100);
            let direction = '';
            if (axis === 'vertical') {
                direction = val > prevPos ? 'Down' : 'Up';
            } else {
                direction = val > prevPos ? 'Right' : 'Left';
            }

            logAction(
                `${name}: ${direction} | ${Math.ceil(val)}px | ${percentage}%`,
                "Scroll Dynamics"
            );

            throttleRef.current[name] = Date.now();
            prevScrollRef.current[name] = val;
        };

        // 1. Throttle: Log immediately if enough time passed
        if (now - lastTime > 30) {
            performLog(current);
        }

        // 2. Debounce/Trailing: Ensure the final position is always captured
        // Clear existing timeout for this element
        if (hoverTimeoutRef.current[name]) {
            clearTimeout(hoverTimeoutRef.current[name]);
        }

        // Set new timeout to check for "stop"
        hoverTimeoutRef.current[name] = setTimeout(() => {
            // If the current value is different from the last logged value
            if (Math.ceil(current) !== Math.ceil(prevScrollRef.current[name])) {
                performLog(current);
            }
        }, 50); // 50ms pause = "stopped"
    };

    // 1. Page Scroll Tracking
    // In iframe complexity mode, content is rendered inside an iframe via createPortal.
    // `window` refers to the parent window, but scrolling happens on the iframe's
    // scroll container (the `iframe-root-content` div with overflow:auto).
    // We find the actual scrollable ancestor to attach the listener correctly.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Walk up from our container to find the nearest scrollable ancestor.
        // Skip <body> and <html> — page-level scroll events fire on `window`, not on those elements.
        const getScrollTarget = (): HTMLElement | Window => {
            const ownerDoc = el.ownerDocument;
            let parent = el.parentElement;
            while (parent) {
                if (parent !== ownerDoc.documentElement && parent !== ownerDoc.body) {
                    const { overflow, overflowY } = getComputedStyle(parent);
                    if (/(auto|scroll)/.test(overflow + overflowY)) {
                        return parent;
                    }
                }
                parent = parent.parentElement;
            }
            return ownerDoc?.defaultView || window;
        };

        const scrollTarget = getScrollTarget();

        const handleScroll = () => {
            let current: number, max: number;
            if (scrollTarget instanceof HTMLElement) {
                current = scrollTarget.scrollTop;
                max = scrollTarget.scrollHeight - scrollTarget.clientHeight;
            } else {
                current = scrollTarget.scrollY;
                const doc = scrollTarget.document || el.ownerDocument;
                max = doc.documentElement.scrollHeight - scrollTarget.innerHeight;
            }
            if (max > 0) {
                trackScroll('Page', current, max, 'vertical');
            }
        };

        scrollTarget.addEventListener('scroll', handleScroll);
        return () => scrollTarget.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={containerRef} className="container fade-in" style={{ padding: "60px 24px", width: '100%', maxWidth: '800px', margin: '0 auto' }}>

            <div style={{ marginBottom: 60, textAlign: 'center' }}>
                <h1 className="h1" style={{ marginBottom: 16 }}>Scroll Dynamics</h1>
                <p className="body-sm" style={{ maxWidth: 600, margin: '0 auto', fontSize: '16px' }}>
                    Advanced scroll tracking for window, nested containers, and carousels.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '60px', width: '100%' }}>

                {/* 1. Main Page Scroll Indicator */}
                <section style={styles.section}>
                    <div style={styles.header}>
                        <h2 className="h2">1. Page Scroll</h2>
                        <span style={styles.badge}>Vertical</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                        Scroll the main browser window up and down. The tracker monitors the global viewport position.
                        (See the Activity Tracker at the top of the screen).
                    </p>
                    <div style={{
                        height: '120px',
                        background: 'linear-gradient(to bottom, var(--bg-tertiary), var(--bg-card))',
                        borderRadius: '12px',
                        border: '1px dashed var(--border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)', fontStyle: 'italic'
                    }}>
                        Scroll the entire page...
                    </div>
                </section>

                {/* 2. Nested Scroll Section */}
                <section style={styles.section}>
                    <div style={styles.header}>
                        <h2 className="h2">2. Nested Container Scroll</h2>
                        <span style={styles.badge}>Overflow-Y</span>
                    </div>
                    <div
                        style={styles.nestedContainer}
                        onScroll={(e) => {
                            const target = e.currentTarget;
                            const max = target.scrollHeight - target.clientHeight;
                            trackScroll('Nested Box', target.scrollTop, max, 'vertical');
                        }}
                    >
                        <h3 className="h3" style={{ marginBottom: 16 }}>Terms & Conditions</h3>
                        <p style={styles.paragraph}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p style={styles.paragraph}>
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <p style={styles.paragraph}>
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam,
                            eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                        </p>
                        <p style={styles.paragraph}>
                            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
                            qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
                        </p>
                        <div style={{ margin: '40px 0', height: '1px', background: 'var(--border-light)' }} />
                        <p style={styles.paragraph}>
                            <strong>Section 2.1: Usage Data</strong><br />
                            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti
                            quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
                        </p>
                        <p style={styles.paragraph}>
                            Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis
                            est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                        </p>
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '13px', background: 'var(--bg-tertiary)', borderRadius: '8px', margin: '20px 0' }}>
                            [ End of Content ]
                        </div>
                    </div>
                </section>

                {/* 3. Product Carousel */}
                <section style={styles.section}>
                    <div style={styles.header}>
                        <h2 className="h2">3. Product Carousel</h2>
                        <span style={styles.badge}>Horizontal</span>
                    </div>

                    <div
                        style={styles.carouselContainer}
                        onScroll={(e) => {
                            const target = e.currentTarget;
                            const max = target.scrollWidth - target.clientWidth;
                            trackScroll('Carousel', target.scrollLeft, max, 'horizontal');
                        }}
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} style={styles.productCard}>
                                <div style={styles.productImage}>
                                    <span style={{ fontSize: '32px' }}>
                                        {['👟', '🕶️', '🎒', '🧢', '⌚', '🎧', '📱', '💻', '📷', '🎮', '🚲', '🎸'][i]}
                                    </span>
                                </div>
                                <div style={styles.productInfo}>
                                    <div style={styles.productTitle}>Premium Item {i + 1}</div>
                                    <div style={styles.productPrice}>${(19.99 + (i * 10)).toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 12, fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Swipe or scroll horizontally to see more items →
                    </div>
                </section>

                {/* Extra Space to enable Page Scroll */}
                <div style={{ height: '2000px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '100px', color: 'var(--text-secondary)', opacity: 0.3, borderTop: '1px dashed var(--border-light)' }}>
                    <p>(Extended Scroll Padding Area)</p>
                    <p style={{ marginTop: 24 }}>Scroll down...</p>
                    <div style={{ width: 1, height: 100, background: 'var(--text-secondary)', margin: '24px 0' }}></div>
                    <p>Keep scrolling...</p>
                    <div style={{ width: 1, height: 100, background: 'var(--text-secondary)', margin: '24px 0' }}></div>
                    <p>Almost there...</p>
                </div>

            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    section: {
        background: "var(--bg-card)",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        width: "100%",
        overflow: "hidden", // Prevent overflow
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
        borderBottom: '1px solid var(--border-light)', paddingBottom: 16
    },
    badge: {
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
        background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-secondary)'
    },
    nestedContainer: {
        height: '300px',
        overflowY: 'auto',
        border: '1px solid var(--border-strong)',
        borderRadius: '12px',
        padding: '24px',
        background: 'var(--bg-secondary)',
        scrollbarWidth: 'thin', // Firefox
        width: '100%',
    },
    paragraph: {
        fontSize: '15px',
        lineHeight: 1.6,
        color: 'var(--text-secondary)',
        marginBottom: '16px'
    },
    carouselContainer: {
        display: 'flex',
        gap: '24px',
        overflowX: 'auto',
        padding: '8px 4px 24px 4px', // Bottom padding for scrollbar
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        width: '100%',
    },
    productCard: {
        flex: '0 0 220px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        padding: '16px',
        scrollSnapAlign: 'start',
        transition: 'transform 0.2s',
        display: 'flex', flexDirection: 'column', gap: 16
    },
    productImage: {
        height: '140px',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    productInfo: {
        display: 'flex', flexDirection: 'column', gap: 4
    },
    productTitle: {
        fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px'
    },
    productPrice: {
        fontWeight: 500, color: 'var(--accent-primary)', fontSize: '14px'
    }
};
