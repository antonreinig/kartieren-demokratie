import type { Metadata } from "next";
import { Inter, Gochi_Hand } from "next/font/google"; // Using Inter as requested/available
import "./globals.css";
import { Providers } from "@/components/providers";

// Mapping Inter to the variable expected by globals.css/Tailwind
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans", // Aliasing Inter as the primary sans font
});

const gochiHand = Gochi_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-gochi-hand",
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
      <body className={`${inter.variable} ${gochiHand.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
