import React from "react";
import Link from "next/link";

export default function Placeholder() {
    return (
        <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
            <h1 className="h1" style={{ marginBottom: "16px" }}>Work in Progress</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
                This module is currently under development. Check back later!
            </p>
            <Link href="/" style={{ color: "var(--accent-blue)", fontWeight: 500 }}>
                &larr; Back to Home
            </Link>
        </div>
    );
}
