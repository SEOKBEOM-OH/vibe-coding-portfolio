/**
 * 주문 상태 (관리자 드롭다운 · 고객 표시 공통)
 *
 * DB 값: pending | paid | confirmed | processing | shipping_start | shipping | delivered | cancelled
 * 관리자 선택: 주문확인~주문취소 6종 (pending/paid 는 주문확인으로 표시)
 */

export const ORDER_STATUS_OPTIONS = [
  { value: 'confirmed', label: '주문확인' },
  { value: 'processing', label: '상품준비중' },
  { value: 'shipping_start', label: '배송시작' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '주문취소' },
];

/** 관리자 주문 목록 탭 — 드롭다운과 동일한 상태 구분 */
export const ORDER_STATUS_TABS = [
  { id: 'all', label: '전체', statuses: null },
  {
    id: 'confirmed',
    label: '주문확인',
    statuses: ['pending', 'paid', 'confirmed'],
  },
  { id: 'processing', label: '상품준비중', statuses: ['processing'] },
  { id: 'shipping_start', label: '배송시작', statuses: ['shipping_start'] },
  { id: 'shipping', label: '배송중', statuses: ['shipping'] },
  { id: 'delivered', label: '배송완료', statuses: ['delivered'] },
  { id: 'cancelled', label: '주문취소', statuses: ['cancelled'] },
];

export const ORDER_STATUS_LABEL = {
  pending: '주문확인',
  paid: '주문확인',
  confirmed: '주문확인',
  processing: '상품준비중',
  shipping_start: '배송시작',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '주문취소',
};

/** 드롭다운 value — pending/paid 는 주문확인(confirmed)으로 맞춤 */
export function toOrderStatusSelectValue(status) {
  if (status === 'pending' || status === 'paid') return 'confirmed';
  return status;
}

export function isShippingLike(status) {
  return status === 'shipping' || status === 'shipping_start';
}

export function isProcessingLike(status) {
  return ['pending', 'paid', 'confirmed', 'processing'].includes(status);
}
