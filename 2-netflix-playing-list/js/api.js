const MovieAPI = {
  async fetchNowPlaying(page = 1) {
    const url = new URL(`${CONFIG.API_BASE_URL}/movie/now_playing`);
    url.searchParams.set("api_key", CONFIG.API_KEY);
    url.searchParams.set("language", CONFIG.LANGUAGE);
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
