import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import NextTopLoader from 'nextjs-toploader'
import { CommandMenu } from '@/components/command-menu'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'CodewithChat - AI Studio',
  description:
    'A professional AI software engineering mentor that helps you design, build, and deploy production-ready SaaS applications step-by-step.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/light_logo.png', media: '(prefers-color-scheme: light)' },
      { url: '/dark_logo.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [
      { url: '/dark_logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <body suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader 
            color="hsl(var(--foreground))" 
            initialPosition={0.08} 
            crawlSpeed={200} 
            height={3} 
            crawl={true} 
            showSpinner={false} 
            easing="ease" 
            speed={200} 
            shadow="0 0 10px hsl(var(--foreground)),0 0 5px hsl(var(--foreground))" 
          />
          <ClerkProvider appearance={{ theme: shadcn }}>
            {children}
            <CommandMenu />
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
