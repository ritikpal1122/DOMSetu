import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import ComplexityWrapper from "@/components/ComplexityWrapper";
import ActivityCapsule from "@/components/ActivityCapsule";

export const metadata: Metadata = {
    title: "DOMSetu | Advanced Automation Playground",
    description: "An elite playground for testing Kane AI and automation frameworks against complex DOM architectures like Shadow DOM and multi-level iFrames.",
    keywords: ["Automation", "Kane AI", "Shadow DOM", "iFrame", "Testing", "Playground", "DOMSetu"],
    openGraph: {
        title: "DOMSetu | Elite Automation Lab",
        description: "Test Kane AI against next-gen DOM architectures in a high-density simulator.",
        url: "https://domsetu.app",
        siteName: "DOMSetu",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "DOMSetu Advanced Automation Playground",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "DOMSetu | Advanced Automation Lab",
        description: "The ultimate stress-test for AI automation agents.",
        images: ["/og-image.png"],
    },
    viewport: "width=device-width, initial-scale=1, maximum-scale=5",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    ],
};

import MouseGlow from "@/components/MouseGlow";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var theme = localTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
                    }}
                />
                <Providers>
                    <MouseGlow />
                    <Header />
                    <ComplexityWrapper>
                        {children}
                    </ComplexityWrapper>
                    <ActivityCapsule />
                </Providers>
            </body>
        </html>
    );
}
