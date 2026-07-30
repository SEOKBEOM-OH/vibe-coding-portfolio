const CONFIG = {
  API_BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: typeof SECRETS !== "undefined" ? SECRETS.API_KEY : "",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  LANGUAGE: "ko-KR",
  AUTH_STORAGE_KEY: "netflix_clone_auth",
};

if (!CONFIG.API_KEY || CONFIG.API_KEY.includes("여기에_")) {
  console.error(
    "[CONFIG] API 키가 없습니다. js/secrets.example.js 를 복사해 js/secrets.js 를 만든 뒤 키를 넣어 주세요."
  );
}
