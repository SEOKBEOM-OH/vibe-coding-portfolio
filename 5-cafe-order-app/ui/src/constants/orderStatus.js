export const ORDER_STATUS = {
  RECEIVED: '주문 접수',
  MAKING: '제조 중',
  DONE: '제조 완료',
  CANCELLED: '주문 취소',
}

export const NEXT_STATUS = {
  [ORDER_STATUS.RECEIVED]: ORDER_STATUS.MAKING,
  [ORDER_STATUS.MAKING]: ORDER_STATUS.DONE,
  [ORDER_STATUS.DONE]: null,
  [ORDER_STATUS.CANCELLED]: null,
}

export const NEXT_STATUS_HINT = {
  [ORDER_STATUS.RECEIVED]: '제조 중으로',
  [ORDER_STATUS.MAKING]: '제조 완료로',
  [ORDER_STATUS.DONE]: null,
  [ORDER_STATUS.CANCELLED]: null,
}

export function canCancelOrder(status) {
  return status === ORDER_STATUS.RECEIVED || status === ORDER_STATUS.MAKING
}
