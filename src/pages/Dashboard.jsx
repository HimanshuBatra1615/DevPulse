import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Square, Pause, Clock, Flame, Target, TrendingUp,
  Zap, Calendar, ArrowRight, Plus, Code2, ChevronRight, Sparkles, AlertTriangle, Brain
} from 'lucide-react'
import { useSessionStore } from '../store/sessionStore'
import { useTaskStore } from '../store/taskStore'
import { useInsightsStore } from '../store/insightsStore'
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { Link } from 'react-router-dom'

/* ── Animated Counter ── */
function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = 0
    const end = typeof value === 'number' ? value : 0
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    tick()
  }, [value])
  return <span>{display}</span>
}

/* ── Format Timer ── */
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/* ── Start Session Modal ── */
function StartSessionModal({ onClose, onStart }) {
  const [project, setProject] = useState('DevPulse')
  const [language, setLanguage] = useState('JavaScript')
  const [notes, setNotes] = useState('')

  const projects = ['DevPulse', 'ML Pipeline', 'API Gateway', 'Mobile App', 'Data Engine']
  const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-accent-success" />
          Start New Session
        </h3>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Project</label>
            <select value={project} onChange={(e) => setProject(e.target.value)} className="input-field bg-bg-card">
              {projects.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field bg-bg-card">
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field bg-bg-card resize-none h-20"
              placeholder="What are you working on?"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => { onStart(project, language, notes); onClose() }} className="btn-primary flex-1">
            <Play className="w-4 h-4" />
            Start Coding
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Live Timer Widget ── */
function LiveTimerWidget() {
  const { activeSession, elapsedSeconds, stopSession, pauseSession, resumeSession } = useSessionStore()
  const [showModal, setShowModal] = useState(false)
  const { startSession } = useSessionStore()

  if (!activeSession) {
    return (
      <>
        <motion.div
          className="glass-card p-8 relative overflow-hidden group cursor-pointer"
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-base text-text-secondary mb-2">No active session</p>
              <p className="text-4xl font-bold font-mono text-text-muted">00:00:00</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-3 relative z-10">Click to start a new session</p>
        </motion.div>
        {showModal && <StartSessionModal onClose={() => setShowModal(false)} onStart={startSession} />}
      </>
    )
  }

  const isPaused = activeSession.status === 'PAUSED'

  return (
    <motion.div
      className="glass-card p-8 relative overflow-hidden pulse-live h-full flex flex-col justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-success/5 to-accent-cyan/5" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-accent-success pulse-dot" />
          <span className="text-xs font-semibold text-accent-success uppercase tracking-wider">
            {isPaused ? 'Session Paused' : 'Live Session'}
          </span>
          <span className="badge badge-cyan ml-auto">{activeSession.projectTag}</span>
        </div>

        <p className="text-5xl font-bold font-mono text-text-primary tracking-wider mb-2">
          {formatTime(elapsedSeconds)}
        </p>
        <p className="text-sm text-text-muted mb-6">
          {activeSession.language} · Started {format(new Date(activeSession.startedAt), 'h:mm a')}
        </p>

        <div className="flex gap-4 mt-auto">
          {isPaused ? (
            <button onClick={resumeSession} className="btn-success flex-1">
              <Play className="w-4 h-4" /> Resume
            </button>
          ) : (
            <button onClick={pauseSession} className="btn-ghost flex-1">
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          <button onClick={stopSession} className="btn-danger flex-1">
            <Square className="w-4 h-4" /> Stop
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Stats Card ── */
function StatsCard({ icon: Icon, label, value, suffix, color, delay = 0 }) {
  const colorClasses = {
    indigo: 'from-accent-primary/20 to-accent-primary/5 text-accent-primary',
    cyan: 'from-accent-cyan/20 to-accent-cyan/5 text-accent-cyan',
    success: 'from-accent-success/20 to-accent-success/5 text-accent-success',
    warning: 'from-accent-warning/20 to-accent-warning/5 text-accent-warning',
    danger: 'from-accent-danger/20 to-accent-danger/5 text-accent-danger',
    pink: 'from-accent-pink/20 to-accent-pink/5 text-accent-pink',
  }

  return (
    <motion.div
      className="glass-card p-6 stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      style={{ '--glow-color': `var(--color-accent-${color})` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold mt-2 font-mono text-text-primary">
            <AnimatedNumber value={value} />
            {suffix && <span className="text-base font-normal text-text-secondary ml-1">{suffix}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}

/* ── Dashboard Page ── */
export default function Dashboard() {
  const { sessions, activeSession } = useSessionStore()
  const { tasks } = useTaskStore()
  const { focusPrediction, burnoutRisk } = useInsightsStore()

  // Compute stats
  const todayHours = useMemo(() => {
    return sessions
      .filter((s) => isToday(new Date(s.startedAt)))
      .reduce((sum, s) => sum + s.durationMins, 0) / 60
  }, [sessions])

  const weekSessions = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    return sessions.filter((s) => isWithinInterval(new Date(s.startedAt), { start: weekStart, end: weekEnd }))
  }, [sessions])

  const weekHours = useMemo(() => {
    return weekSessions.reduce((sum, s) => sum + s.durationMins, 0) / 60
  }, [weekSessions])

  const completedTasks = tasks.filter((t) => t.status === 'DONE').length
  const todoTasks = tasks.filter((t) => t.status === 'TODO')
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS')
  const recentSessions = sessions.slice(0, 5)

  const focusScore = focusPrediction?.score ?? '--'
  const burnoutLevel = burnoutRisk?.level ?? 'LOW'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 max-w-[1400px] px-2 py-4"
    >
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </h1>
          <p className="text-base text-text-secondary mt-2">Here's your productivity snapshot for today</p>
        </div>
        <Link to="/insights" className="btn-ghost text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          View AI Insights
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top Row: Timer + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Timer — spans 5 cols */}
        <div className="lg:col-span-5">
          <LiveTimerWidget />
        </div>

        {/* Stats Grid — spans 7 cols */}
        <div className="lg:col-span-7 grid grid-cols-2 xl:grid-cols-3 gap-6">
          <StatsCard icon={Clock} label="Today's Hours" value={Math.round(todayHours * 10) / 10} suffix="hrs" color="cyan" delay={1} />
          <StatsCard icon={TrendingUp} label="This Week" value={Math.round(weekHours * 10) / 10} suffix="hrs" color="indigo" delay={2} />
          <StatsCard icon={Target} label="Tasks Done" value={completedTasks} suffix={`/ ${tasks.length}`} color="success" delay={3} />
          <StatsCard icon={Flame} label="Focus Score" value={typeof focusScore === 'number' ? focusScore : 0} suffix="/ 100" color="warning" delay={4} />
          <StatsCard icon={Calendar} label="Week Sessions" value={weekSessions.length} color="pink" delay={5} />
          <StatsCard icon={Zap} label="Avg Duration" value={weekSessions.length > 0 ? Math.round(weekSessions.reduce((s, ss) => s + ss.durationMins, 0) / weekSessions.length) : 0} suffix="min" color="cyan" delay={6} />
        </div>
      </div>

      {/* Bottom Row: Recent Sessions + Tasks Due + AI Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sessions */}
        <motion.div
          className="glass-card p-6 lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-text-primary">Recent Sessions</h3>
            <Link to="/sessions" className="text-sm text-accent-primary hover:text-accent-primary-hover transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-accent-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">{s.projectTag}</p>
                  <p className="text-sm text-text-muted">{s.language} · {s.durationMins}m</p>
                </div>
                <span className="text-sm text-text-muted font-mono">
                  {format(new Date(s.startedAt), 'MMM d')}
                </span>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <p className="text-sm text-text-muted text-center py-6">No sessions yet. Start your first!</p>
            )}
          </div>
        </motion.div>

        {/* Tasks Due */}
        <motion.div
          className="glass-card p-6 lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-text-primary">In Progress</h3>
            <Link to="/tasks" className="text-sm text-accent-primary hover:text-accent-primary-hover transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {[...inProgressTasks, ...todoTasks].slice(0, 5).map((t) => {
              const priorityColors = { 1: 'badge-danger', 2: 'badge-warning', 3: 'badge-indigo', 4: 'badge-cyan', 5: 'badge-success' }
              const priorityLabels = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4', 5: 'P5' }
              return (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <span className={`badge ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                  <div className="flex-1 min-w-0 ml-2">
                    <p className="text-base font-medium text-text-primary truncate">{t.title}</p>
                    <p className="text-sm text-text-muted">{t.projectTag}</p>
                  </div>
                  <span className={`badge text-xs ${t.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-indigo'}`}>
                    {t.status === 'IN_PROGRESS' ? 'WIP' : 'TODO'}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* AI Pulse Card */}
        <motion.div
          className="glass-card p-6 lg:col-span-1 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/5 to-accent-primary/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-5 h-5 text-accent-secondary" />
              <h3 className="text-base font-semibold text-text-primary">AI Pulse</h3>
              <span className="badge badge-indigo text-xs ml-auto">LIVE</span>
            </div>

            {/* Focus Score */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-text-secondary">Focus Score</span>
                <span className={`text-2xl font-bold font-mono ${
                  typeof focusScore === 'number' && focusScore >= 75 ? 'text-accent-success' : 
                  typeof focusScore === 'number' && focusScore >= 55 ? 'text-accent-warning' : 'text-accent-danger'
                }`}>{focusScore}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-danger via-accent-warning to-accent-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${typeof focusScore === 'number' ? focusScore : 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Burnout Risk */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Burnout Risk</span>
                <span className={`badge text-xs ${
                  burnoutLevel === 'LOW' ? 'badge-success' :
                  burnoutLevel === 'MODERATE' ? 'badge-warning' :
                  burnoutLevel === 'HIGH' ? 'badge-danger' : 'badge-danger'
                }`}>{burnoutLevel}</span>
              </div>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">
                {burnoutRisk?.recommendations?.[0] || 'Analyzing your patterns...'}
              </p>
            </div>

            <Link to="/insights" className="flex items-center justify-center gap-2 mt-6 text-sm text-accent-primary hover:text-accent-primary-hover transition-colors">
              <Sparkles className="w-4 h-4" />
              View Full AI Report
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

