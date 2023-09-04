describe('GET /api/todos', () => {
  let response;

  beforeEach(async () => {
    response = await fetch('http://localhost:3000/api/todos');
  });

  it('should return status 200', () => {
    expect(response.status).toBe(200);
  });

  it('should return an array', async () => {
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should return an empty array when there are no todos', async () => {
    const data = await response.json();
    expect(data.length).toBe(0);
  });

  it('should return todos with correct properties when there are todos', async () => {
    const todo = {
      id: 1,
      title: "Buy groceries",
      description: "Buy milk and bread",
      position: 1,
      author: "John Doe",
    };

    // Create a todo
    await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todo)
    });

    // Get all todos
    response = await fetch('http://localhost:3000/api/todos');
    const data = await response.json();

    expect(data.length).toBe(1);
    expect(data[0]).toMatchObject(todo);
  });

  afterEach(async () => {
    // Delete all todos
    const todos = await fetch('http://localhost:3000/api/todos').then(res => res.json());
    todos.forEach(async todo => {
      await fetch(`http://localhost:3000/api/todos/${todo.id}`, {
        method: 'DELETE'
      });
    });
  });
});