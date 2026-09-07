import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Roommates",
  description:
    "Find compatible roommates and shared accommodation within your college community on Uniside.",
  openGraph: {
    title: "Find Roommates | Uniside",
    description:
      "Find compatible roommates and shared accommodation within your college community on Uniside.",
    type: "website",
    url: "/roommates",
  },
  twitter: {
    card: "summary",
    title: "Find Roommates | Uniside",
    description:
      "Find compatible roommates and shared accommodation within your college community on Uniside.",
  },
};

export default function RoommatesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}