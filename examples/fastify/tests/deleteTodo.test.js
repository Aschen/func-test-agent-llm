describe('DELETE /api/todos/:id', () => {
  let createdTodo;

  beforeEach(async () => {
    // Create a todo item for testing
    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Test Todo' }),
    });
    const data = await response.json();
    createdTodo = data;
  });

  it('should delete a todo item that exists in the database', async () => {
    // Delete the created todo item
    const response = await fetch(`http://localhost:3000/api/todos/${createdTodo.id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    // Check if the response is a success message
    expect(data).toEqual({ message: 'Todo deleted successfully' });

    // Use the 'get all todos' API action to ensure that the deleted todo item no longer exists in the database
    const getAllResponse = await fetch('http://localhost:3000/api/todos');
    const allTodos = await getAllResponse.json();
    const deletedTodo = allTodos.find((todo) => todo.id === createdTodo.id);

    expect(deletedTodo).toBeUndefined();
  });
});