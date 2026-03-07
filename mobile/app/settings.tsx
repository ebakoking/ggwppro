import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Ayarlar</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/terms')}>
          <Ionicons name="document-text-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.rowText}>Kullanım Şartları</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/privacy')}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.rowText}>Gizlilik Politikası</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UYGULAMA</Text>
          <Text style={styles.version}>GGWP v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: Spacing.md, padding: Spacing.xs },
  title: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.text, fontWeight: '700' },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.md, color: Colors.text, marginLeft: Spacing.md, flex: 1 },
  section: { marginTop: Spacing.xxl },
  sectionTitle: { fontFamily: Fonts.heading, fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1, marginBottom: Spacing.sm },
  version: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textMuted },
});
