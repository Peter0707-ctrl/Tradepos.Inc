import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DynamicBackground } from "@/components/DynamicBackground";

export const metadata: Metadata = {
  title: "TradePOS — Modern Business Management System",
  description: "Enterprise POS, inventory, customer accounts, expenses, multi-branch, deliveries, and store management.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TradePOS",
  },
};

export const viewport: Viewport = {
  themeColor: "#E1FFAC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TradePOS" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased text-[#1E241E] min-h-screen relative font-sans">
        {/* Dynamic Multi-Photo Business Background cycling smoothly across the entire system */}
        <DynamicBackground />
        
        {/* Main Content */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>

        {/* PWA Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('TradePOS PWA ServiceWorker registered with scope:', registration.scope);
                    },
                    function(err) {
                      console.warn('TradePOS PWA ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
