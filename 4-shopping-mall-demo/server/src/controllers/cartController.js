const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Cart 컨트롤러 — 로그인 유저 본인 장바구니만 (req.user._id)
 * 없으면 빈 카트를 만들어 줌. 담을 때 상품 name/price/image 를 스냅샷으로 저장
 */

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'name price image stock is_active'
  );

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    await cart.populate('items.product', 'name price image stock is_active');
  }

  return cart;
};

const sendCart = (res, cart, status = 200, message) => {
  const payload = {
    success: true,
    data: cart,
  };
  if (message) payload.message = message;
  res.status(status).json(payload);
};

// GET /api/cart — 내 장바구니 조회
const getCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    sendCart(res, cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/items — 상품 담기
// body: { productId, quantity }
const addCartItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId는 필수입니다.',
      });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'quantity는 1 이상의 숫자여야 합니다.',
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.is_active) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    const unitPrice =
      product.sale_price != null && product.sale_price < product.price
        ? product.sale_price
        : product.price;

    const maxStock = product.stock > 0 ? product.stock : 99;

    const cart = await findOrCreateCart(req.user._id);
    const existing = cart.items.find((item) => {
      if (!item.product) return false;
      const id = item.product._id
        ? item.product._id.toString()
        : item.product.toString();
      return id === String(productId);
    });

    if (existing) {
      existing.quantity = Math.min(maxStock, existing.quantity + qty);
      existing.price = unitPrice;
      existing.name = product.name;
      existing.image = product.image;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: unitPrice,
        quantity: Math.min(maxStock, qty),
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name price image stock is_active');

    sendCart(res, cart, 201, '장바구니에 담았습니다.');
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/items/:itemId — 수량 수정
// body: { quantity }
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const qty = Number(req.body.quantity);

    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'quantity는 1 이상의 숫자여야 합니다.',
      });
    }

    const cart = await findOrCreateCart(req.user._id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '장바구니 항목을 찾을 수 없습니다.',
      });
    }

    let maxStock = 99;
    if (item.product) {
      const product = await Product.findById(item.product._id || item.product);
      if (product && product.stock > 0) maxStock = product.stock;
    }

    item.quantity = Math.min(maxStock, qty);
    await cart.save();
    await cart.populate('items.product', 'name price image stock is_active');

    sendCart(res, cart, 200, '수량이 변경되었습니다.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/items/:itemId — 항목 삭제
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await findOrCreateCart(req.user._id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: '장바구니 항목을 찾을 수 없습니다.',
      });
    }

    item.deleteOne();
    await cart.save();
    await cart.populate('items.product', 'name price image stock is_active');

    sendCart(res, cart, 200, '장바구니에서 삭제되었습니다.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart — 장바구니 비우기
const clearCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();

    sendCart(res, cart, 200, '장바구니를 비웠습니다.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
