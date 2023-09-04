## GET /api/todos

This API endpoint retrieves all the todos from the database.

### Request

This endpoint does not require any request parameters.

Example with CURL:

```bash
curl -X GET "http://localhost:3000/api/todos"
```

### Response

The response will be a JSON array of todos. Each todo object will have the following properties:

- `id` (integer): The unique identifier of the todo.
- `title` (string): The title of the todo.
- `description` (string): The description of the todo.
- `position` (integer): The position of the todo.
- `author` (string): The author of the todo.
- `createdAt` (string): The date and time when the todo was created.

Example:

```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Buy milk and bread",
    "position": 1,
    "author": "John Doe",
    "createdAt": "2021-09-01T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Do laundry",
    "description": "Wash and iron clothes",
    "position": 2,
    "author": "John Doe",
    "createdAt": "2021-09-01T11:00:00.000Z"
  }
]
```

### Error

The error response will be a JSON object with the following properties:

- `error` (string): The error message.
- `stack` (string): The stack trace of the error.

Possible errors:

- `Database error`: There was an error retrieving the todos from the database.

Example:

```json
{
  "error": "Database error",
  "stack": "Error: SQLITE_ERROR: no such table: todos\n    at Database.all (native)"
}
```