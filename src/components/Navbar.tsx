"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePreservedParams } from "@/hooks/usePreservedParams";

const NAV_ITEMS = [
    { label: "Home", href: "/" },
    { label: "Forms", href: "/lab/forms" },
    { label: "Scroll", href: "/lab/scroll" },
    { label: "Alerts", href: "/lab/alerts" },
    { label: "Canvas", href: "/lab/canvas" },
    { label: "Dropdowns", href: "/lab/dropdowns" },
    { label: "Chrome Version", href: "/chrome-prefs-validator" },
    { label: "Login", href: "/login-checker" },
    { label: "E-Commerce", href: "/ecommerce/checkout" },
    { label: "Autoheal", href: "/lab/autoheal" },
    { label: "Device Settings", href: "/device-settings" },
];

export default function Navbar() {
    const pathname = usePathname();
    const buildHref = usePreservedParams();
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                left: rect.left,
            });
        }
    }, []);

    // Close on route change
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Position dropdown when opened
    useEffect(() => {
        if (open) updatePosition();
    }, [open, updatePosition]);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                btnRef.current && !btnRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    return (
        <>
            <button
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
                className={`hamburger-btn ${open ? 'hamburger-btn-open' : ''}`}
                aria-label="Toggle navigation menu"
                data-testid="hamburger-btn"
            >
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
            </button>

            {open && createPortal(
                <div
                    ref={dropdownRef}
                    className="hamburger-dropdown"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                    {NAV_ITEMS.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={buildHref(href)}
                            className={`hamburger-item ${pathname === href ? 'hamburger-item-active' : ''}`}
                            data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                            {label}
                        </Link>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}
