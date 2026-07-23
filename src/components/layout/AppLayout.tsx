import type { ReactNode } from 'react'
import { Header, type HeaderProps } from './Header'
import { Footer } from './Footer'
import { TooltipProvider } from '@/components/ui'

export interface AppLayoutProps extends HeaderProps {
  children: ReactNode
}

/**
 * Owns the application chrome: providers, Header, page `<main>`, and Footer.
 * Feature code renders as `children` and never references Header/Footer directly.
 */
export function AppLayout({ children, ...headerProps }: AppLayoutProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-svh flex-col bg-app text-text-primary">
        <Header {...headerProps} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  )
}
