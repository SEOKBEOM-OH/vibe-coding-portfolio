/**
 * 전역 에러 핸들러
 * 라우트/미들웨어에서 next(err) 또는 async 에러가 나면 여기로 온다.
 * 클라이언트에는 항상 { success, message } 형태로 응답한다.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose 유효성 검사 실패 (required, enum 등)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // 잘못된 ObjectId 형식
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // unique 중복 (email, sku 등)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    if (field === 'sku') {
      message = '이미 사용 중인 SKU입니다.';
    } else if (field === 'email') {
      message = '이미 사용 중인 이메일입니다.';
    } else if (field === 'orderNumber') {
      message = '주문번호가 중복되었습니다. 다시 시도해 주세요.';
    } else {
      message = `${field} 값이 이미 존재합니다.`;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
