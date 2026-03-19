import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Artist Official - Editorial Archive",
  description: "Official band introduction homepage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${beVietnamPro.variable} antialiased`}>{children}</body>
    </html>
  );
}
