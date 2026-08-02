const MONGO_API_BASE = "http://127.0.0.1:5000/todos";

/** @type {"firebase" | "mongo" | null} */
let resolvedSource = null;
/** @type {Promise<"firebase" | "mongo"> | null} */
let resolvePromise = null;
/** @type {Promise<typeof import("./api.firebase.js") | typeof import("./api.mongo.js")> | null} */
let apiPromise = null;

/**
 * URL ?db=firebase|mongo 로 강제 지정 가능.
 * 지정이 없으면 백엔드(5000) 연결 가능 시 MongoDB, 아니면 Firebase.
 * @returns {Promise<"firebase" | "mongo">}
 */
async function detectDataSource() {
  const override = new URLSearchParams(location.search).get("db");
  if (override === "firebase" || override === "mongo") return override;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 800);
    const response = await fetch(MONGO_API_BASE, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (response.ok) return "mongo";
  } catch {
    // 백엔드 미실행 → Firebase
  }

  return "firebase";
}

async function getDataSource() {
  if (resolvedSource) return resolvedSource;
  if (!resolvePromise) {
    resolvePromise = detectDataSource().then((source) => {
      resolvedSource = source;
      console.info(
        `[할일] 데이터 저장소: ${
          source === "firebase" ? "Firebase" : "MongoDB (백엔드 API)"
        }`
      );
      return source;
    });
  }
  return resolvePromise;
}

async function getApi() {
  if (!apiPromise) {
    apiPromise = getDataSource().then((source) =>
      source === "firebase"
        ? import("./api.firebase.js")
        : import("./api.mongo.js")
    );
  }
  return apiPromise;
}

export async function fetchTodos() {
  const api = await getApi();
  return api.fetchTodos();
}

export async function createTodo(title) {
  const api = await getApi();
  return api.createTodo(title);
}

/**
 * @param {string} id
 * @param {{ title?: string, completed?: boolean }} data
 */
export async function updateTodo(id, data) {
  const api = await getApi();
  return api.updateTodo(id, data);
}

export async function deleteTodo(id) {
  const api = await getApi();
  return api.deleteTodo(id);
}
