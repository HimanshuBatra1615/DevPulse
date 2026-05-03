import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useSessionStore } from '../../store/sessionStore'
import { useInsightsStore } from '../../store/insightsStore'
import { useTaskStore } from '../../store/taskStore'

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const loadMockSessions = useSessionStore((s) => s.loadMockSessions)
  const sessions = useSessionStore((s) => s.sessions)
  const fetchInsights = useInsightsStore((s) => s.fetchInsights)
  const tasks = useTaskStore((s) => s.tasks)

  useEffect(() => {
    if (sessions.length === 0) {
      loadMockSessions()
    }
  }, [])

  useEffect(() => {
    fetchInsights(tasks)
  }, [tasks])

  return (
    <div className="flex min-h-screen">
      {/* Animated background mesh */}
      <div className="bg-gradient-mesh" />

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main 
        style={{ marginLeft: collapsed ? '72px' : '260px' }} 
        className="flex-1 min-h-screen transition-all duration-300"
      >
        <Topbar />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
