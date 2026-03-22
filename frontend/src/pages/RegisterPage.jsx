import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('user')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { ...form, role })
      login(res.data.user, res.data.token)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-10 w-72 h-72 bg-violet-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Choose your<br /><span className="text-violet-400 italic">role & start.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
            Users manage their own todos. Admins get full access to all users, roles, and audit logs.
          </p>
          <div className="space-y-3">
            {['User — personal todo management', 'Admin — manage all users', 'Admin — view audit logs', 'Admin — change roles'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold mb-8">
           Todo App
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Pick a role, then fill in your details.</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[{ id: 'user', icon: '👤', name: 'User', desc: 'Standard access' },
              { id: 'admin', icon: '👑', name: 'Admin', desc: 'Full access' }].map(r => (
              <div key={r.id} onClick={() => setRole(r.id)}
                className={`border-2 rounded-xl p-4 cursor-pointer text-center transition ${
                  role === r.id
                    ? r.id === 'admin' ? 'border-violet-500 bg-violet-50' : 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                <div className="text-2xl mb-1">{r.icon}</div>
                <div className="font-700 text-sm font-bold text-slate-800">{r.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {[['Username', 'text', 'yourname', 'username', 3],
              ['Email', 'email', 'you@example.com', 'email', 1],
              ['Password', 'password', 'min. 6 characters', 'password', 6]].map(([label, type, ph, key, min]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                <input type={type} required minLength={min} placeholder={ph}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-400" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm shadow-lg shadow-indigo-200">
              {loading ? 'Creating…' : `Create ${role === 'admin' ? 'Admin ' : ''}Account`}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
