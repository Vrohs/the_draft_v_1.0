import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const courierPrime = localFont({
  src: [
    {
      path: "./fonts/CourierPrime-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/CourierPrime-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/CourierPrime-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/CourierPrime-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-courier-prime",
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
