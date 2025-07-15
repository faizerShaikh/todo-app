// Validation utilities
const validateTodoInput = (title) => {
  if (!title || typeof title !== "string") {
    throw new Error("Title is required and must be a string");
  }

  if (title.trim().length === 0) {
    throw new Error("Title cannot be empty");
  }

  if (title.length > 255) {
    throw new Error("Title is too long (max 255 characters)");
  }

  return title.trim();
};

const validateId = (id) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new Error("Invalid ID format");
  }
  return parsedId;
};

module.exports = {
  validateTodoInput,
  validateId,
};
