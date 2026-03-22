import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { login, token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState('edit')
  const [form, setForm] = useState({ username: '', email: '' })
  const [pass, setPass] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/profile').then(r => {
      setProfile(r.data.user)
      setForm({ username: r.data.user.username, email: r.data.user.email })
    }).catch(() => toast.error('Failed to load profile'))
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await api.put('/profile', form)
      setProfile(res.data.user); login(res.data.user, token)
      toast.success('Profile updated')
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed') }
    finally { setSaving(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pass.newPassword !== pass.confirm) { toast.error('Passwords do not match'); return }
    setSaving(true)
    try {
      await api.put('/profile/password', { currentPassword: pass.currentPassword, newPassword: pass.newPassword })
      toast.success('Password changed')
      setPass({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  if (!profile) return <p className="text-slate-400 text-sm pt-8">Loading…</p>

  const isAdmin = profile.role === 'admin'

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : 'bg-gradient-to-br from-indigo-500 to-blue-500'}`}>
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">{profile.username}</h2>
            <p className="text-slate-500 text-sm">{profile.email}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-bold mt-1.5 px-2.5 py-0.5 rounded-full ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
              {isAdmin ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{ l: 'Account ID', v: `#${profile.id}`, mono: true },
            { l: 'Status', v: 'Active' },
            { l: 'Member since', v: new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
          ].map(s => (
            <div key={s.l} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.l}</div>
              <div className={`font-bold text-slate-800 text-sm ${s.mono ? 'font-mono' : ''}`}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-5">
        {[['edit', 'Edit Profile'], ['password', 'Password']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'edit' && (
        <form onSubmit={saveProfile}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[['Username', 'text', 'username', 3], ['Email', 'email', 'email', 1]].map(([label, type, key, min]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                <input type={type} required minLength={min} value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
              </div>
            ))}
          </div>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-indigo-200">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={savePassword} className="max-w-sm space-y-4">
          {[['Current password', 'currentPassword', 1], ['New password', 'newPassword', 6], ['Confirm new password', 'confirm', 6]].map(([label, key, min]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
              <input type="password" required minLength={min} value={pass[key]}
                onChange={e => setPass({ ...pass, [key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
            </div>
          ))}
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-indigo-200">
            {saving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  )
}
