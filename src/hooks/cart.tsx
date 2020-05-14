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
  addToCart(item: Omit<Product, 'quantity'>): void;
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

  useEffect(() => {
    async function updateStoredProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }

    updateStoredProducts();
  }, [products]);

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

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

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      let updatedCart = [...products];

      if (products[productIndex].quantity === 1) {
        updatedCart = products.filter(product => product.id !== id);
      } else {
        const updatedProduct = {
          ...updatedCart[productIndex],
          quantity: updatedCart[productIndex].quantity - 1,
        };

        updatedCart[productIndex] = updatedProduct;
      }

      setProducts(updatedCart);
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const existingProduct = products.find(
        productInCart => productInCart.id === product.id,
      );

      if (!existingProduct) {
        const updatedCart = [...products, { ...product, quantity: 1 }];

        setProducts(updatedCart);
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
