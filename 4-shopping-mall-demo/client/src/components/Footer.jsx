import { FOOTER_COLUMNS } from '../data/footerLinks';
import { SITE_NAME } from '../constants/site';
import './Footer.css';

/**
 * 사이트 공통 푸터 (검정 배경 + 링크 컬럼)
 * 링크 데이터는 data/footerLinks.js
 */
function Footer() {
  return (
    <footer className="shop-footer">
      <div className="shop-footer__brand">{SITE_NAME}</div>

      <div className="shop-footer__columns">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="shop-footer__column">
            <h3>{column.title}</h3>
            <ul>
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="shop-footer__bottom">
        <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        <p>대한민국 / 한국어</p>
      </div>
    </footer>
  );
}

export default Footer;
