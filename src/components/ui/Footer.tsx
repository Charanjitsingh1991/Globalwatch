'use client'
import Link from 'next/link'

const LINKS = [
  { label: 'About',     href: '/about' },
  { label: 'Status',    href: '/status' },
  { label: 'Docs',      href: '/docs' },
  { label: 'Blog',      href: '/blog' },
  { label: 'GitHub',    href: 'https://github.com', external: true },
  { label: 'X',         href: 'https://x.com',      external: true },
]

export default function Footer() {
  return (
    <div className="flex items-center justify-between px-4 flex-shrink-0"
      style={{
        height: 'var(--footer-h)',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
      }}>
      <div className="flex items-center gap-2 font-mono text-xs"
        style={{ color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
          ◉ GLOBALWATCH
        </span>
        <span style={{ color: 'var(--border-bright)' }}>•</span>
        <span>© {new Date().getFullYear()}</span>
      </div>

      <div className="flex items-center gap-3">
        {LINKS.map(link => (
          link.external ? (
            <a key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs transition-colors hover:underline"
              style={{ color: 'var(--text-muted)' }}>
              {link.label}
            </a>
          ) : (
            <Link key={link.label} href={link.href}
              className="font-mono text-xs transition-colors hover:underline"
              style={{ color: 'var(--text-muted)' }}>
              {link.label}
            </Link>
          )
        ))}
      </div>

      <div className="font-mono text-xs"
        style={{ color: 'var(--text-dim)' }}>
        All data from public APIs • For informational use only
      </div>
    </div>
  )
}
