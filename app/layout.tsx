import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "filmmforher — Photography by Marissa Reynolds";
const description =
  "Warm, artful headshots, event photography, and creative 35mm stories by Wichita photographer Marissa Reynolds.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
    title,
    description,
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
          width: 1728,
          height: 910,
          alt: "filmmforher photography by Marissa Reynolds",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
