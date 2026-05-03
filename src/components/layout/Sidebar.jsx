import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BarChart3,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSessionStore } from '../../store/sessionStore'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sessions', label: 'Sessions', icon: Timer },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/insights', label: 'AI Insights', icon: Brain },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { activeSession } = useSessionStore()

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">
                <span className="gradient-text">Dev</span>
                <span className="text-text-primary">Pulse</span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Session Indicator */}
      <AnimatePresence>
        {activeSession && !collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-6 px-4 py-3 rounded-xl bg-accent-success/10 border border-accent-success/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-success pulse-dot" />
              <span className="text-xs font-semibold text-accent-success">SESSION LIVE</span>
            </div>
            <p className="text-xs text-text-secondary mt-1 truncate">{activeSession.projectTag}</p>
          </motion.div>
        )}
        {activeSession && collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-3 w-3 h-3 rounded-full bg-accent-success pulse-dot"
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-3' : ''}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {item.path === '/insights' && !collapsed && (
              <span className="ml-auto badge badge-indigo text-[10px]">AI</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-text-primary truncate">{user?.username}</p>
              <p className="text-sm text-text-muted truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center p-2 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-bg-elevated border border-white/[0.1] flex items-center justify-center text-text-muted hover:text-text-primary hover:border-white/[0.2] transition-all z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
