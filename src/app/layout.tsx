import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider, NotificationContainer } from "@/context/NotificationContext";

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
        <ThemeProvider>
          <SidebarProvider>
            <NotificationProvider>
              {children}
              <NotificationContainer />
            </NotificationProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
