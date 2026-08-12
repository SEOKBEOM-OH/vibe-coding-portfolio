import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { NAV_CATEGORIES } from '../data/navCategories';
import { PROMO_TEXT, SITE_NAME } from '../constants/site';
import { BagIcon, HeartIcon, SearchIcon, UserPlusIcon } from './Icons';
import './Header.css';

function Header() {
  // AuthContext에서 로그인 유저 / 관리자 여부 / 로그아웃 함수를 가져옴
  // → Home, Register, Admin 어디서든 <Header />만 넣으면 같은 로그인 UI가 보임
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userName = user?.name || '';

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menuOpen]);

  // 드롭다운의 "로그아웃" → storage + 전역 user 상태 초기화
  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="site-header__promo">
        {PROMO_TEXT}
      </div>

      <div className="site-header__bar">
        <nav className="site-header__categories" aria-label="카테고리">
          {NAV_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={
                cat.id === 'magazine'
                  ? '/products?category=magazine'
                  : `/products?category=${cat.id}`
              }
              className="site-header__category"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="site-header__brand">
          {SITE_NAME}
        </Link>

        <nav className="site-header__icons" aria-label="계정 및 쇼핑">
          {/* userName이 있으면 로그인 상태 → 환영 메시지(+ admin이면 어드민 버튼) */}
          {/* 없으면 비로그인 → 회원가입 / 로그인 링크 */}
          {userName ? (
            <>
              {/* admin 권한(USER_TYPES.ADMIN)인 계정만 어드민 메뉴 노출 */}
              {isAdmin && (
                <Link to="/admin" className="site-header__admin-btn">
                  어드민
                </Link>
              )}

              <div className="site-header__account" ref={menuRef}>
                <button
                  type="button"
                  className="site-header__welcome"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {userName} 님 환영합니다
                </button>

                {menuOpen && (
                  <div className="site-header__dropdown" role="menu">
                    <Link
                      to="/orders"
                      className="site-header__dropdown-item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      내 주문 목록
                    </Link>
                    <button
                      type="button"
                      className="site-header__dropdown-item"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/register" className="site-header__icon" aria-label="회원가입">
                <UserPlusIcon />
              </Link>

              <Link to="/login" className="site-header__text-btn">
                로그인
              </Link>
            </>
          )}

          <button type="button" className="site-header__icon" aria-label="검색">
            <SearchIcon />
          </button>

          <Link to="/wishlist" className="site-header__icon" aria-label="위시리스트">
            <HeartIcon />
          </Link>

          <Link to="/cart" className="site-header__icon" aria-label="장바구니">
            <BagIcon />
            {userName && itemCount > 0 && (
              <span className="site-header__badge">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
