import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Darna for commerce — L'Artisanat Algérien, Fait avec le Cœur",
  description: "Découvrez les plus beaux produits artisanaux d'Algérie. Cuir, textiles, bijoux, luminaires — chaque pièce raconte l'histoire de nos mains. Livraison partout en Algérie.",
  keywords: ["Darna", "artisanat", "Algérie", "artisanal", "cuir", "kabylie", "tlemcen", "amazigh", "babouches", "bijoux"],
  authors: [{ name: "Darna for commerce" }],
  openGraph: {
    title: "Darna — L'Artisanat Algérien",
    description: "Des produits faits main par les meilleurs artisans d'Algérie",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
