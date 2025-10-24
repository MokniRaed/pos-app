import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { usePOS } from '@/contexts/POSContext';
import { 
  TrendingUp, 
  Receipt, 
  DollarSign, 
  Calendar,
  ChevronRight
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SalesScreen() {
  const { sales, todaySales, todayTotal } = usePOS();

  const totalSales = sales.reduce((sum: number, sale: typeof sales[0]) => sum + sale.total, 0);
  const totalTransactions = sales.length;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Card';
      case 'cash':
        return 'Cash';
      case 'mobile':
        return 'Mobile';
      default:
        return method;
    }
  };

  const handleViewReceipt = (saleId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/receipt', params: { saleId } } as any);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Sales History',
          headerLargeTitle: false,
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <DollarSign size={24} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Today's Sales</Text>
            <Text style={styles.statValue}>${todayTotal.toFixed(2)}</Text>
            <Text style={styles.statSubtext}>{todaySales.length} transactions</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={24} color="#2563eb" />
            </View>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Text style={styles.statValue}>${totalSales.toFixed(2)}</Text>
            <Text style={styles.statSubtext}>{totalTransactions} transactions</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Receipt size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>Avg Transaction</Text>
            <Text style={styles.statValue}>
              ${totalTransactions > 0 ? (totalSales / totalTransactions).toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.statSubtext}>per sale</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Calendar size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>${totalSales.toFixed(2)}</Text>
            <Text style={styles.statSubtext}>7 days</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {sales.length === 0 ? (
            <View style={styles.emptyState}>
              <Receipt size={64} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Sales will appear here once you complete your first transaction
              </Text>
            </View>
          ) : (
            <View style={styles.transactions}>
              {sales.map((sale: typeof sales[0]) => (
                <TouchableOpacity
                  key={sale.id}
                  style={styles.transaction}
                  onPress={() => handleViewReceipt(sale.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      <Receipt size={20} color="#2563eb" />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionNumber}>
                        {sale.receiptNumber}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(sale.timestamp)}
                      </Text>
                      <View style={styles.transactionMeta}>
                        <Text style={styles.transactionMetaText}>
                          {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.transactionMetaDot}>•</Text>
                        <Text style={styles.transactionMetaText}>
                          {getPaymentMethodLabel(sale.paymentMethod)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
                      ${sale.total.toFixed(2)}
                    </Text>
                    <ChevronRight size={20} color="#9ca3af" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 4,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#9ca3af',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 8,
    textAlign: 'center' as const,
    paddingHorizontal: 20,
  },
  transactions: {
    gap: 12,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionNumber: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionMetaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionMetaDot: {
    fontSize: 12,
    color: '#d1d5db',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#10b981',
  },
});
