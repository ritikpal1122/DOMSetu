"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function MouseGlow() {
    const blobRef = useRef<HTMLDivElement>(null);
    const lastPos = useRef({ x: 0, y: 0 });
    const isIdle = useRef(true);
    const idleTimer = useRef<NodeJS.Timeout | null>(null);

    const animateTo = useCallback((x: number, y: number, duration: number = 2000, easing: string = "cubic-bezier(0.16, 1, 0.3, 1)") => {
        if (!blobRef.current) return;

        blobRef.current.animate({
            transform: `translate(${x - 400}px, ${y - 400}px)`
        }, {
            duration,
            fill: "forwards",
            easing
        });
        lastPos.current = { x, y };
    }, []);

    const startRandomWalk = useCallback(() => {
        if (!isIdle.current) return;

        // Generate a random position within the viewport
        const nextX = Math.random() * window.innerWidth;
        const nextY = Math.random() * window.innerHeight;

        // Slower, more "drifting" animation for idle state
        animateTo(nextX, nextY, 5000, "ease-in-out");

        // Schedule next random movement
        idleTimer.current = setTimeout(startRandomWalk, 5000);
    }, [animateTo]);

    useEffect(() => {
        // Initial random position
        const initialX = Math.random() * window.innerWidth;
        const initialY = Math.random() * window.innerHeight;
        animateTo(initialX, initialY, 0); // Jump to initial
        startRandomWalk();

        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;

            // If we were idle, smooth transition back to mouse
            if (isIdle.current) {
                isIdle.current = false;
                if (idleTimer.current) clearTimeout(idleTimer.current);
            }

            // Normal tracking
            animateTo(x, y, 2000);

            // Set a timer to return to idle
            if (idleTimer.current) clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => {
                isIdle.current = true;
                startRandomWalk();
            }, 5000); // 5 seconds of inactivity
        };

        const handleMouseLeave = () => {
            // Immediately switch to idle mode when mouse leaves viewport
            if (!isIdle.current) {
                isIdle.current = true;
                startRandomWalk();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, [animateTo, startRandomWalk]);

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
            `}</style>
            <div
                ref={blobRef}
                className="mouse-glow"
                style={{
                    pointerEvents: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '800px',
                    height: '800px',
                    zIndex: 0,
                    opacity: 1, // Always visible
                    transition: 'opacity 1s ease',
                    willChange: 'transform'
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    animation: 'morph 8s ease-in-out infinite both alternate, spin 20s linear infinite',
                    background: 'radial-gradient(circle closest-side, rgba(88, 28, 135, 0.45), transparent 100%)',
                    filter: 'blur(120px)',
                    transform: 'translate3d(0,0,0)',
                }} />
            </div>
        </>
    );
}
