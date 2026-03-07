import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { profileApi } from '@/services/api';
import { getDefaultAvatarUrl } from '@/components/AvatarSelectModal';
import type { Profile } from '@/types/api';

const PLAY_STYLE_LABELS: Record<string, string> = {
  TRYHARD: 'Tryhard',
  COMPETITIVE: 'Competitive',
  CHILL: 'Chill',
  CASUAL: 'Casual',
  TEAM_PLAYER: 'Takım Oyuncusu',
  EXPLORER: 'Kaşif',
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Erkek',
  FEMALE: 'Kadın',
  OTHER: 'Diğer',
};

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId: string;
    name?: string;
    avatarUrl?: string;
    bio?: string;
    gender?: string;
    playStyle?: string;
    usesMic?: string;
    games?: string;
  }>();
  const userId = params.userId;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    if (userId.startsWith('demo-')) {
      setProfile({
        id: userId,
        userId,
        displayName: params.name,
        avatarUrl: params.avatarUrl,
        bio: params.bio,
        gender: params.gender as any,
        playStyle: params.playStyle as any,
        usesMic: params.usesMic === 'true',
        user: {
          id: userId,
          username: params.name?.toLowerCase() ?? '',
          email: '',
          createdAt: '',
          updatedAt: '',
          userGames: params.games ? JSON.parse(params.games) : [],
        },
      } as any);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await profileApi.getProfileById(userId);
        setProfile(data as any);
      } catch {}
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#22d3ee" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={s.root} edges={['top']}>
        <View style={s.loadingWrap}>
          <Text style={s.errorTxt}>Profil bulunamadı.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.backLink}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUrl = getDefaultAvatarUrl(profile);
  const name = profile.displayName || profile.user?.username || 'Oyuncu';
  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / 31557600000)
    : null;
  const games = profile.user?.userGames ?? [];

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#d1d5db" />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <LinearGradient
            colors={['#22d3ee', '#06b6d4', '#0891b2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.avatarRing}
          >
            <View style={s.avatarInner}>
              <Image source={{ uri: avatarUrl }} style={s.avatarImg} />
            </View>
          </LinearGradient>
          <View style={s.onlineDot} />
        </View>

        <Text style={s.name}>{name}{age ? `, ${age}` : ''}</Text>
        {profile.gender && (
          <Text style={s.gender}>{GENDER_LABELS[profile.gender] || profile.gender}</Text>
        )}

        {/* Bio */}
        {profile.bio && (
          <View style={s.bioCard}>
            <Text style={s.bioText}>{profile.bio}</Text>
          </View>
        )}

        {/* Info chips */}
        <View style={s.chips}>
          {profile.playStyle && (
            <View style={s.chip}>
              <Text style={s.chipIcon}>⚡</Text>
              <Text style={s.chipTxt}>{PLAY_STYLE_LABELS[profile.playStyle] || profile.playStyle}</Text>
            </View>
          )}
          <View style={s.chip}>
            <Text style={s.chipIcon}>🎤</Text>
            <Text style={s.chipTxt}>{profile.usesMic ? 'Mic Açık' : 'Mic Kapalı'}</Text>
          </View>
          {profile.gameLevel && (
            <View style={s.chip}>
              <Text style={s.chipIcon}>🎮</Text>
              <Text style={s.chipTxt}>{profile.gameLevel}</Text>
            </View>
          )}
        </View>

        {/* Games */}
        {games.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>OYUNLAR</Text>
            <View style={s.gameChips}>
              {games.map((ug) => (
                <View key={ug.id} style={s.gameChip}>
                  <Text style={s.gameChipTxt}>{ug.game.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },
  scroll: { alignItems: 'center', padding: 24, paddingBottom: 48 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorTxt: { fontSize: 16, color: '#9ca3af' },
  backLink: { fontSize: 14, color: '#22d3ee', fontWeight: '700' },

  backBtn: {
    alignSelf: 'flex-start',
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },

  avatarSection: { position: 'relative', marginBottom: 16 },
  avatarRing: {
    width: 120, height: 120, borderRadius: 60, padding: 3,
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 30, elevation: 15,
  },
  avatarInner: {
    flex: 1, borderRadius: 60, overflow: 'hidden',
    backgroundColor: '#0a1628', borderWidth: 2, borderColor: 'rgba(34,211,238,0.5)',
  },
  avatarImg: { width: '100%', height: '100%' },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#4ade80', borderWidth: 3, borderColor: '#0a1628',
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6, elevation: 5,
  },

  name: {
    fontFamily: Fonts.heading, fontSize: 28, fontWeight: '800',
    color: '#fff', marginBottom: 4,
  },
  gender: { fontSize: 14, color: '#9ca3af', marginBottom: 20 },

  bioCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  bioText: { fontSize: 14, color: '#d1d5db', lineHeight: 22 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(34,211,238,0.3)',
  },
  chipIcon: { fontSize: 14 },
  chipTxt: { fontSize: 12, fontWeight: '700', color: '#22d3ee' },

  section: { width: '100%', marginBottom: 24 },
  sectionTitle: {
    fontSize: 12, fontWeight: '800', color: '#6b7280',
    letterSpacing: 1, marginBottom: 12,
  },
  gameChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gameChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(34,211,238,0.08)',
    borderWidth: 0.5, borderColor: 'rgba(34,211,238,0.3)',
  },
  gameChipTxt: { fontSize: 12, fontWeight: '700', color: '#22d3ee' },
});
