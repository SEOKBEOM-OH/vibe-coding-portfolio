const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Cart 라우트 — JWT 로그인한 본인 장바구니만 접근
 * 모두 authenticateToken (Bearer JWT) 필요
 */
router.get('/', authenticateToken, cartController.getCart);
router.post('/items', authenticateToken, cartController.addCartItem);
router.put('/items/:itemId', authenticateToken, cartController.updateCartItem);
router.delete('/items/:itemId', authenticateToken, cartController.removeCartItem);
router.delete('/', authenticateToken, cartController.clearCart);

module.exports = router;
