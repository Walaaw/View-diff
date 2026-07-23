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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-accent-fg"
      >
        Skip to content
      </a>
      <div className="flex min-h-svh flex-col bg-app text-text-primary">
        <Header {...headerProps} />
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6"
        >
          {children}
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  )
}
