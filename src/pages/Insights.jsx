import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Shield, Target, AlertTriangle, CheckCircle, Zap, Activity, Clock, Calendar, CheckSquare } from 'lucide-react'
import { useInsightsStore } from '../store/insightsStore'
import { useTaskStore } from '../store/taskStore'

function FocusGauge({ score, level }) {
  const radius = 90, stroke = 12, circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444'
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={220} height={220} viewBox="0 0 220 220">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
          <circle cx="110" cy="110" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 110 110)" className="gauge-circle" style={{ '--gauge-offset': offset }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold font-mono" style={{ color }}>{score}</span>
          <span className="text-sm text-text-muted mt-2 font-medium tracking-wide">/ 100</span>
        </div>
      </div>
      <span className={`badge mt-6 px-4 py-1.5 text-xs ${score >= 75 ? 'badge-success' : score >= 55 ? 'badge-warning' : 'badge-danger'}`}>{level} FOCUS</span>
    </div>
  )
}

function BurnoutCard({ risk }) {
  if (!risk) return null
  
  const isLow = risk.level === 'LOW'
  const isModerate = risk.level === 'MODERATE'
  const bgGradient = isLow ? 'from-accent-success/10 to-accent-success/5' : isModerate ? 'from-accent-warning/10 to-accent-warning/5' : 'from-accent-danger/10 to-accent-danger/5'
  const Icon = isLow ? CheckCircle : AlertTriangle

  const metrics = [
    { label: 'Weekly Hours', value: risk.metrics.weeklyHours + 'h', icon: Clock },
    { label: 'Avg Session', value: risk.metrics.avgSessionLength + 'h', icon: Activity },
    { label: 'Completion', value: Math.round(risk.metrics.taskCompletionRate * 100) + '%', icon: CheckSquare },
    { label: 'Night Ratio', value: Math.round(risk.metrics.lateNightRatio * 100) + '%', icon: Zap },
    { label: 'Weekend', value: Math.round(risk.metrics.weekendRatio * 100) + '%', icon: Calendar },
    { label: 'Risk Score', value: risk.score + '/100', icon: Shield }
  ]

  return (
    <div className={`glass-card p-8 bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isLow ? 'bg-accent-success/20 text-accent-success' : isModerate ? 'bg-accent-warning/20 text-accent-warning' : 'bg-accent-danger/20 text-accent-danger'}`}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary">Burnout Risk Assessment</h3>
            <p className="text-sm text-text-muted mt-1">Based on your recent activity patterns</p>
          </div>
        </div>
        <span className={`badge px-4 py-2 text-sm ${isLow ? 'badge-success' : isModerate ? 'badge-warning' : 'badge-danger'}`}>{risk.level} RISK</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="p-4 rounded-xl bg-bg-primary/40 border border-white/[0.04] hover:border-white/[0.1] transition-colors flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-4 h-4 text-text-muted" />
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{m.label}</p>
            </div>
            <p className="text-2xl font-bold font-mono text-text-primary">{m.value}</p>
          </div>
        ))}
      </div>
      
      <div className="space-y-4 bg-bg-primary/30 p-5 rounded-xl border border-white/[0.04]">
        <h4 className="text-sm font-semibold text-text-primary mb-3">AI Recommendations</h4>
        {risk.recommendations.map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isLow ? 'text-accent-success' : isModerate ? 'text-accent-warning' : 'text-accent-danger'}`} />
            <p className="text-sm text-text-secondary leading-relaxed">{r}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Insights() {
  const { focusPrediction, burnoutRisk, taskETAs, isLoading, fetchInsights, refreshFocusScore } = useInsightsStore()
  const { tasks } = useTaskStore()
  
  useEffect(() => { 
    if (!focusPrediction) fetchInsights(tasks) 
  }, [])
  
  const focus = focusPrediction

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-[1400px] px-2 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-text-primary">AI Insights</h2>
            <p className="text-base text-text-secondary mt-1">Powered by DevPulse ML Engine</p>
          </div>
        </div>
        <button onClick={() => { refreshFocusScore(); fetchInsights(tasks) }} className="btn-primary">
          <Sparkles className="w-5 h-5" /> 
          Refresh Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Focus Score */}
        <motion.div className="glass-card p-8 lg:col-span-1 flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-warning/20 text-accent-warning">
              <Zap className="w-5 h-5" />
            </div>
            Current Focus Score
          </h3>
          
          <div className="flex-1 flex flex-col justify-center">
            {focus ? <FocusGauge score={focus.score} level={focus.level} /> : <div className="shimmer h-64 rounded-2xl" />}
            
            {focus && (
              <div className="mt-8 space-y-4">
                {focus.factors.map((f, i) => (
                  <div key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-bg-primary/40 border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${f.impact === 'positive' ? 'bg-accent-success' : 'bg-accent-danger'}`} />
                      <span className="text-sm font-semibold text-text-primary">{f.name}</span>
                    </div>
                    <span className="text-xs text-text-muted pl-4">{f.detail}</span>
                  </div>
                ))}
              </div>
            )}
            
            {focus && (
              <div className="mt-6 p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/20">
                <p className="text-sm text-text-primary leading-relaxed">💡 {focus.recommendation}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Burnout + ETAs */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <BurnoutCard risk={burnoutRisk} />
          </motion.div>

          <motion.div className="glass-card p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-cyan/20 text-accent-cyan">
                  <Target className="w-6 h-6" />
                </div>
                Task Completion Predictions
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskETAs.slice(0, 6).map((eta, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-bg-primary/40 border border-white/[0.04] hover:border-white/[0.1] hover:bg-bg-primary/60 transition-all">
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-base font-semibold text-text-primary truncate mb-1">{eta.title}</p>
                    <p className="text-sm text-text-muted">Based on {eta.basedOnSimilar} similar tasks</p>
                  </div>
                  <div className="text-right flex-shrink-0 bg-white/[0.03] p-3 rounded-xl border border-white/[0.04]">
                    <p className="text-xl font-bold font-mono text-accent-cyan mb-1">{Math.round(eta.predictedHours * 10) / 10}h</p>
                    <p className="text-xs font-medium text-text-muted">{Math.round(eta.confidence * 100)}% conf.</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
