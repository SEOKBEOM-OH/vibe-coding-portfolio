export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttr(text) {
  return escapeHtml(text);
}

export function normalizeTodo(todo) {
  return {
    id: String(todo._id ?? todo.id),
    text: typeof todo.title === "string" ? todo.title : "",
    done: Boolean(todo.completed),
  };
}
