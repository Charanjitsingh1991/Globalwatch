import { create } from 'zustand'
import type { BaseEvent } from '@/types/events'

interface AlertStore {
  alerts: BaseEvent[]
  addAlert: (event: BaseEvent) => void
  dismissAlert: (id: string) => void
  clearAll: () => void
}

export const useAlertStore = create<AlertStore>()((set) => ({
  alerts: [],
  addAlert: (event) =>
    set((state) => {
      const exists = state.alerts.find((a) => a.id === event.id)
      if (exists) return state
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      const fresh = state.alerts.filter(
        (a) => new Date(a.timestamp).getTime() > oneHourAgo
      )
      return { alerts: [event, ...fresh].slice(0, 50) }
    }),
  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
  clearAll: () => set({ alerts: [] }),
}))
