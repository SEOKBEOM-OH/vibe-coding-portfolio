function renderHero() {
  const hero = document.getElementById('hero');
  hero.innerHTML = `
    <section class="hero">
      <div class="container">
        <div class="hero__content">
          <div class="hero__label">Product Designer</div>
          <h1 class="hero__title">Markus Räikkönen</h1>
          <p class="hero__subtitle">I am a freelance product designer. Let's work together.</p>
          <div class="hero__buttons">
            <a href="#contact" class="btn-primary">Contact Me</a>
            <a href="#" class="btn-outline">Download CV</a>
          </div>
          <div class="hero__dots">
            <span></span>
            <span class="active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="hero__decoration">
            ${Array(40).fill('<span></span>').join('')}
          </div>
        </div>
        <div class="hero__image">
          <div class="hero__image-wrapper">
            <div class="hero__image-bg"></div>
            <div class="hero__image-triangle"></div>
            <div class="hero__image-photo">
              <div class="hero__image-placeholder">😎</div>
            </div>
            <div class="hero__circle-dots">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

renderHero();
