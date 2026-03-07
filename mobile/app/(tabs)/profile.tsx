import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import AvatarSelectModal, { getDefaultAvatarUrl } from '@/components/AvatarSelectModal';
import { profileApi } from '@/services/api';

const GENDER_TR: Record<string, string> = { MALE: 'Erkek', FEMALE: 'Kadın', OTHER: 'Diğer' };

const PLAY_STYLE_TR: Record<string, string> = {
  COMPETITIVE: 'Rekabetçi',
  CASUAL: 'Rahat',
  TEAM_PLAYER: 'Takım Oyuncusu',
  EXPLORER: 'Kaşif',
  TRYHARD: 'Rekabetçi',
  CHILL: 'Rahat',
};

function calcAge(dob?: string | null): number | null {
  if (!dob) return null;
  const b = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, fetchProfile, updateProfile } = useProfileStore();
  const { logout, username } = useAuthStore();
  const { myGames, loadMyGames } = useGameStore();

  const handleLogout = () => {
    logout();
    router.replace('/reset-to-welcome');
  };

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchProfile();
    loadMyGames();
  }, []);

  useEffect(() => {
    if (profile?.bio !== undefined) setBio(profile.bio || '');
  }, [profile?.bio]);

  const avatarUrl = getDefaultAvatarUrl(profile);
  const age = calcAge(profile?.dateOfBirth ?? undefined);

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

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>GGWP</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          </View>
          <TouchableOpacity
            style={styles.avatarChangeBtn}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarChangeText}>Avatar Değiştir</Text>
          </TouchableOpacity>
          <Text style={styles.displayName}>{profile?.displayName || username || 'Oyuncu'}</Text>
        </View>

        <View style={styles.tagsRow}>
          {profile?.gender && (
            <View style={styles.tag}>
              <Ionicons
                name={profile.gender === 'FEMALE' ? 'female' : profile.gender === 'MALE' ? 'male' : 'transgender'}
                size={13}
                color={Colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.tagText}>{GENDER_TR[profile.gender]}</Text>
            </View>
          )}
          {age != null && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{age} yaş</Text>
            </View>
          )}
          {profile?.playStyle && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {PLAY_STYLE_TR[profile.playStyle] || profile.playStyle}
              </Text>
            </View>
          )}
          <View style={styles.tag}>
            <Ionicons
              name={profile?.usesMic ? 'mic' : 'mic-off'}
              size={13}
              color={profile?.usesMic ? Colors.success : Colors.error}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.tagText}>Mik {profile?.usesMic ? 'Açık' : 'Kapalı'}</Text>
          </View>
        </View>

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
            onBlur={() => {
              const trimmed = bio.trim();
              if (trimmed !== (profile?.bio || '')) updateProfile({ bio: trimmed || undefined });
            }}
          />
          <Text style={styles.bioCount}>{bio.length}/120</Text>
        </View>

        {myGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OYUNLARIM</Text>
            <View style={styles.gamesRow}>
              {myGames.map((ug) => (
                <View key={ug.id} style={styles.gameChip}>
                  <Ionicons name="game-controller" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.gameChipText}>{ug.game.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.logoutSpacer} />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
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
  container: { flex: 1, backgroundColor: Colors.background },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl, flexGrow: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: { fontFamily: Fonts.heading, fontSize: FontSize.xxl, color: Colors.text, fontWeight: '700' },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarChangeBtn: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarChangeText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, color: '#b8c5d6' },
  displayName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xxxl,
    color: Colors.text,
    fontWeight: '700',
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
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: Spacing.xxl,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: Colors.text },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  gamesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  gameChipText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: Colors.primary },
  logoutSpacer: { minHeight: 40, flexGrow: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.md, color: Colors.error },
});
