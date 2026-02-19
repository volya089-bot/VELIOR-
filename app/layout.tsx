import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "VELIOR", description: "Monitoring, alerts, reporting." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>{children}</body></html>);
}
