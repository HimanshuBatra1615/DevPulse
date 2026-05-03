import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Mail, Save, Moon, Sun, Globe, Key } from 'lucide-react'
import { GithubIcon as Github } from '../components/icons/GithubIcon'
import { useAuthStore } from '../store/authStore'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [notifs, setNotifs] = useState({ email: true, push: true, weekly: true, burnout: true })
  const [saved, setSaved] = useState(false)

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
      <h2 className="text-lg font-semibold mb-6">Settings</h2>

      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === t.key ? 'bg-accent-primary/15 text-accent-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-white/[0.06]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-2xl font-bold text-white">{user?.username?.charAt(0).toUpperCase()}</div>
            <div><p className="font-semibold text-lg">{user?.username}</p><p className="text-sm text-text-muted">{user?.email}</p><span className="badge badge-indigo mt-1">{user?.role}</span></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-text-secondary mb-1 block">Username</label><input defaultValue={user?.username} className="input-field" /></div>
            <div><label className="text-xs font-medium text-text-secondary mb-1 block">Email</label><input defaultValue={user?.email} className="input-field" /></div>
          </div>
          <div><label className="text-xs font-medium text-text-secondary mb-1 block">Bio</label><textarea className="input-field resize-none h-20" placeholder="Tell us about yourself..." /></div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <Github className="w-5 h-5 text-text-secondary" /><div className="flex-1"><p className="text-sm font-medium">GitHub</p><p className="text-xs text-text-muted">Connect your GitHub account for OAuth login and commit tracking</p></div>
            <button className="btn-ghost text-xs">Connect</button>
          </div>
          <button onClick={handleSave} className="btn-primary">{saved ? <><CheckIcon className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Changes</>}</button>
        </motion.div>
      )}

      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
          {[{ key: 'email', label: 'Email Notifications', desc: 'Receive weekly productivity reports via email', icon: Mail },
            { key: 'push', label: 'Push Notifications', desc: 'Browser notifications for session reminders', icon: Bell },
            { key: 'weekly', label: 'Weekly Digest', desc: 'Sunday evening summary of your productivity week', icon: Globe },
            { key: 'burnout', label: 'Burnout Alerts', desc: 'Get notified when your burnout risk increases', icon: Shield }].map((n) => (
            <div key={n.key} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <n.icon className="w-5 h-5 text-text-secondary flex-shrink-0" />
              <div className="flex-1"><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-text-muted">{n.desc}</p></div>
              <button onClick={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })} className={`w-11 h-6 rounded-full relative transition-colors ${notifs[n.key] ? 'bg-accent-primary' : 'bg-white/[0.1]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifs[n.key] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
          <div><label className="text-xs font-medium text-text-secondary mb-1 block">Current Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
          <div><label className="text-xs font-medium text-text-secondary mb-1 block">New Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
          <div><label className="text-xs font-medium text-text-secondary mb-1 block">Confirm Password</label><input type="password" className="input-field" placeholder="••••••••" /></div>
          <button className="btn-primary"><Key className="w-4 h-4" />Update Password</button>
        </motion.div>
      )}

      {activeTab === 'appearance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-6">
          <div><h4 className="text-sm font-semibold mb-3">Theme</h4>
            <div className="flex gap-3">
              {[{ icon: Moon, label: 'Dark', active: true }, { icon: Sun, label: 'Light', active: false }].map((t) => (
                <button key={t.label} className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${t.active ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-white/[0.06] text-text-muted hover:border-white/[0.12]'}`}>
                  <t.icon className="w-4 h-4" />{t.label}
                </button>
              ))}
            </div>
          </div>
          <div><h4 className="text-sm font-semibold mb-3">Accent Color</h4>
            <div className="flex gap-3">
              {[{ color: '#6366f1', label: 'Indigo' }, { color: '#8b5cf6', label: 'Violet' }, { color: '#06b6d4', label: 'Cyan' }, { color: '#10b981', label: 'Emerald' }, { color: '#ec4899', label: 'Pink' }].map((c) => (
                <button key={c.label} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/[0.3] transition-all" style={{ backgroundColor: c.color }} title={c.label} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function CheckIcon(props) {
  return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>)
}
