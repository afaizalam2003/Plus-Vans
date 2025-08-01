"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { ReduxProvider } from "@/redux/provider";

import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Plus Vans Admin</title>
        <meta name="description" content="Admin dashboard for Plus Vans" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >

          <QueryProvider>
            <ReduxProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ReduxProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
