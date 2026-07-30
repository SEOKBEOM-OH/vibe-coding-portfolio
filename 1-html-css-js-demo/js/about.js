function renderAbout() {
  const about = document.getElementById('about');
  about.innerHTML = `
    <section class="about" id="about-section">
      <div class="container">
        <div class="about__services">
          <div class="service-card">
            <div class="service-card__icon"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
            <h3 class="service-card__title">User Research</h3>
          </div>
          <div class="service-card">
            <div class="service-card__icon"><i class="fa-solid fa-pen-ruler"></i></div>
            <h3 class="service-card__title">Visual Design</h3>
          </div>
          <div class="service-card">
            <div class="service-card__icon"><i class="fa-solid fa-vials"></i></div>
            <h3 class="service-card__title">User Testing</h3>
          </div>
          <div class="service-card">
            <div class="service-card__icon"><i class="fa-solid fa-sitemap"></i></div>
            <h3 class="service-card__title">Prototyping</h3>
          </div>
        </div>
        <div class="about__content">
          <div class="about__triangle"></div>
          <p class="about__label">About Me</p>
          <h2 class="about__title">Better design,<br>better <em>experiences</em></h2>
          <p class="about__text">
            Lorem ipsum is simply dummy text of the printing and typesetting industry.
            Lorem ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </p>
          <div class="about__buttons">
            <a href="#contact" class="btn-primary">Contact Me</a>
            <a href="#" class="btn-outline">Download CV</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

renderAbout();
