const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  info: (msg: string, data?: unknown) => {
    if (isDev) console.log(`[INFO] ${msg}`, data ?? '')
  },
  warn: (msg: string, data?: unknown) => {
    if (isDev) console.warn(`[WARN] ${msg}`, data ?? '')
  },
  error: (msg: string, data?: unknown) => {
    console.error(`[ERROR] ${msg}`, data ?? '')
  },
}
