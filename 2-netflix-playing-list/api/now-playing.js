// Vercel 서버리스 함수.
// 브라우저에 키를 두지 않고, 프로젝트 환경 변수 TMDB_API_KEY 로 현재 상영작을 조회한다.
module.exports = async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    res.status(500).json({
      status_message: "TMDB_API_KEY 환경 변수가 없습니다.",
    });
    return;
  }

  // 페이지 번호만 받고, 그 외 쿼리는 TMDB로 넘기지 않는다.
  const rawPage = Array.isArray(req.query?.page) ? req.query.page[0] : req.query?.page;
  const page = /^[1-9]\d*$/.test(String(rawPage || "1")) ? String(rawPage || "1") : "1";

  const url = new URL("https://api.themoviedb.org/3/movie/now_playing");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "ko-KR");
  url.searchParams.set("page", page);

  const response = await fetch(url);
  const data = await response.json();

  res.status(response.status).json(data);
};
