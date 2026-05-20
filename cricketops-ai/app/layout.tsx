import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import LiveMatchBanner from "@/components/layout/LiveMatchBanner";

export const metadata: Metadata = {
  title: "CricketOps AI — IPL AI Agent Dashboard",
  description: "Real-time AI operations dashboard for IPL cricket content generation with four specialized AI agents.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏏</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground overflow-hidden">
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Area */}
          <div className="flex-1 flex flex-col ml-64 h-screen">
            <TopBar />
            <LiveMatchBanner />
            <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
