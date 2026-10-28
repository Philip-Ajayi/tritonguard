import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TritonGuard | Autonomous GPU Kernel Memory Verifier",
  description: "Static GPU memory invariant proof and automated memory swizzling synthesis.",
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
