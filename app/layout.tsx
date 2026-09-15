import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Studyprint — Find your four-letter study code",
  description: "A quick study-personality test that reveals how you focus, communicate, plan, and get things finished.",
  openGraph: {
    title: "Studyprint — Find your four-letter study code",
    description: "Discover your study type, get a practical playbook, and compare compatibility with a study partner.",
    type: "website",
    images: [{ url: `${siteUrl.replace(/\/$/, "")}/og.png`, width: 1536, height: 1024, alt: "Studyprint — Find your four-letter study code" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Studyprint — Find your four-letter study code",
    description: "Discover your study type and compare compatibility with a study partner.",
    images: [`${siteUrl.replace(/\/$/, "")}/og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
