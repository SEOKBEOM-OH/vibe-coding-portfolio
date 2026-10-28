const CONFIG = {
  API_BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: typeof SECRETS !== "undefined" ? SECRETS.API_KEY : "",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  LANGUAGE: "ko-KR",
  AUTH_STORAGE_KEY: "netflix_clone_auth",
};

if (!CONFIG.API_KEY || CONFIG.API_KEY.includes("여기에_")) {
  console.info(
    "[CONFIG] 브라우저용 API 키가 없습니다. Vercel 환경 변수로 /api/now-playing 을 조회합니다."
  );
}
