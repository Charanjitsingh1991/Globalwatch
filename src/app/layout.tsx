import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: 'GlobalWatch — Real-Time Global Intelligence Dashboard',
  description:
    'Live global monitoring: conflicts, earthquakes, wildfires, flights, disasters and breaking news — all in one real-time dashboard.',
  keywords: [
    'global intelligence', 'real-time map', 'conflict tracker',
    'earthquake map', 'flight tracker', 'wildfire map',
    'global news', 'geopolitical dashboard', 'situational awareness',
  ],
  openGraph: {
    title: 'GlobalWatch — Real-Time Global Intelligence',
    description: 'Live conflict, earthquake, fire, flight and news monitoring dashboard.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalWatch — Real-Time Global Intelligence',
    description: 'Live global monitoring dashboard.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} bg-background antialiased`}>
        {children}
      </body>
    </html>
  );
}
