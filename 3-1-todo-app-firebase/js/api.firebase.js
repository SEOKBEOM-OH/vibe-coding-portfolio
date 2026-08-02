import {
  get,
  push,
  ref,
  remove,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { db } from "./firebase.js";

const todosRef = ref(db, "todos");

export async function fetchTodos() {
  const snapshot = await get(todosRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.entries(data)
    .map(([id, todo]) => ({
      id,
      title: todo.title ?? "",
      completed: Boolean(todo.completed),
      createdAt: todo.createdAt ?? 0,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function createTodo(title) {
  const newTodoRef = push(todosRef);
  const todo = {
    title,
    completed: false,
    createdAt: Date.now(),
  };

  await set(newTodoRef, todo);
  return { id: newTodoRef.key, ...todo };
}

/**
 * @param {string} id
 * @param {{ title?: string, completed?: boolean }} data
 */
export async function updateTodo(id, data) {
  const payload = {};
  if (typeof data.title === "string") payload.title = data.title;
  if (typeof data.completed === "boolean") payload.completed = data.completed;

  await update(ref(db, `todos/${id}`), payload);
  return { id, ...payload };
}

export async function deleteTodo(id) {
  await remove(ref(db, `todos/${id}`));
}
