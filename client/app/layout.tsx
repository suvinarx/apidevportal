// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Source_Sans_3 } from "next/font/google";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "API Developer Portal",
    template: "API Developer Portal",
  },
  description: "Browse, document, and test APIs in one place.",
  // optional but tiny:
  applicationName: "API Developer Portal",
  keywords: [
    "API portal",
    "API catalog",
    "OpenAPI",
    "Swagger",
    "Redoc",
    "Swagger UI",
    "REST",
    "developer portal",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={sourceSans3.className}>{children}</body>
    </html>
  );
}
