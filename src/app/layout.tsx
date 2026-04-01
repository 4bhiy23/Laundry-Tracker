import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Laundry Tracker",
  description: "Track your clothes between wardrobe and laundry with ease",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#13131f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#2a2a3e",
                color: "#e2e2f0",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.75rem",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#6366f1", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
