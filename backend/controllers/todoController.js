const Todo = require('../models/sql/Todo');
const auditLog = require('../utils/auditLogger');

const getAll = async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ todos });
  } catch {
    res.status(500).json({ error: 'Failed to fetch todos.' });
  }
};

const create = async (req, res) => {
  const { title, priority } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required.' });
  try {
    const todo = await Todo.create({ title: title.trim(), priority: priority || 'medium', userId: req.user.id });
    await auditLog({
      userId: String(req.user.id), username: req.user.username, role: req.user.role,
      action: 'TODO_CREATED', resource: '/api/todos', method: 'POST',
      message: `Created: "${todo.title}"`, req,
    });
    res.status(201).json({ todo });
  } catch {
    res.status(500).json({ error: 'Failed to create todo.' });
  }
};

const update = async (req, res) => {
  try {
    const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });

    const { title, completed, priority } = req.body;
    await todo.update({
      title:     title     !== undefined ? title.trim() : todo.title,
      completed: completed !== undefined ? completed    : todo.completed,
      priority:  priority  !== undefined ? priority     : todo.priority,
    });

    const action = completed !== undefined
      ? (completed ? 'TODO_COMPLETED' : 'TODO_REOPENED')
      : 'TODO_UPDATED';

    await auditLog({
      userId: String(req.user.id), username: req.user.username, role: req.user.role,
      action, resource: `/api/todos/${req.params.id}`, method: 'PUT',
      message: `"${todo.title}"`, req,
    });

    res.json({ todo });
  } catch {
    res.status(500).json({ error: 'Failed to update todo.' });
  }
};

const remove = async (req, res) => {
  try {
    const todo = await Todo.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });

    await todo.destroy();
    await auditLog({
      userId: String(req.user.id), username: req.user.username, role: req.user.role,
      action: 'TODO_DELETED', resource: `/api/todos/${req.params.id}`, method: 'DELETE',
      message: `Deleted: "${todo.title}"`, req,
    });

    res.json({ message: 'Deleted.' });
  } catch {
    res.status(500).json({ error: 'Failed to delete todo.' });
  }
};

module.exports = { getAll, create, update, remove };