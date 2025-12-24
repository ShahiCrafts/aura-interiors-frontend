import { create } from "zustand";

const GUEST_CART_KEY = "guest_cart";

// Helper to load cart from localStorage
const loadGuestCart = () => {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
  }
  return [];
};

// Helper to save cart to localStorage
const saveGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save guest cart:", error);
  }
};

const useGuestCartStore = create((set, get) => ({
  items: loadGuestCart(),

  // Add item to guest cart
  addItem: (product, quantity = 1, variant = {}) => {
    const { items } = get();

    // Check if item already exists with same variant
    const existingIndex = items.findIndex(
      (item) =>
        item.product._id === product._id &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    let newItems;
    if (existingIndex >= 0) {
      // Update quantity if item exists
      newItems = items.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item
      const newItem = {
        _id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
          stock: product.stock,
        },
        quantity,
        variant,
      };
      newItems = [...items, newItem];
    }

    saveGuestCart(newItems);
    set({ items: newItems });
  },

  // Update item quantity
  updateItemQuantity: (itemId, quantity) => {
    const { items } = get();

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      const newItems = items.filter((item) => item._id !== itemId);
      saveGuestCart(newItems);
      set({ items: newItems });
      return;
    }

    const newItems = items.map((item) =>
      item._id === itemId ? { ...item, quantity } : item
    );
    saveGuestCart(newItems);
    set({ items: newItems });
  },

  // Remove item from cart
  removeItem: (itemId) => {
    const { items } = get();
    const newItems = items.filter((item) => item._id !== itemId);
    saveGuestCart(newItems);
    set({ items: newItems });
  },

  // Clear entire cart
  clearCart: () => {
    localStorage.removeItem(GUEST_CART_KEY);
    set({ items: [] });
  },

  // Get cart totals
  getCartTotals: () => {
    const { items } = get();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    return { itemCount, subtotal };
  },

  // Get items formatted for checkout
  getCheckoutItems: () => {
    const { items } = get();
    return items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      variant: item.variant,
      price: item.product.price,
    }));
  },
}));

export default useGuestCartStore;
