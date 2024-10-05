import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { notoSans } from "./fonts";
import NameModal from "./components/nameModal";
import UserProvider from "./UserProvider";

export { metadata } from "./metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="winter">
      <body className={notoSans.className}>
        <UserProvider>
          <NameModal />
          {children}
          <Analytics />
          <SpeedInsights />
        </UserProvider>
      </body>
    </html>
  );
}