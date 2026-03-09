import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useDiscoverStore } from '@/stores/discoverStore';
import { useGameStore } from '@/stores/gameStore';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { useMessageStore } from '@/stores/messageStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { profileApi } from '@/services/api';
import { getDefaultAvatarUrl } from '@/components/AvatarSelectModal';
import type { Profile } from '@/types/api';

const getHiddenDemoKey = (userId: string) => `ggwp_hidden_demo_${userId}`;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SWIPE_X = 100;
const SWIPE_Y = -80;

const GENDER_TR: Record<string, string> = { MALE: 'Erkek', FEMALE: 'Kadın', OTHER: 'Diğer' };
const PLAY_STYLE_TR: Record<string, string> = {
  COMPETITIVE: 'Tryhard', CASUAL: 'Chill', TEAM_PLAYER: 'Takım Oyuncusu',
  EXPLORER: 'Kaşif', TRYHARD: 'Tryhard', CHILL: 'Chill',
};

function calcAge(dob?: string | null): number | null {
  if (!dob) return null;
  const b = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const RECENT_MS = 15 * 60 * 1000; // 15 dk = online
function onlineLabel(lastSeen?: string | null): string {
  if (!lastSeen) return 'Kısa süre önce';
  const diff = Date.now() - new Date(lastSeen).getTime();
  if (diff < RECENT_MS) return 'Online';
  if (diff < ONE_MONTH_MS) return 'Kısa süre önce';
  return 'Uzun süre önce';
}

function avatarFallback(gender?: string) {
  switch (gender) {
    case 'FEMALE': return { bg: ['#C850C0', '#FF6B9D'] as const, emoji: '👩‍💻' };
    case 'OTHER': return { bg: ['#A855F7', '#6366F1'] as const, emoji: '🧑‍💻' };
    default: return { bg: ['#00B4D8', '#0077B6'] as const, emoji: '👨‍💻' };
  }
}

const DEMO: (Profile & { userId: string })[] = [];

export default function DiscoverScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { feed, currentIndex, isLoading, lastMatch, matchedProfile, loadFeed, swipe, clearMatchFlag, advanceToNext } = useDiscoverStore();
  const { myGames, loadMyGames, catalog, loadCatalog } = useGameStore();
  const { profile, fetchProfile } = useProfileStore();

  const [hiddenDemoIds, setHiddenDemoIds] = useState<string[]>([]);

  const pentakillsLeft = profile?.pentakillsLeft ?? 0;
  const primaryGameId = myGames.length > 0 ? myGames[0].gameId : null;
  const genelGameId = catalog.find((g) => g.slug === 'genel')?.id ?? null;
  const effectiveGameId = primaryGameId || genelGameId;

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const busy = useRef(false);
  const pentaRef = useRef(pentakillsLeft);
  pentaRef.current = pentakillsLeft;
  const effectiveGameIdRef = useRef(effectiveGameId);
  effectiveGameIdRef.current = effectiveGameId;

  useEffect(() => { loadMyGames(); loadCatalog(); }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      loadFeed(effectiveGameId);
    }, [effectiveGameId]),
  );
  useEffect(() => {
    if (!userId) return;
    const mergeHidden = (stored: string[]) => {
      const fromChats = useMessageStore.getState().localChats
        .map((c) => c.userId)
        .filter((id): id is string => typeof id === 'string' && id.startsWith('demo-'));
      setHiddenDemoIds([...new Set([...stored, ...fromChats])]);
    };
    useMessageStore.getState().loadLocalChats(userId).then(() => {
      AsyncStorage.getItem(getHiddenDemoKey(userId))
        .then((raw) => {
          try {
            const ids = raw ? JSON.parse(raw) : [];
            mergeHidden(Array.isArray(ids) ? ids : []);
          } catch {
            mergeHidden([]);
          }
        })
        .catch(() => mergeHidden([]));
    });
  }, [userId]);
  useEffect(() => {
    if (lastMatch && matchedProfile) {
      const name = matchedProfile?.displayName || matchedProfile?.user?.username || 'Bir oyuncu';
      useNotificationStore.getState().add(userId, {
        type: 'match',
        title: 'Yeni eşleşme!',
        body: `${name} ile eşleştin. Sohbete başlayabilirsin.`,
      });
      router.push('/match' as any);
    }
  }, [lastMatch, matchedProfile, userId]);

  const filteredDemo = DEMO.filter((d) => !hiddenDemoIds.includes(d.userId));
  const effectiveFeed = feed.length > 0 ? feed : filteredDemo;
  const card = effectiveFeed[currentIndex];
  const isDemo = card?.userId?.startsWith?.('demo-') ?? false;

  const isPremium = profile?.isPremium ?? false;
  const dailyLikesUsed = profile?.dailyLikesUsed ?? 0;
  const DAILY_LIMIT = 30;
  const likesRemaining = isPremium ? Infinity : Math.max(0, DAILY_LIMIT - dailyLikesUsed);

  const cardRef = useRef(card);
  cardRef.current = card;

  const addHiddenDemo = useCallback((demoUserId: string) => {
    if (!userId) return;
    setHiddenDemoIds((prev) => {
      if (prev.includes(demoUserId)) return prev;
      const next = [...prev, demoUserId];
      AsyncStorage.setItem(getHiddenDemoKey(userId), JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [userId]);

  const showLimitAlertRef = useRef(() => {});

  const doAction = useCallback(async (a: 'LIKE' | 'DISLIKE' | 'PENTAKILL') => {
    const currentCard = cardRef.current;
    if (a === 'PENTAKILL') {
      try { await profileApi.usePentakill(); } catch {}
    }
    const demo = currentCard?.userId?.startsWith?.('demo-') ?? false;
    if (demo && currentCard?.userId) {
      addHiddenDemo(currentCard.userId);
      if ((a === 'LIKE' || a === 'PENTAKILL') && currentCard.userId === 'demo-1') {
        useDiscoverStore.setState({ lastMatch: true, matchedProfile: currentCard });
      }
      useDiscoverStore.setState({ currentIndex: 0 });
    } else if (effectiveGameIdRef.current) {
      try {
        await swipe(a, effectiveGameIdRef.current);
      } catch (err: any) {
        const msg = err?.message ?? '';
        if (msg.includes('limit') || msg.includes('like limit') || msg.includes('Günlük')) {
          showLimitAlertRef.current();
        } else {
          Alert.alert('Hata', msg || 'İşlem başarısız oldu.');
        }
      }
    }
    if (a === 'PENTAKILL' || a === 'LIKE') fetchProfile();
  }, [swipe, addHiddenDemo, fetchProfile]);

  const fly = useCallback((x: number, y: number, a: 'LIKE' | 'DISLIKE' | 'PENTAKILL') => {
    if (busy.current) return;
    busy.current = true;
    Animated.timing(pan, { toValue: { x, y }, duration: 300, useNativeDriver: false }).start(() => {
      doAction(a);
      pan.setValue({ x: 0, y: 0 });
      busy.current = false;
    });
  }, [pan, doAction]);

  const flyRef = useRef(fly);
  flyRef.current = fly;

  const showLimitAlert = useCallback(() => {
    Alert.alert('Günlük Limit', 'Günlük 30 like hakkınız doldu!\nDislike sınırsızdır. Premium ile sınırsız like keşfedin.', [
      { text: 'Premium Al', onPress: () => router.push('/premium' as any) },
      { text: 'Tamam' },
    ]);
  }, [router]);
  showLimitAlertRef.current = showLimitAlert;
  const like = () => {
    if (!isPremium && likesRemaining <= 0) { showLimitAlert(); return; }
    flyRef.current(500, 0, 'LIKE');
  };
  const dislike = () => {
    flyRef.current(-500, 0, 'DISLIKE');
  };
  const pentakill = () => {
    if (pentakillsLeft <= 0) { router.push('/store' as any); return; }
    flyRef.current(0, -600, 'PENTAKILL');
  };

  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !busy.current,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, g) => !busy.current && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
      onMoveShouldSetPanResponderCapture: (_, g) => !busy.current && (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_X) flyRef.current(500, g.dy, 'LIKE');
        else if (g.dx < -SWIPE_X) flyRef.current(-500, g.dy, 'DISLIKE');
        else if (g.dy < SWIPE_Y && pentaRef.current > 0) flyRef.current(g.dx, -600, 'PENTAKILL');
        else {
          if (g.dy < SWIPE_Y && pentaRef.current <= 0) router.push('/store' as any);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 5 }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-20deg', '0deg', '20deg'], extrapolate: 'clamp' });
  const likeOp = pan.x.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOp = pan.x.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const pentaOp = pan.y.interpolate({ inputRange: [-80, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  if (!card) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <Header isPremium={isPremium} />
        <View style={s.emptyWrap}>
          {isLoading ? <ActivityIndicator size="large" color={Colors.primary} /> : (
            <>
              <Text style={s.emptyText}>Yeni oyuncu bulunamadı.</Text>
              <TouchableOpacity style={s.refreshBtn} onPress={() => loadFeed(primaryGameId)}>
                <Text style={s.refreshText}>Yenile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const avatarUri = getDefaultAvatarUrl(card);
  const fb = avatarFallback(card.gender);
  const age = calcAge(card.dateOfBirth ?? undefined);
  const gender = card.gender ? GENDER_TR[card.gender] || card.gender : '';
  const style = card.playStyle ? PLAY_STYLE_TR[card.playStyle] || card.playStyle : '';
  const micLabel = card.usesMic ? 'Mik: Açık' : 'Mik: Kapalı';
  const isTryhard = card.playStyle === 'COMPETITIVE' || card.playStyle === 'TRYHARD';
  const games = card.user?.userGames?.slice(0, 3) ?? [];

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <Header isPremium={isPremium} />

      {/* --- CARD --- */}
      <View style={s.cardArea}>
        <Animated.View
          {...pr.panHandlers}
          style={[s.cardOuter, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }]}
        >
          <View style={s.card}>
            {/* Image */}
            <View style={s.imageWrap}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.image} resizeMode="cover" />
              ) : (
                <LinearGradient colors={[...fb.bg]} style={StyleSheet.absoluteFill}>
                  <Text style={s.emoji}>{fb.emoji}</Text>
                </LinearGradient>
              )}

              {/* Gradient overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(10,22,40,0.70)', '#0a1628']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
              />

              {/* Swipe labels */}
              <Animated.View style={[s.sLabel, s.sLabelR, { opacity: likeOp }]}>
                <Text style={[s.sLabelTxt, { color: '#4ade80' }]}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[s.sLabel, s.sLabelL, { opacity: nopeOp }]}>
                <Text style={[s.sLabelTxt, { color: '#f87171' }]}>NOPE</Text>
              </Animated.View>
              <Animated.View style={[s.sLabel, s.sLabelT, { opacity: pentaOp }]}>
                <Text style={[s.sLabelTxt, { color: '#facc15' }]}>PENTAKILL</Text>
              </Animated.View>

              {/* Online badge */}
              <View style={s.onlineBadge}>
                <View style={[s.onlineDot, (card as any).lastSeen && Date.now() - new Date((card as any).lastSeen).getTime() < RECENT_MS && s.onlineDotActive]} />
                <Text style={s.onlineTxt}>{onlineLabel((card as any).lastSeen)}</Text>
              </View>

              {/* Match score - her avatar renginde okunaklı */}
              <View style={s.matchBadge}>
                <Text style={s.matchTxt}>%{card.compatibilityScore ?? '?'} UYUM</Text>
              </View>

              {/* Bottom info */}
              <View style={s.info}>
                {/* Name + Age */}
                <View style={s.nameRow}>
                  <Text style={s.name}>{card.displayName || (card as any).user?.username || 'Oyuncu'}</Text>
                  {age != null && <Text style={s.age}>{age}</Text>}
                </View>

                {/* Gender • PlayStyle • Mic */}
                <Text style={s.attrs}>
                  {[gender, style, micLabel].filter(Boolean).join(' • ')}
                </Text>

                {/* Bio */}
                {card.bio ? <Text style={s.bio} numberOfLines={2}>{card.bio}</Text> : null}

                {/* Game chips */}
                {games.length > 0 && (
                  <View style={s.chips}>
                    {games.map((ug: any) => (
                      <View key={ug.id} style={s.gameChip}>
                        <Text style={s.gameChipTxt}>{ug.game?.name}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Attribute chips */}
                <View style={s.chips}>
                  {isTryhard && (
                    <View style={s.attrChip}>
                      <Ionicons name="flash" size={11} color="#facc15" />
                      <Text style={s.attrChipTxt}>Tryhard</Text>
                    </View>
                  )}
                  {card.usesMic && (
                    <View style={s.attrChip}>
                      <Ionicons name="mic" size={11} color="#4ade80" />
                      <Text style={s.attrChipTxt}>Mic On</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* --- ACTIONS --- */}
      <View style={s.actions}>
        {/* Dislike */}
        <TouchableOpacity style={s.btnSide} onPress={dislike} activeOpacity={0.8}>
          <Ionicons name="close" size={30} color="#f87171" />
        </TouchableOpacity>

        {/* Pentakill */}
        <View style={s.pentaWrap}>
          <View style={s.pentaBtnContainer}>
            <TouchableOpacity style={s.btnPenta} onPress={pentakill} activeOpacity={0.85}>
              <LinearGradient
                colors={['#facc15', '#f59e0b', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.pentaGrad}
              >
                <Ionicons name="star" size={38} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={s.pentaBadge}>
              <Text style={s.pentaBadgeTxt}>x{pentakillsLeft}</Text>
            </View>
          </View>
          <Text style={s.pentaLabel}>PENTAKILL</Text>
        </View>

        {/* Like */}
        <TouchableOpacity style={s.btnSide} onPress={like} activeOpacity={0.8}>
          <Ionicons name="heart-outline" size={30} color="#22d3ee" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Header({ isPremium }: { isPremium: boolean }) {
  const router = useRouter();
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <Text style={s.headerTitle}>KEŞFET</Text>
      </View>
      <TouchableOpacity activeOpacity={0.85} style={s.premiumWrap} onPress={() => router.push(isPremium ? '/filters' as any : '/premium' as any)}>
        <LinearGradient
          colors={isPremium ? ['#22d3ee', '#06b6d4'] : ['#facc15', '#eab308', '#ca8a04']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.premiumGrad}
        >
          <Ionicons name={isPremium ? 'options-outline' : 'star'} size={11} color={isPremium ? '#fff' : '#000'} />
          <Text style={[s.premiumTxt, isPremium && { color: '#fff' }]}>{isPremium ? 'FİLTRELE' : 'PREMIUM'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const CARD_H = Math.min(SCREEN_H * 0.58, 520);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: Fonts.heading, fontSize: 18, fontWeight: '800', color: '#22d3ee', fontStyle: 'italic' },
  premiumWrap: { borderRadius: 999, overflow: 'hidden' },
  premiumGrad: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  premiumTxt: { fontSize: 10, fontWeight: '800', color: '#000' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary },
  refreshBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.surface, borderRadius: 999 },
  refreshText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.primary },

  cardArea: { flex: 1, paddingHorizontal: 16, paddingTop: 4, justifyContent: 'flex-start', alignItems: 'center' },

  cardOuter: { width: '100%', maxWidth: 420 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 8,
  },
  imageWrap: { height: CARD_H, position: 'relative' },
  image: { width: '100%', height: '100%' },
  emoji: { fontSize: 80, textAlign: 'center', marginTop: '30%' },

  sLabel: { position: 'absolute', zIndex: 10, borderWidth: 3, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  sLabelR: { top: 50, left: 20, borderColor: '#4ade80', transform: [{ rotate: '-15deg' }] },
  sLabelL: { top: 50, right: 20, borderColor: '#f87171', transform: [{ rotate: '15deg' }] },
  sLabelT: { top: 50, alignSelf: 'center', left: '25%', borderColor: '#facc15' },
  sLabelTxt: { fontFamily: Fonts.heading, fontSize: 26, fontWeight: '900', letterSpacing: 2 },

  onlineBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 999,
    borderWidth: 0.5, borderColor: 'rgba(74,222,128,0.5)',
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#94a3b8' },
  onlineDotActive: { backgroundColor: '#4ade80' },
  onlineTxt: { fontSize: 10, fontWeight: '700', color: '#e2e8f0' },

  matchBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(34,211,238,0.9)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 4,
    elevation: 4,
  },
  matchTxt: {
    fontSize: 11, fontWeight: '800', color: '#67e8f9',
    textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4,
  },

  info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 20 },

  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  name: { fontFamily: Fonts.heading, fontSize: 30, fontWeight: '800', color: '#fff' },
  age: { fontFamily: Fonts.body, fontSize: 20, color: '#d1d5db' },

  attrs: { fontFamily: Fonts.body, fontSize: 12, color: '#d1d5db', marginBottom: 8, lineHeight: 16 },
  bio: { fontFamily: Fonts.body, fontSize: 12, color: '#e5e7eb', marginBottom: 10, lineHeight: 17 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  gameChip: {
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(34,211,238,0.2)',
    borderRadius: 999, borderWidth: 0.5, borderColor: '#22d3ee',
  },
  gameChipTxt: { fontFamily: Fonts.bodySemiBold, fontSize: 10, fontWeight: '700', color: '#67e8f9' },

  attrChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  attrChipTxt: { fontFamily: Fonts.bodySemiBold, fontSize: 10, fontWeight: '700', color: '#d1d5db' },

  actions: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 24, paddingTop: 56, paddingBottom: 8,
  },

  btnSide: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  pentaWrap: { alignItems: 'center' },
  pentaBtnContainer: {
    width: 88, height: 88,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPenta: {
    width: 80, height: 80, borderRadius: 40, overflow: 'hidden',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 30,
    elevation: 12,
  },
  pentaGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  pentaBadge: {
    position: 'absolute', top: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#0a1628',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#ef4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10,
    elevation: 15,
  },
  pentaBadgeTxt: { fontSize: 12, fontWeight: '900', color: '#fff' },
  pentaLabel: { fontFamily: Fonts.heading, fontSize: 9, fontWeight: '700', color: '#facc15', letterSpacing: 1.5, marginTop: 2 },

  actionLabel: { textAlign: 'center', paddingBottom: 4 },
});
