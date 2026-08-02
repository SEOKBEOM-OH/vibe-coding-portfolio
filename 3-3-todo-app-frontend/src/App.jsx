import { useEffect, useState } from 'react'
import { createTodo, deleteTodo, getTodos, updateTodo } from './api/todos'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadTodos() {
      try {
        setLoading(true)
        setError('')
        const data = await getTodos()
        if (!cancelled) {
          setTodos(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTodos()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle || submitting) return

    try {
      setSubmitting(true)
      setError('')
      const todo = await createTodo(nextTitle)
      setTodos((prev) => [todo, ...prev])
      setTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(todo) {
    try {
      setError('')
      const updated = await updateTodo(todo._id, {
        completed: !todo.completed,
      })
      setTodos((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      )
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(todo) {
    setEditingId(todo._id)
    setEditingTitle(todo.title)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingTitle('')
  }

  async function handleSaveEdit(event) {
    event.preventDefault()
    const nextTitle = editingTitle.trim()
    if (!nextTitle || !editingId) return

    try {
      setError('')
      const updated = await updateTodo(editingId, { title: nextTitle })
      setTodos((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      )
      cancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    try {
      setError('')
      await deleteTodo(id)
      setTodos((prev) => prev.filter((todo) => todo._id !== id))
      if (editingId === id) {
        cancelEdit()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const remaining = todos.filter((todo) => !todo.completed).length

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />

      <main className="panel">
        <header className="panel__header">
          <p className="panel__eyebrow">Daily Focus</p>
          <h1 className="panel__title">할일</h1>
          <p className="panel__subtitle">
            오늘 해야 할 일을 추가하고, 수정하고, 정리하세요.
          </p>
        </header>

        <form className="composer" onSubmit={handleAdd}>
          <label className="sr-only" htmlFor="todo-title">
            새 할일
          </label>
          <input
            id="todo-title"
            className="composer__input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="할일을 입력하세요"
            autoComplete="off"
          />
          <button
            className="composer__button"
            type="submit"
            disabled={submitting || !title.trim()}
          >
            추가
          </button>
        </form>

        {error && <p className="status status--error">{error}</p>}
        {loading && <p className="status">불러오는 중...</p>}

        {!loading && todos.length === 0 && (
          <p className="status status--empty">아직 할일이 없습니다.</p>
        )}

        {!loading && todos.length > 0 && (
          <>
            <p className="panel__meta">남은 일 {remaining}개</p>
            <ul className="todo-list">
              {todos.map((todo) => (
                <li
                  key={todo._id}
                  className={`todo-item${todo.completed ? ' is-done' : ''}`}
                >
                  {editingId === todo._id ? (
                    <form className="todo-item__edit" onSubmit={handleSaveEdit}>
                      <input
                        className="todo-item__edit-input"
                        type="text"
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        autoFocus
                      />
                      <button className="btn btn--primary" type="submit">
                        저장
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={cancelEdit}
                      >
                        취소
                      </button>
                    </form>
                  ) : (
                    <>
                      <label className="todo-item__check">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggle(todo)}
                        />
                        <span className="todo-item__title">{todo.title}</span>
                      </label>
                      <div className="todo-item__actions">
                        <button
                          className="btn"
                          type="button"
                          onClick={() => startEdit(todo)}
                        >
                          수정
                        </button>
                        <button
                          className="btn btn--danger"
                          type="button"
                          onClick={() => handleDelete(todo._id)}
                        >
                          삭제
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}

export default App
