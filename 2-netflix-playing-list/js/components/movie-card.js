const MovieCard = {
  create(movie, { onSelect } = {}) {
    const card = document.createElement("article");
    card.className = "movie-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${movie.title} 상세 보기`);

    const posterUrl = MovieAPI.getImageUrl(movie.poster_path, "w342");

    if (posterUrl) {
      card.innerHTML = `
        <img
          class="movie-card-poster"
          src="${posterUrl}"
          alt="${movie.title} 포스터"
          loading="lazy"
        />
        <div class="movie-card-info">
          <h3 class="movie-card-title">${movie.title}</h3>
          <div class="movie-card-meta">
            <span class="movie-card-rating">★ ${MovieAPI.formatRating(movie.vote_average)}</span>
            <span>${(movie.release_date || "").slice(0, 4)}</span>
          </div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="movie-card-poster is-placeholder">${movie.title}</div>
        <div class="movie-card-info">
          <h3 class="movie-card-title">${movie.title}</h3>
          <div class="movie-card-meta">
            <span class="movie-card-rating">★ ${MovieAPI.formatRating(movie.vote_average)}</span>
            <span>${(movie.release_date || "").slice(0, 4)}</span>
          </div>
        </div>
      `;
    }

    const select = () => {
      if (typeof onSelect === "function") onSelect(movie);
    };

    card.addEventListener("click", select);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select();
      }
    });

    return card;
  },
};

const MovieRow = {
  render(container, { title, movies, onSelect } = {}) {
    container.innerHTML = `
      <section class="movie-row" id="now-playing" aria-labelledby="now-playing-title">
        <div class="movie-row-header">
          <h2 class="movie-row-title" id="now-playing-title">${title}</h2>
          <span class="movie-row-count">${movies.length}편</span>
        </div>
        <div class="movie-row-track-wrap">
          <button type="button" class="movie-row-nav prev" aria-label="이전 영화">
            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <div class="movie-row-track" role="list"></div>
          <button type="button" class="movie-row-nav next" aria-label="다음 영화">
            <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
      </section>
    `;

    const track = container.querySelector(".movie-row-track");
    const prevBtn = container.querySelector(".movie-row-nav.prev");
    const nextBtn = container.querySelector(".movie-row-nav.next");

    movies.forEach((movie) => {
      const card = MovieCard.create(movie, { onSelect });
      card.setAttribute("role", "listitem");
      track.appendChild(card);
    });

    const scrollByAmount = () => Math.min(track.clientWidth * 0.85, 720);

    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
    });

    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
    });
  },
};
