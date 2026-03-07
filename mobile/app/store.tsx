import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '@/constants/theme';
import { profileApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';

interface PurchaseCard {
  id: string;
  title: string;
  amount: string;
  count: number;
  price: string;
  badge?: string;
  isPopular?: boolean;
}

const PACKAGES: PurchaseCard[] = [
  { id: 'single', title: 'Tekli Pentakill', amount: '1 Adet', count: 1, price: '₺29.90' },
  { id: 'pack', title: 'Takim Savasi', amount: '5 Adet', count: 5, price: '₺119.90', badge: 'POPÜLER', isPopular: true },
  { id: 'series', title: 'Pentakill Serisi', amount: '20 Adet', count: 20, price: '₺399.90', badge: 'EN İYİ FİYAT' },
];

export default function PentakillStore() {
  const router = useRouter();
  const { profile, fetchProfile } = useProfileStore();
  const [selectedId, setSelectedId] = useState('pack');
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(sparkle1, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(sparkle2, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(sparkle2, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const pentakillsLeft = profile?.pentakillsLeft ?? 0;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const result = await profileApi.purchasePentakill(selectedId);
      await fetchProfile();
      const pkg = PACKAGES.find(p => p.id === selectedId);
      Alert.alert(
        'Satın Alma Başarılı!',
        `${pkg?.count ?? result.added} Pentakill eklendi.\nMevcut: ${result.pentakillsLeft}`,
        [{ text: 'Tamam', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Satın alma başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          {/* Close */}
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>

          {/* Crown */}
          <View style={s.crownSection}>
            <View style={s.crownWrap}>
              <Animated.View style={[s.outerGlow, { transform: [{ scale: pulseAnim }] }]} />
              <View style={s.midGlow} />
              <LinearGradient
                colors={['#facc15', '#f59e0b', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.crownCircle}
              >
                <View style={s.crownShine} />
                <Ionicons name="trophy" size={40} color="#fff" style={{ zIndex: 2 }} />
              </LinearGradient>
              <Animated.View style={[s.sparkle, s.sparkle1, { opacity: sparkle1 }]} />
              <Animated.View style={[s.sparkle, s.sparkle2, { opacity: sparkle2 }]} />
            </View>

            <Text style={s.title}>PENTAKILL AL</Text>
            <Text style={s.subtitle}>
              Mevcut Pentakill: <Text style={s.countBold}>{pentakillsLeft}</Text>
            </Text>
          </View>

          {/* Info */}
          <View style={s.infoSection}>
            <Text style={s.infoHeading}>
              Direkt Dikkat Çek,{'\n'}Sohbeti Başlat.
            </Text>
            <Text style={s.infoBody}>
              Pentakill gönderdiğin kullanıcı seni eşleşmeler bölümünde görür. Karşı taraf seni beğenirse sohbet anında başlar.
            </Text>
          </View>

          {/* Packages */}
          <View style={s.packages}>
            {PACKAGES.map((pkg) => {
              const selected = selectedId === pkg.id;
              return (
                <TouchableOpacity
                  key={pkg.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedId(pkg.id)}
                  style={[
                    s.pkgCard,
                    pkg.isPopular && s.pkgPopular,
                    selected && s.pkgSelected,
                  ]}
                >
                  {pkg.badge && (
                    <LinearGradient
                      colors={['#facc15', '#f59e0b']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.badge}
                    >
                      <Text style={s.badgeTxt}>{pkg.badge}</Text>
                    </LinearGradient>
                  )}
                  <View style={s.pkgRow}>
                    <View>
                      <Text style={s.pkgTitle}>{pkg.title}</Text>
                      <Text style={s.pkgAmount}>{pkg.amount}</Text>
                    </View>
                    <Text style={s.pkgPrice}>{pkg.price}</Text>
                  </View>
                  {pkg.isPopular && <View style={s.pkgGlowOverlay} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Purchase Button */}
          <TouchableOpacity activeOpacity={0.85} onPress={handlePurchase} disabled={loading}>
            <LinearGradient
              colors={['#facc15', '#f59e0b', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.buyBtn}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={s.buyBtnTxt}>PENTAKILL SATIN AL</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={s.footer}>
            Ödeme işlemi App Store veya Google Play üzerinden güvenli şekilde gerçekleştirilir.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#0f1c2e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  crownSection: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  crownWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  outerGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(250,204,21,0.15)',
  },
  midGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(250,204,21,0.2)',
  },
  crownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(253,224,71,0.5)',
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
    overflow: 'hidden',
  },
  crownShine: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    height: '50%',
  },
  sparkle: { position: 'absolute', borderRadius: 99, backgroundColor: '#fde047' },
  sparkle1: { top: 0, right: 8, width: 8, height: 8 },
  sparkle2: { bottom: 8, left: 0, width: 6, height: 6 },

  title: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    fontWeight: '800',
    color: '#facc15',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  subtitle: { fontSize: 14, color: '#9ca3af' },
  countBold: { color: '#fff', fontWeight: '700' },

  infoSection: { alignItems: 'center', marginBottom: 28, paddingHorizontal: 8 },
  infoHeading: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  infoBody: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 22,
  },

  packages: { gap: 16, marginBottom: 28 },
  pkgCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'visible',
  },
  pkgPopular: {
    borderWidth: 1.5,
    borderColor: 'rgba(234,179,8,0.6)',
    backgroundColor: 'rgba(234,179,8,0.05)',
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 10,
  },
  pkgSelected: {
    borderColor: '#facc15',
    borderWidth: 2,
  },
  pkgRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pkgTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  pkgAmount: { fontSize: 14, fontWeight: '700', color: '#facc15' },
  pkgPrice: { fontSize: 24, fontWeight: '800', color: '#fff' },
  pkgGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(234,179,8,0.04)',
    pointerEvents: 'none',
  },

  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 5,
  },
  badgeTxt: { fontSize: 10, fontWeight: '800', color: '#000' },

  buyBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
    marginBottom: 16,
  },
  buyBtnTxt: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 1 },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
