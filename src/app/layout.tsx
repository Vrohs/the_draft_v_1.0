import type { Metadata } from "next";
import { Courier_Prime } from "next/font/google";
import "./globals.css";

const courierPrime = Courier_Prime({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: "--font-courier-prime",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "The Draft",
  description: "Distraction-free screenwriting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${courierPrime.variable} antialiased bg-cream text-ink font-courier`}
      >
        {children}
      </body>
    </html>
  );
}
