import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const PRIORITY = {
  high:   { dot: 'bg-red-500',    label: 'High',   badge: 'bg-red-50 text-red-600' },
  medium: { dot: 'bg-amber-500',  label: 'Medium', badge: 'bg-amber-50 text-amber-600' },
  low:    { dot: 'bg-emerald-500', label: 'Low',   badge: 'bg-emerald-50 text-emerald-600' },
}

export default function UserDashboard() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editVal, setEditVal] = useState('')
  const editRef = useRef(null)

  useEffect(() => { fetchTodos() }, [])
  useEffect(() => { if (editingId && editRef.current) editRef.current.focus() }, [editingId])

  const fetchTodos = async () => {
    try { const res = await api.get('/todos'); setTodos(res.data.todos) }
    catch { toast.error('Failed to load todos') }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    try {
      const res = await api.post('/todos', { title: input.trim(), priority })
      setTodos(prev => [res.data.todo, ...prev])
      setInput('')
    } catch { toast.error('Failed to add todo') }
  }

  const toggle = async (todo) => {
    try {
      const res = await api.put(`/todos/${todo.id}`, { completed: !todo.completed })
      setTodos(prev => prev.map(t => t.id === todo.id ? res.data.todo : t))
    } catch { toast.error('Failed to update') }
  }

  const saveEdit = async (id) => {
    if (!editVal.trim()) { setEditingId(null); return }
    try {
      const res = await api.put(`/todos/${id}`, { title: editVal.trim() })
      setTodos(prev => prev.map(t => t.id === id ? res.data.todo : t))
      setEditingId(null)
    } catch { toast.error('Failed to save') }
  }

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`)
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch { toast.error('Failed to delete') }
  }

  const clearCompleted = async () => {
    const ids = todos.filter(t => t.completed).map(t => t.id)
    await Promise.all(ids.map(id => api.delete(`/todos/${id}`)))
    setTodos(prev => prev.filter(t => !t.completed))
    toast.success('Cleared completed tasks')
  }

  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'active' ? !t.completed : t.completed
  )
  const done = todos.filter(t => t.completed).length
  const remaining = todos.length - done

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-slate-800">My Todos</h1>
        {todos.length > 0 && (
          <div className="flex gap-3 text-xs text-slate-400">
            <span><strong className="text-slate-700">{remaining}</strong> remaining</span>
            <span><strong className="text-slate-700">{done}</strong> done</span>
            <span><strong className="text-slate-700">{todos.length}</strong> total</span>
          </div>
        )}
      </div>

     <form onSubmit={addTodo} className="mb-4">
  <div className="flex flex-col sm:flex-row gap-2">
    <input
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder="Add a new task…"
      className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400 shadow-sm"
    />
    <div className="flex gap-2">
      <select
        value={priority}
        onChange={e => setPriority(e.target.value)}
        className="flex-1 sm:flex-none px-3 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
      >
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>
      <button
        type="submit"
        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-indigo-200 whitespace-nowrap flex-shrink-0"
      >
        Add
      </button>
    </div>
  </div>
</form>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[['all','All'], ['active','Active'], ['completed','Done']].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${
              filter === id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}>
            {label}
          </button>
        ))}
        {done > 0 && (
          <button onClick={clearCompleted}
            className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition">
            Clear completed
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">{filter === 'completed' ? '✓' : '📋'}</div>
          <p className="text-sm">
            {filter === 'completed' ? 'No completed tasks yet.' : filter === 'active' ? 'All done! Nothing remaining.' : 'No tasks yet. Add one above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(todo => (
            <div key={todo.id}
              className={`group flex items-center gap-3 bg-white border rounded-xl px-4 py-3 shadow-sm transition hover:shadow-md hover:border-slate-200 ${
                todo.completed ? 'opacity-60 border-slate-100' : 'border-slate-200'
              }`}>
              <button onClick={() => toggle(todo)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                  todo.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400'
                }`}>
                {todo.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </button>

              {editingId === todo.id ? (
                <input ref={editRef} value={editVal} onChange={e => setEditVal(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(todo.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 text-sm font-medium text-slate-800 border-b-2 border-indigo-500 outline-none bg-transparent" />
              ) : (
                <span onDoubleClick={() => !todo.completed && (setEditingId(todo.id), setEditVal(todo.title))}
                  className={`flex-1 text-sm font-medium cursor-default select-none ${todo.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {todo.title}
                </span>
              )}

              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline ${PRIORITY[todo.priority].badge}`}>
                {PRIORITY[todo.priority].label}
              </span>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 sm:hidden ${PRIORITY[todo.priority].dot}`} />

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition sm:opacity-100 flex-shrink-0">
                {!todo.completed && editingId !== todo.id && (
                  <button onClick={() => { setEditingId(todo.id); setEditVal(todo.title) }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition text-sm">
                    ✎
                  </button>
                )}
                <button onClick={() => deleteTodo(todo.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition text-sm">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
