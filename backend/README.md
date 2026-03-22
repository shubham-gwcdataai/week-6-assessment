# Secure API — Backend (Node.js + Express)

## What This Covers
- ✅ JWT Authentication (register / login)
- ✅ Role-Based Access Control — user / moderator / admin
- ✅ MySQL via Sequelize ORM
- ✅ MongoDB via Mongoose ODM (audit logs)
- ✅ Security middleware (Helmet, CORS, Rate Limiting)

---

## Project Structure

```
secure-api/
├── server.js                    ← Entry point
├── .env.example                 ← Copy to .env and fill in values
│
├── config/
│   ├── mysql.js                 ← Sequelize connection to MySQL
│   └── mongodb.js               ← Mongoose connection to MongoDB
│
├── models/
│   ├── sql/User.js              ← Sequelize model → "users" table in MySQL
│   └── mongo/AuditLog.js        ← Mongoose model → "audit_logs" in MongoDB
│
├── middleware/
│   ├── auth.js                  ← Verifies JWT token on protected routes
│   └── rbac.js                  ← authorize('admin') / authorize('moderator','admin')
│
├── controllers/
│   ├── authController.js        ← register() and login() logic
│   └── userController.js        ← profile, user list, role change, audit logs
│
├── routes/
│   ├── auth.js                  ← POST /api/auth/register  /login
│   └── user.js                  ← Protected routes with RBAC
│
├── utils/
│   └── auditLogger.js           ← Writes events to MongoDB
│
└── SECURITY_AUDIT_REPORT.md     ← Deliverable 4
```

---

## Setup

### 1. Install dependencies
```bash
cd secure-api
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Open .env and fill in your MySQL password and MongoDB URI
```

### 3. Create MySQL database
```bash
mysql -u root -p -e "CREATE DATABASE secure_api_db;"
```
Sequelize will auto-create the `users` table when the server starts.

### 4. Start the server
```bash
npm run dev     # with auto-restart (nodemon)
npm start       # without
```

Server runs at: **http://localhost:3000**

---

## API Reference

### Public endpoints (no token required)

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/register` | `{ username, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

Both return: `{ token: "eyJ...", user: { id, username, email, role } }`

### Protected endpoints (add `Authorization: Bearer <token>` header)

| Method | Endpoint | Required Role |
|--------|----------|--------------|
| GET | `/api/profile` | any |
| GET | `/api/moderator/users` | moderator or admin |
| PATCH | `/api/admin/users/:id/role` | admin only |
| GET | `/api/admin/audit-logs` | admin only |

---

## How RBAC Works

```
Every protected request goes through TWO middleware layers:

1. authenticate  →  checks JWT token, attaches req.user
        ↓
2. authorize('admin')  →  checks req.user.role
        ↓
   ✅ match  →  controller runs
   ❌ no match  →  403 Forbidden + audit log written to MongoDB
```

---

## Testing with curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"pass1234"}'

# Login (copy the token from response)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"pass1234"}'

# Access profile
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Try admin route as regular user → 403 Forbidden
curl http://localhost:3000/api/admin/audit-logs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

To test admin routes: manually update your role in MySQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'alice@test.com';
```
Then log in again to get a fresh token with the new role embedded.
