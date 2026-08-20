const express = require('express')
const { listOrders, getOrder, createOrder, updateStatus, cancelItem } = require('../controllers/ordersController')

const router = express.Router()

router.get('/', listOrders)
router.post('/', createOrder)
router.patch('/:id/items/:itemId/cancel', cancelItem)
router.get('/:id', getOrder)
router.patch('/:id/status', updateStatus)

module.exports = router
