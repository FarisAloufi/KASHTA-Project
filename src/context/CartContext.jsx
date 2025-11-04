import React, { createContext, useContext, useState, useEffect } from 'react';


const CartContext = createContext();


export function useCart() {
  return useContext(CartContext);
}


export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);


  useEffect(() => {
    const storedCart = localStorage.getItem('kashta-cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

 
  useEffect(() => {
    localStorage.setItem('kashta-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  
  const addToCart = (item) => {
    setCartItems(prevItems => {
    
      const newItem = { ...item, cartId: Date.now() };
      return [...prevItems, newItem];
    });
    alert('!تمت إضافة الخدمة إلى السلة');
  };


  const removeFromCart = (cartId) => {
    setCartItems(prevItems => {
      return prevItems.filter(item => item.cartId !== cartId);
    });
  };

  
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}