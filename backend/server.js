require('dotenv').config();
const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const sequelize    = require('./config/mysql');
const connectMongo = require('./config/mongodb');
const authRoutes   = require('./routes/auth');
const userRoutes   = require('./routes/user');
const todoRoutes   = require('./routes/todos');

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  credentials: true,
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests.' } }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth',  require('./routes/auth'));
app.use('/api',       userRoutes);
app.use('/api/todos', todoRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found.` }));
app.use((err, req, res, next) => res.status(500).json({ error: 'Internal server error.' }));

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectMongo();
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');
    await sequelize.sync({ alter: true });
    console.log('Tables synced');
  } catch (err) {
    console.error('MySQL failed:', err.message);
  }
  app.listen(PORT, () => console.log(` http://localhost:${PORT}`));
};

start();
