"use client";

import React, { useEffect, useRef } from "react";
import { useActivity } from "@/context/ActivityContext";

interface LogViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LogViewerModal({ isOpen, onClose }: LogViewerModalProps) {
    const { getHistory, clearActivity } = useActivity();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const logs = getHistory();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            // Check if already open to avoid redundant calls
            if (!dialog.open) dialog.showModal();
            document.body.style.overflow = 'hidden';
        } else {
            dialog.close();
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClick={handleBackdropClick}
            data-testid="log-viewer-modal"
            style={styles.dialog}
        >
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Interaction History</h2>
                    <p style={styles.subtitle}>Audit trail of all recent events</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => clearActivity()}
                        style={styles.btnSecondary}
                        data-testid="clear-logs-btn"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        style={styles.closeBtn}
                        data-testid="close-logs-btn"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>

            <div style={styles.tableWrapper} className="custom-scrollbar">
                <table style={styles.table} data-testid="log-table">
                    <thead>
                        <tr>
                            <th style={styles.th}>Serial</th>
                            <th style={styles.th}>Event Message</th>
                            <th style={styles.th}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody data-testid="log-table-body">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={styles.emptyState}>No activities recorded yet.</td>
                            </tr>
                        ) : (
                            logs.slice().reverse().map((log) => (
                                <tr key={log.serial} style={styles.tr} data-testid={`log-row-${log.serial}`}>
                                    <td style={styles.td} data-testid="log-serial">{log.serial}</td>
                                    <td style={styles.td} data-testid="log-message">
                                        <code style={styles.code}>{log.message}</code>
                                    </td>
                                    <td style={{ ...styles.td, ...styles.timeCell }} data-testid="log-timestamp">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                dialog::backdrop {
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(8px);
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border-light);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--text-tertiary);
                }
            `}</style>
        </dialog>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    dialog: {
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        padding: '32px',
        borderRadius: '24px',
        border: '1px solid var(--border-light)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-lg)',
        outline: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        margin: 'auto', // Center centering
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexShrink: 0,
    },
    title: {
        fontSize: '24px',
        fontWeight: 700,
        margin: 0,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        margin: '4px 0 0 0',
    },
    closeBtn: {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        transition: 'all 0.2s',
    },
    btnSecondary: {
        fontSize: '13px',
        fontWeight: 600,
        padding: '0 16px',
        height: '40px',
        background: 'transparent',
        border: '1px solid var(--border-light)',
        borderRadius: '12px',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        transition: 'all 0.2s',
    },
    tableWrapper: {
        overflowY: 'auto',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        background: 'var(--bg-app)',
        flex: 1, // Fill available space
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '14px',
    },
    th: {
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        color: 'var(--text-secondary)',
        fontWeight: 600,
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    td: {
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-light)',
        color: 'var(--text-primary)',
    },
    tr: {
        transition: 'background 0.1s',
    },
    code: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '13px',
        color: 'var(--accent-primary)',
        background: 'var(--accent-surface)',
        padding: '2px 6px',
        borderRadius: '4px',
    },
    timeCell: {
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--text-tertiary)',
        fontSize: '13px',
    },
    emptyState: {
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontStyle: 'italic',
    },
};
