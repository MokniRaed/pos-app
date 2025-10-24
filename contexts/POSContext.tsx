import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { products as initialProducts } from '@/mocks/products';
import { Product, CartItem, Sale, PaymentMethod } from '@/types/pos';

const TAX_RATE = 0.20;
const STORAGE_KEYS = {
  SALES: '@pos_sales',
  PRODUCTS: '@pos_products',
};

export const [POSProvider, usePOS] = createContextHook(() => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return stored ? JSON.parse(stored) : initialProducts;
    },
  });

  const salesQuery = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SALES);
      return stored ? JSON.parse(stored).map((s: Sale) => ({ ...s, timestamp: new Date(s.timestamp) })) : [];
    },
  });

  const saveSaleMutation = useMutation({
    mutationFn: async (sale: Sale) => {
      const currentSales = salesQuery.data || [];
      const updatedSales = [sale, ...currentSales];
      await AsyncStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updatedSales));
      return updatedSales;
    },
    onSuccess: () => {
      salesQuery.refetch();
    },
  });

  const updateProductsMutation = useMutation({
    mutationFn: async (products: Product[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return products;
    },
    onSuccess: () => {
      productsQuery.refetch();
    },
  });

  const addProduct = useCallback(
    async (product: Omit<Product, 'id'>) => {
      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
      };
      const updatedProducts = [...(productsQuery.data || []), newProduct];
      await updateProductsMutation.mutateAsync(updatedProducts);
      return newProduct;
    },
    [productsQuery.data, updateProductsMutation.mutateAsync]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      const updatedProducts = (productsQuery.data || []).map((p: Product) =>
        p.id === id ? { ...p, ...updates } : p
      );
      await updateProductsMutation.mutateAsync(updatedProducts);
    },
    [productsQuery.data, updateProductsMutation.mutateAsync]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const updatedProducts = (productsQuery.data || []).filter(
        (p: Product) => p.id !== id
      );
      await updateProductsMutation.mutateAsync(updatedProducts);
    },
    [productsQuery.data, updateProductsMutation.mutateAsync]
  );

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, tax, total, itemCount };
  }, [cart]);

  const completeSale = useCallback(
    async (paymentMethod: PaymentMethod) => {
      if (cart.length === 0) return null;

      const { subtotal, tax, total } = cartSummary;
      const receiptNumber = `RCP${Date.now().toString().slice(-8)}`;

      const sale: Sale = {
        id: Date.now().toString(),
        items: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
        timestamp: new Date(),
        receiptNumber,
      };

      const updatedProducts = (productsQuery.data || []).map((p: Product) => {
        const cartItem = cart.find((item) => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      });

      await updateProductsMutation.mutateAsync(updatedProducts);
      await saveSaleMutation.mutateAsync(sale);
      clearCart();

      return sale;
    },
    [cart, cartSummary, productsQuery.data, updateProductsMutation.mutateAsync, saveSaleMutation.mutateAsync, clearCart]
  );

  const filteredProducts = useMemo(() => {
    const prods = productsQuery.data || [];
    if (selectedCategory === 'all') return prods;
    return prods.filter((p: Product) => p.category === selectedCategory);
  }, [productsQuery.data, selectedCategory]);

  const todaySales = useMemo(() => {
    const sales = salesQuery.data || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.timestamp);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
  }, [salesQuery.data]);

  const todayTotal = useMemo(() => {
    return todaySales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
  }, [todaySales]);

  return useMemo(
    () => ({
      cart,
      cartSummary,
      products: productsQuery.data || [],
      filteredProducts,
      sales: salesQuery.data || [],
      todaySales,
      todayTotal,
      selectedCategory,
      isLoading: productsQuery.isLoading || salesQuery.isLoading,
      isProcessingSale: saveSaleMutation.isPending,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      completeSale,
      setSelectedCategory,
      addProduct,
      updateProduct,
      deleteProduct,
    }),
    [
      cart,
      cartSummary,
      productsQuery.data,
      productsQuery.isLoading,
      filteredProducts,
      salesQuery.data,
      salesQuery.isLoading,
      todaySales,
      todayTotal,
      selectedCategory,
      saveSaleMutation.isPending,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      completeSale,
      setSelectedCategory,
      addProduct,
      updateProduct,
      deleteProduct,
    ]
  );
});
