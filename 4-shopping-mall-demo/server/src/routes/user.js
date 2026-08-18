const express = require('express');
const userController = require('../controllers/userController');
const {
  authenticateToken,
  authorize,
  authorizeSelfOrAdmin,
} = require('../middleware/auth');

const router = express.Router();

/**
 * User 라우트 — @RequestMapping("/api/users")
 * 공개: POST /login, POST / (회원가입)
 * 보호: authenticateToken = 로그인 필터, authorize = 권한 체크
 */
router.post('/login', userController.loginUser);
router.post('/', userController.createUser);

router.get('/me', authenticateToken, userController.getMe);
router.get('/', authenticateToken, authorize('admin'), userController.getUsers);
router.get('/:id', authenticateToken, authorizeSelfOrAdmin, userController.getUserById);
router.put('/:id', authenticateToken, authorizeSelfOrAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, authorizeSelfOrAdmin, userController.deleteUser);

module.exports = router;
