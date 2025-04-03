import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { SidebarNav } from "@/components/layout/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarInset } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen">
            <SidebarNav />
            <SidebarInset>
              <div className="flex-1">{children}</div>
            </SidebarInset>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
