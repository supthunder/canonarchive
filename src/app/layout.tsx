import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canon Archive - Canon Camera Archive",
  description: "Discover 908+ Canon cameras with intelligent search and filtering. Find cameras by megapixels, sensor type, era, and more features.",
  keywords: ["Canon", "cameras", "photography", "vintage cameras", "camera specs", "megapixels", "sensor", "CCD", "CMOS"],
  authors: [{ name: "Canon Archive" }],
  creator: "Canon Archive",
  publisher: "Canon Archive",
  
  // Open Graph metadata
  openGraph: {
    title: "Canon Archive - Canon Camera Archive",
    description: "Discover 908+ Canon cameras with intelligent search and filtering. Find cameras by megapixels, sensor type, era, and more features.",
    url: "https://canonarchive.vercel.app",
    siteName: "Canon Archive",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Canon Archive - Canon Camera Archive",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Canon Archive - Canon Camera Archive",
    description: "Discover 908+ Canon cameras with intelligent search and filtering.",
    images: ["/api/og"],
    creator: "@canonarchive",
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification and other meta
  verification: {
    google: "your-google-verification-code", // Replace with actual code
  },
  
  // Canonical URL
  alternates: {
    canonical: "https://canonarchive.vercel.app",
  },
  
  // App info
  applicationName: "Canon Archive",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  
  // Theme and viewport
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  
  // Additional structured data hints
  other: {
    "og:image:alt": "Canon Archive - Search results showing vintage and modern Canon cameras",
    "og:site_name": "Canon Archive",
    "article:author": "Canon Archive Team",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Comprehensive Favicon Setup - Beautiful Camera Icon */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="android-chrome" href="/android-chrome-192x192.png" sizes="192x192" />
        <link rel="android-chrome" href="/android-chrome-512x512.png" sizes="512x512" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/_next/static/media/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Allow OG image generation endpoint */}
        <meta name="robots" content="index, follow" />
        
        {/* Schema.org structured data for better search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Canon Archive",
              "description": "Canon camera archive platform for Canon cameras",
              "url": "https://canonarchive.vercel.app",
              "applicationCategory": "Photography",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Canon Archive"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
