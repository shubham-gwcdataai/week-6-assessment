import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteUser, setDeleteUser] = useState(null)

  useEffect(() => { fetchStats() }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/admin/users', { params: { search, role: roleFilter, page, limit: 8 } })
      setUsers(r.data.users); setTotalPages(r.data.totalPages); setTotal(r.data.total)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [search, roleFilter, page])

  useEffect(() => { if (tab === 'users') fetchUsers() }, [tab, fetchUsers])
  useEffect(() => { if (tab === 'logs') fetchLogs() }, [tab])

  const fetchStats = async () => {
    try { const r = await api.get('/admin/stats'); setStats(r.data) }
    catch { toast.error('Failed to load stats') }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try { const r = await api.get('/admin/audit-logs?limit=40'); setLogs(r.data.logs) }
    catch { toast.error('Failed to load logs') }
    finally { setLoading(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/admin/users/${editUser.id}`, editForm)
      toast.success('User updated'); setEditUser(null); fetchUsers(); fetchStats()
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed') }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteUser.id}`)
      toast.success(`"${deleteUser.username}" deleted`); setDeleteUser(null); fetchUsers(); fetchStats()
    } catch (err) { toast.error(err.response?.data?.error || 'Delete failed') }
  }

  const inp = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {[['overview','Overview'], ['users','Users'], ['logs','Audit Logs']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[{ l: 'Total Users', v: stats.totalUsers, c: 'text-indigo-600' },
              { l: 'Active', v: stats.totalActive, c: 'text-emerald-600' },
              { l: 'Admins', v: stats.totalAdmins, c: 'text-violet-600' }].map(s => (
              <div key={s.l} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{s.l}</div>
                <div className={`text-3xl font-bold ${s.c}`}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <span className="font-semibold text-slate-800 text-sm">Recent Activity</span>
              <span className="text-xs text-slate-400 font-mono">MongoDB</span>
            </div>
            {stats.recentLogs.length === 0
              ? <p className="text-center text-slate-400 text-sm py-8">No activity yet</p>
              : stats.recentLogs.map(log => (
                <div key={log._id} className="flex items-start gap-3 px-5 py-3 border-b border-slate-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs font-medium text-slate-800">{log.action}</div>
                    <div className="text-xs text-slate-400 truncate">{log.username} · {log.resource}</div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono flex-shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <input placeholder="Search name or email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 min-w-40 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="text-xs text-slate-400">{total} result{total !== 1 ? 's' : ''}</p>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">Loading…</td></tr>
                    : users.length === 0
                    ? <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">No users found</td></tr>
                    : users.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${u.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : 'bg-gradient-to-br from-indigo-400 to-blue-500'}`}>
                              {u.username[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{u.username}</div>
                              <div className="text-xs text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                            {u.role === 'admin' ? '👑' : '👤'} {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => { setEditUser(u); setEditForm({ username: u.username, email: u.email, role: u.role, isActive: u.isActive }) }}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Edit</button>
                            <button onClick={() => setDeleteUser(u)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${page === p ? 'bg-indigo-600 text-white border-indigo-600' : 'border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">›</button>
            </div>
          )}
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
            <span className="font-semibold text-slate-800 text-sm flex-1">Audit Logs</span>
            <span className="text-xs text-slate-400 font-mono">MongoDB</span>
            <button onClick={fetchLogs} className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">Refresh</button>
          </div>
          {loading ? <p className="text-center text-slate-400 text-sm py-8">Loading…</p>
          : logs.length === 0 ? <p className="text-center text-slate-400 text-sm py-8">No logs yet</p>
          : logs.map(log => (
            <div key={log._id} className="flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-slate-800">{log.action}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${log.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {log.success ? 'OK' : 'FAIL'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {log.username} ({log.role}) · {log.method} {log.resource}{log.message ? ` · ${log.message}` : ''}
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono flex-shrink-0 hidden sm:block">{new Date(log.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[slideUp_.2s_ease]">
            <h3 className="font-bold text-slate-800 text-base mb-5">Edit User</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Username</label>
                  <input className={inp} value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} required /></div>
                <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                  <input type="email" className={inp} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Role</label>
                  <select className={inp} value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select></div>
                <div><label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                  <select className={inp} value={String(editForm.isActive)} onChange={e => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}>
                    <option value="true">Active</option><option value="false">Inactive</option>
                  </select></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setDeleteUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-slate-800 text-base mb-2">Delete User</h3>
            <p className="text-slate-500 text-sm mb-5">Delete <strong>{deleteUser.username}</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteUser(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
