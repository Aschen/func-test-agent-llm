describe('POST /api/todos', () => {
  let createdTodo;

  afterEach(async () => {
    if (createdTodo) {
      await fetch(`http://localhost:3000/api/todos/${createdTodo.id}`, {
        method: 'DELETE',
      });
      createdTodo = null;
    }
  });

  test('Test the creation of a valid todo item', async () => {
    const todoData = {
      title: 'New Todo',
      description: 'This is a new todo',
      position: 1,
      author: 'John Doe',
    };

    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toMatchObject({
      ...todoData,
      id: expect.any(Number),
      createdAt: expect.any(String),
    });

    createdTodo = data;
  });

  test('Test the creation of a todo item with missing title', async () => {
    const todoData = {
      description: 'This is a new todo',
      position: 1,
      author: 'John Doe',
    };

    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data).toMatchObject({
      error: 'Invalid title: title must be a string and have a maximum length of 120 characters',
    });
  });

  test('Test the creation of a todo item with invalid description', async () => {
    const todoData = {
      title: 'New Todo',
      description: 123,
      position: 1,
      author: 'John Doe',
    };

    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data).toMatchObject({
      error: 'Invalid description: if present, description must be a string',
    });
  });

  test('Test the creation of a todo item with invalid author', async () => {
    const todoData = {
      title: 'New Todo',
      description: 'This is a new todo',
      position: 1,
      author: 123,
    };

    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data).toMatchObject({
      error: 'Invalid author: author must be a string and have a maximum length of 120 characters',
    });
  });

  test('Test the creation of a todo item with invalid position', async () => {
    const todoData = {
      title: 'New Todo',
      description: 'This is a new todo',
      position: -1,
      author: 'John Doe',
    };

    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data).toMatchObject({
      error: 'Invalid position: position must be a number and be greater than or equal to 0',
    });
  });

  test('Test the creation of a todo item with missing author', async () => {
    const todoData = {
      title: 'New Todo',
      description: 'This is a new todo',
      position: 1,
    };

    const response = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data).toMatchObject({
      error: 'Invalid author: author must be a string and have a maximum length of 120 characters',
    });
  });
});