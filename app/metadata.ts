import { Metadata } from "next";
import { constants } from "./constants";

const title = "Spycy"
const description = "A fun spy game for everyone"

export const metadata: Metadata = {
  title: title,
  description: description,

  metadataBase: new URL(constants.siteUrl),
  keywords: [
    title,
    "more",
    "keywords",
    "here"
  ],
  openGraph: {
    siteName: title,
    type: "website",
    locale: "en_US"
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow"
  },
  verification: {
    google: "<YOUR GOOGLE VERIFICATION FROM ANALYTICS>"
  },
  alternates: {
    canonical: constants.siteUrl
  },
  applicationName: title,
  appleWebApp: {
    title: title,
    statusBarStyle: "default",
    capable: true
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    creator: "@AkshitDayal8",
    site: "@AkshitDayal8",
    images: [
      {
        url: `${constants.siteUrl}/favicon.ico`,
        width: 1200,
        height: 630,
        alt: title
      }
    ]
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon"
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      }
      // add favicon-32x32.png, favicon-96x96.png, android-chrome-192x192.png
    ],
    shortcut: [
      {
        url: "/favicon.ico",
        type: "image/x-icon"
      }
    ],
    apple: [
      {
        url: "/apple-icon-57x57.png",
        sizes: "57x57",
        type: "image/png"
      },
      {
        url: "/apple-icon-60x60.png",
        sizes: "60x60",
        type: "image/png"
      }
      // add apple-icon-72x72.png, apple-icon-76x76.png, apple-icon-114x114.png, apple-icon-120x120.png, apple-icon-144x144.png, apple-icon-152x152.png, apple-icon-180x180.png
    ]
  }
};