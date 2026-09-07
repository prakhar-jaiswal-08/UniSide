import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "College Marketplace",
  description:
    "Buy and sell products within your college campus on Uniside.",
  openGraph: {
    title: "College Marketplace | Uniside",
    description:
      "Buy and sell products within your college campus on Uniside.",
    type: "website",
    url: "/products",
  },
  twitter: {
    card: "summary",
    title: "College Marketplace | Uniside",
    description:
      "Buy and sell products within your college campus on Uniside.",
  },
};

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}