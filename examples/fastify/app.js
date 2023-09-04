const fastify = require('fastify')();

const {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  createOrOpenDatabase,
} = require('./database');
const { verifyTodo } = require('./verify');

// API endpoints for ToDo operations
fastify.get('/api/todos', async (request, reply) => {
  try {
    const todos = await getAllTodos();
    reply.send(todos);
  } catch (error) {
    console.error(error);
    reply.status(400).send({ error: error.message, stack: error.stack });
  }
});

fastify.post('/api/todos', async (request, reply) => {
  const { title, description, position, author } = request.body;
  
  const newTodo = { title, description, position, author };

  try {
    verifyTodo(newTodo)
    const createdTodo = await createTodo(newTodo);
    reply.send(createdTodo);
  } catch (error) {
    console.error(error);
    reply.status(400).send({ error: error.message, stack: error.stack });
  }
});

fastify.put('/api/todos/:id', async (request, reply) => {
  const { id } = request.params;
  const { title, description, position, author } = request.body;

  try {
    const updatedTodo = await updateTodo(id, {
      title,
      description,
      position,
      author,
    });
    reply.send(updatedTodo);
  } catch (error) {
    console.error(error);
    reply.status(400).send({ error: error.message, stack: error.stack });
  }
});

fastify.delete('/api/todos/:id', async (request, reply) => {
  const { id } = request.params;

  try {
    await deleteTodo(id);
    reply.send({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    reply.status(400).send({ error: error.message, stack: error.stack });
  }
});

// Start the Fastify server
fastify.listen(3000, async (error) => {
  if (error) throw err;

  await createOrOpenDatabase();

  console.log('Server listening on port 3000');
});