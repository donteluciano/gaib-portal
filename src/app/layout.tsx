import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Herald Capital Partners finds, secures and de-risks powered sites for modular AI inference data centers.";

export const metadata: Metadata = {
  metadataBase: new URL("https://heraldcappartners.com"),
  title: {
    default: "Herald Capital Partners",
    template: "%s | Herald Capital Partners",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Herald Capital Partners",
    title: "Herald Capital Partners",
    description,
    url: "https://heraldcappartners.com",
  },
  icons: {
    icon: "/favicon.svg",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
