/**
 * 백엔드 Todo API 통신 모듈
 * App.jsx → 여기 함수 호출 → fetch → 백엔드(VITE_API_BASE_URL)
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/todos'  // .env의 VITE_API_BASE_URL 사용, 없으면 로컬 백엔드로 폴백

if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.')
}

// 공통 요청 처리: JSON 헤더 + 응답 파싱 + 에러 처리
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

// GET /todos — 목록 조회
export function getTodos() {
  return request()
}

// POST /todos — 새 할일 추가
export function createTodo(title) {
  return request('', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

// PUT /todos/:id — 제목/완료 여부 수정
export function updateTodo(id, payload) {
  return request(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

// DELETE /todos/:id — 삭제
export function deleteTodo(id) {
  return request(`/${id}`, {
    method: 'DELETE',
  })
}
