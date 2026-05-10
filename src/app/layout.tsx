import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/frontend/components/Navbar";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Traveloop - Your Ultimate Trip Planner",
  description: "Plan, manage, and share multi-city travel itineraries with Traveloop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased`}>
        <div className="noise" />
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
