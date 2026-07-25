import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumora — Your reflective companion",
  description: "A voice-first journal and life insights companion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
