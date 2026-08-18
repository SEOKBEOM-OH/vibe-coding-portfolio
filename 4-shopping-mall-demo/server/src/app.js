const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const errorHandler = require('./middleware/errorHandler');

/**
 * Express 앱 조립 (Spring의 DispatcherServlet + WebMvcConfig)
 *
 * 요청은 위에서 아래로 통과:
 *   cors → JSON 파서 → /api/* 라우터 → 404 → errorHandler
 *
 * routes/  = @RestController 의 URL 매핑
 * middleware/ = Filter / Interceptor
 */
const createApp = () => {
  const app = express();

  // CORS: 프론트 주소가 API와 다를 때 브라우저가 요청을 허용할지 결정
  // CLIENT_URL(운영 Vercel) + 로컬 + Vercel Preview URL 허용
  // Preview는 Redeploy 때마다 호스트가 바뀜 (예: shopping-mall-client-xxxxx.vercel.app)
  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://shopping-mall-client-eight.vercel.app',
  ].filter(Boolean);

  const isVercelPreview = (origin) =>
    /^https:\/\/shopping-mall-client[a-z0-9-]*\.vercel\.app$/.test(origin);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || isVercelPreview(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Not allowed by CORS: ${origin}`));
      },
    })
  );

  // 요청 body를 JSON / form으로 파싱 → req.body로 사용
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 루트 헬스체크: http://localhost:5000/ (브라우저에서 서버 접속 확인)
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Shopping Mall API is running',
    });
  });

  // 프론트가 API 연결 확인 (서버가 “살아있는지”만 확인하는 연결 테스트용 주소)
  // API 헬스체크 (클라이언트 Home 에서 사용)  // 프론트 ↔ 백엔드 연결이 되는지 보는 용도
  app.get('/api', (req, res) => {
    res.json({
      success: true,
      message: 'Shopping Mall API is running',
    });
  });

  // User CRUD: /api/users, /api/users/:id
  app.use('/api/users', userRoutes);

  // Product CRUD: /api/products, /api/products/:id
  app.use('/api/products', productRoutes);

  // Cart CRUD: /api/cart, /api/cart/items/:itemId
  app.use('/api/cart', cartRoutes);

  // Order CRUD: /api/orders, /api/orders/:id
  app.use('/api/orders', orderRoutes);

  app.use((req, res) => {
    res.status(404).json({  // 위에서 처리되지 않은 경로 → 404 JSON
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(errorHandler);  // next(err) 또는 throw 된 에러를 여기서 일괄 처리 (인자 4개 = 에러 미들웨어)

  return app;
};

module.exports = createApp;
