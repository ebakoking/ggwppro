import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '@/constants/theme';
import { useDiscoverStore } from '@/stores/discoverStore';
import { useProfileStore } from '@/stores/profileStore';
import { getDefaultAvatarUrl } from '@/components/AvatarSelectModal';

const SCREEN_W = Dimensions.get('window').width;
const AVATAR_SIZE = Math.min(SCREEN_W * 0.3, 128);

const PLAY_STYLE_LABELS: Record<string, string> = {
  TRYHARD: 'Tryhard',
  COMPETITIVE: 'Competitive',
  CHILL: 'Chill',
  CASUAL: 'Casual',
  TEAM_PLAYER: 'Takım Oyuncusu',
  EXPLORER: 'Kaşif',
};

export default function MatchScreen() {
  const router = useRouter();
  const { matchedProfile, clearMatchFlag } = useDiscoverStore();
  const { profile: myProfile } = useProfileStore();

  const pulse = useRef(new Animated.Value(1)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;
  const lightningPulse = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();

    const pingAnim = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      );
    pingAnim(sparkle1, 0).start();
    pingAnim(sparkle2, 500).start();
    pingAnim(sparkle3, 200).start();
    pingAnim(sparkle4, 700).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(lightningPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(lightningPulse, { toValue: 0.8, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const myAvatar = getDefaultAvatarUrl(myProfile ?? null);
  const otherAvatar = matchedProfile ? getDefaultAvatarUrl(matchedProfile) : '';
  const myName = myProfile?.displayName || myProfile?.user?.username || 'Sen';
  const otherName = matchedProfile?.displayName || matchedProfile?.user?.username || 'Oyuncu';
  const score = matchedProfile?.compatibilityScore ?? 95;
  const playStyle = matchedProfile?.playStyle ? PLAY_STYLE_LABELS[matchedProfile.playStyle] || matchedProfile.playStyle : 'Chill';
  const micOn = matchedProfile?.usesMic ?? false;

  const handleChat = () => {
    clearMatchFlag();
    const userGames = matchedProfile?.user?.userGames ?? [];
    router.replace({
      pathname: '/chat',
      params: {
        matchId: '',
        name: otherName,
        avatarUrl: otherAvatar,
        userId: matchedProfile?.userId ?? '',
        bio: matchedProfile?.bio ?? '',
        gender: matchedProfile?.gender ?? '',
        playStyle: matchedProfile?.playStyle ?? '',
        usesMic: String(matchedProfile?.usesMic ?? false),
        games: JSON.stringify(userGames),
      },
    } as any);
  };

  const handleContinue = () => {
    clearMatchFlag();
    router.back();
  };

  return (
    <View style={s.root}>
      {/* Background glow */}
      <View style={s.bgGlow} />

      {/* SYNERGY LOCKED badge */}
      <View style={s.badgeWrap}>
        <View style={s.badge}>
          <Text style={s.badgeTxt}>SYNERGY LOCKED</Text>
        </View>
      </View>

      {/* Title */}
      <View style={s.titleWrap}>
        <Text style={s.title}>DUO BULUNDU</Text>
        <Animated.View style={{ opacity: lightningPulse }}>
          <Ionicons name="flash" size={32} color="#22d3ee" />
        </Animated.View>
      </View>
      <Text style={s.subtitle}>Yeni takım arkadaşın hazır.</Text>

      {/* Avatars */}
      <View style={s.avatarsSection}>
        {/* Left - Cyan */}
        <View style={s.avatarCol}>
          <View style={s.avatarOuter}>
            <Animated.View style={[s.avatarGlow, s.avatarGlowCyan, { transform: [{ scale: pulse }] }]} />
            <LinearGradient
              colors={['#22d3ee', '#06b6d4', '#0891b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.avatarRing}
            >
              <View style={s.avatarInner}>
                <Image source={{ uri: myAvatar }} style={s.avatarImg} />
              </View>
            </LinearGradient>
            <Animated.View style={[s.sparkle, { top: 0, right: 8, opacity: sparkle1 }]} />
            <Animated.View style={[s.sparkle, s.sparkleSmall, { bottom: 8, left: 0, opacity: sparkle2 }]} />
          </View>
          <Text style={s.avatarName}>{myName}</Text>
        </View>

        {/* Lightning center */}
        <View style={s.lightningWrap}>
          <Animated.View style={[s.lightningGlow, { opacity: lightningPulse }]} />
          <LinearGradient
            colors={['#ffffff', '#e0f2fe', '#ddd6fe']}
            style={s.lightningCircle}
          >
            <Ionicons name="flash" size={24} color="#0891b2" />
          </LinearGradient>
        </View>

        {/* Right - Magenta */}
        <View style={s.avatarCol}>
          <View style={s.avatarOuter}>
            <Animated.View style={[s.avatarGlow, s.avatarGlowMagenta, { transform: [{ scale: pulse }] }]} />
            <LinearGradient
              colors={['#ec4899', '#db2777', '#be185d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.avatarRing}
            >
              <View style={s.avatarInner}>
                <Image source={{ uri: otherAvatar }} style={s.avatarImg} />
              </View>
            </LinearGradient>
            <Animated.View style={[s.sparkle, s.sparklePink, { top: 0, left: 8, opacity: sparkle3 }]} />
            <Animated.View style={[s.sparkle, s.sparkleSmall, s.sparklePink, { bottom: 8, right: 0, opacity: sparkle4 }]} />
          </View>
          <Text style={s.avatarName}>{otherName}</Text>
        </View>
      </View>

      {/* Compatibility */}
      <Text style={s.score}>%{score} Uyum</Text>

      {/* Match info card */}
      <View style={s.infoCard}>
        <View style={s.infoRow}>
          <View style={s.infoIconWrap}>
            <Text style={s.infoEmoji}>⚡</Text>
          </View>
          <View style={s.infoText}>
            <Text style={s.infoLabel}>OYUN TARZI</Text>
            <View style={s.infoValRow}>
              <Text style={s.infoVal}>{playStyle}</Text>
              <Ionicons name="checkmark" size={14} color="#22d3ee" />
            </View>
          </View>
        </View>

        <View style={s.infoDivider} />

        <View style={s.infoRow}>
          <View style={s.infoIconWrap}>
            <Text style={s.infoEmoji}>🎤</Text>
          </View>
          <View style={s.infoText}>
            <Text style={s.infoLabel}>SES DURUMU</Text>
            <View style={s.infoValRow}>
              <Text style={s.infoVal}>{micOn ? 'Mikrofon Açık' : 'Mikrofon Kapalı'}</Text>
              <Ionicons name="checkmark" size={14} color="#22d3ee" />
            </View>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity activeOpacity={0.85} onPress={handleChat}>
        <LinearGradient
          colors={['#22d3ee', '#06b6d4', '#0891b2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.chatBtn}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#000" />
          <Text style={s.chatBtnTxt}>DUO SOHBETE BAŞLA</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={s.continueBtn} activeOpacity={0.8} onPress={handleContinue}>
        <Text style={s.continueBtnTxt}>KEŞFETMEYE DEVAM ET</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a1628',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  bgGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(34,211,238,0.06)',
    top: '30%',
    alignSelf: 'center',
  },

  badgeWrap: { marginBottom: 24 },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(34,211,238,0.4)',
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22d3ee',
    letterSpacing: 2,
  },

  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    fontWeight: '800',
    color: '#22d3ee',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 32,
  },

  avatarsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  avatarCol: { alignItems: 'center' },
  avatarOuter: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarGlow: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarGlowCyan: {
    backgroundColor: 'rgba(34,211,238,0.25)',
  },
  avatarGlowMagenta: {
    backgroundColor: 'rgba(236,72,153,0.25)',
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    padding: 3,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  avatarInner: {
    flex: 1,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#0a1628',
    borderWidth: 2,
    borderColor: 'rgba(34,211,238,0.5)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },

  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#67e8f9',
  },
  sparkleSmall: { width: 6, height: 6, borderRadius: 3 },
  sparklePink: { backgroundColor: '#f472b6' },

  lightningWrap: {
    position: 'absolute',
    zIndex: 10,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightningGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  lightningCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },

  score: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    fontWeight: '800',
    color: '#22d3ee',
    marginBottom: 24,
  },

  infoCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 24,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(34,211,238,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoEmoji: { fontSize: 18 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#6b7280', letterSpacing: 1, marginBottom: 2 },
  infoValRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoVal: { fontSize: 14, fontWeight: '800', color: '#fff' },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },

  chatBtn: {
    width: '100%',
    maxWidth: 380,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
    marginBottom: 12,
  },
  chatBtnTxt: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 0.5 },

  continueBtn: {
    width: '100%',
    maxWidth: 380,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  continueBtnTxt: { fontSize: 14, fontWeight: '800', color: '#d1d5db' },
});
