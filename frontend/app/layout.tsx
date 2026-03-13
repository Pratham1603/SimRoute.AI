import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FullPageVideoBackground from "@/components/full-page-video-background";
import TechBackgroundEffects from "@/components/tech-background-effects";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SimRouteAI",
  description:
    "AI-powered semantic segmentation platform for desert terrain classification. Built for the Duality AI Hackathon.",
  icons: {
    icon: "/simroute-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans min-h-screen bg-slate-950">
        {children}
      </body>
    </html>
  );
}
