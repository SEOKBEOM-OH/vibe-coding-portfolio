import { Link } from 'react-router-dom';
import { HeartIcon } from './Icons';
import { formatProductPrice, getProductId } from '../utils/productDisplay';
import './ProductCard.css';

/**
 * 상품 카드 1개
 * 클릭 시 /products/:id 상세로 이동 (위시 버튼 제외)
 */
function ProductCard({ product, liked, index = 0, onToggleWish }) {
  const id = getProductId(product);
  const colors = product.colors || [];
  const displayPrice =
    product.sale_price != null && product.sale_price < product.price
      ? formatProductPrice(product.sale_price)
      : formatProductPrice(product.price);

  const handleWish = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWish?.(id);
  };

  return (
    <article
      className="product"
      style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
    >
      <div className="product__media-wrap">
        <Link to={`/products/${id}`} className="product__media-link" tabIndex={-1}>
          <div className="product__media">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="product__image"
            />
          </div>
        </Link>
        <button
          type="button"
          className={`product__wish${liked ? ' is-active' : ''}`}
          aria-label={liked ? '위시리스트에서 제거' : '위시리스트에 추가'}
          aria-pressed={liked}
          onClick={handleWish}
        >
          <HeartIcon size={18} filled={liked} />
        </button>
      </div>

      <Link to={`/products/${id}`} className="product__link">
        <div className="product__info">
          <h2 className="product__name">{product.name}</h2>
          <p className="product__price">{displayPrice}</p>
          {colors.length > 0 && (
            <div className="product__swatches" aria-label="색상">
              {colors.map((color) => (
                <span
                  key={color}
                  className="product__swatch"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
