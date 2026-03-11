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

export const metadata = {
  metadataBase: new URL("https://mojtermin.site"),

  title: {
    default: "MojTermin – Online zakazivanje termina i pregleda u Srbiji",
    template: "%s | MojTermin",
  },

  description:
    "Zakazujte lekarske preglede, salone i usluge online. Brzo, jednostavno i bez čekanja. MojTermin je moderan sistem za digitalno zakazivanje termina.",

  applicationName: "MojTermin",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  alternates: {
    canonical: "https://mojtermin.site",
  },

  icons: {
    icon: "/Images/logo.png",
  },

  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: "https://mojtermin.site",
    siteName: "MojTermin",
    title: "MojTermin – Online zakazivanje termina",
    description:
      "Jednostavno zakazivanje lekarskih pregleda i usluga online. Bez čekanja, bez poziva.",
    images: [
      {
        url: "/Images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MojTermin – Online zakazivanje termina",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MojTermin – Online zakazivanje termina",
    description:
      "Zakazivanje pregleda i usluga online. Brzo, jednostavno i moderno.",
    images: ["/Images/og-image.jpg"],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <head>
        <link rel="stylesheet" href="https://unicons.iconscout.com/release/v2.1.9/css/unicons.css"/>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;550;600;700;800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />



      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
