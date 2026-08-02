const API_BASE = "http://127.0.0.1:5000/todos";

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path = "", options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json();
  }

  if (!response.ok) {
    throw new Error(payload?.message || `요청 실패 (${response.status})`);
  }

  return payload;
}

export async function fetchTodos() {
  return request("");
}

export async function createTodo(title) {
  return request("", {
    method: "POST",
    body: JSON.stringify({ title, completed: false }),
  });
}

/**
 * @param {string} id
 * @param {{ title?: string, completed?: boolean }} data
 */
export async function updateTodo(id, data) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTodo(id) {
  return request(`/${id}`, { method: "DELETE" });
}
