import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { usePOS } from '@/contexts/POSContext';
import { useState } from 'react';
import { Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function BusinessInfoScreen() {
  const { businessInfo, updateBusinessInfo } = usePOS();
  const [formData, setFormData] = useState(businessInfo);
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSaving(true);
    try {
      await updateBusinessInfo(formData);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Business Information',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              <Save size={22} color="#2563eb" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
              placeholder="Enter business name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
              placeholder="Enter business address"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) =>
                setFormData({ ...formData, phone: text })
              }
              placeholder="+1 234 567 8900"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) =>
                setFormData({ ...formData, email: text })
              }
              placeholder="info@business.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Website (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.website}
              onChangeText={(text) =>
                setFormData({ ...formData, website: text })
              }
              placeholder="www.business.com"
              placeholderTextColor="#9ca3af"
              keyboardType="url"
              autoCapitalize="none"
            />
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
              VAT, GST, or other tax identification number
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt Preview</Text>
          <View style={styles.receiptPreview}>
            <Text style={styles.previewBusinessName}>{formData.name || 'Business Name'}</Text>
            {formData.address ? (
              <Text style={styles.previewText}>{formData.address}</Text>
            ) : null}
            {formData.phone ? (
              <Text style={styles.previewText}>Tel: {formData.phone}</Text>
            ) : null}
            {formData.email ? (
              <Text style={styles.previewText}>{formData.email}</Text>
            ) : null}
            {formData.website ? (
              <Text style={styles.previewText}>{formData.website}</Text>
            ) : null}
            {formData.taxNumber ? (
              <Text style={styles.previewText}>Tax No: {formData.taxNumber}</Text>
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
    height: 90,
    paddingTop: 12,
    paddingBottom: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  receiptPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
  },
  previewBusinessName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  previewText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
});
