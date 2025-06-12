import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Button from "@mui/material/Button"
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TextField } from "@mui/material";
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


const client = generateClient<Schema>();

const todoSchema = z.object({
  title: z.string().min(1, "Todoを入力してください")
})

type TodoSchema = z.infer<typeof todoSchema>;

function TodoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoSchema>({
    resolver: zodResolver(todoSchema),
  });

  const onSubmit = (data: TodoSchema) => {
    client.models.Todo.create({ content: data.title});
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="タイトル"
        variant="outlined"
        fullWidth
        margin="normal"
        error={!!errors.title}
        helperText={errors.title?.message}
        {...register("title")}
      />
      <Button type="submit" variant="contained" sx={{width: "100%"}}>
        Todoを追加
      </Button>
    </form>
  );
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main>
      <Typography variant="h4" component="h2">{user?.signInDetails?.loginId}'s todos</Typography>
      <TodoForm />
      <Stack spacing={1} sx={{mt: 2}}>
        {todos.map((todo) => (
          <Item key={todo.id} onClick={() => deleteTodo(todo.id)}>{todo.content}</Item>
        ))}
      </Stack>
      <Button variant="outlined" onClick={signOut} sx={{mt: 3}}>Sign out</Button>
    </main>
  );
}

export default App;
