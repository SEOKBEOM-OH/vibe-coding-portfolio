const mongoose = require('mongoose');

/**
 * Cart 아이템 (장바구니 한 줄)
 * - product: Product 참조
 * - name/image/price: 담을 당시 스냅샷 (상품 수정·삭제 대비)
 * - size + color 조합으로 동일 상품 구분
 */
const cartItemSchema = new mongoose.Schema(
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
 * Cart 스키마 ≈ @Entity(Cart) + @OneToMany items
 * user당 1개(unique). totalQuantity/totalAmount 는 DB에 안 넣고 virtual(계산필드)
 */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/** 총 수량 — items 합산 (DB 저장 X) */
cartSchema.virtual('totalQuantity').get(function () {
  return (this.items || []).reduce((sum, item) => sum + item.quantity, 0);
});

/** 총 금액 — price * quantity 합산 (DB 저장 X) */
cartSchema.virtual('totalAmount').get(function () {
  return (this.items || []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

module.exports = mongoose.model('Cart', cartSchema);
