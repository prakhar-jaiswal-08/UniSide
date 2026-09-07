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
  metadataBase: new URL("https://uniside.in"),

  title: {
    default: "Uniside — College Marketplace",
    template: "%s | Uniside",
  },

  description:
    "Buy, sell, find services, roommates, and connect with students on your college campus.",

  applicationName: "Uniside",

  keywords: [
    "college marketplace",
    "campus marketplace",
    "student marketplace",
    "college students",
    "buy and sell college",
    "college services",
    "student roommates",
    "campus community",
  ],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    siteName: "Uniside",
    title: "Uniside — College Marketplace",
    description:
      "Buy, sell, find services, roommates, and connect with students on your college campus.",
    url: "https://uniside.in",
  },

  twitter: {
    card: "summary",
    title: "Uniside — College Marketplace",
    description:
      "Buy, sell, find services, roommates, and connect with students on your college campus.",
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