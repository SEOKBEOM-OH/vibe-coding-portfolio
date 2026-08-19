export default function Header({ activeScreen, onNavigateOrder, onNavigateAdmin }) {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__brand-cafe">카페</span>
        <span className="header__brand-u">U</span>
      </div>
      <nav className="header__nav">
        <button
          type="button"
          className={`header__btn${activeScreen === 'order' ? ' header__btn--active' : ''}`}
          onClick={onNavigateOrder}
        >
          주문하기
        </button>
        <button
          type="button"
          className={`header__btn${activeScreen === 'admin' ? ' header__btn--active' : ''}`}
          onClick={onNavigateAdmin}
        >
          관리자
        </button>
      </nav>
    </header>
  )
}
