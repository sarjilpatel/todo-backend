const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Todo = require('../models/Todo');

// @route   GET api/todos
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/todos
router.post('/', auth, async (req, res) => {
  const { title, description, priority, category, dueDate } = req.body;

  try {
    const newTodo = new Todo({
      user: req.user.id,
      title,
      description,
      priority,
      category,
      dueDate
    });

    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/todos/:id
router.put('/:id', auth, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    todo = await Todo.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/todos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
