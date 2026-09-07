import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "College Services",
  description:
    "Find and offer useful services within your college campus on Uniside.",
  openGraph: {
    title: "College Services | Uniside",
    description:
      "Find and offer useful services within your college campus on Uniside.",
    type: "website",
    url: "/services",
  },
  twitter: {
    card: "summary",
    title: "College Services | Uniside",
    description:
      "Find and offer useful services within your college campus on Uniside.",
  },
};

export default function ServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}