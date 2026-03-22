# Secure API — Frontend (React + Vite)

A React frontend that connects to the Express backend and visually showcases
authentication, role-based access control, and audit logging.

---

## What's Inside

```
secure-frontend/
├── src/
│   ├── api/
│   │   └── axios.js             ← Axios instance: sets base URL + auto-attaches JWT
│   │
│   ├── context/
│   │   └── AuthContext.jsx      ← Global auth state (user, token, login, logout)
│   │
│   ├── components/
│   │   └── ProtectedRoute.jsx   ← Redirects to /login if not authenticated
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx        ← Login form → calls POST /api/auth/login
│   │   ├── RegisterPage.jsx     ← Register form → calls POST /api/auth/register
│   │   └── DashboardPage.jsx    ← Main app: profile, users, audit logs, role management
│   │
│   ├── App.jsx                  ← Router setup + AuthProvider wrapper
│   ├── main.jsx                 ← React entry point
│   └── index.css                ← All styles (dark industrial theme)
│
├── vite.config.js               ← Vite config with /api proxy to backend
└── index.html                   ← HTML shell
```

---

## Setup

### 1. Make sure the backend is running first
```bash
cd secure-api
npm run dev   # must be on port 3000
```

### 2. Install frontend dependencies
```bash
cd secure-frontend
npm install
```

### 3. Start the dev server
```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Pages & Features

### `/register` — Registration page
- Form with username, email, password
- Calls `POST /api/auth/register`
- On success: saves token to localStorage, redirects to dashboard

### `/login` — Login page
- Calls `POST /api/auth/login`
- Token stored in `localStorage` via `AuthContext`

### `/dashboard` — Main dashboard (protected)
Redirects to `/login` if no token found.

**Sidebar panels (visible based on role):**

| Panel | Route Called | Visible To |
|-------|-------------|-----------|
| My Profile | GET /api/profile | everyone |
| All Users | GET /api/moderator/users | moderator, admin |
| Audit Logs | GET /api/admin/audit-logs | admin only |
| Manage Roles | PATCH /api/admin/users/:id/role | admin only |

The sidebar automatically hides panels the user doesn't have access to.
If they somehow trigger a restricted endpoint, they'll get a toast notification
with the 403 error message from the backend.

---

## Key Concepts Demonstrated

### Axios interceptors (src/api/axios.js)
```js
// Automatically adds JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Automatically handles expired token (redirects to login)
api.interceptors.response.use(res => res, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});
```

### AuthContext (src/context/AuthContext.jsx)
```js
// Any component can call:
const { user, isAdmin, isModerator, logout } = useAuth();
```

### ProtectedRoute (src/components/ProtectedRoute.jsx)
```jsx
// In App.jsx — wraps routes that need auth
<Route path="/dashboard" element={
  <ProtectedRoute><DashboardPage /></ProtectedRoute>
} />
```

### Frontend RBAC (DashboardPage.jsx)
```jsx
// Sidebar hides panels user can't access
{isModerator && <button>All Users</button>}
{isAdmin && <button>Audit Logs</button>}
```
Note: this is UI-only hiding. The backend enforces real access control.

---

## Build for Production

```bash
npm run build
# Creates: secure-frontend/dist/
# Serve dist/ with any static file server or Express.static()
```
