import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
} from 'react-native';
import { Stack } from 'expo-router';
import { usePOS } from '@/contexts/POSContext';
import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Download,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useState, useMemo } from 'react';

export default function BusinessScreen() {
  const { sales, products } = usePOS();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const filteredSales = sales.filter((sale: typeof sales[0]) => {
      const saleDate = new Date(sale.timestamp);
      switch (selectedPeriod) {
        case 'today':
          return saleDate >= today;
        case 'week':
          return saleDate >= weekAgo;
        case 'month':
          return saleDate >= monthAgo;
        default:
          return true;
      }
    });

    const totalRevenue = filteredSales.reduce((sum: number, sale: typeof sales[0]) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalItemsSold = filteredSales.reduce((sum: number, sale: typeof sales[0]) => 
      sum + sale.items.reduce((itemSum: number, item: typeof sale.items[0]) => itemSum + item.quantity, 0), 0
    );

    const lowStock = products.filter((p: typeof products[0]) => p.stock < 10).length;
    const totalInventoryValue = products.reduce((sum: number, p: typeof products[0]) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    type TopProduct = { name: string; quantity: number; revenue: number };
    const productMap: Record<string, TopProduct> = {};
    
    filteredSales.forEach((sale: typeof sales[0]) => {
      sale.items.forEach((item: typeof sale.items[0]) => {
        if (!productMap[item.product.id]) {
          productMap[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productMap[item.product.id].quantity += item.quantity;
        productMap[item.product.id].revenue += item.product.price * item.quantity;
      });
    });
    
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalTransactions,
      avgTransaction,
      totalItemsSold,
      lowStock,
      totalInventoryValue,
      topProducts,
    };
  }, [sales, products, selectedPeriod]);

  const handleExportReport = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const reportText = `Business Report - ${selectedPeriod.toUpperCase()}
    
Revenue: $${stats.totalRevenue.toFixed(2)}
Transactions: ${stats.totalTransactions}
Average Transaction: $${stats.avgTransaction.toFixed(2)}
Items Sold: ${stats.totalItemsSold}
Inventory Value: $${stats.totalInventoryValue.toFixed(2)}
Low Stock Items: ${stats.lowStock}

Top Products:
${stats.topProducts.map((p, i) => `${i + 1}. ${p.name} - $${p.revenue.toFixed(2)} (${p.quantity} sold)`).join('\n')}
`;

    try {
      await Share.share({
        message: reportText,
        title: 'Business Report',
      });
    } catch (error) {
      console.log('Error sharing report:', error);
    }
  };

  const periodOptions = [
    { id: 'today' as const, label: 'Today' },
    { id: 'week' as const, label: 'Week' },
    { id: 'month' as const, label: 'Month' },
    { id: 'all' as const, label: 'All Time' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Business Management',
          headerLargeTitle: false,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSelector}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.periodButton,
                selectedPeriod === option.id && styles.periodButtonActive,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedPeriod(option.id);
              }}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === option.id && styles.periodButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                <DollarSign size={24} color="#10b981" />
              </View>
              <Text style={styles.statLabel}>Revenue</Text>
              <Text style={styles.statValue}>${stats.totalRevenue.toFixed(2)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                <FileText size={24} color="#2563eb" />
              </View>
              <Text style={styles.statLabel}>Transactions</Text>
              <Text style={styles.statValue}>{stats.totalTransactions}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
                <TrendingUp size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statLabel}>Avg Transaction</Text>
              <Text style={styles.statValue}>${stats.avgTransaction.toFixed(2)}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e0e7ff' }]}>
                <Users size={24} color="#6366f1" />
              </View>
              <Text style={styles.statLabel}>Items Sold</Text>
              <Text style={styles.statValue}>{stats.totalItemsSold}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Overview</Text>
          <View style={styles.inventoryCards}>
            <View style={styles.inventoryCard}>
              <Package size={28} color="#2563eb" />
              <View style={styles.inventoryCardInfo}>
                <Text style={styles.inventoryCardLabel}>Total Products</Text>
                <Text style={styles.inventoryCardValue}>{products.length}</Text>
              </View>
            </View>

            <View style={styles.inventoryCard}>
              <DollarSign size={28} color="#10b981" />
              <View style={styles.inventoryCardInfo}>
                <Text style={styles.inventoryCardLabel}>Inventory Value</Text>
                <Text style={styles.inventoryCardValue}>
                  ${stats.totalInventoryValue.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.inventoryCard}>
              <TrendingUp size={28} color="#ef4444" />
              <View style={styles.inventoryCardInfo}>
                <Text style={styles.inventoryCardLabel}>Low Stock Items</Text>
                <Text style={[styles.inventoryCardValue, { color: '#ef4444' }]}>
                  {stats.lowStock}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          {stats.topProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No sales data yet</Text>
            </View>
          ) : (
            <View style={styles.topProducts}>
              {stats.topProducts.map((product: { name: string; quantity: number; revenue: number }, index: number) => (
                <View key={index} style={styles.topProductCard}>
                  <View style={styles.topProductRank}>
                    <Text style={styles.topProductRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topProductInfo}>
                    <Text style={styles.topProductName}>{product.name}</Text>
                    <Text style={styles.topProductQuantity}>
                      {product.quantity} sold
                    </Text>
                  </View>
                  <Text style={styles.topProductRevenue}>
                    ${product.revenue.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reports & Export</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleExportReport}
          >
            <View style={styles.actionCardIcon}>
              <Download size={24} color="#2563eb" />
            </View>
            <View style={styles.actionCardInfo}>
              <Text style={styles.actionCardTitle}>Export Report</Text>
              <Text style={styles.actionCardDescription}>
                Share sales and inventory data
              </Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCards}>
            <TouchableOpacity style={styles.settingCard}>
              <SettingsIcon size={20} color="#6b7280" />
              <Text style={styles.settingCardText}>Business Information</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingCard}>
              <Calendar size={20} color="#6b7280" />
              <Text style={styles.settingCardText}>Tax Settings</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingCard}>
              <FileText size={20} color="#6b7280" />
              <Text style={styles.settingCardText}>Receipt Customization</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
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
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2563eb',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  inventoryCards: {
    gap: 12,
  },
  inventoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 16,
  },
  inventoryCardInfo: {
    flex: 1,
  },
  inventoryCardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  inventoryCardValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  topProducts: {
    gap: 12,
  },
  topProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 12,
  },
  topProductRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topProductRankText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 2,
  },
  topProductQuantity: {
    fontSize: 13,
    color: '#6b7280',
  },
  topProductRevenue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#10b981',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 16,
  },
  actionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardInfo: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  actionCardDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  settingsCards: {
    gap: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 12,
  },
  settingCardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#1f2937',
  },
});
