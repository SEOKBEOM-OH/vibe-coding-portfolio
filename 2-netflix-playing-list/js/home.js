document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  const navbarRoot = document.getElementById("navbar-root");
  const heroRoot = document.getElementById("hero-root");
  const movieRowRoot = document.getElementById("movie-row-root");
  const modalRoot = document.getElementById("modal-root");
  const statusRoot = document.getElementById("status-root");

  Navbar.render(navbarRoot, {
    userEmail: user?.email || "",
    onLogout() {
      Auth.logout();
      window.location.href = "index.html";
    },
  });

  MovieModal.init(modalRoot);

  const openMovie = (movie) => MovieModal.open(movie);

  statusRoot.innerHTML = `
    <div class="status-message">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p>현재 상영 중인 영화를 불러오는 중...</p>
    </div>
  `;

  try {
    const data = await MovieAPI.fetchNowPlaying(1);
    const movies = data.results || [];

    if (movies.length === 0) {
      statusRoot.innerHTML = `
        <div class="status-message">현재 상영 중인 영화가 없습니다.</div>
      `;
      return;
    }

    statusRoot.innerHTML = "";

    const featured =
      [...movies].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0] ||
      movies[0];

    Hero.render(heroRoot, featured, { onMoreInfo: openMovie });
    MovieRow.render(movieRowRoot, {
      title: "현재 상영작",
      movies,
      onSelect: openMovie,
    });
  } catch (error) {
    console.error(error);
    statusRoot.innerHTML = `
      <div class="status-message is-error">
        영화 정보를 불러오지 못했습니다.<br />
        잠시 후 다시 시도해 주세요.
      </div>
    `;
    Hero.render(heroRoot, null);
  }
});
