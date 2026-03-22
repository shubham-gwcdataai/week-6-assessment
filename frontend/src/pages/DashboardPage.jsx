import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import UserDashboard from './UserDashboard'
import AdminDashboard from './AdminDashboard'
import ProfilePage from './ProfilePage'

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth()
  const [view, setView] = useState(isAdmin ? 'admin' : 'todos')
  const [open, setOpen] = useState(false)

  const navItems = isAdmin
    ? [{ id: 'admin',  label: 'Admin Panel', tag: true },
       { id: 'profile', label: 'My Profile', tag: false }]
    : [{ id: 'todos', label: 'My Todos', tag: false },
       { id: 'profile', label: 'My Profile', tag: false }]

  const titles = { todos: 'My Todos', profile: 'Profile', admin: 'Admin Panel' }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100
        flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-bold text-slate-800">
            Todo App
          </div>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${isAdmin ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : 'bg-gradient-to-br from-indigo-500 to-blue-500'}`}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-slate-800 text-sm truncate">{user?.username}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 pb-1.5">Menu</p>
          {navItems.map(item => (
            <button key={item.id}
              onClick={() => { setView(item.id); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                view === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}>
             
              {item.label}
              {item.tag && (
                <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold">Admin</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
            {isAdmin ? 'Admin' : '👤 User'}
          </span>
          <button onClick={logout}
            className="w-full py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content — takes remaining width, never shrinks below 0 */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
        <header className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setOpen(v => !v)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-bold text-slate-800 text-base flex-1 truncate">{titles[view]}</h1>
          <button onClick={logout}
            className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition flex-shrink-0">
            Sign Out
          </button>
        </header>

        <main className="flex-1 p-4 overflow-x-hidden">
          {view === 'todos'   && <UserDashboard />}
          {view === 'profile' && <ProfilePage />}
          {view === 'admin'   && <AdminDashboard />}
        </main>
      </div>
    </div>
  )
}