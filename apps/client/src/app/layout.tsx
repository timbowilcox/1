import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import QCProvider from "@/components/providers/QueryClient";
import { UserDTO } from "@/auth/auth.dto";
import InitUserState from "@/components/providers/InitUserState";
import { meServer } from "./actions/auth";
import ErrorToast from "@/components/ui/ErrorToast";
import SuccessToast from "@/components/ui/SuccessToast";
import { env } from "@/lib/env";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: "RealStyler - AI Interior Design",
  description: "Transform your space with AI-powered interior design.",
  openGraph: {
    title: "RealStyler - AI Interior Design",
    description: "Transform your space with AI-powered interior design.",
    type: "website",
    siteName: "RealStyler",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user: UserDTO | null | undefined = undefined;
  try {
    user = await meServer();
  } catch {}

  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <InitUserState user={user ?? null}>
          <QCProvider>
            {children}
          </QCProvider>
        </InitUserState>
        <ErrorToast />
        <SuccessToast />
      </body>
    </html>
  );
}