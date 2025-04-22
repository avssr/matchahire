import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/client/layout/Header";
import { Footer } from "@/components/client/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from '@/components/ui/toaster';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: 'swap',
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "MatchaHire - AI-Powered Hiring Platform",
    template: "%s | MatchaHire"
  },
  description: "Connect with top tech companies through AI-powered role personas. Experience a revolutionary way to find your next career opportunity.",
  keywords: ["hiring", "recruitment", "AI", "tech jobs", "career", "employment"],
  authors: [{ name: "MatchaHire Team" }],
  creator: "MatchaHire",
  publisher: "MatchaHire",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://matchahire.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://matchahire.com',
    title: 'MatchaHire - AI-Powered Hiring Platform',
    description: 'Connect with top tech companies through AI-powered role personas',
    siteName: 'MatchaHire',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MatchaHire - AI-Powered Hiring Platform',
    description: 'Connect with top tech companies through AI-powered role personas',
    creator: '@matchahire',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
