import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Fonts, FontSize } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;

const AVATAR_NEON =
  'https://images.unsplash.com/photo-1597938430467-c7a5f65c24f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';
const AVATAR_LUNA =
  'https://images.unsplash.com/photo-1628501899963-43bb8e2423e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';

export default function WelcomeScreen() {
  const router = useRouter();
  const goAuth = () => router.push('/auth/login');

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const wobble1 = useRef(new Animated.Value(0)).current;
  const wobble2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(float1, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ]),
    );
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(float2, { toValue: 1, duration: 2800, useNativeDriver: true }),
        Animated.timing(float2, { toValue: 0, duration: 2800, useNativeDriver: true }),
      ]),
    );
    anim1.start();
    anim2.start();
    return () => { anim1.stop(); anim2.stop(); };
  }, [float1, float2]);

  const runWobble = useCallback((wobbleAnim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(wobbleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: -0.7, duration: 100, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: 0.4, duration: 90, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: -0.2, duration: 80, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  }, []);

  const translateY1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const translateY2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const rotateZ1 = wobble1.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-2deg', '0deg', '2deg'] });
  const translateX1 = wobble1.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });
  const rotateZ2 = wobble2.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-2deg', '0deg', '2deg'] });
  const translateX2 = wobble2.interpolate({ inputRange: [-1, 0, 1], outputRange: [-6, 0, 6] });

  return (
    <View style={styles.container}>
      {/* Logo - text-5xl font-bold tracking-wider mb-8 */}
      <View style={styles.header}>
        <Text style={styles.logo}>GGWP</Text>
      </View>

      {/* Headline - 4 lines, Saniyeler İçinde = cyan-400 */}
      <View style={styles.headlineWrap}>
        <Text style={styles.headlineLine}>Yeni Gamer</Text>
        <Text style={styles.headlineLine}>Arkadaşlarını</Text>
        <Text style={[styles.headlineLine, styles.headlineAccent]}>Saniyeler İçinde</Text>
        <Text style={styles.headlineLine}>Bul</Text>
      </View>

      {/* Subtitle - gray-400, 3 lines */}
      <View style={styles.subHeadlineWrap}>
        <Text style={styles.subHeadline}>Sevdiğin oyunları seç.</Text>
        <Text style={styles.subHeadline}>Yeni arkadaşlar keşfet.</Text>
        <Text style={styles.subHeadline}>Sohbet et, birlikte oyna.</Text>
      </View>

      {/* User cards */}
      <View style={styles.cardsWrap}>
        <TouchableWithoutFeedback onPress={() => runWobble(wobble1)}>
          <Animated.View style={[styles.card, styles.cardFirst, { transform: [{ translateY: translateY1 }, { translateX: translateX1 }, { rotate: rotateZ1 }] }]}>
            <View style={styles.cardInner}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: AVATAR_NEON }} style={styles.avatarImg} />
                <View style={styles.onlineBadge} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>NeonStriker</Text>
                <View style={styles.tagRow}>
                  <View style={[styles.tag, styles.tagValorant]}><Text style={styles.tagValorantText}>VALORANT</Text></View>
                  <View style={styles.tag}><Text style={styles.tagText}>LoL</Text></View>
                  <View style={styles.tag}><Text style={styles.tagText}>CS2</Text></View>
                </View>
                <View style={[styles.tagRow, { marginTop: 8 }]}>
                  <View style={styles.tagMic}><Text style={styles.tagMicText}>🎤 Mic On</Text></View>
                  <View style={styles.tagCompetitive}><Text style={styles.tagCompetitiveText}>Competitive</Text></View>
                </View>
              </View>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => runWobble(wobble2)}>
          <Animated.View style={[styles.card, styles.cardSecond, { transform: [{ translateY: translateY2 }, { translateX: translateX2 }, { rotate: rotateZ2 }] }]}>
            <View style={styles.cardInner}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: AVATAR_LUNA }} style={styles.avatarImg} />
                <View style={styles.onlineBadgeRight} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardName}>Luna_Vibe</Text>
                  <Text style={styles.onlineLabel}>ONLINE</Text>
                </View>
                <Text style={styles.cardDesc}>Ready for ranked matches!</Text>
                <View style={styles.tagRow}>
                  <View style={styles.tagMic}><Text style={styles.tagMicText}>🎤 Mic On</Text></View>
                  <View style={styles.tagCasual}><Text style={styles.tagCasualText}>Casual</Text></View>
                </View>
              </View>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>

      {/* CTA - gradient cyan-400 to purple-600, shadow cyan glow */}
      <TouchableOpacity style={styles.ctaWrap} onPress={goAuth} activeOpacity={0.9}>
        <LinearGradient
          colors={['#22d3ee', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.ctaText}>Hemen Başla</Text>
      </TouchableOpacity>

      {/* Footer - gray-500 text-xs */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Devam ederek{' '}
          <Text style={styles.footerLink} onPress={() => router.push('/terms')}>Kullanım Şartları</Text>
          {' '}ve{' '}
          <Text style={styles.footerLink} onPress={() => router.push('/privacy')}>Gizlilik Politikası</Text>
          'nı kabul etmiş sayılırsın.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
    paddingHorizontal: 32,
    paddingTop: 56,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontFamily: Fonts.heading,
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  headlineWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headlineLine: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headlineAccent: {
    color: '#22d3ee',
  },
  subHeadlineWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subHeadline: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: '#9ca3af',
    lineHeight: 20,
  },
  cardsWrap: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  card: {
    width: width - 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardFirst: {
    marginBottom: CARD_GAP,
    zIndex: 2,
  },
  cardSecond: {
    zIndex: 1,
  },
  cardInner: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 16,
    width: 96,
    height: 96,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#0a1628',
  },
  onlineBadgeRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#0a1628',
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  onlineLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#22c55e',
  },
  cardDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: '#9ca3af',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#374151',
  },
  tagValorant: {
    backgroundColor: '#22d3ee',
  },
  tagValorantText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#000000',
  },
  tagText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
  tagMic: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(22,163,74,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.3)',
  },
  tagMicText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#4ade80',
  },
  tagCompetitive: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(234,88,12,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(234,88,12,0.3)',
  },
  tagCompetitiveText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#fb923c',
  },
  tagCasual: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(147,51,234,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
  },
  tagCasualText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#c084fc',
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 12,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#22d3ee',
    textDecorationLine: 'underline',
    fontFamily: Fonts.bodySemiBold,
  },
});
