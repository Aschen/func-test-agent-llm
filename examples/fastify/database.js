const sqlite3 = require('sqlite3').verbose();

const databaseName = 'todos.db'; 
let database = null;
let databasePromise = null;

async function createOrOpenDatabase() {
  databasePromise = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(databaseName, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database ready');
        database = db;
        resolve(db);
      }
    });
  });

  await createTodosTable();

  return databasePromise;
}

async function createTodosTable() {
  await databasePromise;

  return new Promise((resolve, reject) => {
      database.run(`
      CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY,
          title TEXT,
          description TEXT,
          position INTEGER,
          author TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `, function (err) {
      if (err) {
          reject(err);
      } else {
          resolve();
      }
      });
  });
}

async function getAllTodos() {
  await databasePromise;

  return new Promise((resolve, reject) => {
    database.all('SELECT id,title,description,position,author,createdAt FROM todos', (err, todos) => {
      if (err) {
        reject(err);
      } else {
        resolve(todos);
      }
    });
  });
}

async function createTodo(todo) {
  const { title, description, position, author } = todo;

  await databasePromise;

  return new Promise((resolve, reject) => {
    database.run(
      'INSERT INTO todos (title, description, position, author) VALUES (?, ?, ?, ?)',
      [title, description, position, author],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            title,
            description,
            position,
            author,
            createdAt: new Date().toISOString(),
          });
        }
      }
    );
  });
}

async function updateTodo(id, todo) {
  const { title, description, position, author } = todo;

  await databasePromise;

  return new Promise((resolve, reject) => {
    // First, retrieve the existing todo
    database.get('SELECT * FROM todos WHERE id=?', [id], (err, existingTodo) => {
      if (err) {
        reject(err);
        return;
      }

      if (!existingTodo) {
        // If the todo with the specified id doesn't exist, reject the promise
        reject(new Error(`Todo with id ${id} not found`));
        return;
      }

      // Merge the updated values into the existing todo
      const updatedTodo = {
        ...existingTodo,
        title,
        description,
        position,
        author,
      };

      database.run(
        'UPDATE todos SET title=?, description=?, position=?, author=? WHERE id=?',
        [title, description, position, author, id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(updatedTodo);
          }
        }
      );
    });
  });
}

async function deleteTodo(id) {
  await databasePromise;
  
  return new Promise((resolve, reject) => {
    database.run('DELETE FROM todos WHERE id = ?', id, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ message: 'Todo deleted successfully' });
      }
    });
  });
}

module.exports = {
  createOrOpenDatabase,
  createTodosTable,
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
};