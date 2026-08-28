import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKITECH OS",
  description: "SKITECH Personal Operating System",
  openGraph: {
    title: "SKITECH OS",
    url: "https://lskitechl.github.io",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
