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
      const storage = await AsyncStorage.getItem('@GoMarket:Cart');
      if (storage) {
        setProducts(JSON.parse(storage));
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productList = [...products];
      const index = productList.findIndex(el => el.id === product.id);

      if (index >= 0) {
        productList[index].quantity += 1;
        setProducts([...products]);
      } else {
        setProducts([...productList, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(productList));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productList = [...products];
      const index = productList.findIndex(el => el.id === id);

      if (index !== -1) {
        productList[index].quantity += 1;
        setProducts([...productList]);
      }

      await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(productList));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productList = [...products];
      const index = productList.findIndex(el => el.id === id);

      if (index !== -1 && productList[index].quantity > 1) {
        productList[index].quantity -= 1;
        setProducts([...productList]);
      } else {
        setProducts(productList.splice(index, 1));
      }

      await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(productList));
    },
    [products],
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
