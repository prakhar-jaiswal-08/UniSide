import Navbar from "../component/Navbar";
import { Toaster } from "sonner";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://uniside.vercel.app"),

  verification: {
    google:
      "Hhd8cg_XdZEkSpORWzB43fvR89Qc2qGDPj12lx9lnks",
  },

  title: {
    default: "Uniside — College Marketplace for Students",
    template: "%s | Uniside",
  },

  description:
    "Uniside is a college marketplace where students can buy and sell products, find services and roommates, and connect with their campus community.",

  applicationName: "Uniside",

  keywords: [
    "Uniside",
    "college marketplace",
    "campus marketplace",
    "student marketplace",
    "college students",
    "buy and sell college",
    "college services",
    "student services",
    "student roommates",
    "campus community",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    siteName: "Uniside",
    title: "Uniside — College Marketplace for Students",
    description:
      "Buy and sell products, find services and roommates, and connect with students on your college campus.",
    url: "https://uniside.vercel.app",
  },

  twitter: {
    card: "summary",
    title: "Uniside — College Marketplace for Students",
    description:
      "Buy and sell products, find services and roommates, and connect with students on your college campus.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />

        {children}
      </body>
    </html>
  );
}