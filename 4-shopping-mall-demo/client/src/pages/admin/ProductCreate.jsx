import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopLayout from '../../components/ShopLayout';
import { CloseIcon, UploadCloudIcon } from '../../components/Icons';
import { createProduct } from '../../api/products';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { openCloudinaryUploadWidget } from '../../utils/cloudinary';
import './ProductCreate.css';

/**
 * 상품 등록 페이지
 * 필드: sku, category, name, description, price, image
 * 이미지는 Cloudinary Upload Widget으로 업로드
 *
 * 등록 흐름:
 *  1) 폼 검증
 *  2) createProduct() → POST /api/products (JWT + admin/seller)
 *  3) 성공 시 /admin 으로 이동
 */
function ProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    sku: '',
    categories: [],
    name: '',
    description: '',
    price: '',
    image: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCategoryToggle = (value) => {
    setForm((prev) => {
      const has = prev.categories.includes(value);
      const categories = has
        ? prev.categories.filter((c) => c !== value)
        : [...prev.categories, value];
      return { ...prev, categories };
    });
    setError('');
  };

  const handleCancel = () => navigate('/admin/products');

  const handleImageUpload = async () => {
    setError('');
    setUploading(true);

    try {
      await openCloudinaryUploadWidget({
        onSuccess: (info) => {
          const url = info.secure_url || info.url;
          if (!url) {
            setError('업로드된 이미지 URL을 받지 못했습니다.');
            return;
          }
          setForm((prev) => ({ ...prev, image: url }));
        },
        onError: () => {
          setError('이미지 업로드에 실패했습니다. 다시 시도해 주세요.');
        },
      });
    } catch (err) {
      setError(err.message || 'Cloudinary 위젯을 열 수 없습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !form.sku.trim() ||
      form.categories.length === 0 ||
      !form.name.trim() ||
      !form.price
    ) {
      setError('SKU, 카테고리(1개 이상), 상품명, 가격은 필수입니다.');
      return;
    }

    if (!form.image.trim()) {
      setError('상품 이미지를 업로드해 주세요.');
      return;
    }

    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      setError('가격은 0 이상의 숫자여야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      /**
       * POST /api/products
       * Authorization: Bearer <token> 은 apiClient가 자동 첨부
       */
      await createProduct({
        sku: form.sku.trim(),
        category: form.categories,
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        image: form.image.trim(),
        stock: 10,
      });
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || '상품 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShopLayout showFooter={false}>
      <div className="product-create">
        <div className="product-create__panel">
          <header className="product-create__header">
            <h1>상품 등록</h1>
            <button
              type="button"
              className="product-create__close"
              onClick={handleCancel}
              aria-label="닫기"
            >
              <CloseIcon size={20} />
            </button>
          </header>

          <form className="product-create__form" onSubmit={handleSubmit}>
            {error && <p className="product-create__error">{error}</p>}

            {/* 1행: SKU | 카테고리 | 상품명 */}
            <div className="product-create__row product-create__row--3">
              <div className="product-create__field">
                <label htmlFor="sku" className="product-create__label">
                  SKU <span className="product-create__required">*</span>
                </label>
                <input
                  id="sku"
                  name="sku"
                  className="product-create__input"
                  placeholder="예: COS-SHIRT-001"
                  value={form.sku}
                  onChange={handleChange}
                  autoComplete="off"
                />
                <p className="product-create__hint">상품 고유 식별코드</p>
              </div>

              <div className="product-create__field">
                <span className="product-create__label">
                  카테고리 <span className="product-create__required">*</span>
                </span>
                <div className="product-create__checks" role="group" aria-label="카테고리">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <label key={cat.value} className="product-create__check">
                      <input
                        type="checkbox"
                        checked={form.categories.includes(cat.value)}
                        onChange={() => handleCategoryToggle(cat.value)}
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
                <p className="product-create__hint">여러 개 선택 가능</p>
              </div>

              <div className="product-create__field">
                <label htmlFor="name" className="product-create__label">
                  상품명 <span className="product-create__required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  className="product-create__input"
                  placeholder="예: Relaxed-Fit Cotton Shirt"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 2행: 상품 설명 | 가격 */}
            <div className="product-create__row product-create__row--2">
              <div className="product-create__field">
                <label htmlFor="description" className="product-create__label">
                  상품 설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="product-create__textarea"
                  placeholder="소재, 핏, 착용감 등을 입력해 주세요"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                />
                <p className="product-create__hint">선택사항</p>
              </div>

              <div className="product-create__field product-create__field--price">
                <label htmlFor="price" className="product-create__label">
                  가격 <span className="product-create__required">*</span>
                </label>
                <div className="product-create__price-wrap">
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    className="product-create__input product-create__input--price"
                    placeholder="0"
                    value={form.price}
                    onChange={handleChange}
                  />
                  <span className="product-create__price-unit" aria-hidden="true">
                    원
                  </span>
                </div>
              </div>
            </div>

            {/* 하단: 이미지 + 액션 */}
            <div className="product-create__footer">
              <div className="product-create__image-block">
                <span className="product-create__label">
                  상품 이미지 <span className="product-create__required">*</span>
                </span>

                <button
                  type="button"
                  className="product-create__upload"
                  onClick={handleImageUpload}
                  disabled={uploading || submitting}
                >
                  <UploadCloudIcon size={18} />
                  <span>
                    {form.image
                      ? '이미지 변경 (Cloudinary)'
                      : uploading
                        ? '위젯 여는 중…'
                        : '이미지 업로드 (Cloudinary)'}
                  </span>
                </button>

                {form.image && (
                  <div className="product-create__preview-wrap">
                    <div className="product-create__preview">
                      <img src={form.image} alt="상품 미리보기" />
                      <button
                        type="button"
                        className="product-create__preview-remove"
                        onClick={handleClearImage}
                        aria-label="이미지 제거"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                    <p className="product-create__hint">업로드된 이미지 미리보기</p>
                  </div>
                )}
              </div>

              <div className="product-create__actions">
                <button
                  type="button"
                  className="product-create__btn product-create__btn--cancel"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="product-create__btn product-create__btn--submit"
                  disabled={submitting || uploading}
                >
                  {submitting ? '등록 중…' : '상품 등록'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ShopLayout>
  );
}

export default ProductCreate;
