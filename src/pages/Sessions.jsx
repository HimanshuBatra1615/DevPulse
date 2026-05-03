import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Timer, Code2, Calendar, Search, Clock, Zap } from 'lucide-react'
import { useSessionStore } from '../store/sessionStore'
import { format, subDays } from 'date-fns'

function ContributionHeatmap({ sessions }) {
  const today = new Date()
  const dayMap = useMemo(() => {
    const map = {}
    sessions.forEach((s) => {
      const day = format(new Date(s.startedAt), 'yyyy-MM-dd')
      map[day] = (map[day] || 0) + s.durationMins
    })
    return map
  }, [sessions])
  const maxMins = Math.max(...Object.values(dayMap), 1)

  const cells = useMemo(() => {
    const r = []
    for (let i = 0; i <= 364; i++) {
      const date = subDays(today, 364 - i)
      const key = format(date, 'yyyy-MM-dd')
      const mins = dayMap[key] || 0
      r.push({ date, key, mins, intensity: mins / maxMins, dayOfWeek: date.getDay(), weekIndex: Math.floor(i / 7) })
    }
    return r
  }, [dayMap, maxMins])

  const getColor = (v) => {
    if (v === 0) return 'rgba(255,255,255,0.03)'
    if (v < 0.25) return 'rgba(99,102,241,0.2)'
    if (v < 0.5) return 'rgba(99,102,241,0.4)'
    if (v < 0.75) return 'rgba(99,102,241,0.6)'
    return 'rgba(99,102,241,0.85)'
  }

  const [tooltip, setTooltip] = useState(null)
  const weeks = Math.ceil(365 / 7)
  const sz = 13, gap = 3

  return (
    <div className="relative overflow-x-auto">
      <svg width={weeks * (sz + gap) + 30} height={7 * (sz + gap) + 20}>
        {cells.map((c) => (
          <rect key={c.key} x={c.weekIndex * (sz + gap) + 30} y={c.dayOfWeek * (sz + gap)} width={sz} height={sz} rx={2.5} fill={getColor(c.intensity)} className="heatmap-cell"
            onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, date: format(c.date, 'MMM d, yyyy'), mins: c.mins })}
            onMouseLeave={() => setTooltip(null)} />
        ))}
      </svg>
      {tooltip && (
        <div className="fixed z-50 px-3 py-2 rounded-lg bg-bg-elevated border border-white/[0.1] shadow-xl text-xs pointer-events-none" style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}>
          <p className="font-medium text-text-primary">{tooltip.mins > 0 ? `${tooltip.mins} min` : 'No sessions'}</p>
          <p className="text-text-muted">{tooltip.date}</p>
        </div>
      )}
      <div className="flex items-center gap-2 mt-3 ml-7">
        <span className="text-[10px] text-text-muted">Less</span>
        {[0, 0.2, 0.4, 0.6, 0.85].map((v, i) => (<div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(v) }} />))}
        <span className="text-[10px] text-text-muted">More</span>
      </div>
    </div>
  )
}

export default function Sessions() {
  const { sessions } = useSessionStore()
  const [filter, setFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')

  const projects = useMemo(() => ['all', ...new Set(sessions.map((s) => s.projectTag))], [sessions])
  const filtered = useMemo(() => sessions.filter((s) => {
    if (projectFilter !== 'all' && s.projectTag !== projectFilter) return false
    if (filter && !s.projectTag.toLowerCase().includes(filter.toLowerCase()) && !s.language.toLowerCase().includes(filter.toLowerCase())) return false
    return true
  }), [sessions, filter, projectFilter])

  const totalHours = Math.round(sessions.reduce((a, s) => a + s.durationMins, 0) / 60 * 10) / 10
  const avgFocus = (() => { const sc = sessions.filter((s) => s.focusScore != null); return sc.length ? Math.round(sc.reduce((a, s) => a + s.focusScore, 0) / sc.length) : 0 })()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ icon: Timer, label: 'Total Sessions', value: sessions.length, color: 'accent-primary' },
          { icon: Clock, label: 'Total Hours', value: totalHours, color: 'accent-cyan' },
          { icon: Zap, label: 'Avg Focus', value: avgFocus, color: 'accent-warning' }].map((s, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${s.color}/10 flex items-center justify-center`}><s.icon className={`w-5 h-5 text-${s.color}`} /></div>
            <div><p className="text-xs text-text-muted">{s.label}</p><p className="text-xl font-bold font-mono">{s.value}</p></div>
          </div>
        ))}
      </div>

      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-accent-primary" />Coding Activity</h3>
        <ContributionHeatmap sessions={sessions} />
      </motion.div>

      <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-semibold text-text-primary">Session History</h3>
          <div className="flex items-center gap-2">
            <div className="relative"><Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" /><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search..." className="input-field pl-9 w-48 text-xs py-2" /></div>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="input-field text-xs py-2 w-36">{projects.map((p) => <option key={p} value={p}>{p === 'all' ? 'All Projects' : p}</option>)}</select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/[0.06]">{['Project', 'Language', 'Date', 'Duration', 'Focus', 'Status'].map((h) => (<th key={h} className="text-[11px] text-text-muted font-medium uppercase tracking-wider pb-3 pr-4">{h}</th>))}</tr></thead>
            <tbody>{filtered.slice(0, 20).map((s, i) => (
              <motion.tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                <td className="py-3 pr-4"><div className="flex items-center gap-2"><Code2 className="w-4 h-4 text-accent-primary" /><span className="text-sm font-medium">{s.projectTag}</span></div></td>
                <td className="py-3 pr-4"><span className="badge badge-cyan">{s.language}</span></td>
                <td className="py-3 pr-4 text-sm text-text-secondary font-mono">{format(new Date(s.startedAt), 'MMM d, h:mm a')}</td>
                <td className="py-3 pr-4 text-sm font-mono">{s.durationMins}m</td>
                <td className="py-3 pr-4">{s.focusScore != null ? <span className={`text-sm font-bold font-mono ${s.focusScore >= 75 ? 'text-accent-success' : s.focusScore >= 55 ? 'text-accent-warning' : 'text-accent-danger'}`}>{s.focusScore}</span> : <span className="text-xs text-text-muted">—</span>}</td>
                <td className="py-3"><span className={`badge ${s.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{s.status}</span></td>
              </motion.tr>
            ))}</tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
