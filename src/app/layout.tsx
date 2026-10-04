import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/components/telemetry-provider";
import { AmbientMusic } from "@/components/ambient-music";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "NOVA · Deep Space Mission Command",
  description:
    "Navigate the unknown, catalog new worlds, and expand the boundaries of human presence. Live fleet telemetry, mission dispatch and stellar cartography.",
};

export const viewport: Viewport = {
  themeColor: "#04060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <AmbientMusic>
          <TelemetryProvider>{children}</TelemetryProvider>
        </AmbientMusic>
      </body>
    </html>
  );
}
