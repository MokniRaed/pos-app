import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { usePOS } from '@/contexts/POSContext';
import { CreditCard, Banknote, Smartphone, Trash } from 'lucide-react-native';
import { PaymentMethod } from '@/types/pos';
import * as Haptics from 'expo-haptics';

const paymentMethods: {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: typeof CreditCard;
}[] = [

  {
    id: 'card',
    name: 'Card Payment',
    description: 'Credit or debit card',
    icon: CreditCard,
  },
  {
    id: 'cash',
    name: 'Cash',
    description: 'Cash payment',
    icon: Banknote,
  },
  {
    id: 'mobile',
    name: 'Mobile Payment',
    description: 'Apple Pay, Google Pay',
    icon: Smartphone,
  },
];

export default function CheckoutScreen() {
  const { cart, cartSummary, completeSale, isProcessingSale, removeFromCart, updateQuantity } = usePOS();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  const handlePayment = async () => {
    if (!selectedPayment) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const sale = await completeSale(selectedPayment);
    
    if (sale) {
      router.replace({ pathname: '/receipt', params: { saleId: sale.id } } as any);
    }
  };

  if (cart.length === 0) {
    router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={() => {
                Alert.alert(
                  'Clear Cart',
                  'Are you sure you want to clear all items?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => {
                        if (Platform.OS !== 'web') {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                        router.back();
                      },
                    },
                  ]
                );
              }}
              disabled={isProcessingSale}
            >
              <Trash size={18} color="#ef4444" />
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.orderSummary}>
            {cart.map((item) => (
              <View key={item.product.id} style={styles.orderItem}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.product.name}</Text>
                  <View style={styles.itemFooter}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          updateQuantity(item.product.id, item.quantity - 1);
                        }}
                        disabled={isProcessingSale}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.itemQuantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                          updateQuantity(item.product.id, item.quantity + 1);
                        }}
                        disabled={isProcessingSale}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemTotal}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                    removeFromCart(item.product.id);
                  }}
                  disabled={isProcessingSale}
                >
                  <Trash size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedPayment === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    isSelected && styles.paymentMethodSelected,
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    setSelectedPayment(method.id);
                  }}
                  disabled={isProcessingSale}
                >
                  <View
                    style={[
                      styles.paymentIcon,
                      isSelected && styles.paymentIconSelected,
                    ]}
                  >
                    <Icon
                      size={28}
                      color={isSelected ? '#fff' : '#2563eb'}
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    <Text style={styles.paymentDescription}>
                      {method.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <View style={styles.selectedDot} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.totalBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal</Text>
              <Text style={styles.breakdownValue}>
                ${cartSummary.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tax (20%)</Text>
              <Text style={styles.breakdownValue}>
                ${cartSummary.tax.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${cartSummary.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isProcessingSale}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedPayment || isProcessingSale) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedPayment || isProcessingSale}
        >
          {isProcessingSale ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              Complete Payment
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ef4444',
  },
  orderSummary: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600' as const,
    paddingHorizontal: 16,
    minWidth: 40,
    textAlign: 'center' as const,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2563eb',
  },
  removeItemButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
    gap: 16,
  },
  paymentMethodSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  paymentIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconSelected: {
    backgroundColor: '#2563eb',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  totalBreakdown: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  breakdownTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginTop: 4,
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  payButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  payButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
