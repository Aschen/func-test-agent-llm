/**
To get all todos:
node cli.js getAll

To create a new todo:
node cli.js create "Todo Title" "Todo Description" 1 "Todo Author"

To update a todo:
node cli.js update todoId "Updated Todo Title" "Updated Todo Description" 2 "Updated Todo Author"

To delete a todo:
node cli.js delete todoId
*/

// API base URL
const baseURL = 'http://localhost:3000/api';

// Function to handle API requests
async function makeRequest(method, url, data = null) {
    try {
      const response = await fetch(baseURL + url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' || method === "PUT" ? JSON.stringify(data) : undefined,
      });
      return response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

// Function to get all todos
async function getAllTodos() {
  const todos = await makeRequest('GET', '/todos');
  console.log('All Todos:', todos);
}

// Function to create a new todo
async function createTodo(title, description, position, author) {
  const todo = await makeRequest('POST', '/todos', {
    title,
    description,
    position,
    author,
  });
  console.log('Created Todo:', todo);
}

// Function to update a todo
async function updateTodo(id, title, description, position, author) {
  const todo = await makeRequest('PUT', `/todos/${id}`, {
    title,
    description,
    position,
    author,
  });
  console.log('Updated Todo:', todo);
}

// Function to delete a todo
async function deleteTodo(id) {
  await makeRequest('DELETE', `/todos/${id}`);
  console.log('Todo deleted successfully');
}

// Parse command line arguments
const [command, ...args] = process.argv.slice(2);

// Execute the corresponding command
switch (command) {
  case 'getAll':
    getAllTodos();
    break;
  case 'create':
    const [title, description, position, author] = args;
    createTodo(title, description, position, author);
    break;
  case 'update':
    const [id, updatedTitle, updatedDescription, updatedPosition, updatedAuthor] = args;
    updateTodo(id, updatedTitle, updatedDescription, updatedPosition, updatedAuthor);
    break;
  case 'delete':
    const [todoId] = args;
    deleteTodo(todoId);
    break;
  default:
    console.log('Invalid command. Available commands: getAll, create, update, delete');
}