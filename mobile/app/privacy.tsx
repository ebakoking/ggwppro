import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Gizlilik Politikası</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Son güncelleme: Mart 2026</Text>
        <Text style={styles.paragraph}>
          GGWP olarak gizliliğinize saygı duyuyoruz. Bu politika, hangi verileri topladığımızı ve nasıl kullandığımızı açıklar.
        </Text>
        <Text style={styles.heading}>1. Toplanan Veriler</Text>
        <Text style={styles.paragraph}>
          Hesap oluştururken e-posta, kullanıcı adı ve şifre; profil bilgileriniz (takma ad, doğum tarihi, cinsiyet, oyun tercihleri, fotoğraf); sohbet ve eşleşme verileri; cihaz bilgisi ve kullanım istatistikleri toplanabilir.
        </Text>
        <Text style={styles.heading}>2. Verilerin Kullanımı</Text>
        <Text style={styles.paragraph}>
          Verileriniz hizmeti sunmak, eşleştirme ve keşfet algoritmalarını iyileştirmek, güvenlik sağlamak ve yasal yükümlülüklere uymak için kullanılır.
        </Text>
        <Text style={styles.heading}>3. Veri Paylaşımı</Text>
        <Text style={styles.paragraph}>
          Profil bilgileriniz (takma ad, avatar, oyun tarzı vb.) diğer kullanıcılara gösterilir. Üçüncü taraflarla yalnızca hizmet sağlayıcılar (sunucu, analitik) ve yasal zorunluluklar çerçevesinde paylaşım yapılır.
        </Text>
        <Text style={styles.heading}>4. Saklama ve Güvenlik</Text>
        <Text style={styles.paragraph}>
          Verileriniz şifreli iletişim ve güvenli sunucularda tutulur. Hesabınızı sildiğinizde kişisel verileriniz silinir veya anonimleştirilir.
        </Text>
        <Text style={styles.heading}>5. Haklarınız</Text>
        <Text style={styles.paragraph}>
          Verilerinize erişim, düzeltme ve silme talebinde bulunabilirsiniz. Talepleriniz için: gizlilik@ggwp.app
        </Text>
        <Text style={styles.paragraph}>
          Bu politika zaman zaman güncellenebilir. Güncel metin uygulama içinden erişilebilir.
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
