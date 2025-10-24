import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { products as initialProducts, categories as initialCategories } from '@/mocks/products';
import { Product, CartItem, Sale, PaymentMethod, Category, TaxSettings, BusinessInfo, ReceiptSettings } from '@/types/pos';

const DEFAULT_TAX_SETTINGS: TaxSettings = {
  enabled: true,
  rate: 20,
  name: 'VAT',
  taxNumber: '',
};

const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  name: 'My Business',
  address: '',
  phone: '',
  email: '',
  website: '',
  taxNumber: '',
  logo: '',
};

const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  showLogo: true,
  header: 'Thank you for your purchase!',
  footer: 'Please visit us again',
  showTaxNumber: true,
  showWebsite: true,
  showBarcode: true,
};

const STORAGE_KEYS = {
  SALES: '@pos_sales',
  PRODUCTS: '@pos_products',
  CATEGORIES: '@pos_categories',
  TAX_SETTINGS: '@pos_tax_settings',
  BUSINESS_INFO: '@pos_business_info',
  RECEIPT_SETTINGS: '@pos_receipt_settings',
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

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return stored ? JSON.parse(stored) : initialCategories;
    },
  });

  const salesQuery = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SALES);
      return stored ? JSON.parse(stored).map((s: Sale) => ({ ...s, timestamp: new Date(s.timestamp) })) : [];
    },
  });

  const taxSettingsQuery = useQuery({
    queryKey: ['taxSettings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TAX_SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_TAX_SETTINGS;
    },
  });

  const businessInfoQuery = useQuery({
    queryKey: ['businessInfo'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BUSINESS_INFO);
      return stored ? JSON.parse(stored) : DEFAULT_BUSINESS_INFO;
    },
  });

  const receiptSettingsQuery = useQuery({
    queryKey: ['receiptSettings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECEIPT_SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_RECEIPT_SETTINGS;
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

  const updateCategoriesMutation = useMutation({
    mutationFn: async (categories: Category[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return categories;
    },
    onSuccess: () => {
      categoriesQuery.refetch();
    },
  });

  const updateTaxSettingsMutation = useMutation({
    mutationFn: async (settings: TaxSettings) => {
      await AsyncStorage.setItem(STORAGE_KEYS.TAX_SETTINGS, JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      taxSettingsQuery.refetch();
    },
  });

  const updateBusinessInfoMutation = useMutation({
    mutationFn: async (info: BusinessInfo) => {
      await AsyncStorage.setItem(STORAGE_KEYS.BUSINESS_INFO, JSON.stringify(info));
      return info;
    },
    onSuccess: () => {
      businessInfoQuery.refetch();
    },
  });

  const updateReceiptSettingsMutation = useMutation({
    mutationFn: async (settings: ReceiptSettings) => {
      await AsyncStorage.setItem(STORAGE_KEYS.RECEIPT_SETTINGS, JSON.stringify(settings));
      return settings;
    },
    onSuccess: () => {
      receiptSettingsQuery.refetch();
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

  const addCategory = useCallback(
    async (category: Omit<Category, 'id'>) => {
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
      };
      const updatedCategories = [...(categoriesQuery.data || []), newCategory];
      await updateCategoriesMutation.mutateAsync(updatedCategories);
      return newCategory;
    },
    [categoriesQuery.data, updateCategoriesMutation.mutateAsync]
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      const updatedCategories = (categoriesQuery.data || []).map((c: Category) =>
        c.id === id ? { ...c, ...updates } : c
      );
      await updateCategoriesMutation.mutateAsync(updatedCategories);
    },
    [categoriesQuery.data, updateCategoriesMutation.mutateAsync]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (id === 'all') return;
      const updatedCategories = (categoriesQuery.data || []).filter(
        (c: Category) => c.id !== id
      );
      await updateCategoriesMutation.mutateAsync(updatedCategories);
      if (selectedCategory === id) {
        setSelectedCategory('all');
      }
    },
    [categoriesQuery.data, updateCategoriesMutation.mutateAsync, selectedCategory]
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
    const taxSettings = taxSettingsQuery.data || DEFAULT_TAX_SETTINGS;
    const tax = taxSettings.enabled ? subtotal * (taxSettings.rate / 100) : 0;
    const total = subtotal + tax;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, tax, total, itemCount };
  }, [cart, taxSettingsQuery.data]);

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

  const updateTaxSettings = useCallback(
    async (settings: TaxSettings) => {
      await updateTaxSettingsMutation.mutateAsync(settings);
    },
    [updateTaxSettingsMutation.mutateAsync]
  );

  const updateBusinessInfo = useCallback(
    async (info: BusinessInfo) => {
      await updateBusinessInfoMutation.mutateAsync(info);
    },
    [updateBusinessInfoMutation.mutateAsync]
  );

  const updateReceiptSettings = useCallback(
    async (settings: ReceiptSettings) => {
      await updateReceiptSettingsMutation.mutateAsync(settings);
    },
    [updateReceiptSettingsMutation.mutateAsync]
  );

  return useMemo(
    () => ({
      cart,
      cartSummary,
      products: productsQuery.data || [],
      filteredProducts,
      categories: categoriesQuery.data || [],
      sales: salesQuery.data || [],
      todaySales,
      todayTotal,
      selectedCategory,
      taxSettings: taxSettingsQuery.data || DEFAULT_TAX_SETTINGS,
      businessInfo: businessInfoQuery.data || DEFAULT_BUSINESS_INFO,
      receiptSettings: receiptSettingsQuery.data || DEFAULT_RECEIPT_SETTINGS,
      isLoading: productsQuery.isLoading || salesQuery.isLoading || categoriesQuery.isLoading,
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
      addCategory,
      updateCategory,
      deleteCategory,
      updateTaxSettings,
      updateBusinessInfo,
      updateReceiptSettings,
    }),
    [
      cart,
      cartSummary,
      productsQuery.data,
      productsQuery.isLoading,
      filteredProducts,
      categoriesQuery.data,
      categoriesQuery.isLoading,
      salesQuery.data,
      salesQuery.isLoading,
      todaySales,
      todayTotal,
      selectedCategory,
      taxSettingsQuery.data,
      businessInfoQuery.data,
      receiptSettingsQuery.data,
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
      addCategory,
      updateCategory,
      deleteCategory,
      updateTaxSettings,
      updateBusinessInfo,
      updateReceiptSettings,
    ]
  );
});
