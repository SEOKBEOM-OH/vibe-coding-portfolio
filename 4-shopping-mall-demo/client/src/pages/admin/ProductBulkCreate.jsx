import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopLayout from '../../components/ShopLayout';
import { CloseIcon, PlusIcon, UploadCloudIcon } from '../../components/Icons';
import { createProductsBulk } from '../../api/products';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import { openCloudinaryUploadWidget } from '../../utils/cloudinary';
import './ProductCreate.css';
import './ProductBulkCreate.css';

const MAX_ROWS = 50;

const emptyRow = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sku: '',
  name: '',
  price: '',
  stock: '10',
  description: '',
  categories: [],
  image: '',
});

const skuFromFile = (filename = '') => {
  const base = String(filename)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 16)
    .toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `COS-${base || 'IMG'}-${suffix}`;
};

const nameFromFile = (filename = '') =>
  String(filename)
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();

/**
 * 상품 대량 등록
 * Cloudinary에서 jpg/png/webp 여러 장을 올리면 행이 생기고, 정보 채운 뒤 일괄 저장
 */
function ProductBulkCreate() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([emptyRow()]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    setError('');
  };

  const toggleCategory = (id, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const has = row.categories.includes(value);
        const categories = has
          ? row.categories.filter((c) => c !== value)
          : [...row.categories, value];
        return { ...row, categories };
      })
    );
    setError('');
  };

  const removeRow = (id) => {
    setRows((prev) => (prev.length <= 1 ? [emptyRow()] : prev.filter((row) => row.id !== id)));
  };

  const addEmptyRow = () => {
    if (rows.length >= MAX_ROWS) {
      setError(`한 번에 최대 ${MAX_ROWS}개까지 등록할 수 있습니다.`);
      return;
    }
    setRows((prev) => [...prev, emptyRow()]);
  };

  const appendFromUpload = (info) => {
    const url = info.secure_url || info.url;
    if (!url) return;
    const filename = info.original_filename || '';
    setRows((prev) => {
      const nextRow = {
        ...emptyRow(),
        image: url,
        name: nameFromFile(filename),
        sku: skuFromFile(filename),
      };
      const first = prev[0];
      const onlyBlank =
        prev.length === 1 &&
        !first.image &&
        !first.sku &&
        !first.name &&
        !first.price;
      const base = onlyBlank ? [] : prev;
      if (base.length >= MAX_ROWS) return prev;
      return [...base, nextRow];
    });
  };

  const handleBulkImageUpload = async () => {
    setError('');
    setUploading(true);
    try {
      await openCloudinaryUploadWidget({
        multiple: true,
        maxFiles: MAX_ROWS,
        onSuccess: appendFromUpload,
        onError: () => {
          setError('이미지 업로드에 실패했습니다. jpg, png, webp를 확인해 주세요.');
        },
      });
    } catch (err) {
      setError(err.message || 'Cloudinary 위젯을 열 수 없습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleRowImageUpload = async (id) => {
    setError('');
    setUploading(true);
    try {
      await openCloudinaryUploadWidget({
        onSuccess: (info) => {
          const url = info.secure_url || info.url;
          if (!url) return;
          const filename = info.original_filename || '';
          setRows((prev) =>
            prev.map((row) => {
              if (row.id !== id) return row;
              return {
                ...row,
                image: url,
                name: row.name.trim() ? row.name : nameFromFile(filename),
                sku: row.sku.trim() ? row.sku : skuFromFile(filename),
              };
            })
          );
        },
        onError: () => {
          setError('이미지 업로드에 실패했습니다.');
        },
      });
    } catch (err) {
      setError(err.message || 'Cloudinary 위젯을 열 수 없습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rows.length) {
      setError('등록할 상품이 없습니다.');
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const n = i + 1;
      if (
        !row.sku.trim() ||
        !row.name.trim() ||
        row.categories.length === 0 ||
        !row.price ||
        !row.image.trim()
      ) {
        setError(
          `${n}번째 상품: SKU, 상품명, 카테고리, 가격, 이미지(webp 포함)는 필수입니다.`
        );
        return;
      }
      const price = Number(row.price);
      if (Number.isNaN(price) || price < 0) {
        setError(`${n}번째 상품: 가격은 0 이상의 숫자여야 합니다.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await createProductsBulk(
        rows.map((row) => ({
          sku: row.sku.trim(),
          name: row.name.trim(),
          category: row.categories,
          price: Number(row.price),
          stock: Number(row.stock) || 0,
          description: row.description.trim(),
          image: row.image.trim(),
        }))
      );
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || '대량 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShopLayout showFooter={false}>
      <div className="product-create product-bulk">
        <div className="product-create__panel">
          <header className="product-create__header">
            <h1>상품 대량 등록</h1>
            <button
              type="button"
              className="product-create__close"
              onClick={() => navigate('/admin/products')}
              aria-label="닫기"
            >
              <CloseIcon size={20} />
            </button>
          </header>

          <p className="product-bulk__lead">
            jpg, png, <strong>webp</strong> 이미지를 여러 장 올리면 상품 행이 만들어집니다.
            SKU·카테고리·가격을 채운 뒤 한 번에 등록하세요. (최대 {MAX_ROWS}개)
          </p>

          <form onSubmit={handleSubmit}>
            {error && <p className="product-create__error">{error}</p>}

            <div className="product-bulk__toolbar">
              <button
                type="button"
                className="product-create__upload"
                onClick={handleBulkImageUpload}
                disabled={uploading || submitting}
              >
                <UploadCloudIcon size={18} />
                <span>
                  {uploading ? '위젯 여는 중…' : '이미지 여러 장 업로드 (webp 포함)'}
                </span>
              </button>
              <button
                type="button"
                className="product-bulk__add"
                onClick={addEmptyRow}
                disabled={submitting || rows.length >= MAX_ROWS}
              >
                <PlusIcon size={16} />
                행 추가
              </button>
            </div>

            <div className="product-bulk__list">
              {rows.map((row, index) => (
                <article key={row.id} className="product-bulk__card">
                  <div className="product-bulk__card-head">
                    <span>상품 {index + 1}</span>
                    <button
                      type="button"
                      className="product-create__close"
                      onClick={() => removeRow(row.id)}
                      aria-label={`${index + 1}번째 행 삭제`}
                    >
                      <CloseIcon size={16} />
                    </button>
                  </div>

                  <div className="product-bulk__card-body">
                    <div className="product-bulk__thumb">
                      {row.image ? (
                        <img src={row.image} alt="" />
                      ) : (
                        <span>이미지 없음</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRowImageUpload(row.id)}
                        disabled={uploading || submitting}
                      >
                        {row.image ? '이미지 변경' : '이미지 업로드'}
                      </button>
                    </div>

                    <div className="product-bulk__fields">
                      <div className="product-create__row product-create__row--3">
                        <div className="product-create__field">
                          <label className="product-create__label">
                            SKU <span className="product-create__required">*</span>
                          </label>
                          <input
                            className="product-create__input"
                            value={row.sku}
                            onChange={(e) => updateRow(row.id, { sku: e.target.value })}
                            placeholder="COS-SHIRT-001"
                          />
                        </div>
                        <div className="product-create__field">
                          <label className="product-create__label">
                            상품명 <span className="product-create__required">*</span>
                          </label>
                          <input
                            className="product-create__input"
                            value={row.name}
                            onChange={(e) => updateRow(row.id, { name: e.target.value })}
                          />
                        </div>
                        <div className="product-create__field">
                          <label className="product-create__label">
                            가격 <span className="product-create__required">*</span>
                          </label>
                          <input
                            className="product-create__input"
                            type="number"
                            min="0"
                            value={row.price}
                            onChange={(e) => updateRow(row.id, { price: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="product-create__field">
                        <span className="product-create__label">
                          카테고리 <span className="product-create__required">*</span>
                        </span>
                        <div className="product-create__checks">
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <label key={cat.value} className="product-create__check">
                              <input
                                type="checkbox"
                                checked={row.categories.includes(cat.value)}
                                onChange={() => toggleCategory(row.id, cat.value)}
                              />
                              <span>{cat.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="product-create__row product-create__row--2">
                        <div className="product-create__field">
                          <label className="product-create__label">상품 설명</label>
                          <input
                            className="product-create__input"
                            value={row.description}
                            onChange={(e) =>
                              updateRow(row.id, { description: e.target.value })
                            }
                          />
                        </div>
                        <div className="product-create__field">
                          <label className="product-create__label">재고</label>
                          <input
                            className="product-create__input"
                            type="number"
                            min="0"
                            value={row.stock}
                            onChange={(e) => updateRow(row.id, { stock: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="product-create__actions product-bulk__actions">
              <button
                type="button"
                className="product-create__btn product-create__btn--cancel"
                onClick={() => navigate('/admin/products')}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="product-create__btn product-create__btn--submit"
                disabled={submitting || uploading}
              >
                {submitting ? '등록 중…' : `${rows.length}개 상품 일괄 등록`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ShopLayout>
  );
}

export default ProductBulkCreate;
