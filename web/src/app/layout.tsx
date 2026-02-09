import type { Metadata } from "next";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";

import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "oh-my-ag Official Docs",
  description: "Official documentation site for oh-my-ag.",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      {
        url: `${basePath}/icons/ios/16.png`,
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: `${basePath}/icons/ios/32.png`,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: `${basePath}/icons/android/android-launchericon-192-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: `${basePath}/icons/android/android-launchericon-512-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: [`${basePath}/icons/ios/16.png`, `${basePath}/icons/ios/32.png`],
    apple: [
      {
        url: `${basePath}/icons/ios/152.png`,
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: `${basePath}/icons/ios/167.png`,
        sizes: "167x167",
        type: "image/png",
      },
      {
        url: `${basePath}/icons/ios/180.png`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
