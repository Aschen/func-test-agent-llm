## DELETE /api/todos/:id

This API endpoint allows you to delete a specific todo item by its ID.

### Request

The request should be a DELETE method with the ID of the todo item in the URL.

Example with CURL:

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

### Response

If the todo item is successfully deleted, the API will return a JSON object with a success message.

Example:

```json
{
  "message": "Todo deleted successfully"
}
```

### Error

If there is an error during the deletion process, the API will return a JSON object with the error message and the error stack.

Possible errors:

- `Error: SQLITE_ERROR`: This error occurs when there is a problem with the SQLite database.
- `Error: no such table: todos`: This error occurs when the 'todos' table does not exist in the database.

Example:

```json
{
  "error": "no such table: todos",
  "stack": "Error: no such table: todos\n    at Database.prepare..."
}
```