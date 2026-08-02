import { renderTodoItem } from "./TodoItem.js";

/**
 * @param {HTMLElement} listEl
 * @param {HTMLElement} emptyEl
 * @param {{
 *   onToggle: (id: string, completed: boolean) => Promise<void> | void,
 *   onEdit: (id: string) => void,
 *   onCancel: () => void,
 *   onSave: (id: string, title: string) => Promise<void> | void,
 *   onDelete: (id: string) => Promise<void> | void,
 * }} handlers
 */
export function createTodoList(listEl, emptyEl, handlers) {
  listEl.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const item = target.closest(".todo-item");
    if (!item) return;

    const id = item.dataset.id;
    if (!id) return;

    if (target.matches("[data-action='delete']")) {
      await handlers.onDelete(id);
      return;
    }

    if (target.matches("[data-action='edit']")) {
      handlers.onEdit(id);
      return;
    }

    if (target.matches("[data-action='cancel']")) {
      handlers.onCancel();
    }
  });

  listEl.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.matches("[data-action='toggle']")) return;

    const item = target.closest(".todo-item");
    const id = item?.dataset.id;
    if (!id) return;

    await handlers.onToggle(id, target.checked);
  });

  listEl.addEventListener("submit", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLFormElement)) return;
    if (!target.classList.contains("edit-form")) return;

    event.preventDefault();
    const id = target.dataset.id;
    const editInput = target.querySelector(".edit-input");
    if (!id || !(editInput instanceof HTMLInputElement)) return;

    const title = editInput.value.trim();
    if (!title) return;

    await handlers.onSave(id, title);
  });

  /**
   * @param {{ id: string, text: string, done: boolean }[]} todos
   * @param {string | null} editingId
   */
  function render(todos, editingId = null) {
    emptyEl.hidden = todos.length > 0;
    listEl.innerHTML = todos
      .map((todo) => renderTodoItem(todo, todo.id === editingId))
      .join("");

    if (editingId) {
      const editInput = listEl.querySelector(
        `.todo-item[data-id="${CSS.escape(editingId)}"] .edit-input`
      );
      if (editInput instanceof HTMLInputElement) {
        editInput.focus();
        editInput.setSelectionRange(
          editInput.value.length,
          editInput.value.length
        );
      }
    }
  }

  return { render };
}
