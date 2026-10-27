import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import FirebaseAnalytics from "./components/FirebaseAnalytics";
import { syneMono, rockSalt } from "./fonts";
import NameModal from "./components/modals/nameModal";
import UserProvider from "./UserProvider";

export { metadata } from "./metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="winter">
      <body className={`${syneMono.className} text-white`}>
        <UserProvider>
          <NameModal />
          {children}
          <FirebaseAnalytics />
          <Analytics />
          <SpeedInsights />
        </UserProvider>
      </body>
    </html>
  );
}