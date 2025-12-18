"use client";

import React, { useEffect, useRef } from 'react';

export default function MouseGlow() {
    const blobRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (blobRef.current) {
                const x = e.clientX;
                const y = e.clientY;

                // Using animate() for smooth hardware-accelerated movement
                // Offset is -400 for 800px width
                blobRef.current.animate({
                    transform: `translate(${x - 400}px, ${y - 400}px)`
                }, {
                    duration: 2000,
                    fill: "forwards",
                    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
                });

                if (blobRef.current.style.opacity === '0') {
                    blobRef.current.style.opacity = '1';
                }
            }
        };

        const handleMouseLeave = () => {
            if (blobRef.current) blobRef.current.style.opacity = '0';
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

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
                    opacity: 0,
                    transition: 'opacity 0.5s ease',
                    willChange: 'transform' // Optimize movement
                }}
            >
                {/* Inner animated blob container to separate movement from shape morphing */}
                <div style={{
                    width: '100%',
                    height: '100%',

                    // Aggressive Shape Morphing
                    animation: 'morph 8s ease-in-out infinite both alternate, spin 20s linear infinite',

                    // Radial gradient for smooth falloff
                    // Center is slightly colored, edges are fully transparent
                    background: 'radial-gradient(circle closest-side, rgba(88, 28, 135, 0.4), transparent 100%)',

                    // Extreme blur to kill banding lines
                    filter: 'blur(120px)',

                    // Hardware acceleration
                    transform: 'translate3d(0,0,0)',
                }} />
            </div>
        </>
    );
}
