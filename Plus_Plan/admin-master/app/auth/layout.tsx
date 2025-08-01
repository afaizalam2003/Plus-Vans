import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ReduxProvider } from "@/redux/provider";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentication - PlusVans Admin",
  description: "Authentication page for PlusVans Admin Dashboard",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <ReduxProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            {/* Left side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
              <div className="w-full max-w-xl">{children}</div>
            </div>

            {/* Right side - Image */}
            <div className="relative hidden lg:block lg:w-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10" />
              <Image
                src="/auth-background.jpg"
                alt="Van delivery service"
                fill
                className="object-cover object-center"
                priority
                quality={100}
              />
              <div className="relative z-20 flex flex-col items-center justify-center h-full px-8 text-white">
                <div className="backdrop-blur-sm bg-black/20 p-8 rounded-xl border border-white/10">
                  <h1 className="text-5xl font-bold text-center mb-4 drop-shadow-lg">
                    Dashboard
                  </h1>
                  <p className="text-xl text-center max-w-md text-gray-100 drop-shadow-lg">
                    Manage collections, bookings, and payments efficiently with
                    our comprehensive admin dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </ReduxProvider>
    </div>
  );
}
