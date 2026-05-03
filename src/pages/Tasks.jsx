import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, GripVertical, Clock, Tag, AlertCircle, CheckCircle2, Circle, ArrowUpDown, X } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { useInsightsStore } from '../store/insightsStore'
import { format } from 'date-fns'

const priorityConfig = { 1: { label: 'Critical', color: 'badge-danger', bg: 'border-l-red-500' }, 2: { label: 'High', color: 'badge-warning', bg: 'border-l-amber-500' }, 3: { label: 'Medium', color: 'badge-indigo', bg: 'border-l-indigo-500' }, 4: { label: 'Low', color: 'badge-cyan', bg: 'border-l-cyan-500' }, 5: { label: 'Minimal', color: 'badge-success', bg: 'border-l-emerald-500' } }
const complexityColors = { LOW: 'badge-success', MEDIUM: 'badge-warning', HIGH: 'badge-danger' }
const columns = [
  { key: 'TODO', label: 'To Do', icon: Circle, accent: 'text-text-muted', bg: 'bg-white/[0.02]' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Clock, accent: 'text-accent-warning', bg: 'bg-accent-warning/[0.02]' },
  { key: 'DONE', label: 'Done', icon: CheckCircle2, accent: 'text-accent-success', bg: 'bg-accent-success/[0.02]' },
]

function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 3, complexity: 'MEDIUM', projectTag: 'DevPulse', estimatedHrs: '', deadline: '' })
  const handleSubmit = () => { if (!form.title.trim()) return; onAdd({ ...form, estimatedHrs: form.estimatedHrs ? Number(form.estimatedHrs) : null, deadline: form.deadline || null }); onClose() }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">New Task</h3><button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06]"><X className="w-4 h-4" /></button></div>
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-text-secondary mb-1 block">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Task title..." /></div>
          <div><label className="text-xs font-medium text-text-secondary mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none h-20" placeholder="Describe the task..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-text-secondary mb-1 block">Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} className="input-field">{[1,2,3,4,5].map((p) => <option key={p} value={p}>{priorityConfig[p].label} (P{p})</option>)}</select></div>
            <div><label className="text-xs font-medium text-text-secondary mb-1 block">Complexity</label><select value={form.complexity} onChange={(e) => setForm({ ...form, complexity: e.target.value })} className="input-field">{['LOW','MEDIUM','HIGH'].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-text-secondary mb-1 block">Project</label><select value={form.projectTag} onChange={(e) => setForm({ ...form, projectTag: e.target.value })} className="input-field">{['DevPulse','ML Pipeline','API Gateway','Mobile App','Data Engine'].map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="text-xs font-medium text-text-secondary mb-1 block">Est. Hours</label><input type="number" value={form.estimatedHrs} onChange={(e) => setForm({ ...form, estimatedHrs: e.target.value })} className="input-field" placeholder="0" /></div>
          </div>
        </div>
        <div className="flex gap-3 mt-5"><button onClick={onClose} className="btn-ghost flex-1">Cancel</button><button onClick={handleSubmit} className="btn-primary flex-1"><Plus className="w-4 h-4" />Create Task</button></div>
      </motion.div>
    </motion.div>
  )
}

function TaskCard({ task, onMove }) {
  const p = priorityConfig[task.priority] || priorityConfig[3]
  const eta = useInsightsStore((s) => s.taskETAs.find((e) => e.taskId === task.id))
  return (
    <motion.div layout className={`glass-card p-4 task-card-drag border-l-2 ${p.bg}`} whileHover={{ y: -2 }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-text-primary leading-snug">{task.title}</h4>
        <span className={`badge ${p.color} text-[10px] flex-shrink-0`}>P{task.priority}</span>
      </div>
      {task.description && <p className="text-xs text-text-muted mb-3 line-clamp-2">{task.description}</p>}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="badge badge-indigo text-[10px]">{task.projectTag}</span>
        <span className={`badge ${complexityColors[task.complexity]} text-[10px]`}>{task.complexity}</span>
        {task.estimatedHrs && <span className="text-[10px] text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{task.estimatedHrs}h</span>}
      </div>
      {eta && <div className="text-[10px] text-accent-secondary mb-2">⚡ ETA: {Math.round(eta.predictedHours * 10) / 10}h ({Math.round(eta.confidence * 100)}% conf.)</div>}
      {task.status !== 'DONE' && (
        <div className="flex gap-1.5 mt-1">
          {task.status === 'TODO' && <button onClick={() => onMove(task.id, 'IN_PROGRESS')} className="text-[10px] px-2 py-1 rounded-md bg-accent-warning/10 text-accent-warning hover:bg-accent-warning/20 transition-colors">Start</button>}
          {task.status === 'IN_PROGRESS' && (<><button onClick={() => onMove(task.id, 'TODO')} className="text-[10px] px-2 py-1 rounded-md bg-white/[0.05] text-text-muted hover:bg-white/[0.1] transition-colors">Back</button><button onClick={() => onMove(task.id, 'DONE')} className="text-[10px] px-2 py-1 rounded-md bg-accent-success/10 text-accent-success hover:bg-accent-success/20 transition-colors">Done</button></>)}
        </div>
      )}
    </motion.div>
  )
}

export default function Tasks() {
  const { tasks, addTask, moveTask } = useTaskStore()
  const [showAdd, setShowAdd] = useState(false)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">Task Board</h2><p className="text-xs text-text-muted mt-0.5">{tasks.length} tasks · {tasks.filter((t) => t.status === 'DONE').length} completed</p></div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs"><Plus className="w-4 h-4" />Add Task</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key).sort((a, b) => a.priority - b.priority)
          return (
            <div key={col.key} className={`rounded-2xl ${col.bg} p-4 kanban-column`}>
              <div className="flex items-center gap-2 mb-4">
                <col.icon className={`w-4 h-4 ${col.accent}`} />
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="ml-auto text-xs text-text-muted font-mono">{colTasks.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>{colTasks.map((t) => <TaskCard key={t.id} task={t} onMove={moveTask} />)}</AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
      <AnimatePresence>{showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} />}</AnimatePresence>
    </motion.div>
  )
}
