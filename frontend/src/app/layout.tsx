
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TritonGuard — GPU Memory Verification",
  description:
    "Inspect GPU memory conflicts, generate swizzled layouts, and verify kernel performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-gpu-bg">{children}</body>
    </html>
  );
}
