import type { Metadata } from "next";
import { Geist_Mono, Lexend, Fraunces } from "next/font/google";
import "./globals.css";

// Body: Lexend — diseñada específicamente para mejorar la legibilidad
// en lectores jóvenes y personas con dislexia (audiencia 9-10 años).
const lexend = Lexend({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// Headings: Fraunces — serif amigable con personalidad, alejada del look "SaaS".
const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barkley — El Colegio Online de Chile",
  description:
    "Educacion online adaptativa desde 5to basico a 4to medio. 60% mas economico, validado por Examenes Libres MINEDUC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CL"
      className={`${lexend.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--paper)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
