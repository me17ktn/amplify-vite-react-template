import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Button from "@mui/material/Button"
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Item from "./Item";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


const client = generateClient<Schema>();

const todoSchema = z.object({
  task: z.string().min(1, "タスクを入力してください")
})

type TodoSchema = z.infer<typeof todoSchema>;

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
    console.log(client.models);
    
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main>
      <Typography variant="h4" component="h2">{user?.signInDetails?.loginId}'s todos</Typography>
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
