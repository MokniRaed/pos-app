import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { usePOS } from '@/contexts/POSContext';
import { useState } from 'react';
import { Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function TaxSettingsScreen() {
  const { taxSettings, updateTaxSettings } = usePOS();
  const [formData, setFormData] = useState(taxSettings);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSaving(true);
    try {
      await updateTaxSettings(formData);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tax Settings',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Save size={22} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Enable Tax</Text>
              <Text style={styles.switchDescription}>
                Apply tax to all transactions
              </Text>
            </View>
            <Switch
              value={formData.enabled}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFormData({ ...formData, enabled: value });
              }}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={formData.enabled ? '#2563eb' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
              placeholder="e.g., VAT, Sales Tax"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.helperText}>
              Display name for tax on receipts
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={formData.rate.toString()}
              onChangeText={(text) => {
                const num = parseFloat(text) || 0;
                setFormData({ ...formData, rate: num });
              }}
              keyboardType="decimal-pad"
              placeholder="20"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.helperText}>
              Tax percentage applied to subtotal
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tax Number (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.taxNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, taxNumber: text })
              }
              placeholder="Enter tax registration number"
              placeholderTextColor="#9ca3af"
            />
            <Text style={styles.helperText}>
              Your business tax identification number
            </Text>
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Subtotal</Text>
              <Text style={styles.previewValue}>$100.00</Text>
            </View>
            {formData.enabled && (
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>
                  {formData.name || 'Tax'} ({formData.rate}%)
                </Text>
                <Text style={styles.previewValue}>
                  ${(100 * (formData.rate / 100)).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.previewRow, styles.previewTotal]}>
              <Text style={styles.previewTotalLabel}>Total</Text>
              <Text style={styles.previewTotalValue}>
                $
                {formData.enabled
                  ? (100 + 100 * (formData.rate / 100)).toFixed(2)
                  : '100.00'}
              </Text>
            </View>
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
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  previewSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 20,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  previewLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  previewValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500' as const,
  },
  previewTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginTop: 8,
    paddingTop: 12,
  },
  previewTotalLabel: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#1f2937',
  },
  previewTotalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10b981',
  },
});
