const API_BASE = import.meta.env.VITE_API_BASE_URL

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
}

async function request(path = '', options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || '요청에 실패했습니다.')
  }

  return data
}

export function getTodos() {
  return request()
}

export function createTodo(title) {
  return request('', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function updateTodo(id, payload) {
  return request(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTodo(id) {
  return request(`/${id}`, {
    method: 'DELETE',
  })
}
