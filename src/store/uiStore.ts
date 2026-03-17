import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ActivePanel = 'news' | 'alerts' | 'intel' | 'countries' | 'flights' | 'ships' | null

interface UIStore {
  sidebarOpen: boolean
  rightPanelOpen: boolean
  activePanel: ActivePanel
  theme: 'dark' | 'light'
  toggleSidebar: () => void
  toggleRightPanel: () => void
  setActivePanel: (panel: ActivePanel) => void
  toggleTheme: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      rightPanelOpen: true,
      activePanel: 'news',
      theme: 'dark',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      setActivePanel: (panel) => set({ activePanel: panel }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'globalwatch-ui-store',
      partialize: (state) => ({ theme: state.theme, activePanel: state.activePanel }),
    }
  )
)
