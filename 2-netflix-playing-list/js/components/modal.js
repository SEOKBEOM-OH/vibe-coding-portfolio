const MovieModal = {
  container: null,

  init(container) {
    this.container = container;
    this.container.innerHTML = `
      <div class="modal" id="movie-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
        <div class="modal-backdrop" data-close="true"></div>
        <div class="modal-dialog">
          <button type="button" class="modal-close" data-close="true" aria-label="닫기">
            <svg viewBox="0 0 24 24"><path d="M18.3 5.71L12 12.01 5.7 5.7 4.29 7.11 10.59 13.4 4.29 19.7 5.7 21.11 12 14.82l6.3 6.29 1.41-1.41-6.29-6.3 6.29-6.29z"/></svg>
          </button>
          <img class="modal-banner" id="modal-banner" alt="" />
          <div class="modal-body">
            <h2 class="modal-title" id="modal-title"></h2>
            <div class="modal-meta">
              <span class="modal-rating" id="modal-rating"></span>
              <span id="modal-date"></span>
              <span id="modal-votes"></span>
            </div>
            <p class="modal-overview" id="modal-overview"></p>
          </div>
        </div>
      </div>
    `;

    this.modal = this.container.querySelector("#movie-modal");

    this.container.addEventListener("click", (event) => {
      if (event.target.closest("[data-close='true']")) {
        this.close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });
  },

  isOpen() {
    return this.modal?.classList.contains("is-open");
  },

  open(movie) {
    if (!this.modal || !movie) return;

    const banner = MovieAPI.getBackdropUrl(
      movie.backdrop_path || movie.poster_path,
      "w1280"
    );
    const overview =
      movie.overview?.trim() || "줄거리 정보가 제공되지 않았습니다.";

    const bannerEl = this.modal.querySelector("#modal-banner");
    bannerEl.src = banner || "";
    bannerEl.alt = `${movie.title} 배경`;
    bannerEl.style.display = banner ? "block" : "none";

    this.modal.querySelector("#modal-title").textContent = movie.title;
    this.modal.querySelector("#modal-rating").textContent =
      `★ ${MovieAPI.formatRating(movie.vote_average)}`;
    this.modal.querySelector("#modal-date").textContent =
      MovieAPI.formatDate(movie.release_date);
    this.modal.querySelector("#modal-votes").textContent =
      `투표 ${movie.vote_count?.toLocaleString?.("ko-KR") ?? movie.vote_count ?? 0}회`;
    this.modal.querySelector("#modal-overview").textContent = overview;

    this.modal.hidden = false;
    requestAnimationFrame(() => {
      this.modal.classList.add("is-open");
    });

    document.body.style.overflow = "hidden";
  },

  close() {
    if (!this.modal) return;
    this.modal.classList.remove("is-open");
    document.body.style.overflow = "";

    window.setTimeout(() => {
      if (!this.isOpen()) {
        this.modal.hidden = true;
      }
    }, 250);
  },
};
