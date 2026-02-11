import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TODO List",
  description: "A simple TODO list application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
