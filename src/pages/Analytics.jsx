import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, Code2 } from 'lucide-react'
import { useSessionStore } from '../store/sessionStore'
import { useInsightsStore } from '../store/insightsStore'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { format, subDays, startOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns'

const chartColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated/95 backdrop-blur-lg border border-white/[0.1] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      {payload.map((p, i) => (<p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? Math.round(p.value * 10) / 10 : p.value}</p>))}
    </div>
  )
}

function PeakHoursHeatmap({ data }) {
  if (!data?.length) return <div className="text-sm text-text-muted text-center py-8">Loading insights...</div>
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const sz = 28, gap = 2
  const getColor = (v) => {
    if (v < 0.05) return 'rgba(255,255,255,0.02)'
    if (v < 0.2) return 'rgba(99,102,241,0.15)'
    if (v < 0.4) return 'rgba(99,102,241,0.3)'
    if (v < 0.6) return 'rgba(99,102,241,0.5)'
    if (v < 0.8) return 'rgba(99,102,241,0.7)'
    return 'rgba(99,102,241,0.9)'
  }
  return (
    <div className="overflow-x-auto">
      <svg width={24 * (sz + gap) + 40} height={7 * (sz + gap) + 25}>
        {hours.filter((h) => h % 3 === 0).map((h) => (<text key={h} x={h * (sz + gap) + 40 + sz / 2} y={10} textAnchor="middle" className="fill-text-muted text-[9px]" fontFamily="var(--font-mono)">{h}:00</text>))}
        {days.map((d, di) => (<text key={d} x={0} y={di * (sz + gap) + 20 + sz / 2 + 3} className="fill-text-muted text-[10px]" fontFamily="var(--font-sans)">{d}</text>))}
        {data.map((c, i) => (<rect key={i} x={c.hour * (sz + gap) + 40} y={c.dayIndex * (sz + gap) + 18} width={sz} height={sz} rx={4} fill={getColor(c.intensity)} className="heatmap-cell" />))}
      </svg>
    </div>
  )
}

export default function Analytics() {
  const { sessions } = useSessionStore()
  const { peakHours } = useInsightsStore()

  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: subWeeks(new Date(), 11), end: new Date() }, { weekStartsOn: 1 })
    return weeks.map((wStart) => {
      const wEnd = new Date(wStart); wEnd.setDate(wEnd.getDate() + 6)
      const wSessions = sessions.filter((s) => { const d = new Date(s.startedAt); return d >= wStart && d <= wEnd })
      return { name: format(wStart, 'MMM d'), hours: Math.round(wSessions.reduce((a, s) => a + s.durationMins, 0) / 60 * 10) / 10, sessions: wSessions.length, avgFocus: wSessions.length ? Math.round(wSessions.filter((s) => s.focusScore).reduce((a, s) => a + (s.focusScore || 0), 0) / Math.max(wSessions.filter((s) => s.focusScore).length, 1)) : 0 }
    })
  }, [sessions])

  const projectData = useMemo(() => {
    const map = {}
    sessions.forEach((s) => { map[s.projectTag] = (map[s.projectTag] || 0) + s.durationMins })
    return Object.entries(map).map(([name, mins]) => ({ name, hours: Math.round(mins / 60 * 10) / 10 })).sort((a, b) => b.hours - a.hours)
  }, [sessions])

  const languageData = useMemo(() => {
    const map = {}
    sessions.forEach((s) => { map[s.language] = (map[s.language] || 0) + s.durationMins })
    return Object.entries(map).map(([name, mins]) => ({ name, value: Math.round(mins / 60 * 10) / 10 })).sort((a, b) => b.value - a.value)
  }, [sessions])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px]">
      {/* Weekly Hours Trend */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent-primary" />Weekly Hours (12 weeks)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={weeklyData}><defs><linearGradient id="gHours" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} fill="url(#gHours)" name="Hours" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Hours */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent-cyan" />Hours by Project</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={90} /><Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" name="Hours" radius={[0, 6, 6, 0]}>{projectData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Language Distribution */}
        <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Code2 className="w-4 h-4 text-accent-secondary" />Language Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart><Pie data={languageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">{languageData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}</Pie></PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">{languageData.map((l, i) => (
              <div key={l.name} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }} /><span className="text-xs text-text-secondary flex-1">{l.name}</span><span className="text-xs font-mono text-text-primary">{l.value}h</span></div>
            ))}</div>
          </div>
        </motion.div>
      </div>

      {/* Peak Hours Heatmap */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-accent-warning" />Peak Productivity Hours</h3>
        <PeakHoursHeatmap data={peakHours} />
      </motion.div>

      {/* Focus Trend */}
      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h3 className="text-sm font-semibold mb-4">Focus Score Trend (12 weeks)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="avgFocus" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} name="Avg Focus" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}
