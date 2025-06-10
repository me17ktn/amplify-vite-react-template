import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Button from "@mui/material/Button"
import Stack from '@mui/material/Stack';
import Item from "./Item";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <Stack spacing={1}>
        {todos.map((todo) => (
          <Item key={todo.id} onClick={() => deleteTodo(todo.id)}>{todo.content}</Item>
        ))}
      </Stack>
      <Button onClick={signOut}>Sign out</Button>
    </main>
  );
}

export default App;
