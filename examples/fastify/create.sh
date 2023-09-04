curl -X POST -H "Content-Type: application/json" \
     -d '{"title":"New Todo","description":"This is a new todo","position":1,"author":"John Doe"}' \
     http://localhost:3000/api/todos