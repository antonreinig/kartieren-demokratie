import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested/available
import "./globals.css";
import { Providers } from "@/components/providers";

// Mapping Inter to the variable expected by globals.css/Tailwind
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans", // Aliasing Inter as the primary sans font
});

export const metadata: Metadata = {
  title: "Kartieren Demokratie",
  description: "Werkstatt der Verbundenen Demokratie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
