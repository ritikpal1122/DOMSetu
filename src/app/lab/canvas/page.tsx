"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useActivity } from "@/context/ActivityContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface KanbanCard { id: number; text: string }
interface KanbanColumns { todo: KanbanCard[]; progress: KanbanCard[]; done: KanbanCard[] }

type ColumnKey = keyof KanbanColumns;

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function CanvasPage() {
    const { logAction, clearActivity } = useActivity();

    useEffect(() => { clearActivity(); logAction("Page loaded", "Canvas"); }, []);

    const log = (msg: string) => logAction(msg, "Canvas & Vision");

    return (
        <>
            <CanvasSideNav />
            <div className="container fade-in main-container" style={{ padding: "60px 40px", maxWidth: '1200px' }}>
                <div style={{ marginBottom: '3.75rem', textAlign: 'center' }}>
                    <h1 className="h1" style={{ marginBottom: '1rem' }}>Canvas & Vision</h1>
                    <p className="body-sm" style={{ maxWidth: '37.5rem', margin: '0 auto', fontSize: '1rem' }}>
                        Drag & drop, canvas drawing, visual state assertions, and spatial interactions.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    <div id="section-sortable"><SortableList log={log} /></div>
                    <div id="section-kanban"><KanbanBoard log={log} /></div>
                    <div id="section-slider"><CustomSlider log={log} /></div>
                    <div id="section-resize"><ResizePanels log={log} /></div>
                    <div id="section-visual"><VisualStateAssertions log={log} /></div>
                    <div id="section-progress"><ProgressBarControls log={log} /></div>
                    <div id="section-drawing"><DrawingCanvas log={log} /></div>
                    <div id="section-zoom"><ZoomPanCanvas log={log} /></div>
                </div>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Styles
// ─────────────────────────────────────────────────────────────────────────────
const sectionStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-light)',
};

const sectionHeader: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '8px',
};

const badge = (color: string): React.CSSProperties => ({
    fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
    padding: '4px 10px', borderRadius: '99px',
    background: color, color: '#fff', letterSpacing: '0.05em',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Sortable List
// ─────────────────────────────────────────────────────────────────────────────
function SortableList({ log }: { log: (msg: string) => void }) {
    const [items, setItems] = useState([
        "Deploy to production",
        "Write unit tests",
        "Code review PR #42",
        "Update documentation",
        "Fix login bug",
    ]);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (index: number) => {
        dragItem.current = index;
        log(`Sortable: Started dragging "${items[index]}"`);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        dragOverItem.current = index;
    };

    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const updated = [...items];
        const [removed] = updated.splice(dragItem.current, 1);
        updated.splice(dragOverItem.current, 0, removed);
        setItems(updated);
        log(`Sortable: Moved "${removed}" to position ${dragOverItem.current + 1}`);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <section style={sectionStyle} data-testid="sortable-section">
            <div style={sectionHeader}>
                <h2 className="h2">1. Sortable List</h2>
                <div style={badge('#6366f1')}>Drag to Reorder</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Drag items to reorder. The order is logged for assertion.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, i) => (
                    <div
                        key={item}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={handleDrop}
                        data-testid={`sortable-item-${i}`}
                        style={{
                            padding: '14px 18px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            cursor: 'grab',
                            display: 'flex', alignItems: 'center', gap: '12px',
                            border: '1px solid var(--border-light)',
                            transition: 'box-shadow 0.15s',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                        }}
                    >
                        <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, minWidth: '20px' }}>{i + 1}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                            <circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" />
                            <circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" />
                            <circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" />
                        </svg>
                        <span>{item}</span>
                    </div>
                ))}
            </div>
            <div data-testid="sortable-order" style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Current order: {items.join(" → ")}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Kanban Board
// ─────────────────────────────────────────────────────────────────────────────
function KanbanBoard({ log }: { log: (msg: string) => void }) {
    const [columns, setColumns] = useState<KanbanColumns>({
        todo: [
            { id: 1, text: "Design homepage" },
            { id: 2, text: "Setup CI/CD" },
            { id: 3, text: "Create API endpoints" },
        ],
        progress: [
            { id: 4, text: "User authentication" },
        ],
        done: [
            { id: 5, text: "Project scaffolding" },
        ],
    });

    const dragCard = useRef<{ card: KanbanCard; from: ColumnKey } | null>(null);

    const handleDragStart = (card: KanbanCard, from: ColumnKey) => {
        dragCard.current = { card, from };
        log(`Kanban: Started dragging "${card.text}" from ${columnLabel(from)}`);
    };

    const handleDropOnColumn = (to: ColumnKey) => {
        if (!dragCard.current) return;
        const { card, from } = dragCard.current;
        if (from === to) { dragCard.current = null; return; }

        setColumns(prev => ({
            ...prev,
            [from]: prev[from].filter(c => c.id !== card.id),
            [to]: [...prev[to], card],
        }));
        log(`Kanban: Moved "${card.text}" from ${columnLabel(from)} → ${columnLabel(to)}`);
        dragCard.current = null;
    };

    const columnLabel = (key: ColumnKey) => {
        switch (key) {
            case 'todo': return 'To Do';
            case 'progress': return 'In Progress';
            case 'done': return 'Done';
        }
    };

    const columnColor = (key: ColumnKey) => {
        switch (key) {
            case 'todo': return '#94a3b8';
            case 'progress': return '#f59e0b';
            case 'done': return '#22c55e';
        }
    };

    return (
        <section style={sectionStyle} data-testid="kanban-section">
            <div style={sectionHeader}>
                <h2 className="h2">2. Kanban Board</h2>
                <div style={badge('#f59e0b')}>Cross-Container Drag</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Drag cards between columns to change their status.
            </p>
            <style jsx global>{`
                @media (max-width: 768px) {
                    .kanban-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
            <div className="kanban-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {(Object.keys(columns) as ColumnKey[]).map(col => (
                    <div
                        key={col}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnColumn(col)}
                        data-testid={`kanban-col-${col}`}
                        style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: '14px',
                            padding: '16px',
                            minHeight: '150px',
                            border: '1px dashed var(--border-light)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: columnColor(col) }} />
                            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {columnLabel(col)}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{columns[col].length}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {columns[col].map(card => (
                                <div
                                    key={card.id}
                                    draggable
                                    onDragStart={() => handleDragStart(card, col)}
                                    data-testid={`kanban-card-${card.id}`}
                                    style={{
                                        padding: '12px 14px',
                                        background: 'var(--bg-card)',
                                        borderRadius: '10px',
                                        cursor: 'grab',
                                        fontSize: '13px',
                                        color: 'var(--text-primary)',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: '1px solid var(--border-light)',
                                    }}
                                >
                                    {card.text}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Custom Range Slider
// ─────────────────────────────────────────────────────────────────────────────
function CustomSlider({ log }: { log: (msg: string) => void }) {
    const [value, setValue] = useState(50);
    const trackRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const updateValue = useCallback((clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const rounded = Math.round(pct);
        setValue(rounded);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        dragging.current = true;
        updateValue(e.clientX);
        log(`Slider: Drag started at ${value}%`);
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (dragging.current) updateValue(e.clientX);
        };
        const handleUp = () => {
            if (dragging.current) {
                dragging.current = false;
                log(`Slider: Set to ${value}%`);
            }
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [updateValue, value, log]);

    return (
        <section style={sectionStyle} data-testid="slider-section">
            <div style={sectionHeader}>
                <h2 className="h2">3. Custom Range Slider</h2>
                <div style={badge('#8b5cf6')}>Precision Drag</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Drag the thumb to set a value. Tests precise horizontal drag targeting.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', minWidth: '30px' }}>0</span>
                <div
                    ref={trackRef}
                    onMouseDown={handleMouseDown}
                    data-testid="slider-track"
                    style={{
                        flex: 1, height: '8px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '99px',
                        position: 'relative',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        width: `${value}%`, background: 'var(--accent-primary)',
                        borderRadius: '99px', transition: dragging.current ? 'none' : 'width 0.1s',
                    }} />
                    <div
                        data-testid="slider-thumb"
                        style={{
                            position: 'absolute', top: '50%',
                            left: `${value}%`, transform: 'translate(-50%, -50%)',
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'var(--accent-primary)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            cursor: 'grab',
                        }}
                    />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-tertiary)', minWidth: '30px' }}>100</span>
            </div>
            <div data-testid="slider-value" style={{ textAlign: 'center', marginTop: '12px', fontSize: '28px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {value}%
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Resize Panels
// ─────────────────────────────────────────────────────────────────────────────
function ResizePanels({ log }: { log: (msg: string) => void }) {
    const [leftWidth, setLeftWidth] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);

    const handleMouseDown = () => {
        dragging.current = true;
        log(`Resize: Drag started at ${leftWidth}%`);
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!dragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const pct = Math.max(20, Math.min(80, ((e.clientX - rect.left) / rect.width) * 100));
            setLeftWidth(Math.round(pct));
        };
        const handleUp = () => {
            if (dragging.current) {
                dragging.current = false;
                log(`Resize: Set to ${leftWidth}% / ${100 - leftWidth}%`);
            }
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [leftWidth, log]);

    return (
        <section style={sectionStyle} data-testid="resize-section">
            <div style={sectionHeader}>
                <h2 className="h2">4. Resize Panels</h2>
                <div style={badge('#0ea5e9')}>Drag Divider</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Drag the divider to resize the panels. Min 20%, max 80%.
            </p>
            <div
                ref={containerRef}
                data-testid="resize-container"
                style={{ display: 'flex', height: '200px', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border-light)' }}
            >
                <div data-testid="resize-left" style={{ width: `${leftWidth}%`, background: 'var(--bg-secondary)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: dragging.current ? 'none' : 'width 0.1s' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Left Panel — {leftWidth}%</span>
                </div>
                <div
                    onMouseDown={handleMouseDown}
                    data-testid="resize-handle"
                    style={{
                        width: '8px', cursor: 'col-resize',
                        background: 'var(--border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <div style={{ width: '2px', height: '32px', background: 'var(--text-tertiary)', borderRadius: '2px', opacity: 0.5 }} />
                </div>
                <div data-testid="resize-right" style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Right Panel — {100 - leftWidth}%</span>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Visual State Assertions
// ─────────────────────────────────────────────────────────────────────────────
function VisualStateAssertions({ log }: { log: (msg: string) => void }) {
    const [statusColor, setStatusColor] = useState('#94a3b8');
    const [statusLabel, setStatusLabel] = useState('Idle');
    const [badgeCount, setBadgeCount] = useState(0);
    const [visible, setVisible] = useState(true);
    const [toggled, setToggled] = useState(false);

    const setStatus = (color: string, label: string) => {
        setStatusColor(color);
        setStatusLabel(label);
        log(`Status: Changed to "${label}"`);
    };

    return (
        <section style={sectionStyle} data-testid="visual-section">
            <div style={sectionHeader}>
                <h2 className="h2">5. Visual State Assertions</h2>
                <div style={badge('#22c55e')}>Assert States</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                Click buttons to change visual states, then assert the result.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Status Indicator */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>Status Indicator</h3>
                    <div data-testid="status-indicator" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div data-testid="status-dot" style={{ width: 14, height: 14, borderRadius: '50%', background: statusColor, transition: 'background 0.2s' }} />
                        <span data-testid="status-label" style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{statusLabel}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button data-testid="status-idle" onClick={() => setStatus('#94a3b8', 'Idle')} style={miniBtn}>Idle</button>
                        <button data-testid="status-active" onClick={() => setStatus('#22c55e', 'Active')} style={miniBtn}>Active</button>
                        <button data-testid="status-warning" onClick={() => setStatus('#f59e0b', 'Warning')} style={miniBtn}>Warning</button>
                        <button data-testid="status-error" onClick={() => setStatus('#ef4444', 'Error')} style={miniBtn}>Error</button>
                    </div>
                </div>

                {/* Badge Counter */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>Notification Badge</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            {badgeCount > 0 && (
                                <span data-testid="badge-count" style={{
                                    position: 'absolute', top: -6, right: -8,
                                    background: '#ef4444', color: '#fff',
                                    fontSize: '11px', fontWeight: 700,
                                    width: '20px', height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>{badgeCount}</span>
                            )}
                        </div>
                        <span data-testid="badge-value" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {badgeCount === 0 ? 'No notifications' : `${badgeCount} notification${badgeCount > 1 ? 's' : ''}`}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button data-testid="badge-add" onClick={() => { setBadgeCount(c => c + 1); log(`Badge: Incremented to ${badgeCount + 1}`); }} style={miniBtn}>Add +1</button>
                        <button data-testid="badge-clear" onClick={() => { setBadgeCount(0); log(`Badge: Cleared`); }} style={miniBtn}>Clear</button>
                    </div>
                </div>

                {/* Visibility Toggle */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>Show / Hide Element</h3>
                    {visible && (
                        <div data-testid="toggle-target" style={{
                            padding: '14px', background: 'var(--accent-surface, var(--bg-secondary))',
                            borderRadius: '10px', marginBottom: '16px',
                            fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 500,
                            border: '1px solid var(--accent-primary)',
                        }}>
                            This element can be hidden
                        </div>
                    )}
                    {!visible && <div data-testid="toggle-target-hidden" style={{ height: '52px', marginBottom: '16px' }} />}
                    <button data-testid="toggle-visibility" onClick={() => { setVisible(v => !v); log(`Visibility: ${visible ? 'Hidden' : 'Shown'}`); }} style={miniBtn}>
                        {visible ? 'Hide' : 'Show'} Element
                    </button>
                </div>

                {/* Toggle Switch */}
                <div style={cardStyle}>
                    <h3 style={cardTitle}>Toggle Switch</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <button
                            data-testid="toggle-switch"
                            onClick={() => { setToggled(t => !t); log(`Toggle: ${toggled ? 'OFF' : 'ON'}`); }}
                            role="switch"
                            aria-checked={toggled}
                            style={{
                                width: '52px', height: '28px',
                                borderRadius: '99px', border: 'none', cursor: 'pointer',
                                background: toggled ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                boxShadow: 'inset 0 0 0 1px var(--border-light)',
                                position: 'relative', transition: 'background 0.2s',
                                padding: 0,
                            }}
                        >
                            <div style={{
                                width: '22px', height: '22px', borderRadius: '50%',
                                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                                position: 'absolute', top: '3px',
                                left: toggled ? '27px' : '3px',
                                transition: 'left 0.2s',
                            }} />
                        </button>
                        <span data-testid="toggle-state" style={{ fontSize: '14px', fontWeight: 600, color: toggled ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                            {toggled ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid var(--border-light)',
};

const cardTitle: React.CSSProperties = {
    fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
    marginBottom: '14px',
};

const miniBtn: React.CSSProperties = {
    padding: '8px 14px',
    fontSize: '12px', fontWeight: 600,
    borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    boxShadow: 'inset 0 0 0 1px var(--border-light)',
    transition: 'background 0.15s',
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Progress Bar
// ─────────────────────────────────────────────────────────────────────────────
function ProgressBarControls({ log }: { log: (msg: string) => void }) {
    const [progress, setProgress] = useState(0);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const start = () => {
        if (running || progress >= 100) return;
        setRunning(true);
        log(`Progress: Started from ${progress}%`);
        intervalRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setRunning(false);
                    log('Progress: Completed 100%');
                    return 100;
                }
                return prev + 1;
            });
        }, 50);
    };

    const pause = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
        log(`Progress: Paused at ${progress}%`);
    };

    const reset = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
        setProgress(0);
        log('Progress: Reset to 0%');
    };

    useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    return (
        <section style={sectionStyle} data-testid="progress-section">
            <div style={sectionHeader}>
                <h2 className="h2">6. Progress Bar</h2>
                <div style={badge('#10b981')}>Animated Assert</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Start, pause, and reset a progress bar. Assert the percentage value.
            </p>
            <div style={{ marginBottom: '16px' }}>
                <div data-testid="progress-track" style={{
                    width: '100%', height: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '99px', overflow: 'hidden',
                }}>
                    <div data-testid="progress-fill" style={{
                        height: '100%', width: `${progress}%`,
                        background: progress >= 100
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                            : 'linear-gradient(90deg, var(--accent-primary), var(--accent-hover))',
                        borderRadius: '99px',
                        transition: 'width 0.05s linear',
                    }} />
                </div>
                <div data-testid="progress-value" style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {progress}%
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button data-testid="progress-start" onClick={start} disabled={running} style={{ ...miniBtn, opacity: running ? 0.5 : 1 }}>Start</button>
                <button data-testid="progress-pause" onClick={pause} disabled={!running} style={{ ...miniBtn, opacity: !running ? 0.5 : 1 }}>Pause</button>
                <button data-testid="progress-reset" onClick={reset} style={miniBtn}>Reset</button>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Drawing Canvas
// ─────────────────────────────────────────────────────────────────────────────
function DrawingCanvas({ log }: { log: (msg: string) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const [strokeColor, setStrokeColor] = useState('#6366f1');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [strokeCount, setStrokeCount] = useState(0);

    const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvasRef.current!.width / rect.width),
            y: (e.clientY - rect.top) * (canvasRef.current!.height / rect.height),
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        drawing.current = true;
        const ctx = getCtx();
        if (!ctx) return;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        log(`Canvas: Started drawing at (${Math.round(pos.x)}, ${Math.round(pos.y)})`);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing.current) return;
        const ctx = getCtx();
        if (!ctx) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const handleMouseUp = () => {
        if (drawing.current) {
            drawing.current = false;
            setStrokeCount(c => c + 1);
            log(`Canvas: Finished stroke #${strokeCount + 1}`);
        }
    };

    const clearCanvas = () => {
        const ctx = getCtx();
        if (!ctx || !canvasRef.current) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setStrokeCount(0);
        log('Canvas: Cleared');
    };

    const colors = ['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#0ea5e9', '#1a1a1a'];

    return (
        <section style={sectionStyle} data-testid="drawing-section">
            <div style={sectionHeader}>
                <h2 className="h2">7. Drawing Canvas</h2>
                <div style={badge('#6366f1')}>Canvas Draw</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Click and drag to draw on the canvas. Tests mouse coordinate accuracy on &lt;canvas&gt; elements.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)' }}>Color:</span>
                {colors.map(c => (
                    <button
                        key={c}
                        data-testid={`canvas-color-${c.replace('#', '')}`}
                        onClick={() => { setStrokeColor(c); log(`Canvas: Color set to ${c}`); }}
                        style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: c, border: 'none', cursor: 'pointer',
                            boxShadow: strokeColor === c ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${c}` : 'none',
                        }}
                    />
                ))}
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginLeft: '12px' }}>Size:</span>
                <select
                    data-testid="canvas-stroke-width"
                    value={strokeWidth}
                    onChange={(e) => { setStrokeWidth(Number(e.target.value)); log(`Canvas: Stroke width set to ${e.target.value}`); }}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                    <option value={1}>Thin (1px)</option>
                    <option value={3}>Medium (3px)</option>
                    <option value={6}>Thick (6px)</option>
                    <option value={12}>Bold (12px)</option>
                </select>
                <button data-testid="canvas-clear" onClick={clearCanvas} style={{ ...miniBtn, marginLeft: 'auto' }}>Clear Canvas</button>
            </div>
            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                data-testid="drawing-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    width: '100%', height: '300px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '14px',
                    cursor: 'crosshair',
                    border: '1px solid var(--border-light)',
                    display: 'block',
                }}
            />
            <div data-testid="canvas-stroke-count" style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Strokes drawn: {strokeCount}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Zoom & Pan Canvas
// ─────────────────────────────────────────────────────────────────────────────
function ZoomPanCanvas({ log }: { log: (msg: string) => void }) {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const panning = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const next = Math.max(0.5, Math.min(3, scale + delta));
        setScale(next);
        log(`Zoom: ${Math.round(next * 100)}%`);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        panning.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!panning.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        setOffset(o => ({ x: o.x + dx, y: o.y + dy }));
    };

    const handleMouseUp = () => {
        if (panning.current) {
            panning.current = false;
            log(`Pan: Offset (${Math.round(offset.x)}, ${Math.round(offset.y)})`);
        }
    };

    const resetView = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
        log('Zoom/Pan: Reset to default');
    };

    const zoomIn = () => {
        const n = Math.min(3, scale + 0.25);
        setScale(n);
        log(`Zoom: ${Math.round(n * 100)}%`);
    };
    const zoomOut = () => {
        const n = Math.max(0.5, scale - 0.25);
        setScale(n);
        log(`Zoom: ${Math.round(n * 100)}%`);
    };

    return (
        <section style={sectionStyle} data-testid="zoom-pan-section">
            <div style={sectionHeader}>
                <h2 className="h2">8. Zoom & Pan</h2>
                <div style={badge('#ec4899')}>Scroll + Drag</div>
            </div>
            <p className="body-sm" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Scroll to zoom, click & drag to pan. Use buttons for precise zoom control.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
                <button data-testid="zoom-out" onClick={zoomOut} style={miniBtn}>- Zoom Out</button>
                <span data-testid="zoom-level" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '50px', textAlign: 'center' }}>
                    {Math.round(scale * 100)}%
                </span>
                <button data-testid="zoom-in" onClick={zoomIn} style={miniBtn}>+ Zoom In</button>
                <button data-testid="zoom-reset" onClick={resetView} style={{ ...miniBtn, marginLeft: 'auto' }}>Reset View</button>
            </div>
            <div
                ref={containerRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                data-testid="zoom-pan-area"
                style={{
                    width: '100%', height: '350px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: panning.current ? 'grabbing' : 'grab',
                    border: '1px solid var(--border-light)',
                    position: 'relative',
                }}
            >
                <div style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: panning.current ? 'none' : 'transform 0.15s',
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                }}>
                    {/* Sample content to zoom/pan */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            { label: 'Revenue', value: '$84,200', color: '#22c55e' },
                            { label: 'Users', value: '12,400', color: '#6366f1' },
                            { label: 'Orders', value: '1,890', color: '#f59e0b' },
                            { label: 'Growth', value: '+23%', color: '#0ea5e9' },
                            { label: 'Churn', value: '2.1%', color: '#ef4444' },
                            { label: 'NPS', value: '72', color: '#8b5cf6' },
                        ].map(item => (
                            <div key={item.label} style={{
                                width: '120px', padding: '20px',
                                background: 'var(--bg-card)',
                                borderRadius: '14px',
                                textAlign: 'center',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-light)',
                            }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: item.color }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Side Navigation (hidden on mobile via .side-nav-container)
// ─────────────────────────────────────────────────────────────────────────────
function CanvasSideNav() {
    const navRef = useRef<HTMLDivElement>(null);
    const sections = [
        { id: 'section-sortable', label: 'Sortable' },
        { id: 'section-kanban', label: 'Kanban' },
        { id: 'section-slider', label: 'Slider' },
        { id: 'section-resize', label: 'Resize' },
        { id: 'section-visual', label: 'Visual' },
        { id: 'section-progress', label: 'Progress' },
        { id: 'section-drawing', label: 'Drawing' },
        { id: 'section-zoom', label: 'Zoom & Pan' },
    ];

    const scrollTo = (id: string) => {
        const root = navRef.current?.getRootNode() as Document | ShadowRoot;
        let target = root?.getElementById?.(id);
        if (!target) target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div ref={navRef} className="fade-in side-nav-container" style={{
            position: 'fixed', left: '1.875rem', top: '8rem',
            display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 100,
        }}>
            <div style={{
                fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-tertiary)',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                marginBottom: '-0.5rem', marginLeft: '0.375rem',
            }}>
                Navigation
            </div>
            {sections.map(item => (
                <div
                    key={item.id}
                    className="nav-dot-wrapper"
                    onClick={() => scrollTo(item.id)}
                    style={{
                        position: 'relative', display: 'flex', alignItems: 'center',
                        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    <div className="nav-label" style={{
                        position: 'absolute', left: '1.75rem',
                        background: 'var(--bg-card)', padding: '0.375rem 0.875rem',
                        borderRadius: '1.25rem', border: '1px solid var(--border-light)',
                        fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.05em', whiteSpace: 'nowrap', opacity: 0.8,
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)',
                    }}>
                        {item.label}
                    </div>
                    <div className="nav-dot" style={{
                        width: '0.75rem', height: '0.75rem', borderRadius: '50%',
                        background: 'var(--text-tertiary)',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        opacity: 0.6, zIndex: 2, border: '2px solid transparent',
                    }} />
                    <div className="nav-halo" style={{
                        position: 'absolute', left: '0.375rem', top: '50%',
                        transform: 'translate(-50%, -50%) scale(0)',
                        width: '2rem', height: '2rem', borderRadius: '50%',
                        background: 'var(--accent-primary)', opacity: 0,
                        filter: 'blur(0.5rem)',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 1,
                    }} />
                    <style jsx>{`
                        .nav-dot-wrapper:hover { transform: scale(1.05) !important; }
                        .nav-dot-wrapper:hover .nav-dot {
                            background: #fff; border-color: var(--accent-primary);
                            box-shadow: 0 0 15px var(--accent-primary), inset 0 0 5px var(--accent-primary);
                            opacity: 1;
                        }
                        .nav-dot-wrapper:hover .nav-halo { transform: translate(-50%, -50%) scale(1.2); opacity: 0.25; }
                        .nav-dot-wrapper:hover .nav-label { color: var(--text-primary); border-color: var(--accent-primary); opacity: 1; }
                    `}</style>
                </div>
            ))}
        </div>
    );
}
