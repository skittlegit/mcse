import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { AuthProvider } from "@/lib/AuthContext";
import { TradingProvider } from "@/lib/TradingContext";
import { AdminProvider } from "@/lib/AdminContext";
import { PreferencesProvider } from "@/lib/PreferencesContext";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MCSE — Math Club Stock Exchange",
  description: "Mock Capital Stock Exchange trading dashboard",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-bg text-white" style={{ overflowX: 'clip' }}>
        <PreferencesProvider>
          <AuthProvider>
            <TradingProvider>
              <AdminProvider>
                <AppShell>{children}</AppShell>
              </AdminProvider>
            </TradingProvider>
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}