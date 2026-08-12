import Header from './Header';
import Footer from './Footer';
import './ShopLayout.css';

/**
 * 쇼핑몰 공통 레이아웃
 * Header + (본문) + Footer
 *
 * - mainClassName 기본값: shop__main (상품 목록 등)
 * - 회원가입처럼 다른 배경이 필요하면 mainClassName="register" 로 교체
 * - showFooter=false 로 푸터 숨김
 */
function ShopLayout({ children, showFooter = true, mainClassName = 'shop__main' }) {
  return (
    <div className="shop">
      <Header />
      <main className={mainClassName}>{children}</main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}

export default ShopLayout;
