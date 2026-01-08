import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { LoadingProvider } from "@/context/LoadingContext";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <LoadingProvider>
          <Providers>
          {children}
        </Providers>
        </LoadingProvider>
      </body>
    </html>
  );
}
