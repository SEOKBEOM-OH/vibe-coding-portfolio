function renderNavbar() {
  const navbar = document.getElementById('navbar');
  navbar.innerHTML = `
    <nav class="navbar">
      <div class="container">
        <a href="#" class="navbar__logo">
          <span class="navbar__logo-icon">e</span>
          leFolio
        </a>
        <ul class="navbar__menu">
          <li><a href="#about" class="active">About Me</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button class="navbar__hamburger" aria-label="메뉴 열기">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div class="navbar__mobile-menu">
        <a href="#about">About Me</a>
        <a href="#services">Services</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  `;

  const hamburger = navbar.querySelector('.navbar__hamburger');
  const mobileMenu = navbar.querySelector('.navbar__mobile-menu');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });

  window.addEventListener('scroll', () => {
    const nav = navbar.querySelector('.navbar');
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

renderNavbar();
