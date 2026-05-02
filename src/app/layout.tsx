import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TaskFlow — Kanban Board",
  description: "Ekibinizle görevleri yönetin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
