import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  Modal,
  Alert,
  useWindowDimensions
} from 'react-native';
import { Stack } from 'expo-router';
import { useState, useRef } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { categories } from '@/mocks/products';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  Search,
  Camera,
  X
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function POSScreen() {
  const {
    filteredProducts,
    cart,
    cartSummary,
    selectedCategory,
    addToCart,
    updateQuantity,
    removeFromCart,
    setSelectedCategory,
  } = usePOS();

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayProducts = searchQuery
    ? filteredProducts.filter((p: typeof filteredProducts[0]) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  const handleAddToCart = (product: typeof filteredProducts[0]) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    addToCart(product);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (item) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      updateQuantity(productId, item.quantity + delta);
    }
  };

  const handleRemove = (productId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      router.push('/checkout' as any);
    }
  };

  const handleOpenScanner = async () => {
    if (!permission) {
      await requestPermission();
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to scan barcodes'
        );
        return;
      }
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsScanning(true);
    setShowScanner(true);
  };

  const handleBarcodeScanned = (data: string) => {
    if (!isScanning) return;

    setIsScanning(false);

    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    const product = filteredProducts.find(
      (p: typeof filteredProducts[0]) => p.barcode === data
    );

    if (product) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      addToCart(product);
      setShowScanner(false);
      scanTimeoutRef.current = setTimeout(() => {
        setIsScanning(true);
      }, 1000);
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Product Not Found', `No product found with barcode: ${data}`);
      scanTimeoutRef.current = setTimeout(() => {
        setIsScanning(true);
      }, 2000);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      <View style={[styles.leftPanel, !isLargeScreen && styles.leftPanelMobile]}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleOpenScanner}
          >
            <Camera size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryBar}
          contentContainerStyle={styles.categoryBarContent}
        >
          {categories.map((cat) => {
            const iconModule = require('lucide-react-native') as Record<string, any>;
            const Icon = iconModule[cat.icon];
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedCategory(cat.id);
                }}
              >
                <Icon 
                  size={20} 
                  color={selectedCategory === cat.id ? '#fff' : '#333'} 
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView 
          style={styles.productGrid}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productGridContent}>
            {displayProducts.map((product: typeof filteredProducts[0]) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleAddToCart(product)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ${product.price.toFixed(2)}
                  </Text>
                  <Text style={styles.productStock}>
                    Stock: {product.stock}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {isLargeScreen && <View style={styles.rightPanel}>
        <View style={styles.cartHeader}>
          <ShoppingCart size={24} color="#333" />
          <Text style={styles.cartTitle}>Current Order</Text>
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartSummary.itemCount}</Text>
            </View>
          )}
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <ShoppingCart size={64} color="#ddd" />
            <Text style={styles.emptyCartText}>Cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>
              Add items to get started
            </Text>
          </View>
        ) : (
          <>
            <ScrollView 
              style={styles.cartItems}
              showsVerticalScrollIndicator={false}
            >
              {cart.map((item) => (
                <View key={item.product.id} style={styles.cartItem}>
                  <Image
                    source={{ uri: item.product.image }}
                    style={styles.cartItemImage}
                  />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      ${item.product.price.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.product.id, -1)}
                    >
                      <Minus size={16} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.product.id, 1)}
                    >
                      <Plus size={16} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(item.product.id)}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${cartSummary.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (20%)</Text>
                <Text style={styles.summaryValue}>
                  ${cartSummary.tax.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${cartSummary.total.toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Payment
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>}

      {!isLargeScreen && cart.length > 0 && (
        <View style={styles.mobileCartFooter}>
          <View style={styles.mobileCartSummary}>
            <View>
              <Text style={styles.mobileCartLabel}>Total</Text>
              <Text style={styles.mobileCartValue}>
                ${cartSummary.total.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.mobileCheckoutButton}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <ShoppingCart size={20} color="#fff" />
              <Text style={styles.mobileCheckoutText}>
                Checkout ({cartSummary.itemCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>

    <Modal
      visible={showScanner}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setShowScanner(false)}
    >
      <View style={styles.scannerContainer}>
        <View style={styles.scannerHeader}>
          <Text style={styles.scannerTitle}>Scan Barcode</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowScanner(false);
              setIsScanning(true);
            }}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={({ data }: { data: string }) => {
            if (isScanning) {
              handleBarcodeScanned(data);
            }
          }}
          barcodeScannerSettings={{
            barcodeTypes: [
              'qr',
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code39',
              'code93',
              'code128',
            ],
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.scannerText}>
              {isScanning
                ? 'Position barcode within frame'
                : 'Processing...'}
            </Text>
          </View>
        </CameraView>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  leftPanel: {
    flex: 2,
    backgroundColor: '#fff',
  },
  leftPanelMobile: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  categoryBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  categoryBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    gap: 6,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productGrid: {
    flex: 1,
  },
  productGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  productCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2563eb',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#6b7280',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e5e5',
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    gap: 10,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
    flex: 1,
  },
  cartBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#9ca3af',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  cartItems: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    paddingHorizontal: 12,
    minWidth: 32,
    textAlign: 'center' as const,
  },
  removeButton: {
    padding: 8,
  },
  cartSummary: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  summaryTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#2563eb',
  },
  checkoutButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#2563eb',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scannerText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginTop: 32,
    textAlign: 'center' as const,
  },
  mobileCartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingBottom: 20,
  },
  mobileCartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  mobileCartLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  mobileCartValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  mobileCheckoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  mobileCheckoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
