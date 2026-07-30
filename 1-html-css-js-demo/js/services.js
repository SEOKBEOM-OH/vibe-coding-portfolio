function renderServices() {
  const services = document.getElementById('services');
  const items = [
    { icon: 'fa-solid fa-magnifying-glass-chart', title: 'User Research' },
    { icon: 'fa-solid fa-pen-ruler', title: 'Visual Design' },
    { icon: 'fa-solid fa-vials', title: 'User Testing' },
    { icon: 'fa-solid fa-sitemap', title: 'Prototyping' }
  ];

  services.innerHTML = `
    <section class="services">
      <div class="container">
        ${items.map(item => `
          <div class="service-card">
            <div class="service-card__icon">
              <i class="${item.icon}"></i>
            </div>
            <h3 class="service-card__title">${item.title}</h3>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

renderServices();
