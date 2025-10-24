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

export default function ReceiptSettingsScreen() {
  const { receiptSettings, updateReceiptSettings, businessInfo } = usePOS();
  const [formData, setFormData] = useState(receiptSettings);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSaving(true);
    try {
      await updateReceiptSettings(formData);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Receipt Customization',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Save size={22} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Options</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Show Logo</Text>
              <Text style={styles.switchDescription}>
                Display business logo on receipt
              </Text>
            </View>
            <Switch
              value={formData.showLogo}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFormData({ ...formData, showLogo: value });
              }}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={formData.showLogo ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Show Tax Number</Text>
              <Text style={styles.switchDescription}>
                Include tax registration number
              </Text>
            </View>
            <Switch
              value={formData.showTaxNumber}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFormData({ ...formData, showTaxNumber: value });
              }}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={formData.showTaxNumber ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Show Website</Text>
              <Text style={styles.switchDescription}>
                Include website on receipt
              </Text>
            </View>
            <Switch
              value={formData.showWebsite}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFormData({ ...formData, showWebsite: value });
              }}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={formData.showWebsite ? '#2563eb' : '#f3f4f6'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Show Barcode</Text>
              <Text style={styles.switchDescription}>
                Display receipt barcode/QR code
              </Text>
            </View>
            <Switch
              value={formData.showBarcode}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setFormData({ ...formData, showBarcode: value });
              }}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={formData.showBarcode ? '#2563eb' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Messages</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Header Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.header}
              onChangeText={(text) =>
                setFormData({ ...formData, header: text })
              }
              placeholder="Thank you for your purchase!"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Message displayed at the top of receipt
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Footer Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.footer}
              onChangeText={(text) =>
                setFormData({ ...formData, footer: text })
              }
              placeholder="Please visit us again"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              Message displayed at the bottom of receipt
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt Preview</Text>
          <View style={styles.receiptPreview}>
            <Text style={styles.previewBusinessName}>{businessInfo.name}</Text>
            {formData.header ? (
              <Text style={styles.previewHeader}>{formData.header}</Text>
            ) : null}
            <View style={styles.previewDivider} />
            <Text style={styles.previewLabel}>Receipt #: RCP12345678</Text>
            <Text style={styles.previewLabel}>Date: {new Date().toLocaleDateString()}</Text>
            <View style={styles.previewDivider} />
            {formData.showTaxNumber && businessInfo.taxNumber ? (
              <Text style={styles.previewLabel}>Tax No: {businessInfo.taxNumber}</Text>
            ) : null}
            {formData.showWebsite && businessInfo.website ? (
              <Text style={styles.previewLabel}>{businessInfo.website}</Text>
            ) : null}
            {formData.showBarcode ? (
              <View style={styles.barcodePreview}>
                <Text style={styles.previewLabel}>Barcode</Text>
              </View>
            ) : null}
            {formData.footer ? (
              <>
                <View style={styles.previewDivider} />
                <Text style={styles.previewFooter}>{formData.footer}</Text>
              </>
            ) : null}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    marginBottom: 20,
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
  textArea: {
    height: 70,
    paddingTop: 12,
    paddingBottom: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  receiptPreview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  previewBusinessName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  previewHeader: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },
  previewLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  previewFooter: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  barcodePreview: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
});
