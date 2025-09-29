import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

const showToastWarning = (message) => {
  // Assuming toast is available globally or import it
  if (typeof window !== 'undefined' && window.toast) {
    window.toast.warn(message);
  } else {
    console.warn(message); // Fallback for server-side
  }
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const payload = action.payload;
      const existingItem = state.items.find(item => item.id === payload.id);
      let addQuantity = payload.quantity || 1;

      if (payload.availableQuantity !== undefined) {
        if (existingItem) {
          const newTotalQty = existingItem.quantity + addQuantity;
          if (newTotalQty > payload.availableQuantity) {
            addQuantity = payload.availableQuantity - existingItem.quantity;
            if (addQuantity <= 0) {
              showToastWarning(`Cannot add more ${payload.itemName}. Stock limit reached.`);
              return state;
            }
            showToastWarning(`Added maximum available quantity for ${payload.itemName}.`);
          }
        } else {
          if (addQuantity > payload.availableQuantity) {
            addQuantity = payload.availableQuantity;
            showToastWarning(`Added maximum available quantity for ${payload.itemName}.`);
          }
        }
      }

      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = state.items.map(item =>
          item.id === payload.id
            ? { ...item, quantity: existingItem.quantity + addQuantity }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      } else {
        // Add new item
        const newItems = [...state.items, { ...payload, quantity: addQuantity }];
        return {
          ...state,
          items: newItems,
          total: calculateTotal(newItems)
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity: requestedQuantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (!item) return state;

      let newQuantity = requestedQuantity;
      if (item.availableQuantity !== undefined && newQuantity > item.availableQuantity) {
        newQuantity = item.availableQuantity;
        showToastWarning(`Cannot exceed available stock (${item.availableQuantity}) for ${item.itemName}. Quantity set to maximum.`);
      }

      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        const updatedItems = state.items.filter(item => item.id !== id);
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        };
      }

      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        items: [],
        total: 0
      };

    case CART_ACTIONS.LOAD_CART:
      // Ensure loaded items have availableQuantity if present
      const loadedItems = action.payload.items.map(item => ({
        ...item,
        availableQuantity: item.availableQuantity || undefined // Preserve if exists
      }));
      return {
        ...action.payload,
        items: loadedItems
      };

    default:
      return state;
  }
};

// Helper function to calculate total
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.ratePerItem * item.quantity), 0);
};

// Initial State
const initialState = {
  items: [],
  total: 0
};

// Create Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('inventory_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('inventory_cart', JSON.stringify(state));
  }, [state]);

  // Cart Actions
  const addItem = (item) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item });
  };

  const removeItem = (itemId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (itemId) => {
    const item = state.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const isInCart = (itemId) => {
    return state.items.some(item => item.id === itemId);
  };

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
