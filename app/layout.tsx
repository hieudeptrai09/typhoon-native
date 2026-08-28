import { TITLE_COMMON } from "@/lib/constants";
import AntdProvider from "@/lib/layout/AntdProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const font = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", weight: "400" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const SITE_URL = "https://typhoons.vercel.app";
const SITE_DESCRIPTION =
  "Comprehensive typhoon database featuring storm tracking, intensity analysis, and the fascinating stories behind typhoon names";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${TITLE_COMMON}`,
    default: TITLE_COMMON,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: TITLE_COMMON,
    url: "./",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "./",
  },
  keywords: [
    "typhoon",
    "typhoon names",
    "tropical storm",
    "Western Pacific",
    "storm tracking",
    "typhoon database",
    "typhoon intensity",
    "retired typhoon names",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: TITLE_COMMON,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Dataset",
      name: "Western Pacific Typhoon Database",
      description:
        "Comprehensive dataset of Western Pacific typhoons including storm names, intensities, positions, naming history, and retired names.",
      url: SITE_URL,
      mainEntityOfPage: `${SITE_URL}/about`,
      keywords: [
        "typhoon",
        "tropical storm",
        "Western Pacific",
        "storm intensity",
        "typhoon names",
        "retired typhoon names",
      ],
      creator: {
        "@type": "Person",
        name: "Cá Tra",
      },
      license: "https://creativecommons.org/publicdomain/zero/1.0/",
      isBasedOn: [
        {
          "@type": "CreativeWork",
          name: "Japan Meteorological Agency (JMA) — RSMC Tokyo Typhoon Center",
          url: "https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/tyname.html",
        },
        {
          "@type": "CreativeWork",
          name: "Joint Typhoon Warning Center (JTWC)",
          url: "https://www.metoc.navy.mil/jtwc/jtwc.html",
        },
        {
          "@type": "CreativeWork",
          name: "Wikipedia",
          url: "https://en.wikipedia.org/",
          license: "https://creativecommons.org/licenses/by-sa/4.0/",
        },
      ],
      temporalCoverage: "2000/..",
      spatialCoverage: {
        "@type": "Place",
        name: "Western Pacific Basin",
      },
      variableMeasured: ["Storm intensity", "Storm position", "Storm year", "Typhoon name origin"],
    },
  ],
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta
          name="google-site-verification"
          content="8LbzW8YtyO7c8biOK5LX8xyYBcU7IHuD7Je35ZNdgtc"
        />
      </head>
      <body>
        <AntdRegistry>
          <AntdProvider>
            {children}
            {modal}
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
