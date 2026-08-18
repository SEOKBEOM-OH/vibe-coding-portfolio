/**
 * 포트원 REST 유틸 (PG 승인 조회)
 * 브라우저 결제창 성공만 믿지 않고, 서버가 포트원에 다시 물어본다.
 * .env: PORTONE_API_KEY, PORTONE_API_SECRET
 */

const PORTONE_API_BASE = 'https://api.iamport.kr';

/** POST /users/getToken → access_token */
const getPortOneAccessToken = async () => {
  const impKey = process.env.PORTONE_API_KEY;
  const impSecret = process.env.PORTONE_API_SECRET;

  if (!impKey || !impSecret) {
    const error = new Error(
      '포트원 API 키가 없습니다. server/.env 에 PORTONE_API_KEY, PORTONE_API_SECRET 을 설정하세요.'
    );
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(`${PORTONE_API_BASE}/users/getToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imp_key: impKey,
      imp_secret: impSecret,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.code !== 0 || !data.response?.access_token) {
    const error = new Error(
      data.message || '포트원 Access Token 발급에 실패했습니다.'
    );
    error.statusCode = 502;
    throw error;
  }

  return data.response.access_token;
};

/**
 * 결제 내역 조회
 * 1) merchant_uid 로 조회 (권장 — 현재 계정에서 안정적)
 * 2) 실패 시 imp_uid 로 재시도
 */
const getPortOnePayment = async ({ impUid, merchantUid }) => {
  const accessToken = await getPortOneAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: accessToken,
  };

  let payment = null;
  let lastMessage = '';

  // 1) 가맹점 주문번호로 조회
  if (merchantUid) {
    const byMerchant = await fetch(
      `${PORTONE_API_BASE}/payments/find/${encodeURIComponent(merchantUid)}`,
      { method: 'GET', headers }
    );
    const data = await byMerchant.json();
    if (byMerchant.ok && data.code === 0 && data.response) {
      payment = data.response;
    } else {
      lastMessage = data.message || lastMessage;
    }
  }

  // 2) imp_uid 로 조회 (fallback)
  if (!payment && impUid) {
    const byImp = await fetch(
      `${PORTONE_API_BASE}/payments/${encodeURIComponent(impUid)}`,
      { method: 'GET', headers }
    );
    const data = await byImp.json();
    if (byImp.ok && data.code === 0 && data.response) {
      payment = data.response;
    } else {
      lastMessage = data.message || lastMessage;
    }
  }

  if (!payment) {
    const error = new Error(
      lastMessage || '유효하지 않은 결제 정보입니다.'
    );
    error.statusCode = 400;
    throw error;
  }

  return payment;
};

/**
 * 결제 검증
 * - status === 'paid'
 * - amount === expectedAmount
 * - imp_uid / merchant_uid 일치
 */
const verifyPortOnePayment = async ({
  impUid,
  merchantUid,
  expectedAmount,
}) => {
  const payment = await getPortOnePayment({ impUid, merchantUid });

  if (payment.status !== 'paid') {
    const error = new Error(
      `결제가 완료되지 않았습니다. (상태: ${payment.status})`
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number(payment.amount) !== Number(expectedAmount)) {
    const error = new Error(
      `결제 금액이 일치하지 않습니다. (결제 ${payment.amount}원 / 주문 ${expectedAmount}원)`
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    merchantUid &&
    payment.merchant_uid &&
    String(payment.merchant_uid) !== String(merchantUid)
  ) {
    const error = new Error('가맹점 주문번호(merchant_uid)가 일치하지 않습니다.');
    error.statusCode = 400;
    throw error;
  }

  if (impUid && payment.imp_uid && String(payment.imp_uid) !== String(impUid)) {
    const error = new Error('결제 고유번호(imp_uid)가 일치하지 않습니다.');
    error.statusCode = 400;
    throw error;
  }

  return payment;
};

module.exports = {
  getPortOneAccessToken,
  getPortOnePayment,
  verifyPortOnePayment,
};
