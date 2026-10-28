const MovieAPI = {
  // 로컬은 js/secrets.js 의 키로 TMDB를 직접 호출한다.
  // Vercel에는 그 파일이 없으므로 /api/now-playing 이 환경 변수 TMDB_API_KEY 를 대신 사용한다.
  hasClientKey() {
    return Boolean(CONFIG.API_KEY) && !CONFIG.API_KEY.includes("여기에_");
  },

  async fetchNowPlaying(page = 1) {
    const url = this.hasClientKey()
      ? new URL(`${CONFIG.API_BASE_URL}/movie/now_playing`)
      : new URL("/api/now-playing", window.location.origin);

    if (this.hasClientKey()) {
      url.searchParams.set("api_key", CONFIG.API_KEY);
      url.searchParams.set("language", CONFIG.LANGUAGE);
    }

    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`영화 정보를 불러오지 못했습니다. (${response.status})`);
    }

    return response.json();
  },

  getImageUrl(path, size = "w500") {
    if (!path) return null;
    return `${CONFIG.IMAGE_BASE_URL}/${size}${path}`;
  },

  getBackdropUrl(path, size = "original") {
    return this.getImageUrl(path, size);
  },

  formatRating(voteAverage) {
    if (typeof voteAverage !== "number") return "-";
    return voteAverage.toFixed(1);
  },

  formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}.${month}.${day}`;
  },
};
