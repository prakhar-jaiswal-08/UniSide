import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Feed",
  description:
    "See what's happening around your college, share updates, and connect with students on Uniside.",
  openGraph: {
    title: "Campus Feed | Uniside",
    description:
      "See what's happening around your college, share updates, and connect with students on Uniside.",
    type: "website",
    url: "/feed",
  },
  twitter: {
    card: "summary",
    title: "Campus Feed | Uniside",
    description:
      "See what's happening around your college, share updates, and connect with students on Uniside.",
  },
};

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}