import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://olam-2-0.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FlowState - Adaptive Student Workload Management",
    template: "%s | FlowState",
  },
  description: "Your workload shouldn't control your entire day. Decide what matters today based on actual capacity.",
  applicationName: "FlowState",
  authors: [{ name: "FlowState Team", url: siteUrl }],
  creator: "FlowState",
  publisher: "FlowState",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "FlowState - Adaptive Student Workload Management",
    description: "Your workload shouldn't control your entire day. Decide what matters today based on actual capacity.",
    url: siteUrl,
    siteName: "FlowState",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowState - Adaptive Student Workload Management",
    description: "Your workload shouldn't control your entire day. Decide what matters today based on actual capacity.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
