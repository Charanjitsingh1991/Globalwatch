"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  rightPanel?: React.ReactNode;
  statusBar?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  sidebar,
  rightPanel,
  statusBar,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={cn(
            "transition-all duration-300 ease-in-out border-r border-border bg-surface",
            "flex flex-col overflow-hidden",
            isSidebarOpen ? "w-[280px]" : "w-0",
            "lg:relative absolute lg:translate-x-0 z-20 h-full",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Layer Controls
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebar || (
              <div className="text-text-muted text-sm">No controls available</div>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-30 lg:hidden bg-surface border border-border p-2 rounded shadow-lg hover:bg-primary/20 transition-colors"
            aria-label="Open sidebar"
          >
            <svg
              className="w-6 h-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        {/* Main Map/Content Area */}
        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>

        {/* Right Panel */}
        <aside
          className={cn(
            "transition-all duration-300 ease-in-out border-l border-border bg-surface",
            "flex flex-col overflow-hidden",
            isRightPanelOpen ? "w-[320px]" : "w-0",
            "lg:relative absolute right-0 lg:translate-x-0 z-20 h-full",
            isRightPanelOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}
        >
          {/* Right Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Data Feed
            </h2>
            <button
              onClick={() => setIsRightPanelOpen(false)}
              className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close panel"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Right Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanel || (
              <div className="text-text-muted text-sm">No data available</div>
            )}
          </div>
        </aside>

        {/* Mobile Right Panel Toggle */}
        {!isRightPanelOpen && (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="fixed top-4 right-4 z-30 lg:hidden bg-surface border border-border p-2 rounded shadow-lg hover:bg-primary/20 transition-colors"
            aria-label="Open data panel"
          >
            <svg
              className="w-6 h-6 text-text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </button>
        )}

        {/* Mobile Overlay */}
        {(isSidebarOpen || isRightPanelOpen) && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsRightPanelOpen(false);
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 border-t border-border bg-surface flex items-center px-4 text-xs text-text-muted">
        {statusBar || (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent status-pulse" />
              System Online
            </span>
            <span>|</span>
            <span>Last Update: {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </footer>
    </div>
  );
}
