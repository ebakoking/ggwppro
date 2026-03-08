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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIAP, getReceiptIOS, ErrorCode } from 'expo-iap';
import { Colors, Fonts } from '@/constants/theme';
import { profileApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';
import { IAP_PREMIUM_SKUS } from '@/constants/iap';

interface Plan {
  id: string;
  title: string;
  price: string;
  duration: string;
  badge?: string;
  features: string[];
  isPopular?: boolean;
}

const PLAN_TO_SKU: Record<string, string> = {
  weekly: 'com.ggwp.app.premium.weekly',
  monthly: 'com.ggwp.app.premium.monthly',
};

const PLANS: Plan[] = [
  {
    id: 'weekly',
    title: 'HAFTALIK\nPREMIUM',
    price: '₺199.99',
    duration: '/hafta',
    features: ['Sınırsız keşfet', 'Profil görünürlüğü artışı'],
  },
  {
    id: 'monthly',
    title: 'AYLIK PREMIUM',
    price: '₺399.99',
    duration: '/ay',
    badge: 'EN POPÜLER',
    features: ['Seni kimlerin beğendiğini gör', 'Gelişmiş filtreleme', 'Profil dopingi'],
    isPopular: true,
  },
];

const FEATURES = [
  {
    icon: 'eye-outline' as const,
    title: 'Seni Kimlerin Beğendiğini Gör',
    desc: 'Beklemeden eşlemeye başla.',
  },
  {
    icon: 'filter-outline' as const,
    title: 'Gelişmiş Filtreleme',
    desc: 'Aradığın oyuncuyu daha hızlı bul.',
  },
  {
    icon: 'flash-outline' as const,
    title: 'Profil Dopingi',
    desc: 'Eşleşmelerde öne çık!',
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const { fetchProfile } = useProfileStore();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;

  const {
    connected,
    subscriptions,
    fetchProducts,
    requestPurchase,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        if (Platform.OS !== 'ios') {
          Alert.alert('Bilgi', 'Şu an sadece iOS destekleniyor.');
          setLoading(false);
          return;
        }
        const receipt = await getReceiptIOS();
        if (!receipt) {
          Alert.alert('Hata', 'Makbuz alınamadı.');
          setLoading(false);
          return;
        }
        await profileApi.iapComplete('ios', purchase.productId, receipt);
        await fetchProfile();
        await finishTransaction({ purchase, isConsumable: false });
        setLoading(false);
        const plan = PLANS.find(p => PLAN_TO_SKU[p.id] === purchase.productId);
        Alert.alert(
          'Premium Aktif!',
          `${plan?.title.replace('\n', ' ') ?? 'Premium'} planınız başarıyla aktif edildi.`,
          [{ text: 'Harika!', onPress: () => router.back() }],
        );
      } catch (e: any) {
        setLoading(false);
        Alert.alert('Hata', e?.message || 'İşlem başarısız.');
      }
    },
    onPurchaseError: (error) => {
      if (error.code !== ErrorCode.UserCancelled) {
        Alert.alert('Satın alma hatası', error.message || 'İşlem iptal edildi.');
      }
      setLoading(false);
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: [...IAP_PREMIUM_SKUS], type: 'subs' }).catch(() => {});
    }
  }, [connected]);

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

  const getPlanPrice = (planId: string) => {
    const sku = PLAN_TO_SKU[planId];
    const sub = subscriptions?.find((s: { id: string }) => s.id === sku);
    const displayPrice = (sub as { displayPrice?: string; currencyCode?: string })?.displayPrice;
    const currencyCode = (sub as { currencyCode?: string })?.currencyCode;
    if (displayPrice && currencyCode === 'TRY') return displayPrice;
    return PLANS.find(p => p.id === planId)?.price ?? '';
  };

  const handleSubscribe = async () => {
    const productId = PLAN_TO_SKU[selectedPlan];
    if (!productId) return;
    setLoading(true);
    try {
      if (Platform.OS === 'ios') {
        await requestPurchase({
          request: { apple: { sku: productId }, google: { skus: [productId] } },
          type: 'subs',
        });
      } else {
        const sub = subscriptions?.find((s: { id: string }) => s.id === productId);
        const offers = (sub as any)?.subscriptionOfferDetailsAndroid;
        if (offers?.length) {
          await requestPurchase({
            request: {
              google: {
                skus: [productId],
                subscriptionOffers: [{ sku: productId, offerToken: offers[0].offerToken }],
              },
            },
            type: 'subs',
          });
        } else {
          await requestPurchase({
            request: { apple: { sku: productId }, google: { skus: [productId] } },
            type: 'subs',
          });
        }
      }
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Satın alma başlatılamadı.');
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

          {/* Shield Icon */}
          <View style={s.headerSection}>
            <View style={s.iconWrap}>
              <Animated.View style={[s.outerGlow, { transform: [{ scale: pulseAnim }] }]} />
              <View style={s.midGlow} />
              <LinearGradient
                colors={['#22d3ee', '#06b6d4', '#0891b2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.iconCircle}
              >
                <View style={s.iconShine} />
                <Ionicons name="shield-checkmark" size={40} color="#fff" style={{ zIndex: 2 }} />
              </LinearGradient>
              <Animated.View style={[s.sparkle, s.sparkle1, { opacity: sparkle1 }]} />
              <Animated.View style={[s.sparkle, s.sparkle2, { opacity: sparkle2 }]} />
            </View>

            <Text style={s.title}>OYUNUN KURALLARINI{'\n'}SEN BELİRLE</Text>
            <Text style={s.subtitle}>Premium ile daha hızlı eşleş, daha fazla oyuncu keşfet.</Text>
          </View>

          {/* Plans Side by Side */}
          <View style={s.plansRow}>
            {PLANS.map((plan) => {
              const selected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    s.planCard,
                    plan.isPopular && s.planPopular,
                    selected && s.planSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <LinearGradient
                      colors={['#facc15', '#f59e0b']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={s.planBadge}
                    >
                      <Text style={s.planBadgeTxt}>{plan.badge}</Text>
                    </LinearGradient>
                  )}

                  <Text style={s.planTitle}>{plan.title}</Text>

                  <Text style={s.planPrice}>{getPlanPrice(plan.id)}</Text>
                  <Text style={s.planDuration}>{plan.duration}</Text>

                  <View style={s.planFeatures}>
                    {plan.features.map((f, i) => (
                      <View key={i} style={s.planFeatureRow}>
                        <View style={s.planDot} />
                        <Text style={s.planFeatureTxt}>{f}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[s.planBtn, selected && s.planBtnActive]}>
                    <Text style={[s.planBtnTxt, selected && s.planBtnTxtActive]}>
                      {selected ? 'SEÇİLDİ' : 'SEÇ'}
                    </Text>
                  </View>

                  {plan.isPopular && <View style={s.planGlowOverlay} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Features List */}
          <View style={s.featuresList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <View style={s.featureIconWrap}>
                  <Ionicons name={f.icon} size={24} color="#22d3ee" />
                </View>
                <View style={s.featureTextWrap}>
                  <Text style={s.featureTitle}>{f.title}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity activeOpacity={0.85} onPress={handleSubscribe} disabled={loading}>
            <LinearGradient
              colors={['#facc15', '#f59e0b', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.ctaBtn}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={s.ctaBtnTxt}>PREMIUM ABONELİĞİ BAŞLAT</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={s.footer}>
            Ödeme App Store veya Google Play üzerinden güvenli şekilde yapılır. Abonelik otomatik yenilenir ve istediğin zaman iptal edebilirsin.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 16, paddingVertical: 32 },
  card: {
    backgroundColor: '#0f1c2e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: {
    position: 'absolute', top: 20, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },

  headerSection: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  iconWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  outerGlow: {
    position: 'absolute', width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(34,211,238,0.15)',
  },
  midGlow: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(34,211,238,0.2)',
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(34,211,238,0.5)',
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 40, elevation: 20, overflow: 'hidden',
  },
  iconShine: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', height: '50%',
  },
  sparkle: { position: 'absolute', borderRadius: 99, backgroundColor: '#22d3ee' },
  sparkle1: { top: 0, right: 8, width: 8, height: 8 },
  sparkle2: { bottom: 8, left: 0, width: 6, height: 6 },

  title: {
    fontFamily: Fonts.heading, fontSize: 24, fontWeight: '800',
    color: '#fff', textAlign: 'center', lineHeight: 30, marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingHorizontal: 16 },

  plansRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  planCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)', overflow: 'visible',
  },
  planPopular: {
    borderWidth: 1.5, borderColor: 'rgba(234,179,8,0.6)',
    backgroundColor: 'rgba(234,179,8,0.05)',
    shadowColor: '#eab308', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35, shadowRadius: 35, elevation: 10,
  },
  planSelected: { borderColor: 'rgba(34,211,238,0.5)', borderWidth: 2 },
  planBadge: {
    position: 'absolute', top: -10, alignSelf: 'center', left: '15%', right: '15%',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99,
    alignItems: 'center',
    shadowColor: '#eab308', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 15, elevation: 8, zIndex: 5,
  },
  planBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#000' },
  planTitle: {
    fontSize: 10, fontWeight: '700', color: '#9ca3af',
    textAlign: 'center', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  planPrice: { fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 2 },
  planDuration: { fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 12 },
  planFeatures: { gap: 6, marginBottom: 12 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  planDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#22d3ee', marginTop: 5 },
  planFeatureTxt: { fontSize: 10, color: '#d1d5db', lineHeight: 14, flex: 1 },
  planBtn: {
    width: '100%', paddingVertical: 8, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  planBtnActive: {
    backgroundColor: '#22d3ee', borderWidth: 0,
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 15, elevation: 6,
  },
  planBtnTxt: { fontSize: 11, fontWeight: '800', color: '#9ca3af' },
  planBtnTxtActive: { color: '#000' },
  planGlowOverlay: {
    ...StyleSheet.absoluteFillObject, borderRadius: 16,
    backgroundColor: 'rgba(234,179,8,0.04)', pointerEvents: 'none',
  },

  featuresList: { gap: 16, marginBottom: 28 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  featureIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(34,211,238,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureTextWrap: { flex: 1, paddingTop: 4 },
  featureTitle: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: '#9ca3af', lineHeight: 18 },

  ctaBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#eab308', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 30, elevation: 12, marginBottom: 20,
  },
  ctaBtnTxt: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 1 },

  footer: {
    textAlign: 'center', fontSize: 12, color: '#6b7280',
    lineHeight: 18, paddingHorizontal: 8,
  },
});
