import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import AvatarSelectModal, { getDefaultAvatarUrl } from '@/components/AvatarSelectModal';
import { profileApi } from '@/services/api';

const GENDER_TR: Record<string, string> = { MALE: 'Erkek', FEMALE: 'Kadın', OTHER: 'Diğer' };

const PLAY_STYLE_TR: Record<string, string> = {
  COMPETITIVE: 'Tryhard',
  CASUAL: 'Chill',
  TEAM_PLAYER: 'Team Player',
  EXPLORER: 'Explorer',
};

function calcAge(dob?: string | null): number | null {
  if (!dob) return null;
  const b = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}

export default function PreviewScreen() {
  const router = useRouter();
  const { profile, fetchProfile, updateProfile, isLoading } = useProfileStore();
  const { username } = useAuthStore();
  const { myGames, loadMyGames } = useGameStore();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
    loadMyGames();
  }, []);

  useEffect(() => {
    if (profile?.bio !== undefined) setBio(profile.bio || '');
  }, [profile?.bio]);

  useEffect(() => {
    const onBack = () => {
      router.replace('/onboarding/customize');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [router]);

  const age = calcAge(profile?.dateOfBirth ?? undefined);
  const avatarUrl = getDefaultAvatarUrl(profile);

  const handleSelectAvatar = async (url: string) => {
    try {
      await updateProfile({ avatarUrl: url });
      setShowAvatarModal(false);
    } catch {
      setShowAvatarModal(false);
    }
  };

  const handleUploadCustom = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf seçmek için galeri izni vermeniz gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    setUploadingAvatar(true);
    try {
      const { avatarUrl: newUrl } = await profileApi.uploadAvatar(result.assets[0].uri);
      await updateProfile({ avatarUrl: newUrl });
      setShowAvatarModal(false);
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Yükleme başarısız.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateProfile({ bio: bio.trim() || undefined });
      router.replace('/(tabs)');
    } catch {
      setSaving(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Ambient glow */}
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.glowBottom} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/onboarding/customize')} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Avatar + glow */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarGlowOuter} />
          <View style={styles.avatarGlowInner} />
          <View style={styles.avatarRing}>
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          </View>
          <View style={styles.onlineDot} />
          <TouchableOpacity
            style={styles.avatarChangeBtn}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarChangeText}>Avatar Değiştir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.nickname}>{username || 'Player'}</Text>

        {/* Single line attributes */}
        <Text style={styles.attributes}>
          {profile?.gender && GENDER_TR[profile.gender]}
          {age != null && ` • ${age} yaş`}
          {profile?.playStyle && ` • ${PLAY_STYLE_TR[profile.playStyle] || profile.playStyle}`}
          {' • Mik: '}
          {profile?.usesMic ? 'Açık' : 'Kapalı'}
        </Text>

        {/* HAKKINDA */}
        <View style={styles.bioSection}>
          <Text style={styles.bioLabel}>HAKKINDA</Text>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Kendini kısaca tanıt..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={120}
          />
          <Text style={styles.bioCount}>{bio.length}/120</Text>
        </View>

        <TouchableOpacity
          style={styles.ctaWrapper}
          onPress={handleFinish}
          activeOpacity={0.85}
          disabled={saving}
        >
          <LinearGradient
            colors={['#22d3ee', '#3b82f6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGrad}
          >
            {saving ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <Text style={styles.ctaText}>PROFİLİ OLUŞTUR VE BAŞLA</Text>
                <Ionicons name="flash" size={20} color={Colors.background} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <AvatarSelectModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatarUrl={avatarUrl}
        onSelectAvatar={handleSelectAvatar}
        isPremium={profile?.isPremium}
        onUploadCustom={handleUploadCustom}
        uploading={uploadingAvatar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  scroll: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  header: { marginBottom: Spacing.lg },
  backBtn: { alignSelf: 'flex-start' },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.lg },
  avatarGlowOuter: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -56,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  avatarGlowInner: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.5)',
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarImg: { width: '100%', height: '100%' },
  onlineDot: {
    position: 'absolute',
    bottom: 22,
    right: '50%',
    marginRight: -52,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: '#0a1628',
  },
  avatarChangeBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarChangeText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, color: '#b8c5d6' },
  nickname: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  attributes: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: '#b8c5d6',
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  bioSection: { marginBottom: Spacing.xxl },
  bioLabel: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  bioInput: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.text,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 96,
    textAlignVertical: 'top',
  },
  bioCount: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  ctaWrapper: { width: '100%', borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg + 2,
    gap: Spacing.sm,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: '#0a1628',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
