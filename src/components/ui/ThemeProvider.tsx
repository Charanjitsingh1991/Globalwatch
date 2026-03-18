'use client'
import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useUIStore()

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light')
    } else {
      html.removeAttribute('data-theme')
    }
  }, [theme])

  return <>{children}</>
}
