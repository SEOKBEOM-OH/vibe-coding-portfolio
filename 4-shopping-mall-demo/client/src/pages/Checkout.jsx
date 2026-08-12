import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShopLayout from '../components/ShopLayout';
import {
  ArrowLeftIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '../components/Icons';
import { createOrder } from '../api/orders';
import { getProductById } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatProductPrice } from '../utils/productDisplay';
import {
  EXPRESS_SHIPPING_FEE,
  NEXT_DAY_SHIPPING_FEE,
  getStandardShippingFee,
} from '../constants/shipping';
import './Checkout.css';

/** 포트원 고객사 식별코드 (강의 프롬프트) */
const IMP_CODE = 'imp77560410';

/**
 * KG이니시스 결제창 일반결제 V1 (구모듈)
 * 콘솔에 html5_inicis + INIpayTest 등록 확인됨
 */
const IMP_PG = 'html5_inicis';

const SHIPPING_OPTIONS = [
  {
    id: 'standard',
    title: '일반 배송',
    desc: '영업일 기준 5–7일',
  },
  {
    id: 'express',
    title: '특급 배송',
    desc: '영업일 기준 2–3일',
    fee: EXPRESS_SHIPPING_FEE,
  },
  {
    id: 'next',
    title: '익일 배송',
    desc: '다음 영업일 도착',
    fee: NEXT_DAY_SHIPPING_FEE,
  },
];

const PAYMENT_OPTIONS = [
  { id: 'card', label: '신용/직불 카드' },
];

/**
 * 주문(체크아웃) 페이지
 * 왼쪽: 배송·결제 입력 / 오른쪽: 주문 요약 + 주문하기
 */
function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, itemCount, totalAmount, loading, refreshCart } = useCart();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: user?.address || '',
    city: '',
    state: '',
    zip: '',
    shippingMethod: 'standard',
    paymentMethod: 'card',
    sameAsShipping: true,
    memo: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  /** 결제 성공 후 주문 저장만 실패한 경우 — 재결제 없이 주문 저장 재시도 */
  const [pendingPaidOrder, setPendingPaidOrder] = useState(null);

  // 1) 포트원 결제 모듈 초기화 — IMP.init(고객사 식별코드)
  useEffect(() => {
    const { IMP } = window;
    if (!IMP) {
      console.warn('[PortOne] iamport.js 가 로드되지 않았습니다. index.html 스크립트를 확인하세요.');
      return;
    }
    IMP.init(IMP_CODE);
  }, []);

  const standardFee = getStandardShippingFee(totalAmount);

  const shippingFee = useMemo(() => {
    if (form.shippingMethod === 'express') return EXPRESS_SHIPPING_FEE;
    if (form.shippingMethod === 'next') return NEXT_DAY_SHIPPING_FEE;
    return standardFee;
  }, [form.shippingMethod, standardFee]);

  const finalAmount = totalAmount + shippingFee;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildShippingPayload = () => {
    const receiverName = form.name.trim();
    const addressParts = [
      form.address.trim(),
      form.city.trim(),
      form.state.trim(),
      form.zip.trim(),
    ].filter(Boolean);
    return {
      receiverName,
      shippingAddress: addressParts.join(', '),
      receiverPhone: form.phone.trim(),
      shippingFee,
      memo: form.memo.trim(),
    };
  };

  /** 결제 전에 재고 확인 — 부족하면 결제창을 열지 않음 */
  const assertCartInStock = async () => {
    for (const item of items) {
      const res = await getProductById(item.productId);
      const product = res.data;
      if (!product || !product.is_active) {
        throw new Error(`상품을 주문할 수 없습니다: ${item.name}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `재고가 부족합니다: ${product.name} (재고 ${product.stock}개)`
        );
      }
    }
  };

  /** 결제 완료 건 → 서버에 주문 저장 */
  const savePaidOrder = async (payment) => {
    const shipping = buildShippingPayload();
    const res = await createOrder({
      ...shipping,
      paymentMethod: 'card',
      impUid: payment.impUid,
      merchantUid: payment.merchantUid,
    });
    await refreshCart();
    setPendingPaidOrder(null);
    navigate(`/checkout/complete/${res.data._id}`, {
      replace: true,
      state: { order: res.data },
    });
  };

  /**
   * 2) 주문하기 → 재고 확인 후 IMP.request_pay
   * 재고 0 / 부족이면 결제창을 열지 않음
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!items.length) {
      setError('장바구니가 비어 있습니다.');
      return;
    }

    const shipping = buildShippingPayload();

    if (
      !shipping.receiverName ||
      !shipping.receiverPhone ||
      !form.address.trim()
    ) {
      setError('수령인, 연락처, 주소는 필수입니다.');
      return;
    }

    if (!form.city.trim() || !form.zip.trim()) {
      setError('도시와 우편번호를 입력해 주세요.');
      return;
    }

    // 이미 결제만 끝난 건 → 결제창 다시 열지 않고 주문 저장만 재시도
    if (pendingPaidOrder) {
      setSubmitting(true);
      try {
        await savePaidOrder(pendingPaidOrder);
      } catch (err) {
        setError(
          err.message ||
            '주문 저장에 실패했습니다. 결제는 완료된 상태이니 다시 시도해 주세요.'
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const { IMP } = window;
    if (!IMP) {
      setError('결제 모듈을 불러오지 못했습니다. 페이지를 새로고침해 주세요.');
      return;
    }

    const orderName =
      items.length === 1
        ? items[0].name
        : `${items[0].name} 외 ${items.length - 1}건`;

    const merchantUid = `COS-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    setSubmitting(true);

    try {
      // 결제 전 재고 확인 (부족하면 결제하지 않음)
      await assertCartInStock();

      IMP.request_pay(
        {
          pg: IMP_PG,
          pay_method: 'card',
          merchant_uid: merchantUid,
          name: orderName,
          amount: finalAmount,
          buyer_email: form.email.trim() || user?.email || '',
          buyer_name: shipping.receiverName,
          buyer_tel: shipping.receiverPhone,
          buyer_addr: shipping.shippingAddress,
          buyer_postcode: form.zip.trim(),
        },
        async (rsp) => {
          try {
            if (!rsp.success) {
              setError(rsp.error_msg || '결제가 취소되었거나 실패했습니다.');
              return;
            }

            const payment = {
              impUid: rsp.imp_uid,
              merchantUid: rsp.merchant_uid || merchantUid,
            };

            try {
              await savePaidOrder(payment);
            } catch (saveErr) {
              setPendingPaidOrder(payment);
              setError(
                `${saveErr.message || '주문 저장에 실패했습니다.'} 결제는 완료되었습니다. 아래 버튼으로 주문만 다시 저장해 주세요.`
              );
            }
          } finally {
            setSubmitting(false);
          }
        }
      );
    } catch (err) {
      setError(err.message || '결제창을 열지 못했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <ShopLayout mainClassName="checkout-layout">
      <div className="checkout-page">
        <header className="checkout-page__topbar">
          <button
            type="button"
            className="checkout-page__back"
            onClick={() => navigate('/cart')}
            aria-label="장바구니로"
          >
            <ArrowLeftIcon size={20} />
          </button>
          <h1>주문하기</h1>
          <span className="checkout-page__topbar-spacer" aria-hidden="true" />
        </header>

        <ol className="checkout-steps" aria-label="주문 단계">
          <li className="is-active">
            <span className="checkout-steps__num">1</span>
            배송
          </li>
          <li className="checkout-steps__line" aria-hidden="true" />
          <li>
            <span className="checkout-steps__num">2</span>
            결제
          </li>
          <li className="checkout-steps__line" aria-hidden="true" />
          <li>
            <span className="checkout-steps__num">3</span>
            확인
          </li>
        </ol>

        {loading && <p className="checkout-page__status">불러오는 중…</p>}

        {!loading && items.length === 0 && (
          <div className="checkout-page__empty">
            <p>주문할 상품이 없습니다.</p>
            <Link to="/products" className="checkout-btn checkout-btn--primary">
              쇼핑하러 가기
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <form className="checkout-page__grid" onSubmit={handleSubmit}>
            <div className="checkout-page__main">
              <section className="checkout-section">
                <h2>배송 정보</h2>
                <div className="checkout-fields">
                  <label className="checkout-field">
                    <span>이름</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField('name', e.target.value)}
                      placeholder="홍길동"
                      autoComplete="name"
                      required
                    />
                  </label>

                  <label className="checkout-field">
                    <span>이메일</span>
                    <div className="checkout-input-icon">
                      <MailIcon size={16} />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setField('email', e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </label>

                  <label className="checkout-field">
                    <span>전화번호</span>
                    <div className="checkout-input-icon">
                      <PhoneIcon size={16} />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setField('phone', e.target.value)}
                        placeholder="010-0000-0000"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </label>

                  <label className="checkout-field">
                    <span>주소</span>
                    <div className="checkout-input-icon">
                      <MapPinIcon size={16} />
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setField('address', e.target.value)}
                        placeholder="도로명 주소"
                        autoComplete="street-address"
                        required
                      />
                    </div>
                  </label>

                  <div className="checkout-row checkout-row--3">
                    <label className="checkout-field">
                      <span>도시</span>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => setField('city', e.target.value)}
                        placeholder="서울"
                        autoComplete="address-level2"
                        required
                      />
                    </label>
                    <label className="checkout-field">
                      <span>시/도</span>
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => setField('state', e.target.value)}
                        placeholder="서울특별시"
                        autoComplete="address-level1"
                      />
                    </label>
                    <label className="checkout-field">
                      <span>우편번호</span>
                      <input
                        type="text"
                        value={form.zip}
                        onChange={(e) => setField('zip', e.target.value)}
                        placeholder="06236"
                        autoComplete="postal-code"
                        required
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className="checkout-section">
                <h2>배송 방법</h2>
                <div className="checkout-options" role="radiogroup" aria-label="배송 방법">
                  {SHIPPING_OPTIONS.map((opt) => {
                    const fee =
                      opt.id === 'standard' ? standardFee : opt.fee;
                    const feeLabel =
                      fee === 0 ? '무료' : formatProductPrice(fee);
                    const selected = form.shippingMethod === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`checkout-option${selected ? ' is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={opt.id}
                          checked={selected}
                          onChange={() => setField('shippingMethod', opt.id)}
                        />
                        <span className="checkout-option__radio" aria-hidden="true" />
                        <span className="checkout-option__body">
                          <span className="checkout-option__title">{opt.title}</span>
                          <span className="checkout-option__desc">{opt.desc}</span>
                        </span>
                        <span
                          className={`checkout-option__price${fee === 0 ? ' is-free' : ''}`}
                        >
                          {feeLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="checkout-section">
                <h2>결제 정보</h2>
                <div className="checkout-pay-types" role="radiogroup" aria-label="결제 수단">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`checkout-pay-type${
                        form.paymentMethod === opt.id ? ' is-selected' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.id}
                        checked={form.paymentMethod === opt.id}
                        onChange={() => setField('paymentMethod', opt.id)}
                      />
                      <span className="checkout-option__radio" aria-hidden="true" />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <p className="checkout-pay-hint">
                  주문하기를 누르면 포트원(KG이니시스) 결제창이 열립니다. 카드 정보는
                  결제창에서 입력합니다.
                </p>
              </section>

              <section className="checkout-section">
                <h2>청구 주소</h2>
                <label className="checkout-check">
                  <input
                    type="checkbox"
                    checked={form.sameAsShipping}
                    onChange={(e) => setField('sameAsShipping', e.target.checked)}
                  />
                  <span>배송 주소와 동일합니다</span>
                </label>
              </section>

              <section className="checkout-section">
                <h2>배송 요청사항</h2>
                <label className="checkout-field">
                  <span className="checkout-field__optional">선택</span>
                  <input
                    type="text"
                    value={form.memo}
                    onChange={(e) => setField('memo', e.target.value)}
                    placeholder="문 앞에 놓아주세요"
                  />
                </label>
              </section>
            </div>

            <aside className="checkout-summary">
              <h2>주문 요약</h2>

              <ul className="checkout-summary__items">
                {items.map((item) => (
                  <li key={item._id} className="checkout-summary__item">
                    <div className="checkout-summary__thumb">
                      {item.image ? (
                        <img src={item.image} alt="" />
                      ) : (
                        <span />
                      )}
                      <span className="checkout-summary__qty">{item.quantity}</span>
                    </div>
                    <div className="checkout-summary__meta">
                      <strong>{item.name}</strong>
                      <span>{formatProductPrice(item.price)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="checkout-summary__divider" />

              <div className="checkout-summary__row">
                <span>소계 ({itemCount}개)</span>
                <strong>{formatProductPrice(totalAmount)}</strong>
              </div>
              <div className="checkout-summary__row">
                <span>배송비</span>
                <strong className={shippingFee === 0 ? 'is-free' : ''}>
                  {shippingFee === 0 ? '무료' : formatProductPrice(shippingFee)}
                </strong>
              </div>

              <div className="checkout-summary__divider" />

              <div className="checkout-summary__row checkout-summary__row--total">
                <span>총 결제 금액</span>
                <strong>{formatProductPrice(finalAmount)}</strong>
              </div>

              {error && <p className="checkout-summary__error">{error}</p>}

              <button
                type="submit"
                className="checkout-btn checkout-btn--primary checkout-btn--order"
                disabled={submitting}
              >
                <LockIcon size={16} />
                {submitting
                  ? pendingPaidOrder
                    ? '주문 저장 중…'
                    : '결제 진행 중…'
                  : pendingPaidOrder
                    ? '주문 저장 다시 시도'
                    : '주문하기'}
              </button>

              <div className="checkout-summary__badges">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
                <span>PAYPAL</span>
              </div>
              <p className="checkout-summary__legal">
                주문하기를 누르면 이용약관 및 개인정보 처리방침에 동의하는 것으로
                간주됩니다.
              </p>
            </aside>
          </form>
        )}
      </div>
    </ShopLayout>
  );
}

export default Checkout;
