const { readTodos, writeTodos } = require("../config/database");
const { activeTodos, totalTodos } = require("../config/prometheus");

class TodoService {
  // Update metrics after any todo operation
  updateMetrics() {
    const data = readTodos();
    const activeCount = data.todos.filter((todo) => !todo.completed).length;
    const totalCount = data.todos.length;

    activeTodos.set(activeCount);
    totalTodos.set(totalCount);
  }

  // Get all todos
  getAllTodos() {
    try {
      const data = readTodos();
      return { count: data.todos.length, data: data.todos };
    } catch (error) {
      throw error;
    }
  }

  // Get todo by ID
  getTodoById(id) {
    try {
      const data = readTodos();
      const todo = data.todos.find((t) => t.id === parseInt(id));
      return todo;
    } catch (error) {
      throw error;
    }
  }

  // Create new todo
  createTodo(title) {
    try {
      if (!title) {
        todoOperationsTotal.labels("create", "validation_error").inc();
        throw new Error("Title is required");
      }

      const data = readTodos();
      const newTodo = { id: data.currentId++, title, completed: false };
      data.todos.push(newTodo);
      writeTodos(data);

      this.updateMetrics();
      return newTodo;
    } catch (error) {
      throw error;
    }
  }

  // Update todo
  updateTodo(id, updates) {
    try {
      const data = readTodos();
      const todo = data.todos.find((t) => t.id === parseInt(id));

      if (!todo) {
        todoOperationsTotal.labels("update", "not_found").inc();
        throw new Error("Todo not found");
      }

      const { title, completed } = updates;
      if (title !== undefined) todo.title = title;
      if (completed !== undefined) todo.completed = completed;

      writeTodos(data);
      this.updateMetrics();
      return todo;
    } catch (error) {
      throw error;
    }
  }

  // Delete todo
  deleteTodo(id) {
    try {
      const data = readTodos();
      const index = data.todos.findIndex((t) => t.id === parseInt(id));

      if (index === -1) {
        throw new Error("Todo not found");
      }

      const deleted = data.todos.splice(index, 1);
      writeTodos(data);
      this.updateMetrics();
      return deleted[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TodoService();
