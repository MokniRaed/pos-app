import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { usePOS } from '@/contexts/POSContext';
import { Check, Share2, Mail, MessageSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function ReceiptScreen() {
  const { saleId } = useLocalSearchParams<{ saleId: string }>();
  const { sales } = usePOS();

  const sale = sales.find((s: typeof sales[0]) => s.id === saleId);

  if (!sale) {
    router.replace('/(tabs)' as any);
    return null;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Card Payment';
      case 'cash':
        return 'Cash';
      case 'mobile':
        return 'Mobile Payment';
      default:
        return method;
    }
  };

  const generateReceiptText = () => {
    let text = '━━━━━━━━━━━━━━━━━━━━━━\n';
    text += '       RECEIPT\n';
    text += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
    text += `Receipt #: ${sale.receiptNumber}\n`;
    text += `Date: ${formatDate(sale.timestamp)}\n`;
    text += `Payment: ${getPaymentMethodLabel(sale.paymentMethod)}\n\n`;
    text += '━━━━━━━━━━━━━━━━━━━━━━\n';
    text += 'ITEMS\n';
    text += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    sale.items.forEach((item: typeof sale.items[0]) => {
      text += `${item.product.name}\n`;
      text += `  ${item.quantity} x $${item.product.price.toFixed(2)} = $${(
        item.quantity * item.product.price
      ).toFixed(2)}\n\n`;
    });

    text += '━━━━━━━━━━━━━━━━━━━━━━\n';
    text += `Subtotal:    $${sale.subtotal.toFixed(2)}\n`;
    text += `Tax (20%):   $${sale.tax.toFixed(2)}\n`;
    text += `TOTAL:       $${sale.total.toFixed(2)}\n`;
    text += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
    text += 'Thank you for your business!\n';

    return text;
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            text: generateReceiptText(),
            title: `Receipt ${sale.receiptNumber}`,
          });
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = generateReceiptText();
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            Alert.alert('Copied!', 'Receipt copied to clipboard');
          } catch {
            Alert.alert('Error', 'Failed to copy receipt');
          }
          textArea.remove();
        }
      } else {
        await Share.share({
          message: generateReceiptText(),
          title: `Receipt ${sale.receiptNumber}`,
        });
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error sharing receipt:', error);
        Alert.alert('Error', 'Failed to share receipt');
      }
    }
  };

  const handleDone = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.successHeader}>
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmarkCircle}>
              <Check size={48} color="#fff" strokeWidth={3} />
            </View>
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Transaction completed successfully
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.receipt}>
            <Text style={styles.receiptTitle}>RECEIPT</Text>
            <View style={styles.divider} />

            <View style={styles.receiptInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Receipt Number</Text>
                <Text style={styles.infoValue}>{sale.receiptNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{formatDate(sale.timestamp)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Method</Text>
                <Text style={styles.infoValue}>
                  {getPaymentMethodLabel(sale.paymentMethod)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.itemsTitle}>Items</Text>
            <View style={styles.items}>
              {sale.items.map((item: typeof sale.items[0], index: number) => (
                <View key={index} style={styles.item}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemTotal}>
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.itemDetails}>
                    {item.quantity} x ${item.product.price.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>${sale.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax (20%)</Text>
                <Text style={styles.totalValue}>${sale.tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.grandTotalLabel}>TOTAL</Text>
                <Text style={styles.grandTotalValue}>
                  ${sale.total.toFixed(2)}
                </Text>
              </View>
            </View>

            <Text style={styles.thankYou}>Thank you for your business!</Text>
          </View>

          <View style={styles.shareSection}>
            <Text style={styles.shareSectionTitle}>Send Receipt</Text>
            <View style={styles.shareButtons}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Share2 size={24} color="#2563eb" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Mail size={24} color="#2563eb" />
                <Text style={styles.shareButtonText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <MessageSquare size={24} color="#2563eb" />
                <Text style={styles.shareButtonText}>SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  successHeader: {
    backgroundColor: '#10b981',
    padding: 32,
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
  },
  receipt: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 12,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 16,
  },
  receiptInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1f2937',
    textAlign: 'right' as const,
    flex: 1,
    marginLeft: 16,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 12,
  },
  items: {
    gap: 12,
  },
  item: {
    gap: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    flex: 1,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginLeft: 16,
  },
  itemDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  totals: {
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
  },
  grandTotal: {
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: '#1f2937',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#10b981',
  },
  thankYou: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center' as const,
    marginTop: 16,
    fontStyle: 'italic' as const,
  },
  shareSection: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  shareSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 16,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#2563eb',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  doneButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
