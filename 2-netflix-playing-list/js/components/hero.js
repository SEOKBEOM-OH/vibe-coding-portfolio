const Hero = {
  render(container, movie, { onMoreInfo } = {}) {
    if (!movie) {
      container.innerHTML = `
        <section class="hero" aria-label="추천 영화">
          <div class="hero-loading">추천 영화를 불러오는 중...</div>
        </section>
      `;
      return;
    }

    const backdrop = MovieAPI.getBackdropUrl(movie.backdrop_path || movie.poster_path);
    const overview =
      movie.overview?.trim() || "줄거리 정보가 제공되지 않았습니다.";

    container.innerHTML = `
      <section class="hero" aria-label="추천 영화: ${movie.title}">
        <div
          class="hero-backdrop"
          style="background-image: url('${backdrop || ""}')"
          role="img"
          aria-label="${movie.title} 배경 이미지"
        ></div>
        <div class="hero-overlay" aria-hidden="true"></div>
        <div class="hero-content">
          <span class="hero-badge">지금 상영 중</span>
          <h1 class="hero-title">${movie.title}</h1>
          <div class="hero-meta">
            <span class="hero-rating">★ ${MovieAPI.formatRating(movie.vote_average)}</span>
            <span>${MovieAPI.formatDate(movie.release_date)}</span>
          </div>
          <p class="hero-overview">${overview}</p>
          <div class="hero-actions">
            <button type="button" class="btn btn-primary" id="hero-play-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
              재생
            </button>
            <button type="button" class="btn btn-secondary" id="hero-info-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              상세 정보
            </button>
          </div>
        </div>
      </section>
    `;

    const openDetail = () => {
      if (typeof onMoreInfo === "function") onMoreInfo(movie);
    };

    container.querySelector("#hero-info-btn").addEventListener("click", openDetail);
    container.querySelector("#hero-play-btn").addEventListener("click", openDetail);
  },
};
