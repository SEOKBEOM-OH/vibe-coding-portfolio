import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { deleteProduct, getProducts } from '../../api/products';
import {
  PRODUCT_CATEGORIES,
  formatProductCategories,
  productHasCategory,
} from '../../constants/productCategories';
import { SITE_NAME } from '../../constants/site';
import {
  ArrowLeftIcon,
  FilterIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/Icons';
import './Admin.css';
import './ProductManage.css';

function formatWon(n) {
  return `₩${Number(n).toLocaleString('ko-KR')}`;
}

const PAGE_SIZE = 5;

/**
 * 상품 관리 — 등록된 상품 목록
 * /admin/products
 */
function ProductManage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProducts({ is_active: 'all' });
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || '상품 목록을 불러오지 못했습니다.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchName = !q || (p.name || '').toLowerCase().includes(q);
      const matchCategory = !category || productHasCategory(p, category);
      return matchName && matchCategory;
    });
  }, [products, search, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // 검색/필터 변경 시 1페이지로, 삭제 등으로 페이지가 비면 보정
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleDelete = async (product) => {
    const ok = window.confirm(`"${product.name}" 상품을 삭제할까요?`);
    if (!ok) return;

    setDeletingId(product._id);
    setError('');
    try {
      await deleteProduct(product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(err.message || '상품 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="product-manage">
      <header className="admin-dash__topbar">
        <div className="admin-dash__brand">
          <Link to="/" className="admin-dash__logo">
            {SITE_NAME}
          </Link>
          <span className="admin-dash__badge">ADMIN</span>
        </div>
        <Link to="/" className="admin-dash__back">
          쇼핑몰로 돌아가기
        </Link>
      </header>

      <main className="product-manage__main">
        <div className="product-manage__header">
          <div className="product-manage__title-row">
            <Link to="/admin" className="product-manage__back" aria-label="대시보드로 돌아가기">
              <ArrowLeftIcon size={20} />
            </Link>
            <h1>상품 관리</h1>
          </div>
          <Link to="/admin/products/new" className="product-manage__create-btn">
            <PlusIcon size={16} />
            새 상품 등록
          </Link>
        </div>

        <div className="product-manage__tabs" role="tablist">
          <NavLink
            to="/admin/products"
            end
            className={({ isActive }) =>
              `product-manage__tab${isActive ? ' is-active' : ''}`
            }
          >
            상품 목록
          </NavLink>
          <NavLink
            to="/admin/products/new"
            className={({ isActive }) =>
              `product-manage__tab${isActive ? ' is-active' : ''}`
            }
          >
            상품 등록
          </NavLink>
        </div>

        <div className="product-manage__toolbar">
          <label className="product-manage__search">
            <SearchIcon size={18} />
            <input
              type="search"
              placeholder="상품명으로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={`product-manage__filter-btn${showFilter ? ' is-open' : ''}`}
            onClick={() => setShowFilter((v) => !v)}
          >
            <FilterIcon size={16} />
            필터
          </button>
        </div>

        {showFilter && (
          <div className="product-manage__filters">
            <label className="product-manage__filter-field">
              <span>카테고리</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">전체</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {error && <p className="product-manage__error">{error}</p>}

        <div className="product-manage__table-wrap">
          <table className="product-manage__table">
            <thead>
              <tr>
                <th>이미지</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>가격</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="product-manage__empty">
                    불러오는 중…
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="product-manage__empty">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              )}

              {!loading &&
                paged.map((product) => {
                  const hasSale =
                    product.sale_price != null &&
                    product.sale_price < product.price;

                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="product-manage__thumb">
                          {product.image ? (
                            <img src={product.image} alt="" />
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className="product-manage__name">{product.name}</span>
                      </td>
                      <td>
                        <span className="product-manage__category">
                          {formatProductCategories(product) || '-'}
                        </span>
                      </td>
                      <td>
                        <div className="product-manage__price">
                          <span className="product-manage__price-main">
                            {formatWon(hasSale ? product.sale_price : product.price)}
                          </span>
                          {hasSale && (
                            <span className="product-manage__price-origin">
                              {formatWon(product.price)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="product-manage__actions">
                          <button
                            type="button"
                            className="product-manage__icon-btn"
                            title="수정 (준비 중)"
                            disabled
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button
                            type="button"
                            className="product-manage__icon-btn product-manage__icon-btn--danger"
                            title="삭제"
                            disabled={deletingId === product._id}
                            onClick={() => handleDelete(product)}
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="product-manage__pagination">
            <p className="product-manage__page-info">
              전체 {filtered.length}개 중 {rangeStart}–{rangeEnd}
            </p>
            <div className="product-manage__page-controls">
              <button
                type="button"
                className="product-manage__page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`product-manage__page-btn${page === n ? ' is-active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-current={page === n ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="product-manage__page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductManage;
