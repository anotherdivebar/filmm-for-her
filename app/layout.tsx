import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "FILMM/FORHER | Photography by Marissa Reynolds";
const description =
  "Executive portraiture, events, and independent 35mm work by Wichita photographer Marissa Reynolds.";

async function getOrigin() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0e0d0b",
};

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getOrigin();
  const socialImage = `${origin}/og-cinematic.png`;

  return {
    title,
    description,
    authors: [{ name: "Marissa Reynolds" }],
    creator: "Marissa Reynolds",
    publisher: "FILMM/FORHER",
    category: "Photography",
    alternates: {
      canonical: origin,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/marissa-portrait.png",
    },
    keywords: [
      "Wichita photographer",
      "corporate headshots",
      "event photographer",
      "35mm photography",
      "Marissa Reynolds",
    ],
    openGraph: {
      type: "website",
      url: origin,
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1536,
          height: 1024,
          alt: "FILMM/FORHER photography by Marissa Reynolds",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const origin = await getOrigin();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "FILMM/FORHER",
    url: origin,
    image: `${origin}/og-cinematic.png`,
    description,
    founder: {
      "@type": "Person",
      name: "Marissa Reynolds",
      jobTitle: "Photographer",
    },
    areaServed: {
      "@type": "City",
      name: "Wichita, Kansas",
    },
    knowsAbout: [
      "Executive portraiture",
      "Corporate event photography",
      "Editorial photography",
      "35mm photography",
    ],
  };

  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
