import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, User, Sparkles } from 'lucide-react'
import { GithubIcon as Github } from '../components/icons/GithubIcon'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { login, register, loginWithGithub, error, isLoading } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'login') {
      await login(email, password)
    } else {
      await register(username, email, password)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="bg-gradient-mesh" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-secondary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-primary/20"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Dev</span><span className="text-text-primary">Pulse</span>
          </h1>
          <p className="text-sm text-text-secondary mt-2">AI-Powered Developer Productivity OS</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button onClick={() => setMode('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-secondary'}`}>Sign In</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-secondary'}`}>Sign Up</button>
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={loginWithGithub}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/[0.08] hover:border-white/[0.16] bg-white/[0.03] hover:bg-white/[0.06] transition-all text-sm font-medium mb-5"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="text-xs text-text-muted">or continue with email</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-accent-danger/10 border border-accent-danger/20 rounded-lg text-accent-danger text-xs text-center font-medium">
                {error}
              </motion.div>
            )}
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Username</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" style={{ paddingLeft: '3rem' }} placeholder="johndoe" />
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input-field" style={{ paddingLeft: '3rem' }} placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? 'text' : 'password'} className="input-field pr-12" style={{ paddingLeft: '3rem' }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end"><button type="button" className="text-xs text-accent-primary hover:text-accent-primary-hover transition-colors">Forgot password?</button></div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
              {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Feature badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {['AI Insights', 'Session Tracking', 'Focus Scores', 'Burnout Detection'].map((f) => (
            <span key={f} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-text-muted">
              <Sparkles className="w-2.5 h-2.5 text-accent-secondary" />{f}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
