import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — GlobalWatch',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen font-mono"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-xs mb-6 block hover:underline"
          style={{ color: 'var(--accent)' }}>
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-1"
          style={{ color: 'var(--accent)' }}>
          BLOG
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Updates, analysis, and intelligence briefings
        </p>

        <div className="p-8 rounded border text-center"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border)',
          }}>
          <div className="text-4xl mb-4">📝</div>
          <p className="text-sm font-bold mb-2"
            style={{ color: 'var(--text)' }}>
            Coming Soon
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Intelligence analysis and platform updates will appear here.
          </p>
        </div>
      </div>
    </main>
  )
}
