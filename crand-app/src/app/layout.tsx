import type { Metadata } from "next";
import "@fontsource/geist";
import "@fontsource/geist-mono";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SDM Ibnu Syam",
  description: "Aplikasi Manajemen Pesantren Ibnu Syam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
