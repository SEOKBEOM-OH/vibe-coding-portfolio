const express = require('express');
const orderController = require('../controllers/orderController');

// Authorization: Bearer <JWT> 헤더 검사 → req.user 설정
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Order 라우트 — @RequestMapping("/api/orders")
 * 전부 JWT 필수. 생성 시 포트원 결제 검증은 컨트롤러에서 수행
 */
router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id', authenticateToken, orderController.updateOrder);
router.delete('/:id', authenticateToken, orderController.deleteOrder);

module.exports = router;
