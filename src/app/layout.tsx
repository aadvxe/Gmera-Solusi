import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Sistem Informasi Keuangan - PT GMera Solusi",
  description: "Dashboard Sistem Informasi Keuangan PT GMera Solusi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.className} ${poppins.variable} antialiased bg-background text-text-primary`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
