import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Bell, Command, Sparkles } from 'lucide-react'
import { useInsightsStore } from '../../store/insightsStore'

const pageNames = {
  '/': 'Dashboard',
  '/sessions': 'Sessions',
  '/tasks': 'Tasks',
  '/analytics': 'Analytics',
  '/insights': 'AI Insights',
  '/settings': 'Settings',
}

export default function Topbar() {
  const location = useLocation()
  const { focusPrediction } = useInsightsStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const pageName = pageNames[location.pathname] || 'DevPulse'

  const focusScore = focusPrediction?.score || '--'
  const focusColor = focusPrediction?.score >= 75 ? 'text-accent-success' : focusPrediction?.score >= 55 ? 'text-accent-warning' : 'text-accent-danger'

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/[0.06] bg-bg-primary/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-text-primary">{pageName}</h2>
        <p className="text-sm text-text-muted mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Focus Score Mini Badge */}
        {focusPrediction && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Sparkles className={`w-3.5 h-3.5 ${focusColor}`} />
            <span className="text-xs text-text-secondary">Focus</span>
            <span className={`text-sm font-bold font-mono ${focusColor}`}>{focusScore}</span>
          </div>
        )}

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-text-muted hover:text-text-secondary transition-all text-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-danger" />
        </button>
      </div>
    </header>
  )
}
