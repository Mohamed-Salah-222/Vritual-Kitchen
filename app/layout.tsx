import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Playpen_Sans, Comfortaa } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { auth } from "@clerk/nextjs/server";

const playpenSans = Playpen_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-playpen",
});

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-comfortaa",
});

export const metadata: Metadata = {
  title: "Virtual Kitchen",
  description: "AI-powered food recommender",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${playpenSans.variable} ${comfortaa.variable}`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
