const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Product 라우트 — @RequestMapping("/api/products")
 * 공개: GET 목록/상세
 * 쓰기(POST/PUT/DELETE): JWT + admin|seller
 */
router.get('/', productController.getProducts);
router.post('/bulk', authenticateToken, authorize('admin', 'seller'), productController.createProductsBulk);
router.get('/:id', productController.getProductById);

router.post('/', authenticateToken, authorize('admin', 'seller'), productController.createProduct);
router.put('/:id', authenticateToken, authorize('admin', 'seller'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorize('admin', 'seller'), productController.deleteProduct);

module.exports = router;
