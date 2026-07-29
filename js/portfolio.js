function renderPortfolio() {
  const el = document.getElementById('portfolio');
  el.innerHTML = `
    <section class="portfolio">
      <div class="container">
        <div class="portfolio__decor portfolio__decor--dots-left">
          ${Array(16).fill('<span></span>').join('')}
        </div>
        <div class="portfolio__decor portfolio__decor--circle-tl"></div>
        <div class="portfolio__decor portfolio__decor--circle-tr">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="portfolio__decor portfolio__decor--dots-right">
          ${Array(20).fill('<span></span>').join('')}
        </div>
        <div class="portfolio__decor portfolio__decor--ring"></div>

        <div class="portfolio__browser">
          <div class="portfolio__browser-bar">
            <div class="portfolio__browser-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="portfolio__browser-url">
              <i class="fa-solid fa-lock" style="margin-right:6px;font-size:10px;"></i>
              yourwebsite.com
            </div>
            <div class="portfolio__browser-actions">
              <i class="fa-solid fa-arrow-left"></i>
              <i class="fa-solid fa-arrow-right"></i>
              <i class="fa-solid fa-rotate-right"></i>
            </div>
          </div>
          <div class="portfolio__browser-image">
            <div class="portfolio__browser-placeholder">😎</div>
          </div>
          <div class="portfolio__browser-footer">
            <div class="portfolio__browser-footer-left">
              <div class="portfolio__browser-avatar"></div>
            </div>
            <div class="portfolio__browser-progress"><span></span></div>
            <div class="portfolio__browser-info">2:22 / 3:05</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

renderPortfolio();
