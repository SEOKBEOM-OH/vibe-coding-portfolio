const mongoose = require('mongoose');

/**
 * Product 스키마 ≈ @Entity(Product)
 * category는 배열(다중값). createdBy는 User FK(ObjectId)
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price must be 0 or greater'],
    },
    image: {
      type: String,
      required: [true, 'image is required'],
      trim: true,
    },
    colors: {
      type: [String],
      default: [],
    },
    category: {
      type: [
        {
          type: String,
          enum: {
            values: ['women', 'men', 'kids', 'accessories', 'sale'],
            message:
              'category must be women, men, kids, accessories, or sale',
          },
          lowercase: true,
          trim: true,
        },
      ],
      required: [true, 'category is required'],
      validate: {
        validator(arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: 'category must have at least one value',
      },
    },
    stock: {
      type: Number,
      required: [true, 'stock is required'],
      min: [0, 'stock must be 0 or greater'],
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      trim: true,
      default: 'COS',
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true, // sku 없을 때도 여러 문서 허용
    },
    sale_price: {
      type: Number,
      min: [0, 'sale_price must be 0 or greater'],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
