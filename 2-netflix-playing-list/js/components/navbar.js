const Navbar = {
  render(container, { userEmail = "", onLogout } = {}) {
    container.innerHTML = `
      <header class="navbar" id="navbar">
        <div class="navbar-left">
          <a href="home.html" class="navbar-logo" aria-label="NETFLIX 홈">NETFLIX</a>
          <nav class="navbar-nav" aria-label="주요 메뉴">
            <a href="home.html" class="is-active">홈</a>
            <a href="#now-playing">현재 상영작</a>
          </nav>
        </div>
        <div class="navbar-right">
          <span class="navbar-user" title="${userEmail}">${userEmail}</span>
          <button type="button" class="navbar-logout" id="logout-btn">로그아웃</button>
        </div>
      </header>
    `;

    const navbar = container.querySelector("#navbar");
    const logoutBtn = container.querySelector("#logout-btn");

    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    logoutBtn.addEventListener("click", () => {
      if (typeof onLogout === "function") onLogout();
    });
  },
};
