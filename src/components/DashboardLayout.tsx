import React, { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Logo } from '@/components/Logo'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Logo size="sm" showSubtitle={false} />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 z-30">
        <Sidebar className="h-full" />
      </div>

      {/* Main Content Area (offset by 64 (16rem = 256px) on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
