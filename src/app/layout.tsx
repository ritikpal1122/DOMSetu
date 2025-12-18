import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import ComplexityWrapper from "@/components/ComplexityWrapper";
import ActivityCapsule from "@/components/ActivityCapsule";

export const metadata: Metadata = {
    title: "DOMSetu",
    description: "Advanced playground for testing Kane AI capabilities",
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
