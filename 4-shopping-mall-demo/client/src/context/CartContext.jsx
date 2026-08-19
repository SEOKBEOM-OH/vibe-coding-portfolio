import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addCartItem as addCartItemApi,
  clearCartApi,
  getCart,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
} from '../api/cart';
import { useAuth } from './AuthContext';
import { clearCartStorage } from '../utils/cartStorage';

/**
 * 전역 장바구니 (서버 Cart API와 동기화)
 * 비로그인: 비움 / 로그인: GET /api/cart
 * Header 장바구니 숫자(itemCount)도 여기서 나옴
 */
const CartContext = createContext(null);

function mapCartItems(cart) {
  if (!cart?.items) return [];
  return cart.items.map((item) => ({
    _id: item._id,
    productId: item.product?._id || item.product,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    size: item.size || '',
    color: item.color || '',
    stock: item.product?.stock,
  }));
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return null;
    }

    setLoading(true);
    try {
      const res = await getCart();
      setCart(res.data || null);
      return res.data;
    } catch {
      setCart(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 로그인/로그아웃·계정 전환 시 장바구니 동기화
  useEffect(() => {
    if (authLoading) return undefined;

    // 예전 localStorage 공용 장바구니 제거
    clearCartStorage();

    if (!user) {
      setCart(null);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getCart();
        if (!cancelled) setCart(res.data || null);
      } catch {
        if (!cancelled) setCart(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const addToCart = useCallback(
    async ({ productId, quantity = 1 }) => {
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }
      const res = await addCartItemApi({
        productId,
        quantity: Math.max(1, Number(quantity) || 1),
      });
      setCart(res.data || null);
      return res.data;
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      const res = await updateCartItemApi(itemId, quantity);
      setCart(res.data || null);
      return res.data;
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      const res = await removeCartItemApi(itemId);
      setCart(res.data || null);
      return res.data;
    },
    [user]
  );

  const clearCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return null;
    }
    const res = await clearCartApi();
    setCart(res.data || null);
    return res.data;
  }, [user]);

  const items = useMemo(() => mapCartItems(cart), [cart]);
  const itemCount = user ? cart?.totalQuantity || 0 : 0;
  const totalAmount = user ? cart?.totalAmount || 0 : 0;

  const value = useMemo(
    () => ({
      cart,
      items,
      itemCount,
      totalAmount,
      loading,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      items,
      itemCount,
      totalAmount,
      loading,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
