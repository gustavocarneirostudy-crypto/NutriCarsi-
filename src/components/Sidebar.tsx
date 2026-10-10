import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/Logo'
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Pacientes',
      to: '/pacientes',
      icon: Users,
    },
  ]

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'N'

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full select-none shadow-sm',
        className
      )}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo Container */}
        <div className="h-20 px-6 flex items-center border-b border-slate-100/90 bg-gradient-to-b from-white to-slate-50/50">
          <Logo size="sm" />
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm shadow-emerald-500/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-4 rounded-full bg-emerald-500" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* Bottom Section: User Profile & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            {userInitial}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-800 truncate" title={user?.name || 'Nutricionista'}>
              {user?.name || 'Nutricionista'}
            </span>
            <span className="text-[11px] text-slate-400 truncate" title={user?.email || ''}>
              {user?.email || 'nutri@exemplo.com'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/80 border border-slate-200 hover:border-red-200 rounded-xl transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Encerrar sessão</span>
        </button>
      </div>
    </aside>
  )
}
