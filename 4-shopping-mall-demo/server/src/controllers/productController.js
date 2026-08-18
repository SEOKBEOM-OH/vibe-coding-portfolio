const Product = require('../models/Product');

/**
 * Product 컨트롤러 ≈ @RestController + Service
 * 공개 GET, 쓰기는 admin/seller. Mongo 조회는 Product.find() (JpaRepository.findAll)
 */

const PRODUCT_FIELDS = [
  'name',
  'price',
  'image',
  'colors',
  'category',
  'stock',
  'is_active',
  'description',
  'images',
  'sizes',
  'brand',
  'sku',
  'sale_price',
  'tags',
];

const PRODUCT_CATEGORY_VALUES = [
  'women',
  'men',
  'kids',
  'accessories',
  'sale',
];

/** body.category → 문자열 배열로 정규화 (단일 값·배열 모두 허용) */
const normalizeCategories = (raw) => {
  const list = Array.isArray(raw) ? raw : raw != null && raw !== '' ? [raw] : [];
  const normalized = [
    ...new Set(
      list
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => PRODUCT_CATEGORY_VALUES.includes(v))
    ),
  ];
  return normalized;
};

const pickProductFields = (body) => {
  const data = {};
  for (const key of PRODUCT_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (data.category !== undefined) {
    data.category = normalizeCategories(data.category);
  }
  return data;
};

// GET /api/products — 목록 (쿼리: category, is_active, tag)
const getProducts = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.category) {
      // category는 배열 — 해당 값을 포함한 상품만
      filter.category = String(req.query.category).toLowerCase();
    }

    // 기본: 판매 중만. ?is_active=all 이면 전체, true/false면 해당 값
    if (req.query.is_active === 'all') {
      // no is_active filter
    } else if (req.query.is_active !== undefined) {
      filter.is_active = req.query.is_active === 'true';
    } else {
      filter.is_active = true;
    }

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    const products = await Product.find(filter)
      .populate('createdBy', 'name email user_type')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id — 단일 조회
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'createdBy',
      'name email user_type'
    );

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/products — 상품 등록 (admin / seller)
// 프론트: ProductCreate.jsx → POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const data = pickProductFields(req.body);

    // 상품 등록 페이지 필수값 (sku 포함)
    if (
      !data.sku ||
      !data.name ||
      data.price === undefined ||
      data.price === null ||
      !data.image ||
      !data.category ||
      !data.category.length
    ) {
      return res.status(400).json({
        success: false,
        message: 'sku, name, price, image, category는 필수입니다.',
      });
    }

    const price = Number(data.price);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'price는 0 이상의 숫자여야 합니다.',
      });
    }
    data.price = price;

    if (data.stock === undefined || data.stock === null) {
      data.stock = 0;
    } else {
      data.stock = Number(data.stock);
      if (Number.isNaN(data.stock) || data.stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'stock은 0 이상의 숫자여야 합니다.',
        });
      }
    }

    // 빈 문자열 sku는 unique 인덱스 충돌을 막기 위해 제외
    if (typeof data.sku === 'string') {
      data.sku = data.sku.trim();
      if (!data.sku) {
        return res.status(400).json({
          success: false,
          message: 'sku는 필수입니다.',
        });
      }
    }

    const product = await Product.create({
      ...data,
      createdBy: req.user._id,
    });

    await product.populate('createdBy', 'name email user_type');

    res.status(201).json({
      success: true,
      message: '상품이 등록되었습니다.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const MAX_BULK_PRODUCTS = 50;

/**
 * POST /api/products/bulk — 여러 상품 한 번에 등록
 * body: { products: [{ sku, name, price, image, category, ... }] }
 */
const createProductsBulk = async (req, res, next) => {
  try {
    const items = req.body.products;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'products 배열이 필요합니다.',
      });
    }

    if (items.length > MAX_BULK_PRODUCTS) {
      return res.status(400).json({
        success: false,
        message: `한 번에 최대 ${MAX_BULK_PRODUCTS}개까지 등록할 수 있습니다.`,
      });
    }

    const prepared = [];
    const skuSet = new Set();

    for (let i = 0; i < items.length; i++) {
      const data = pickProductFields(items[i] || {});
      const row = i + 1;

      if (
        !data.sku ||
        !data.name ||
        data.price === undefined ||
        data.price === null ||
        !data.image ||
        !data.category ||
        !data.category.length
      ) {
        return res.status(400).json({
          success: false,
          message: `${row}번째 상품: sku, name, price, image, category는 필수입니다.`,
        });
      }

      const price = Number(data.price);
      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `${row}번째 상품: price는 0 이상의 숫자여야 합니다.`,
        });
      }
      data.price = price;

      if (data.stock === undefined || data.stock === null) {
        data.stock = 0;
      } else {
        data.stock = Number(data.stock);
        if (Number.isNaN(data.stock) || data.stock < 0) {
          return res.status(400).json({
            success: false,
            message: `${row}번째 상품: stock은 0 이상의 숫자여야 합니다.`,
          });
        }
      }

      data.sku = String(data.sku).trim().toUpperCase();
      if (!data.sku) {
        return res.status(400).json({
          success: false,
          message: `${row}번째 상품: sku는 필수입니다.`,
        });
      }

      if (skuSet.has(data.sku)) {
        return res.status(400).json({
          success: false,
          message: `SKU가 중복되었습니다: ${data.sku}`,
        });
      }
      skuSet.add(data.sku);

      prepared.push({
        ...data,
        createdBy: req.user._id,
      });
    }

    const existing = await Product.find({ sku: { $in: [...skuSet] } }).select(
      'sku'
    );
    if (existing.length) {
      const dup = existing.map((p) => p.sku).join(', ');
      return res.status(409).json({
        success: false,
        message: `이미 사용 중인 SKU입니다: ${dup}`,
      });
    }

    const docs = await Product.insertMany(prepared);
    const populated = await Product.find({
      _id: { $in: docs.map((d) => d._id) },
    }).populate('createdBy', 'name email user_type');

    res.status(201).json({
      success: true,
      message: `${populated.length}개 상품이 등록되었습니다.`,
      count: populated.length,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id — 수정 (admin / seller)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const data = pickProductFields(req.body);
    Object.assign(product, data);
    await product.save();
    await product.populate('createdBy', 'name email user_type');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id — 삭제 (admin / seller)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  createProductsBulk,
  updateProduct,
  deleteProduct,
};
