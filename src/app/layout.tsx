import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { UserProvider } from "@/context/user-context";
=======
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PowerCA - Practice Management Software for Chartered Accountants",
  description: "Simplify your practice, amplify your growth. The all-in-one practice management software designed for Chartered Accountants. Save 10+ hours weekly, ensure 100% compliance.",
  keywords: "CA practice management, chartered accountant software, tax compliance software, accounting software India, CA firm management",
  openGraph: {
    title: "PowerCA - Practice Management Software for CAs",
    description: "Transform your CA practice with PowerCA. Save time, ensure compliance, and grow your firm.",
    url: "https://powerca.in",
    siteName: "PowerCA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SessionProvider>
<<<<<<< HEAD
          <UserProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster />
          </UserProvider>
=======
          <Header />
          <main className="min-h-screen pt-16 lg:pt-20">
            {children}
          </main>
          <Footer />
          <Toaster />
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        </SessionProvider>
      </body>
    </html>
  );
}
