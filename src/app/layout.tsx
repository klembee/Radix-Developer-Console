import type { Metadata } from "next";
import localFont from "next/font/local";
import "./ui/globals.css";
// import "./ui/loading.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "toastify-js/src/toastify.css"
import { ThemeProvider } from "./ThemeProvider";
import { Analytics } from '@vercel/analytics/react';

const geistSans = localFont({
  src: "./ui/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./ui/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Radix Developer Console",
  description: "Accelerate your development on the Radix network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`bg-background text-foreground ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>

          <Analytics />
        
      </body>
    </html>
  );
}
