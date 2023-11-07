import "./globals.scss";
import { Press_Start_2P } from "next/font/google";

const font = Press_Start_2P({ weight: "400", subsets: [] });

export const metadata = {
  title: "",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
