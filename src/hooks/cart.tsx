import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarket:cart');

      cart && setProducts(JSON.parse(cart));
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      console.log(products[productIndex]);

      const updatedCart = [...products];

      const updatedProduct = {
        ...updatedCart[productIndex],
        quantity: updatedCart[productIndex].quantity + 1,
      };

      updatedCart[productIndex] = updatedProduct;

      setProducts(updatedCart);
    },
    [products],
  );

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  }, []);

  const addToCart = useCallback(
    async product => {
      const existingProduct = products.find(
        productInCart => productInCart.id === product.id,
      );

      if (!existingProduct) {
        const updatedCart = [...products, { ...product, quantity: 1 }];

        setProducts(updatedCart);

        await AsyncStorage.setItem(
          '@GoMarket:cart',
          JSON.stringify(updatedCart),
        );
      } else {
        increment(product.id);
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
