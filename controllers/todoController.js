const todoService = require("../services/todoService");

class TodoController {
  // Get all todos
  getAllTodos(req, res) {
    try {
      const todos = todoService.getAllTodos();
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get todo by ID
  getTodoById(req, res) {
    try {
      const todo = todoService.getTodoById(req.params.id);
      if (!todo) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new todo
  createTodo(req, res) {
    try {
      const { title } = req.body;
      const newTodo = todoService.createTodo(title);
      res.status(201).json(newTodo);
    } catch (error) {
      if (error.message === "Title is required") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Update todo
  updateTodo(req, res) {
    try {
      const { title, completed } = req.body;
      const updatedTodo = todoService.updateTodo(req.params.id, {
        title,
        completed,
      });
      res.json(updatedTodo);
    } catch (error) {
      if (error.message === "Todo not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Delete todo
  deleteTodo(req, res) {
    try {
      const deletedTodo = todoService.deleteTodo(req.params.id);
      res.json(deletedTodo);
    } catch (error) {
      if (error.message === "Todo not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TodoController();
