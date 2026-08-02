import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import NextTopLoader from 'nextjs-toploader'
import { CommandMenu } from '@/components/command-menu'
import './globals.css'

const fontSans = Outfit({ subsets: ['latin'], variable: '--font-sans' })
const fontMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

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
      <body suppressHydrationWarning className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased bg-background`}>
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
