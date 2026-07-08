import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "shiv_cart_admin_upi";
const CartCtx = createContext(null);

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const api = useMemo(() => ({
    items,
    add(product, qty = 1) {
      setItems(prev => {
        const found = prev.find(p => p.productId === product._id);
        if (found) return prev.map(p => p.productId === product._id ? { ...p, qty: p.qty + qty } : p);
        return [...prev, { productId: product._id, title: product.title, price: product.price, qty }];
      });
    },
    remove(productId) { setItems(prev => prev.filter(p => p.productId !== productId)); },
    setQty(productId, qty) {
      const q = Math.max(1, Number(qty || 1));
      setItems(prev => prev.map(p => p.productId === productId ? { ...p, qty: q } : p));
    },
    clear() { setItems([]); },
    totalRupees() { return items.reduce((s, it) => s + it.qty * it.price, 0); }
  }), [items]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  return useContext(CartCtx);
}
