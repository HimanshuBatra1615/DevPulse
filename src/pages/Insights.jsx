import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Shield, Clock, TrendingUp, AlertTriangle, CheckCircle, Zap, Target, ArrowRight } from 'lucide-react'
import { useInsightsStore } from '../store/insightsStore'
import { useTaskStore } from '../store/taskStore'

function FocusGauge({ score, level }) {
  const radius = 80, stroke = 10, circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={200} height={200} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
          <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 100 100)" className="gauge-circle" style={{ '--gauge-offset': offset }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono" style={{ color }}>{score}</span>
          <span className="text-xs text-text-muted mt-1">/ 100</span>
        </div>
      </div>
      <span className={`badge mt-3 ${score >= 75 ? 'badge-success' : score >= 55 ? 'badge-warning' : 'badge-danger'}`}>{level} FOCUS</span>
    </div>
  )
}

function BurnoutCard({ risk }) {
  if (!risk) return null
  const bgGradient = risk.level === 'LOW' ? 'from-accent-success/10 to-accent-success/5' : risk.level === 'MODERATE' ? 'from-accent-warning/10 to-accent-warning/5' : 'from-accent-danger/10 to-accent-danger/5'
  const icon = risk.level === 'LOW' ? CheckCircle : risk.level === 'MODERATE' ? AlertTriangle : AlertTriangle
  const Icon = icon
  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-accent-secondary" /><h3 className="text-sm font-semibold">Burnout Risk Assessment</h3></div>
        <span className={`badge ${risk.level === 'LOW' ? 'badge-success' : risk.level === 'MODERATE' ? 'badge-warning' : 'badge-danger'}`}>{risk.level}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {[{ label: 'Weekly Hours', value: risk.metrics.weeklyHours + 'h' }, { label: 'Avg Session', value: risk.metrics.avgSessionLength + 'h' }, { label: 'Completion', value: Math.round(risk.metrics.taskCompletionRate * 100) + '%' }, { label: 'Night Ratio', value: Math.round(risk.metrics.lateNightRatio * 100) + '%' }, { label: 'Weekend', value: Math.round(risk.metrics.weekendRatio * 100) + '%' }, { label: 'Risk Score', value: risk.score + '/100' }].map((m, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-white/[0.03]"><p className="text-[10px] text-text-muted">{m.label}</p><p className="text-sm font-bold font-mono mt-0.5">{m.value}</p></div>
        ))}
      </div>
      <div className="space-y-2">{risk.recommendations.map((r, i) => (
        <div key={i} className="flex items-start gap-2 text-xs text-text-secondary"><Icon className="w-3.5 h-3.5 mt-0.5 text-accent-success flex-shrink-0" /><p>{r}</p></div>
      ))}</div>
    </div>
  )
}

export default function Insights() {
  const { focusPrediction, burnoutRisk, taskETAs, isLoading, fetchInsights, refreshFocusScore } = useInsightsStore()
  const { tasks } = useTaskStore()
  useEffect(() => { if (!focusPrediction) fetchInsights(tasks) }, [])
  const focus = focusPrediction

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center"><Brain className="w-5 h-5 text-white" /></div><div><h2 className="text-lg font-semibold">AI Insights</h2><p className="text-xs text-text-muted">Powered by DevPulse ML Engine</p></div></div>
        <button onClick={() => { refreshFocusScore(); fetchInsights(tasks) }} className="btn-ghost text-xs"><Sparkles className="w-3.5 h-3.5" />Refresh</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Score */}
        <motion.div className="glass-card p-6 lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-accent-warning" />Current Focus Score</h3>
          {focus ? <FocusGauge score={focus.score} level={focus.level} /> : <div className="shimmer h-52 rounded-xl" />}
          {focus && (
            <div className="mt-4 space-y-2">{focus.factors.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs"><span className={`w-1.5 h-1.5 rounded-full ${f.impact === 'positive' ? 'bg-accent-success' : 'bg-accent-danger'}`} /><span className="text-text-secondary">{f.name}</span><span className="text-text-muted ml-auto">{f.detail}</span></div>
            ))}</div>
          )}
          {focus && <p className="text-xs text-text-secondary mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">💡 {focus.recommendation}</p>}
        </motion.div>

        {/* Burnout + ETAs */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <BurnoutCard risk={burnoutRisk} />
          </motion.div>

          <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-accent-cyan" />Task Completion Predictions</h3>
            <div className="space-y-3">{taskETAs.slice(0, 6).map((eta, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{eta.title}</p><p className="text-xs text-text-muted">Based on {eta.basedOnSimilar} similar tasks</p></div>
                <div className="text-right flex-shrink-0"><p className="text-sm font-bold font-mono text-accent-cyan">{Math.round(eta.predictedHours * 10) / 10}h</p><p className="text-[10px] text-text-muted">{Math.round(eta.confidence * 100)}% confidence</p></div>
              </div>
            ))}</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

