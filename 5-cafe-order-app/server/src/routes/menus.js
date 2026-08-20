const express = require('express')
const { listMenus, updateStock } = require('../controllers/menusController')

const router = express.Router()

router.get('/', listMenus)
router.patch('/:id/stock', updateStock)

module.exports = router
