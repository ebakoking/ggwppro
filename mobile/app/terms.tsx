import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/theme';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Kullanım Şartları</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Son güncelleme: Mart 2026</Text>
        <Text style={styles.paragraph}>
          GGWP uygulamasını indirerek veya kullanarak bu Kullanım Şartları'nı kabul etmiş sayılırsınız.
        </Text>
        <Text style={styles.heading}>1. Hizmetin Kapsamı</Text>
        <Text style={styles.paragraph}>
          GGWP, oyuncuların eşleşmesini, sohbet etmesini ve topluluk paylaşımlarını destekleyen bir platformdur.
        </Text>
        <Text style={styles.heading}>2. Hesap ve Güvenlik</Text>
        <Text style={styles.paragraph}>
          Kayıt bilgilerinizin doğru olması ve hesabınızın güvenliğinden sizin sorumlu olmanız gerekmektedir. 13 yaşından küçüklerin kullanımı yasaktır.
        </Text>
        <Text style={styles.heading}>3. Kabul Edilebilir Kullanım</Text>
        <Text style={styles.paragraph}>
          Taciz, nefret söylemi, dolandırıcılık ve yasalara aykırı içerik yasaktır. İhlal durumunda hesap askıya alınabilir veya kapatılabilir.
        </Text>
        <Text style={styles.heading}>4. Abonelik ve Ödemeler</Text>
        <Text style={styles.paragraph}>
          Ücretli özellikler App Store / Google Play üzerinden yönetilir. İptal ve iade mağaza politikalarına tabidir.
        </Text>
        <Text style={styles.heading}>5. Değişiklikler</Text>
        <Text style={styles.paragraph}>
          Bu şartları güncelleyebiliriz. Önemli değişiklikler uygulama veya e-posta ile duyurulacaktır. Sorularınız için: destek@ggwp.app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { marginRight: Spacing.md, padding: Spacing.xs },
  title: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.text, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xxl, paddingBottom: Spacing.xxxl },
  updated: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.xl },
  heading: { fontFamily: Fonts.heading, fontSize: FontSize.md, color: Colors.primary, fontWeight: '700', marginTop: Spacing.xl, marginBottom: Spacing.sm },
  paragraph: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
});
