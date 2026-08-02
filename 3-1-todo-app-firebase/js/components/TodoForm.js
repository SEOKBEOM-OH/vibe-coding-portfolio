/**
 * @param {HTMLElement} container
 * @param {{ onSubmit: (title: string) => Promise<void> | void }} options
 */
export function createTodoForm(container, { onSubmit }) {
  container.innerHTML = `
    <form class="add-form" id="todo-form" autocomplete="off">
      <label class="sr-only" for="todo-input">할일 입력</label>
      <input
        type="text"
        id="todo-input"
        name="todo"
        placeholder="새 할일을 입력하세요"
        maxlength="120"
        required
      />
      <button type="submit" class="btn btn-primary">추가</button>
    </form>
  `;

  const form = container.querySelector("#todo-form");
  const input = container.querySelector("#todo-input");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    await onSubmit(title);
    input.value = "";
    input.focus();
  });

  return { form, input };
}
