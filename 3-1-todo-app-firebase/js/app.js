import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from "./api.js";
import { normalizeTodo } from "./utils.js";
import { createHeader } from "./components/Header.js";
import { createTodoForm } from "./components/TodoForm.js";
import { createTodoList } from "./components/TodoList.js";

/** @type {{ id: string, text: string, done: boolean }[]} */
let todos = [];
/** @type {string | null} */
let editingId = null;

const headerRoot = document.getElementById("header-root");
const formRoot = document.getElementById("todo-form-root");
const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty-state");

createHeader(headerRoot);

const todoList = createTodoList(listEl, emptyEl, {
  onToggle: async (id, completed) => {
    try {
      await updateTodo(id, { completed });
      await loadTodos();
    } catch (error) {
      console.error("완료 상태 변경 실패:", error);
      alert(error.message || "완료 상태를 변경하지 못했습니다.");
      todoList.render(todos, editingId);
    }
  },
  onEdit: (id) => {
    editingId = id;
    todoList.render(todos, editingId);
  },
  onCancel: () => {
    editingId = null;
    todoList.render(todos, editingId);
  },
  onSave: async (id, title) => {
    try {
      await updateTodo(id, { title });
      editingId = null;
      await loadTodos();
    } catch (error) {
      console.error("할일 수정 실패:", error);
      alert(error.message || "할일을 수정하지 못했습니다.");
    }
  },
  onDelete: async (id) => {
    try {
      await deleteTodo(id);
      if (editingId === id) editingId = null;
      await loadTodos();
    } catch (error) {
      console.error("할일 삭제 실패:", error);
      alert(error.message || "할일을 삭제하지 못했습니다.");
    }
  },
});

createTodoForm(formRoot, {
  onSubmit: async (title) => {
    try {
      await createTodo(title);
      await loadTodos();
    } catch (error) {
      console.error("할일 추가 실패:", error);
      alert(error.message || "할일을 추가하지 못했습니다.");
    }
  },
});

async function loadTodos() {
  try {
    const data = await fetchTodos();
    todos = (Array.isArray(data) ? data : []).map(normalizeTodo);
    todoList.render(todos, editingId);
  } catch (error) {
    console.error("할일 조회 실패:", error);
    alert(error.message || "할일 목록을 불러오지 못했습니다.");
  }
}

loadTodos();
