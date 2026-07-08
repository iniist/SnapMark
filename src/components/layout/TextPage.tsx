import type { ReactNode } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { Footer } from '@/components/layout/Footer'

/** Gerüst für inhaltliche Textseiten (Impressum, Datenschutz, Zugang). */
export function TextPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1 px-6 py-12">
        <article className="mx-auto w-full max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-gradient">{title}</span>
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
