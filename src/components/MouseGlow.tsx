"use client";

import React, { useEffect, useRef, useCallback } from 'react';

export default function MouseGlow() {
    const blobRef = useRef<HTMLDivElement>(null);

    const animateTo = useCallback((x: number, y: number, duration: number = 2000, easing: string = "cubic-bezier(0.16, 1, 0.3, 1)") => {
        if (!blobRef.current) return;

        // Offset is -400 for 800px width.
        blobRef.current.animate({
            transform: `translate(${x - 400}px, ${y - 400}px)`
        }, {
            duration,
            fill: "forwards",
            easing
        });
    }, []);

    useEffect(() => {
        // Detect if should enable tracking (disable on small screens/touch for performance)
        const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

        // Initial position: center of screen
        const initialX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
        const initialY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
        animateTo(initialX, initialY, 0);

        if (isMobile) return; // Skip mousemove tracking on mobile for extreme performance

        const handleMouseMove = (e: MouseEvent) => {
            animateTo(e.clientX, e.clientY, 2000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [animateTo]);

    return (
        <>
            <style jsx global>{`
                @keyframes morph {
                    0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
                    25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
                    50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
                    75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
                    100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .glow-container {
                    width: 800px;
                    height: 800px;
                    filter: blur(120px);
                    pointer-events: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 0;
                    will-change: transform;
                }

                .glow-inner {
                    width: 100%;
                    height: 100%;
                    animation: morph 8s ease-in-out infinite both alternate, spin 20s linear infinite;
                    background: radial-gradient(circle closest-side, rgba(88, 28, 135, 0.45), transparent 100%);
                    transform: translate3d(0,0,0);
                }

                /* Mobile Performance - Extreme Optimization */
                @media (max-width: 768px) {
                    .glow-container {
                        /* Force centered static position on mobile */
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        filter: none !important; /* Filters are the #1 cause of lag on mobile */
                        will-change: auto;
                    }
                    .glow-inner {
                        animation: none !important;
                        /* Use a large radial gradient instead of filter:blur for the 'glow' effect */
                        /* This is vastly more performant on mobile GPUs */
                        background: radial-gradient(circle at center, rgba(88, 28, 135, 0.15) 0%, transparent 70%) !important;
                    }
                }
            `}</style>
            <div ref={blobRef} className="mouse-glow glow-container">
                <div className="glow-inner" />
            </div>
        </>
    );
}
