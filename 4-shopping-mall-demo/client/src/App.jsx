import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AdminRoute from './components/AdminRoute';
import GuestRoute from './components/GuestRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderComplete from './pages/OrderComplete';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import Admin from './pages/admin/Admin';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import ProductManage from './pages/admin/ProductManage';
import ProductCreate from './pages/admin/ProductCreate';
import ProductBulkCreate from './pages/admin/ProductBulkCreate';

/**
 * 앱 루트 — URL 라우팅 (web.xml / @GetMapping 화면 버전)
 *
 * BrowserRouter = 브라우저 주소로 페이지 전환 (서버 JSP 포워드가 아님)
 * AuthProvider  = 전역 로그인 상태
 * CartProvider  = 전역 장바구니
 *
 * ProtectedRoute = 로그인 필수, GuestRoute = 비로그인만, AdminRoute = admin만
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />

            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/checkout/complete/:id" element={<ProtectedRoute><OrderComplete /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><ProductManage /></AdminRoute>} />
            <Route path="/admin/products/new" element={<AdminRoute><ProductCreate /></AdminRoute>} />
            <Route path="/admin/products/bulk" element={<AdminRoute><ProductBulkCreate /></AdminRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
