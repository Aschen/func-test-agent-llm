describe('PUT /api/todos/:id', () => {
  let createdTodo;

  beforeEach(async () => {
    // Create a todo item
    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Title',
        description: 'Test Description',
        position: 0,
        author: 'Test Author'
      })
    });
    createdTodo = await response.json();
  });

  afterEach(async () => {
    // Delete the created todo item
    await fetch(`http://localhost:3000/api/todos/${createdTodo.id}`, {
      method: 'DELETE'
    });
  });

  it.only('should update a todo item with valid data', async () => {
    // Update the created todo item
    const response = await fetch(`http://localhost:3000/api/todos/${createdTodo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'New Title',
        description: 'New Description',
        position: 1,
        author: 'New Author'
      })
    });
    const updatedTodo = await response.json();

    // Check if the todo item was updated correctly
    expect(updatedTodo.title).toBe('New Title');
    expect(updatedTodo.description).toBe('New Description');
    expect(updatedTodo.position).toBe(1);
    expect(updatedTodo.author).toBe('New Author');

    // Fetch all todos and check if the updated todo item is present
    const allTodosResponse = await fetch('http://localhost:3000/api/todos');
    const allTodos = await allTodosResponse.json();
    const updatedTodoInAllTodos = allTodos.find(todo => todo.id === updatedTodo.id);

    expect(updatedTodoInAllTodos).toEqual(updatedTodo);
  });
});