"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useActivity } from "@/context/ActivityContext";
import { usePreservedParams } from "@/hooks/usePreservedParams";

export default function Home() {
  const { logAction, clearActivity } = useActivity();
  const buildHref = usePreservedParams();

  useEffect(() => {
    clearActivity();
    logAction("Page loaded", "Home");
  }, []);

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
          href={buildHref("/lab/forms")}
          icon={<FormIcon />}
          onClick={() => handleCardClick("Forms")}
        />
        <ScenarioCard
          title="Scroll Dynamics"
          description="Infinite scroll, virtualization, and nested scroll containers."
          href={buildHref("/lab/scroll")}
          icon={<ScrollIcon />}
          onClick={() => handleCardClick("Scroll")}
        />
        <ScenarioCard
          title="Alerts & Modals"
          description="System dialogs, custom toasts, and blocking overlays."
          href={buildHref("/lab/alerts")}
          icon={<AlertIcon />}
          onClick={() => handleCardClick("Alerts")}
        />
        {/* Placeholder for future expansion */}
        <ScenarioCard
          title="Canvas & Vision"
          description="Draggable elements and visual assertion targets."
          href={buildHref("/lab/canvas")}
          icon={<EyeIcon />}
          onClick={() => handleCardClick("Canvas")}
        />
        <ScenarioCard
          title="Dropdowns & Selects"
          description="Custom search-selects, multi-selects, and native dropdowns."
          href={buildHref("/lab/dropdowns")}
          icon={<ListIcon />}
          onClick={() => handleCardClick("Dropdowns")}
        />
        <ScenarioCard
          title="Dynamic Elements"
          description="Randomized table cells and list items — test autoheal against shuffled DOM positions."
          href={buildHref("/lab/autoheal")}
          icon={<ShuffleIcon />}
          onClick={() => handleCardClick("Autoheal")}
        />
        <ScenarioCard
          title="Login Checker"
          description="Trigger Chrome's save password popup for OpenCV assertion."
          href={buildHref("/login-checker")}
          icon={<LockIcon />}
          onClick={() => handleCardClick("LoginChecker")}
        />
        <ScenarioCard
          title="E-Commerce Checkout"
          description="Complete checkout flow — product browse, cart, shipping, payment, confirmation."
          href={buildHref("/ecommerce/checkout")}
          icon={<CartIcon />}
          onClick={() => handleCardClick("Ecommerce")}
        />
        <ScenarioCard
          title="Chrome Version Validator"
          description="Mirror chrome://version — validate browser info and command-line flags from automation runs."
          href={buildHref("/chrome-prefs-validator")}
          icon={<ShieldIcon />}
          onClick={() => handleCardClick("ChromePrefs")}
        />
        <ScenarioCard
          title="Device Settings"
          description="Auto-detect device capabilities — GPS, orientation, network, timezone, permissions, and hardware."
          href={buildHref("/device-settings")}
          icon={<DeviceIcon />}
          onClick={() => handleCardClick("DeviceSettings")}
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
const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
);
const ShuffleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></svg>
);
const DeviceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
);
