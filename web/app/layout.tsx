import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PA9 — Система моделирования технических систем',
  description: 'Программный комплекс PA9 для моделирования динамики технических систем.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
          <nav className="max-w-6xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-neutral-900 hover:opacity-70 transition-opacity">
              PA9
            </Link>
            <div className="flex items-center gap-10 text-[15px] text-neutral-600">
              <Link href="/" className="hover:text-neutral-900 transition-colors">
                О системе
              </Link>
              <Link href="/pa9" className="hover:text-neutral-900 transition-colors">
                PA9 Online
              </Link>
              <Link href="/research" className="hover:text-neutral-900 transition-colors">
                Исследования
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 min-h-0 flex flex-col">
          {children}
        </main>
        <footer className="bg-neutral-100 py-12 mt-auto">
          <div className="max-w-6xl mx-auto px-6 md:px-12 text-sm text-neutral-500">
            © {new Date().getFullYear()} PA9
          </div>
        </footer>
      </body>
    </html>
  )
}
