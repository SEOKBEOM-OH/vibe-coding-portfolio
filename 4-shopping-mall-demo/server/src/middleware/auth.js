const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 인증 미들웨어 ≈ Spring Security Filter + @PreAuthorize
 *
 * 프론트가 Authorization: Bearer <JWT> 를 보냄
 *  1) jwt.verify 로 서명/만료 확인
 *  2) payload.id 로 User 조회
 *  3) req.user 에 넣고 next() → 컨트롤러에서 사용 (SecurityContext 와 비슷)
 */

/**
 * authenticateToken — Authorization: Bearer <JWT> 검증
 * 통과하면 req.user 가 채워진 채로 next()
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다.',
      });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다. 다시 로그인해 주세요.',
      });
    }

    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.',
    });
  }
};

/**
 * authorize — 권한 검사 (authenticateToken 다음에 붙임)
 * 예: authorize('admin') → admin만 통과
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.user_type)) {
    return res.status(403).json({
      success: false,
      message: '이 작업을 수행할 권한이 없습니다.',
    });
  }
  next();
};

/**
 * authorizeSelfOrAdmin — 본인 리소스이거나 admin이면 통과
 */
const authorizeSelfOrAdmin = (req, res, next) => {
  const isOwner = req.user._id.toString() === req.params.id;
  const isAdmin = req.user.user_type === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: '이 작업을 수행할 권한이 없습니다.',
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  authorizeSelfOrAdmin,
};
