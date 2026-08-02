import { escapeAttr, escapeHtml } from "../utils.js";

/**
 * @param {{ id: string, text: string, done: boolean }} todo
 * @param {boolean} isEditing
 */
export function renderTodoItem(todo, isEditing) {
  if (isEditing) {
    return `
      <li class="todo-item is-editing" data-id="${todo.id}">
        <form class="edit-form" data-id="${todo.id}">
          <input
            class="edit-input"
            type="text"
            value="${escapeAttr(todo.text)}"
            maxlength="120"
            required
            aria-label="할일 수정"
          />
          <div class="edit-actions">
            <button type="submit" class="btn btn-ghost">저장</button>
            <button type="button" class="btn btn-ghost" data-action="cancel">취소</button>
          </div>
        </form>
      </li>
    `;
  }

  return `
    <li class="todo-item${todo.done ? " is-done" : ""}" data-id="${todo.id}">
      <input
        class="todo-check"
        type="checkbox"
        data-action="toggle"
        ${todo.done ? "checked" : ""}
        aria-label="완료 표시"
      />
      <p class="todo-text">${escapeHtml(todo.text)}</p>
      <div class="todo-actions">
        <button type="button" class="btn btn-ghost" data-action="edit">수정</button>
        <button type="button" class="btn btn-danger" data-action="delete">삭제</button>
      </div>
    </li>
  `;
}
