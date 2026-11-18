import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'motovelocity-cart';

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (bike) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === bike.id);
      if (existing) {
        return prev.map((i) =>
          i.id === bike.id ? { ...i, qty: Math.min(10, i.qty + 1) } : i
        );
      }
      return [
        ...prev,
        {
          id: bike.id,
          name: bike.name,
          brand: bike.brand,
          price: bike.price,
          image: bike.image,
          qty: 1,
        },
      ];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.min(10, Math.max(1, qty)) } : i
      )
    );
  };

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const delivery = subtotal >= 5000 ? 0 : 199;

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQty, clear, count, subtotal, tax, delivery, total: subtotal + tax + delivery }),
    [items, count, subtotal, tax, delivery]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
