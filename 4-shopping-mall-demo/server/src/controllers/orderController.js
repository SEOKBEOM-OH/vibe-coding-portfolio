const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { verifyPortOnePayment } = require('../utils/portone');

/**
 * Order 컨트롤러 — CRUD
 *
 * POST   /api/orders      → 장바구니 기반 주문 생성
 * GET    /api/orders      → 주문 목록 (본인 / admin 전체)
 * GET    /api/orders/:id  → 주문 상세
 * PUT    /api/orders/:id  → 주문 수정
 * DELETE /api/orders/:id  → 주문 삭제
 */

const ORDER_STATUSES = [
  'pending',
  'paid',
  'confirmed',
  'processing',
  'shipping_start',
  'shipping',
  'delivered',
  'cancelled',
];

const PAYMENT_METHODS = ['card', 'kakao', 'transfer', 'naver'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

const FREE_SHIPPING_MIN = 0;
const DEFAULT_SHIPPING_FEE = 3000;

const generateOrderNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${y}${m}${d}-${rand}`;
};

const isAdmin = (user) => user?.user_type === 'admin';

const sendOrder = (res, order, status = 200, message) => {
  const payload = { success: true, data: order };
  if (message) payload.message = message;
  res.status(status).json(payload);
};

const findOrderForAccess = async (orderId, user) => {
  const order = await Order.findById(orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name price image stock is_active');

  if (!order) return { order: null, forbidden: false };

  const ownerId = order.user?._id
    ? order.user._id.toString()
    : order.user.toString();
  const isOwner = ownerId === user._id.toString();

  if (!isOwner && !isAdmin(user)) {
    return { order: null, forbidden: true };
  }

  return { order, forbidden: false };
};

/** 재고 복구 (취소·삭제 시) */
const restoreStock = async (items) => {
  for (const item of items || []) {
    const productId = item.product?._id || item.product;
    if (!productId) continue;
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: item.quantity },
    });
  }
};

/**
 * 주문 중복 여부 확인 (impUid / merchantUid)
 * - 이미 있으면 기존 주문 반환
 */
const findDuplicateOrder = async ({ impUid, merchantUid }) => {
  const or = [];
  if (impUid) or.push({ impUid: String(impUid).trim() });
  if (merchantUid) or.push({ merchantUid: String(merchantUid).trim() });
  if (!or.length) return null;

  return Order.findOne({ $or: or })
    .populate('user', 'name email')
    .populate('items.product', 'name price image stock is_active');
};

// POST /api/orders — 장바구니 → 주문 생성
// body: shippingAddress, receiverName, receiverPhone, paymentMethod?, memo?, shippingFee?,
//       impUid, merchantUid (포트원 결제 성공 후 필수)
const createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      receiverName,
      receiverPhone,
      paymentMethod = 'card',
      memo = '',
      shippingFee,
      impUid,
      merchantUid,
    } = req.body;

    if (!shippingAddress?.trim() || !receiverName?.trim() || !receiverPhone?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'shippingAddress, receiverName, receiverPhone은 필수입니다.',
      });
    }

    if (!impUid?.trim() || !merchantUid?.trim()) {
      return res.status(400).json({
        success: false,
        message: '결제 정보(impUid, merchantUid)가 필요합니다.',
      });
    }

    if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `paymentMethod는 ${PAYMENT_METHODS.join(', ')} 중 하나여야 합니다.`,
      });
    }

    // 1) 주문 중복 체크 (같은 결제 / 같은 가맹점 주문번호)
    const duplicate = await findDuplicateOrder({ impUid, merchantUid });
    if (duplicate) {
      return sendOrder(res, duplicate, 200, '이미 처리된 주문입니다.');
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        message: '장바구니가 비어 있습니다.',
      });
    }

    const orderItems = [];
    let totalQuantity = 0;
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.is_active) {
        return res.status(400).json({
          success: false,
          message: `상품을 주문할 수 없습니다: ${item.name}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `재고가 부족합니다: ${product.name} (재고 ${product.stock}개)`,
        });
      }

      const unitPrice =
        product.sale_price != null && product.sale_price < product.price
          ? product.sale_price
          : product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: unitPrice,
        quantity: item.quantity,
      });

      totalQuantity += item.quantity;
      totalAmount += unitPrice * item.quantity;
    }

    let fee;
    if (shippingFee !== undefined && shippingFee !== null && shippingFee !== '') {
      fee = Number(shippingFee);
      if (!Number.isFinite(fee) || fee < 0) {
        return res.status(400).json({
          success: false,
          message: 'shippingFee는 0 이상의 숫자여야 합니다.',
        });
      }
    } else {
      fee = totalAmount >= FREE_SHIPPING_MIN ? 0 : DEFAULT_SHIPPING_FEE;
    }

    const finalAmount = totalAmount + fee;

    // 2) 포트원 결제 검증 (실제 결제 완료·금액·merchant_uid 일치)
    try {
      await verifyPortOnePayment({
        impUid: String(impUid).trim(),
        merchantUid: String(merchantUid).trim(),
        expectedAmount: finalAmount,
      });
    } catch (verifyError) {
      return res.status(verifyError.statusCode || 400).json({
        success: false,
        message: verifyError.message || '결제 검증에 실패했습니다.',
      });
    }

    // 3) 재고 차감 (실패 시 이미 차감한 분만 복구)
    const deductedItems = [];
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        await restoreStock(deductedItems);
        return res.status(400).json({
          success: false,
          message: `재고가 부족합니다: ${item.name}`,
        });
      }
      deductedItems.push(item);
    }

    let order;
    try {
      order = await Order.create({
        user: req.user._id,
        orderNumber: generateOrderNumber(),
        items: orderItems,
        status: 'paid',
        totalQuantity,
        totalAmount,
        shippingFee: fee,
        finalAmount,
        shippingAddress: shippingAddress.trim(),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        paymentMethod,
        paymentStatus: 'paid',
        paidAt: new Date(),
        memo: typeof memo === 'string' ? memo.trim() : '',
        impUid: String(impUid).trim(),
        merchantUid: String(merchantUid).trim(),
      });
    } catch (createError) {
      await restoreStock(deductedItems);
      // unique(impUid/merchantUid) 충돌 → 이미 생성된 주문 반환
      if (createError.code === 11000) {
        const existing = await findDuplicateOrder({ impUid, merchantUid });
        if (existing) {
          return sendOrder(res, existing, 200, '이미 처리된 주문입니다.');
        }
      }
      throw createError;
    }

    cart.items = [];
    await cart.save();

    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'items.product', select: 'name price image stock is_active' },
    ]);

    sendOrder(res, order, 201, '주문이 생성되었습니다.');
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — 목록 (?status=, ?scope=all|mine)
// 기본: 본인 주문만. admin이 scope=all 이면 전체
const getOrders = async (req, res, next) => {
  try {
    const filter = {};
    const scope = String(req.query.scope || 'mine').toLowerCase();

    if (scope === 'all' && isAdmin(req.user)) {
      if (req.query.user) {
        filter.user = req.query.user;
      }
    } else {
      filter.user = req.user._id;
    }

    if (req.query.status) {
      if (!ORDER_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: `status는 ${ORDER_STATUSES.join(', ')} 중 하나여야 합니다.`,
        });
      }
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name price image stock is_active')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id — 상세
const getOrderById = async (req, res, next) => {
  try {
    const { order, forbidden } = await findOrderForAccess(req.params.id, req.user);

    if (forbidden) {
      return res.status(403).json({
        success: false,
        message: '이 주문을 조회할 권한이 없습니다.',
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.',
      });
    }

    sendOrder(res, order);
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id — 수정
// customer (pending): shippingAddress, receiverName, receiverPhone, memo, paymentMethod
// admin: + status, paymentStatus, shippingFee, paidAt
const updateOrder = async (req, res, next) => {
  try {
    const { order, forbidden } = await findOrderForAccess(req.params.id, req.user);

    if (forbidden) {
      return res.status(403).json({
        success: false,
        message: '이 주문을 수정할 권한이 없습니다.',
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.',
      });
    }

    const adminUser = isAdmin(req.user);
    const {
      shippingAddress,
      receiverName,
      receiverPhone,
      memo,
      paymentMethod,
      status,
      paymentStatus,
      shippingFee,
      paidAt,
    } = req.body;

    if (!adminUser && order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '대기 중인 주문만 수정할 수 있습니다.',
      });
    }

    if (shippingAddress !== undefined) {
      if (!String(shippingAddress).trim()) {
        return res.status(400).json({
          success: false,
          message: 'shippingAddress는 비울 수 없습니다.',
        });
      }
      order.shippingAddress = String(shippingAddress).trim();
    }

    if (receiverName !== undefined) {
      if (!String(receiverName).trim()) {
        return res.status(400).json({
          success: false,
          message: 'receiverName은 비울 수 없습니다.',
        });
      }
      order.receiverName = String(receiverName).trim();
    }

    if (receiverPhone !== undefined) {
      if (!String(receiverPhone).trim()) {
        return res.status(400).json({
          success: false,
          message: 'receiverPhone은 비울 수 없습니다.',
        });
      }
      order.receiverPhone = String(receiverPhone).trim();
    }

    if (memo !== undefined) {
      order.memo = typeof memo === 'string' ? memo.trim() : '';
    }

    if (paymentMethod !== undefined) {
      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: `paymentMethod는 ${PAYMENT_METHODS.join(', ')} 중 하나여야 합니다.`,
        });
      }
      order.paymentMethod = paymentMethod;
    }

    if (adminUser) {
      if (status !== undefined) {
        if (!ORDER_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: `status는 ${ORDER_STATUSES.join(', ')} 중 하나여야 합니다.`,
          });
        }

        const prevStatus = order.status;
        if (status === 'cancelled' && prevStatus !== 'cancelled') {
          await restoreStock(order.items);
        }
        order.status = status;
      }

      if (paymentStatus !== undefined) {
        if (!PAYMENT_STATUSES.includes(paymentStatus)) {
          return res.status(400).json({
            success: false,
            message: `paymentStatus는 ${PAYMENT_STATUSES.join(', ')} 중 하나여야 합니다.`,
          });
        }
        order.paymentStatus = paymentStatus;
        if (paymentStatus === 'paid' && !order.paidAt) {
          order.paidAt = new Date();
        }
      }

      if (shippingFee !== undefined) {
        const fee = Number(shippingFee);
        if (!Number.isFinite(fee) || fee < 0) {
          return res.status(400).json({
            success: false,
            message: 'shippingFee는 0 이상의 숫자여야 합니다.',
          });
        }
        order.shippingFee = fee;
        order.finalAmount = order.totalAmount + fee;
      }

      if (paidAt !== undefined) {
        order.paidAt = paidAt ? new Date(paidAt) : undefined;
      }
    }

    await order.save();
    await order.populate([
      { path: 'user', select: 'name email' },
      { path: 'items.product', select: 'name price image stock is_active' },
    ]);

    sendOrder(res, order, 200, '주문이 수정되었습니다.');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/orders/:id
// customer: pending만 삭제 + 재고 복구
// admin: 아무 상태나 삭제 (cancelled가 아니면 재고 복구)
const deleteOrder = async (req, res, next) => {
  try {
    const { order, forbidden } = await findOrderForAccess(req.params.id, req.user);

    if (forbidden) {
      return res.status(403).json({
        success: false,
        message: '이 주문을 삭제할 권한이 없습니다.',
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.',
      });
    }

    const adminUser = isAdmin(req.user);

    if (!adminUser && order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '대기 중인 주문만 삭제할 수 있습니다.',
      });
    }

    if (order.status !== 'cancelled') {
      await restoreStock(order.items);
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: '주문이 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
