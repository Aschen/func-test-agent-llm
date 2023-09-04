function verifyTodo(todo) {
  
  if (typeof todo.title !== 'string' || todo.title.length > 120) {
    throw new Error('Invalid title: title must be a string and have a maximum length of 120 characters');
  }

  if (todo.description !== undefined && typeof todo.description !== 'string') {
    throw new Error('Invalid description: if present, description must be a string');
  }

  if (typeof todo.author !== 'string' || todo.author.length > 120) {
    throw new Error('Invalid author: author must be a string and have a maximum length of 120 characters');
  }

  if (typeof todo.position !== 'number' || todo.position < 0) {
    throw new Error('Invalid position: position must be a number and be greater than or equal to 0');
  }
}

module.exports = { verifyTodo };
