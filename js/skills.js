function renderSkills() {
  const el = document.getElementById('skills');
  const cards = [
    {
      title: 'Brand Identity',
      text: 'Lorem ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
    },
    {
      title: 'Product Design',
      text: 'Lorem ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
    },
    {
      title: 'Interaction Design',
      text: 'Lorem ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
    },
    {
      title: 'App Design',
      text: 'Lorem ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'
    }
  ];

  el.innerHTML = `
    <section class="skills">
      <div class="container">
        <div class="skills__content">
          <div class="skills__label">My Skills</div>
          <h2 class="skills__title">Things I can do for<br>my <em>clients</em></h2>
          <p class="skills__text">
            From refining to match your research, to helping with design
            and testing, I can help bring your product to life.
          </p>
          <div class="skills__buttons">
            <a href="#contact" class="btn-primary">Hire Me</a>
            <a href="#" class="btn-outline">Download CV</a>
          </div>
        </div>
        <div class="skills__cards">
          ${cards.map(card => `
            <div class="skill-card">
              <h3 class="skill-card__title">${card.title}</h3>
              <p class="skill-card__text">${card.text}</p>
              <a href="#" class="skill-card__link">Explore More</a>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

renderSkills();
