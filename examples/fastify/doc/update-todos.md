## PUT /api/todos/:id

This API endpoint updates an existing todo item in the database.

### Request

The request should be a JSON object with the following properties:

- `id` (string, required): The unique identifier of the todo item to be updated.
- `title` (string, required): The title of the todo item. It must be a string and have a maximum length of 120 characters.
- `description` (string, optional): The description of the todo item. If present, it must be a string.
- `position` (number, required): The position of the todo item. It must be a number and be greater than or equal to 0.
- `author` (string, required): The author of the todo item. It must be a string and have a maximum length of 120 characters.

Example with CURL:

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"title":"New Title","description":"New Description","position":1,"author":"New Author"}' http://localhost:3000/api/todos/:id
```

### Response

The response will be a JSON object representing the updated todo item.

Example:

```json
{
  "id": "1",
  "title": "New Title",
  "description": "New Description",
  "position": 1,
  "author": "New Author",
  "createdAt": 1633020302
}
```

### Error

The error response will be a JSON object with `error` and `stack` properties.

Possible errors include:

- `Invalid title`: The title is not a string or exceeds 120 characters.
- `Invalid description`: The description is present but is not a string.
- `Invalid author`: The author is not a string or exceeds 120 characters.
- `Invalid position`: The position is not a number or is less than 0.

Example:

```json
{
  "error": "Invalid title: title must be a string and have a maximum length of 120 characters",
  "stack": "<stack trace>"
}
```