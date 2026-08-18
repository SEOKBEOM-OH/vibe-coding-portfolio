const mongoose = require('mongoose');

/**
 * Order 아이템 (주문 한 줄)
 * - product: Product 참조
 * - name/image/price: 주문 시점 스냅샷 (상품 수정·삭제 대비)
 */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'product is required'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price must be 0 or greater'],
    },
    quantity: {
      type: Number,
      required: [true, 'quantity is required'],
      min: [1, 'quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: true }
);

/**
 * Order 스키마 ≈ @Entity(Order)
 * 장바구니와 달리 금액·상품명을 스냅샷으로 저장 (주문 후 상품 수정에 안 흔들림)
 * impUid / merchantUid = 포트원 결제 키 (중복 주문 방지)
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
      index: true,
    },
    orderNumber: {
      type: String,
      required: [true, 'orderNumber is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'order must have at least one item',
      },
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: [
          'pending',
          'paid',
          'confirmed',
          'processing',
          'shipping_start',
          'shipping',
          'delivered',
          'cancelled',
        ],
        message:
          'status must be pending, paid, confirmed, processing, shipping_start, shipping, delivered, or cancelled',
      },
      default: 'pending',
    },
    totalQuantity: {
      type: Number,
      required: [true, 'totalQuantity is required'],
      min: [1, 'totalQuantity must be at least 1'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'totalAmount is required'],
      min: [0, 'totalAmount must be 0 or greater'],
    },
    shippingFee: {
      type: Number,
      required: [true, 'shippingFee is required'],
      min: [0, 'shippingFee must be 0 or greater'],
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: [true, 'finalAmount is required'],
      min: [0, 'finalAmount must be 0 or greater'],
    },
    shippingAddress: {
      type: String,
      required: [true, 'shippingAddress is required'],
      trim: true,
    },
    receiverName: {
      type: String,
      required: [true, 'receiverName is required'],
      trim: true,
    },
    receiverPhone: {
      type: String,
      required: [true, 'receiverPhone is required'],
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      enum: {
        values: ['card', 'kakao', 'transfer', 'naver'],
        message: 'paymentMethod must be card, kakao, transfer, or naver',
      },
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'refunded'],
        message: 'paymentStatus must be unpaid, paid, or refunded',
      },
      default: 'unpaid',
    },
    memo: {
      type: String,
      trim: true,
      default: '',
    },
    paidAt: {
      type: Date,
    },
    /** 포트원 결제 고유번호 */
    impUid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    /** 포트원 가맹점 주문번호 */
    merchantUid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
