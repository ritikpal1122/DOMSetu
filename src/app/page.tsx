"use client";

import React from "react";
import Link from "next/link";
import { useActivity } from "@/context/ActivityContext";

export default function Home() {
  const { logAction } = useActivity();

  const handleCardClick = (name: string) => {
    logAction(`Navigated to ${name}`, "Home");
  };

  return (
    <main className="container" style={{ padding: "40px 24px" }}>
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1 className="h1" style={{ marginBottom: "12px" }}>Automation Scenarios</h1>
        <p className="body-sm" style={{ fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Select a module to test Kane AI capabilities. Switch complexity modes in the header to test against Shadow DOM and iFrames.
        </p>
      </div>

      <div style={styles.grid}>
        <ScenarioCard
          title="Form Components"
          description="Input fields, radios, checkboxes, and complex validation states."
          href="/lab/forms"
          icon={<FormIcon />}
          onClick={() => handleCardClick("Forms")}
        />
        <ScenarioCard
          title="Scroll Dynamics"
          description="Infinite scroll, virtualization, and nested scroll containers."
          href="/lab/scroll"
          icon={<ScrollIcon />}
          onClick={() => handleCardClick("Scroll")}
        />
        <ScenarioCard
          title="CRM Simulator"
          description="High-density data tables, tabs, and enterprise workflows."
          href="/crm/dashboard"
          icon={<ChartIcon />}
          onClick={() => handleCardClick("CRM")}
        />
        <ScenarioCard
          title="Alerts & Modals"
          description="System dialogs, custom toasts, and blocking overlays."
          href="/lab/alerts"
          icon={<AlertIcon />}
          onClick={() => handleCardClick("Alerts")}
        />
        {/* Placeholder for future expansion */}
        <ScenarioCard
          title="Canvas & Vision"
          description="Draggable elements and visual assertion targets."
          href="/lab/canvas"
          icon={<EyeIcon />}
          onClick={() => handleCardClick("Canvas")}
        />
        <ScenarioCard
          title="Dropdowns & Selects"
          description="Custom search-selects, multi-selects, and native dropdowns."
          href="/lab/dropdowns"
          icon={<ListIcon />}
          onClick={() => handleCardClick("Dropdowns")}
        />
        <ScenarioCard
          title="Chrome Prefs Validator"
          description="Validate Chrome browser preference flags for Kane AI automation runs."
          href="/chrome-prefs-validator"
          icon={<ShieldIcon />}
          onClick={() => handleCardClick("ChromePrefs")}
        />
        <ScenarioCard
          title="Login Checker"
          description="Trigger Chrome's save password popup for OpenCV assertion."
          href="/login-checker"
          icon={<LockIcon />}
          onClick={() => handleCardClick("LoginChecker")}
        />
      </div>
    </main>
  );
}

function ScenarioCard({ title, description, href, icon, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} style={styles.card} className="scenario-card">
      <div style={styles.iconWrapper}>{icon}</div>
      <h3 className="h3" style={{ marginBottom: "8px" }}>{title}</h3>
      <p className="body-sm" style={{ lineHeight: 1.5 }}>{description}</p>
    </Link>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "var(--bg-card)",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "var(--shadow-sm)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    border: "1px solid var(--border-light)",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "var(--bg-secondary)",
    color: "var(--accent-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
};

// Simple SVGs
const FormIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h10" /><path d="M7 15h6" /></svg>
);
const ScrollIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 9l4-4 4 4" /><path d="M8 15l4 4 4-4" /></svg>
);
const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
);
const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
const EyeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
);
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
);
const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
