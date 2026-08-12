/**
 * 관리자 대시보드용 데모 데이터
 * (주문/고객/매출 API 연결 전까지 표시용)
 */
export const ADMIN_DEMO_STATS = {
  orders: { value: 1234, change: '+12%' },
  customers: { value: 2345, change: '+8%' },
  sales: { value: 45678000, change: '+15%' },
  productsChange: '+3%',
};

export const ADMIN_DEMO_ORDERS = [
  {
    id: 'ORD-001234',
    customer: '김민수',
    date: '2024-12-30',
    amount: 219000,
    status: 'processing',
  },
  {
    id: 'ORD-001233',
    customer: '이서연',
    date: '2024-12-29',
    amount: 89000,
    status: 'shipping',
  },
  {
    id: 'ORD-001232',
    customer: '박지훈',
    date: '2024-12-28',
    amount: 450000,
    status: 'delivered',
  },
];

export const ORDER_STATUS_LABEL = {
  processing: '처리중',
  shipping: '배송중',
  delivered: '배송완료',
};
