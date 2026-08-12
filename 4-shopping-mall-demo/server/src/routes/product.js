const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Product 라우트
 * 공개: GET /, GET /:id
 * 보호: authenticateToken + admin|seller
 */
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', authenticateToken, authorize('admin', 'seller'), productController.createProduct);
router.put('/:id', authenticateToken, authorize('admin', 'seller'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorize('admin', 'seller'), productController.deleteProduct);

module.exports = router;
