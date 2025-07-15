const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data.json");

// 🔄 Utility: Read todos from file
function readTodos() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ todos: [], currentId: 1 }, null, 2)
    );
  }
  const rawData = fs.readFileSync(DATA_FILE);
  return JSON.parse(rawData);
}

// 🔄 Utility: Write todos to file
function writeTodos(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  readTodos,
  writeTodos,
  DATA_FILE,
};
