import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://data-forge.threemandev.com"),
  title: {
    default: "Data Forge | Premium SQL & Database Manager",
    template: "%s | Data Forge"
  },
  description: "A modern, high-performance database editor for MSSQL, PostgreSQL, and MySQL. Secure, AI-powered, and developer-friendly.",
  keywords: ["SQL Editor", "Database Manager", "MSSQL", "PostgreSQL", "MySQL", "AI SQL Fixer", "DB Forge", "Data Forge"],
  authors: [{ name: "Three Man Dev", url: "https://threemandev.com" }],
  creator: "Three Man Dev",
  publisher: "Three Man Dev",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Data Forge",
  },
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/icon-180.png',
  },
  alternates: {
    canonical: "https://data-forge.threemandev.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://data-forge.threemandev.com",
    title: "Data Forge | Premium SQL & Database Manager",
    description: "Connect, query, and manage your databases with a premium interface. Supports MSSQL, Postgres, and MySQL with AI assistance.",
    siteName: "Data Forge",
    images: [
      {
        url: "/data-forge.png",
        width: 1200,
        height: 630,
        alt: "Data Forge - Premium Database Manager Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Forge | Premium SQL & Database Manager",
    description: "The most beautiful database manager for developers. Connect to MSSQL, Postgres, and MySQL.",
    images: ["/data-forge.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* Theme restore script — must run before paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('forge-theme');
                  if (savedTheme === 'dark') {
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* GEO/AEO/AIO Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Data Forge",
              "operatingSystem": "Windows, macOS, Linux, Web",
              "applicationCategory": "DeveloperApplication",
              "description": "A premium, high-performance database editor for MSSQL, PostgreSQL, and MySQL. Features AI-powered SQL fixing and security-first encryption.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "128"
              },
              "author": {
                "@type": "Organization",
                "name": "Three Man Dev",
                "url": "https://threemandev.com"
              }
            })
          }}
        />
        {/* PWA */}
        <meta name="theme-color" content="#0d0d0f" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* iOS Safari specific */}
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Data Forge" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

