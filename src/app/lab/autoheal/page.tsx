"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useActivity } from "@/context/ActivityContext";
import { useScrollToHash } from "@/hooks/useScrollToHash";

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const TABLE_SIZE_OPTIONS = [3, 5] as const;
type TableSize = (typeof TABLE_SIZE_OPTIONS)[number];

const FRUITS = [
    "Apple", "Banana", "Cherry", "Date", "Elderberry",
    "Fig", "Grape", "Honeydew", "Kiwi", "Lemon",
    "Mango", "Nectarine", "Orange", "Papaya", "Strawberry",
];

// ─────────────────────────────────────────────────────────────────────────────
// Fisher-Yates Shuffle
// ─────────────────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function generateCellLabels(size: number): string[] {
    const labels: string[] = [];
    for (let r = 1; r <= size; r++) {
        for (let c = 1; c <= size; c++) {
            labels.push(`Cell-${r}${c}`);
        }
    }
    return shuffle(labels);
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AutohealPage() {
    const { logAction, clearActivity } = useActivity();
    useScrollToHash();

    const [tableSize, setTableSize] = useState<TableSize>(5);
    const [cells, setCells] = useState<string[]>([]);
    const [listItems, setListItems] = useState<string[]>([]);
    const [displayValue, setDisplayValue] = useState("");
    const [flashActive, setFlashActive] = useState(false);

    const randomize = useCallback(() => {
        setCells(generateCellLabels(tableSize));
        setListItems(shuffle(FRUITS));
        setDisplayValue("");
        logAction("Randomized all elements", "Autoheal");
    }, [tableSize, logAction]);

    // Clear activity on mount
    useEffect(() => {
        clearActivity();
        logAction("Page loaded", "Autoheal");
    }, []);

    // Randomize on mount and when table size changes
    useEffect(() => {
        randomize();
    }, [tableSize]);

    const handleCellClick = (label: string) => {
        setDisplayValue(label);
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 600);
        logAction(`Clicked ${label}`, "Autoheal");
    };

    const handleListClick = (item: string) => {
        setDisplayValue(item);
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 600);
        logAction(`Clicked ${item}`, "Autoheal");
    };

    const handleSizeToggle = (size: TableSize) => {
        setTableSize(size);
        logAction(`Switched table to ${size}x${size}`, "Autoheal");
    };

    const handleReset = () => {
        randomize();
        clearActivity();
        logAction("Reset", "Autoheal");
    };

    // ── Side nav items ──
    const sections = [
        { id: "display", label: "Display Field" },
        { id: "table", label: "Randomized Table" },
        { id: "list", label: "Randomized List" },
    ];

    return (
        <>
            <AutohealSideNav />
            <div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: "1200px" }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h1 className="h1" style={{ marginBottom: "12px" }}>Dynamic Elements</h1>
                <p className="body-sm" style={{ maxWidth: "600px", margin: "0 auto 20px", fontSize: "16px" }}>
                    Elements are randomized on every load. Refresh the page or click Randomize to shuffle positions.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={randomize}
                        style={btnStyle}
                        data-testid="randomize-btn"
                    >
                        Randomize
                    </button>
                    <button
                        onClick={handleReset}
                        style={resetBtnStyle}
                        data-testid="reset-btn"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Display Field */}
            <section id="display" style={{ marginBottom: "48px" }}>
                <h2 className="h2" style={{ marginBottom: "16px" }}>Selected Element</h2>
                <input
                    type="text"
                    readOnly
                    value={displayValue}
                    placeholder="Click a cell or list item..."
                    style={{
                        ...inputStyle,
                        backgroundColor: flashActive ? "var(--accent-primary-10, rgba(99,102,241,0.1))" : "var(--bg-secondary)",
                        transition: "background-color 0.3s ease",
                    }}
                    data-testid="display-field"
                />
            </section>

            {/* Table Size Toggle */}
            <section id="table" style={{ marginBottom: "48px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <h2 className="h2" style={{ margin: 0 }}>Randomized {tableSize}x{tableSize} Table</h2>
                    <div style={{ display: "flex", gap: "8px" }}>
                        {TABLE_SIZE_OPTIONS.map((size) => (
                            <button
                                key={size}
                                onClick={() => handleSizeToggle(size)}
                                style={tableSize === size ? sizeToggleActiveStyle : sizeToggleStyle}
                                data-testid={`size-${size}x${size}-btn`}
                            >
                                {size}x{size}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${tableSize}, 1fr)`,
                        gap: "8px",
                        maxWidth: tableSize === 3 ? "480px" : "100%",
                    }}
                    data-testid="randomized-table"
                >
                    {cells.map((label, i) => (
                        <button
                            key={`${label}-${i}`}
                            onClick={() => handleCellClick(label)}
                            style={cellStyle}
                            className="autoheal-cell"
                            data-testid={`cell-${label.toLowerCase()}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Randomized List */}
            <section id="list" style={{ marginBottom: "48px" }}>
                <h2 className="h2" style={{ marginBottom: "20px" }}>Randomized List</h2>
                <ol
                    style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: "600px" }}
                    data-testid="randomized-list"
                >
                    {listItems.map((item, i) => (
                        <li key={`${item}-${i}`}>
                            <button
                                onClick={() => handleListClick(item)}
                                style={listItemStyle}
                                className="autoheal-list-item"
                                data-testid={`list-item-${item.toLowerCase()}`}
                            >
                                <span style={{ color: "var(--text-tertiary)", minWidth: "32px", fontWeight: 600 }}>
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                {item}
                            </button>
                        </li>
                    ))}
                </ol>
            </section>

            <style jsx global>{`
                .autoheal-cell {
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }
                .autoheal-cell:hover {
                    background: var(--accent-primary) !important;
                    color: #fff !important;
                    transform: scale(1.03);
                    box-shadow: var(--shadow-md);
                }
                .autoheal-cell:active {
                    transform: scale(0.97);
                }

                .autoheal-list-item {
                    cursor: pointer;
                }
                .autoheal-list-item:hover {
                    background: var(--accent-primary-10, rgba(99,102,241,0.08)) !important;
                    padding-left: 24px !important;
                    color: var(--accent-primary) !important;
                }
                .autoheal-list-item:active {
                    transform: scale(0.98);
                }

                @media (max-width: 768px) {
                    #table [data-testid="randomized-table"] {
                        gap: 6px !important;
                    }
                    .autoheal-cell {
                        padding: 12px 4px !important;
                        font-size: 12px !important;
                    }
                }

                @media (max-width: 480px) {
                    .autoheal-cell {
                        padding: 10px 2px !important;
                        font-size: 11px !important;
                    }
                }
            `}</style>
        </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const btnStyle: React.CSSProperties = {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "none",
    background: "var(--accent-primary)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
};

const resetBtnStyle: React.CSSProperties = {
    padding: "10px 24px",
    borderRadius: "10px",
    border: "1px solid var(--border-light)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1px solid var(--border-light)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: "16px",
    fontWeight: 600,
    outline: "none",
    boxSizing: "border-box",
};

const cellStyle: React.CSSProperties = {
    padding: "18px 8px",
    borderRadius: "12px",
    border: "1px solid var(--border-light)",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    fontWeight: 600,
    fontSize: "14px",
    textAlign: "center",
    transition: "all 0.2s ease",
};

const sizeToggleStyle: React.CSSProperties = {
    padding: "6px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border-light)",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
};

const sizeToggleActiveStyle: React.CSSProperties = {
    ...sizeToggleStyle,
    background: "var(--accent-primary)",
    color: "#fff",
    border: "1px solid var(--accent-primary)",
};

const listItemStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontWeight: 500,
    textAlign: "left",
    transition: "all 0.2s ease",
    borderBottom: "1px solid var(--border-light)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Side Navigation (hidden on mobile via .side-nav-container)
// ─────────────────────────────────────────────────────────────────────────────
function AutohealSideNav() {
    const navRef = useRef<HTMLDivElement>(null);
    const sections = [
        { id: "display", label: "Display" },
        { id: "table", label: "Table" },
        { id: "list", label: "List" },
    ];

    const scrollTo = (id: string) => {
        const root = navRef.current?.getRootNode() as Document | ShadowRoot;
        let target = root?.getElementById?.(id);
        if (!target) target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <div ref={navRef} className="fade-in side-nav-container" style={{
            position: "fixed", left: "1.875rem", top: "8rem",
            display: "flex", flexDirection: "column", gap: "2rem", zIndex: 100,
        }}>
            <div style={{
                fontSize: "0.625rem", fontWeight: 800, color: "var(--text-tertiary)",
                letterSpacing: "0.15em", textTransform: "uppercase",
                marginBottom: "-0.5rem", marginLeft: "0.375rem",
            }}>
                Navigation
            </div>
            {sections.map(item => (
                <div
                    key={item.id}
                    className="nav-dot-wrapper"
                    onClick={() => scrollTo(item.id)}
                    data-testid={`nav-${item.id}`}
                    style={{
                        position: "relative", display: "flex", alignItems: "center",
                        cursor: "pointer", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                >
                    <div className="nav-label" style={{
                        position: "absolute", left: "1.75rem",
                        background: "var(--bg-card)", padding: "0.375rem 0.875rem",
                        borderRadius: "1.25rem", border: "1px solid var(--border-light)",
                        fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.05em", whiteSpace: "nowrap", opacity: 0.8,
                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        boxShadow: "var(--shadow-sm)", color: "var(--text-secondary)",
                    }}>
                        {item.label}
                    </div>
                    <div className="nav-dot" style={{
                        width: "0.75rem", height: "0.75rem", borderRadius: "50%",
                        background: "var(--text-tertiary)",
                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        opacity: 0.6, zIndex: 2, border: "2px solid transparent",
                    }} />
                    <div className="nav-halo" style={{
                        position: "absolute", left: "0.375rem", top: "50%",
                        transform: "translate(-50%, -50%) scale(0)",
                        width: "2rem", height: "2rem", borderRadius: "50%",
                        background: "var(--accent-primary)", opacity: 0,
                        filter: "blur(0.5rem)",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", zIndex: 1,
                    }} />
                    <style jsx>{`
                        .nav-dot-wrapper:hover { transform: scale(1.05) !important; }
                        .nav-dot-wrapper:hover .nav-dot {
                            background: #fff; border-color: var(--accent-primary);
                            box-shadow: 0 0 15px var(--accent-primary), inset 0 0 5px var(--accent-primary);
                            opacity: 1;
                        }
                        .nav-dot-wrapper:hover .nav-halo {
                            transform: translate(-50%, -50%) scale(1) !important;
                            opacity: 0.3;
                        }
                        .nav-dot-wrapper:hover .nav-label {
                            opacity: 1; color: var(--accent-primary);
                            border-color: var(--accent-primary);
                        }
                    `}</style>
                </div>
            ))}
        </div>
    );
}
