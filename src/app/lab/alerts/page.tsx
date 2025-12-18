"use client";

import React, { useState, useEffect } from "react";
import { useActivity } from "@/context/ActivityContext";

export default function AlertsPage() {
    const { logAction, clearActivity } = useActivity();

    // Clear activity on mount
    useEffect(() => {
        clearActivity();
    }, []);

    // State for Custom Modals
    const [showModal, setShowModal] = useState(false);
    const [showBlockingModal, setShowBlockingModal] = useState(false);
    const [delayedModalVisible, setDelayedModalVisible] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // State for Toasts
    const [toasts, setToasts] = useState<{ id: number, type: 'success' | 'error' | 'info', msg: string }[]>([]);

    // -------------------------------------------------------------------------
    // System Alerts Handlers
    // -------------------------------------------------------------------------
    const handleSystemAlert = () => {
        logAction("Triggered System Alert", "Alerts");
        window.alert("This is a system alert! It blocks the thread.");
        logAction("System Alert Closed", "Alerts");
    };

    const handleSystemConfirm = () => {
        logAction("Triggered System Confirm", "Alerts");
        const result = window.confirm("Do you want to proceed?");
        logAction(`System Confirm Result: ${result ? "OK" : "Cancel"}`, "Alerts");
        addToast(result ? "success" : "info", `You clicked: ${result ? "OK" : "Cancel"}`);
    };

    const handleSystemPrompt = () => {
        logAction("Triggered System Prompt", "Alerts");
        const result = window.prompt("Please enter your name:", "Guest");
        logAction(`System Prompt Result: "${result}"`, "Alerts");
        if (result !== null) {
            addToast("success", `Hello, ${result}!`);
        } else {
            addToast("info", "Prompt Cancelled");
        }
    };

    // -------------------------------------------------------------------------
    // Delayed Modal Logic
    // -------------------------------------------------------------------------
    const startDelayedModal = () => {
        if (countdown > 0) return; // Prevent double click
        logAction("Started 3s Timer for Modal", "Alerts");
        setCountdown(3);

        let count = 3;
        const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(interval);
                setDelayedModalVisible(true);
                logAction("Delayed Modal Appeared", "Alerts");
            }
        }, 1000);
    };

    // -------------------------------------------------------------------------
    // Toast Logic
    // -------------------------------------------------------------------------
    const addToast = (type: 'success' | 'error' | 'info', msg: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, msg }]);
        logAction(`Toast Shown: [${type}] ${msg}`, "Alerts");

        // Auto remove after 3s
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <div className="container fade-in" style={{ padding: "60px 40px", maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ marginBottom: 60, textAlign: 'center' }}>
                <h1 className="h1" style={{ marginBottom: 16 }}>Alerts & Modals</h1>
                <p className="body-sm" style={{ maxWidth: 600, margin: '0 auto', fontSize: '16px' }}>
                    Test automation handling for system dialogs, overlays, blocking popups, and ephemeral notifications.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '60px' }}>

                {/* 1. System Dialogs */}
                <section style={styles.section}>
                    <div style={styles.header}>
                        <h2 className="h2">1. System Dialogs</h2>
                        <span style={styles.badge}>Blocking</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                        These are native browser blocking events. Automation tools must handle these specifically using dialog listeners.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                        <button style={styles.btnSecondary} onClick={handleSystemAlert}>
                            window.alert()
                        </button>
                        <button style={styles.btnSecondary} onClick={handleSystemConfirm}>
                            window.confirm()
                        </button>
                        <button style={styles.btnSecondary} onClick={handleSystemPrompt}>
                            window.prompt()
                        </button>
                    </div>
                </section>

                {/* 2. Custom Modals */}
                <section style={styles.section}>
                    <div style={styles.header}>
                        <h2 className="h2">2. Custom Modals</h2>
                        <span style={styles.badge}>Overlays</span>
                    </div>
                    <div style={{ display: 'grid', gap: 24 }}>
                        {/* Standard */}
                        <div style={styles.row}>
                            <div>
                                <h3 className="h3" style={{ fontSize: '16px', marginBottom: 4 }}>Standard Modal</h3>
                                <p style={styles.subtext}>Can be closed by clicking backdrop, or ESC.</p>
                            </div>
                            <button style={styles.btnPrimary} onClick={() => {
                                setShowModal(true);
                                logAction("Opened Standard Modal", "Alerts");
                            }}>Open Modal</button>
                        </div>

                        {/* Delayed */}
                        <div style={styles.row}>
                            <div>
                                <h3 className="h3" style={{ fontSize: '16px', marginBottom: 4 }}>Delayed Modal</h3>
                                <p style={styles.subtext}>Appears after 3 seconds. Tests explicit waits.</p>
                            </div>
                            <button
                                style={{ ...styles.btnPrimary, background: countdown > 0 ? 'var(--text-tertiary)' : 'var(--accent-primary)' }}
                                disabled={countdown > 0}
                                onClick={startDelayedModal}
                            >
                                {countdown > 0 ? `Wait ${countdown}s...` : 'Start Timer'}
                            </button>
                        </div>

                        {/* Blocking */}
                        <div style={styles.row}>
                            <div>
                                <h3 className="h3" style={{ fontSize: '16px', marginBottom: 4 }}>Blocking Modal</h3>
                                <p style={styles.subtext}>Backdrop click ignored. Must click "Close".</p>
                            </div>
                            <button style={{ ...styles.btnPrimary, background: 'var(--error)' }} onClick={() => {
                                setShowBlockingModal(true);
                                logAction("Opened Blocking Modal", "Alerts");
                            }}>Open Blocking</button>
                        </div>
                    </div>
                </section>

                {/* 3. Toast Notifications */}
                <section style={styles.section}>
                    <div style={styles.header}>
                        <h2 className="h2">3. Toasts</h2>
                        <span style={styles.badge}>Ephemeral</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                        Non-blocking notifications that disappear automatically. Setup DOM observers to catch these.
                    </p>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <button style={{ ...styles.btnToast, borderColor: 'var(--success)', color: 'var(--success)' }}
                            onClick={() => addToast('success', 'Operation completed successfully!')}>
                            Show Success
                        </button>
                        <button style={{ ...styles.btnToast, borderColor: 'var(--error)', color: 'var(--error)' }}
                            onClick={() => addToast('error', 'Critical system failure simulated.')}>
                            Show Error
                        </button>
                        <button style={{ ...styles.btnToast, borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                            onClick={() => addToast('info', 'New update available.')}>
                            Show Info
                        </button>
                    </div>
                </section>
            </div>

            {/* ----------------- RENDERED MODALS ----------------- */}

            {/* Standard Modal */}
            {showModal && (
                <div className="modal-backdrop fade-in" style={styles.backdrop} onClick={() => { setShowModal(false); logAction("Closed Modal (Backdrop)", "Alerts"); }}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className="h3" style={{ marginBottom: 12 }}>Standard Modal</h3>
                        <p style={styles.subtext}>This is a simple overlay div.</p>
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={styles.btnSecondary} onClick={() => { setShowModal(false); logAction("Closed Modal (Button)", "Alerts"); }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delayed Modal */}
            {delayedModalVisible && (
                <div className="modal-backdrop fade-in" style={styles.backdrop} onClick={() => { setDelayedModalVisible(false); logAction("Closed Delayed Modal", "Alerts"); }}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className="h3" style={{ marginBottom: 12 }}>Surprise! 🎉</h3>
                        <p style={styles.subtext}>This modal appeared after a delay.</p>
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                            <button style={styles.btnPrimary} onClick={() => { setDelayedModalVisible(false); logAction("Ack Delayed Modal", "Alerts"); }}>Got it</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Blocking Modal */}
            {showBlockingModal && (
                <div className="modal-backdrop fade-in" style={{ ...styles.backdrop, background: 'rgba(0,0,0,0.85)' }}>
                    <div style={{ ...styles.modalContent, border: '1px solid var(--error)' }}>
                        <h3 className="h3" style={{ marginBottom: 12, color: 'var(--error)' }}>Action Required</h3>
                        <p style={styles.subtext}>You cannot dismiss this by clicking outside.</p>
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button style={styles.btnSecondary} onClick={() => { setShowBlockingModal(false); logAction("Closed Blocking Modal", "Alerts"); }}>I Understand</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Container */}
            <div style={{ position: 'fixed', top: '64px', marginTop: 12, right: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, zIndex: 2147483647 }}>
                {toasts.map(toast => (
                    <div key={toast.id} className="fade-in" style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--error)' : 'var(--accent-primary)'}`,
                        padding: '16px 24px',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-lg)',
                        minWidth: '280px',
                        display: 'flex', alignItems: 'center', gap: 12
                    }}>
                        <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{toast.msg}</span>
                    </div>
                ))}
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
        overflow: "hidden",
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
        borderBottom: '1px solid var(--border-light)', paddingBottom: 16
    },
    badge: {
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
        background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-secondary)'
    },
    row: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px'
    },
    btnPrimary: {
        background: 'var(--accent-primary)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: '0.2s'
    },
    btnSecondary: {
        background: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: '1px solid var(--border-strong)', transition: '0.2s'
    },
    btnToast: {
        background: 'transparent', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: '1px solid', flex: 1, transition: '0.2s'
    },
    subtext: {
        fontSize: '13px', color: 'var(--text-secondary)'
    },
    backdrop: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    modalContent: {
        background: 'var(--bg-card)', padding: '32px', borderRadius: '16px',
        maxWidth: '400px', width: '90%',
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)'
    }
};
