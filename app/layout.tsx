import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import FirebaseAnalytics from "./components/FirebaseAnalytics";
import { syneMono } from "./fonts";
import AppChrome from "./AppChrome";

export { metadata } from "./metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="winter">
      <body className={`${syneMono.className} text-white`}>
        <AppChrome>
          {children}
          <FirebaseAnalytics />
          <Analytics />
          <SpeedInsights />
        </AppChrome>
      </body>
    </html>
  );
}