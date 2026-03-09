import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { UPLOADS_BASE } from '@/services/api';

export const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1618517048485-f125b94309a8?w=400',
  'https://images.unsplash.com/photo-1718056514261-bb037cfe6ddd?w=400',
  'https://images.unsplash.com/photo-1613487971624-24f87ffdbfc5?w=400',
  'https://images.unsplash.com/photo-1759701546957-0ac6e568bd9a?w=400',
  'https://images.unsplash.com/photo-1622349851524-890cc3641b87?w=400',
  'https://images.unsplash.com/photo-1771014817844-327a14245bd1?w=400',
  'https://images.unsplash.com/photo-1758523670487-fe71f10c1080?w=400',
  'https://images.unsplash.com/photo-1759701546662-b79f5d881124?w=400',
  'https://images.unsplash.com/photo-1772371272167-0117a6573d58?w=400',
  'https://images.unsplash.com/photo-1543868519-fc5437bc63fe?w=400',
  'https://images.unsplash.com/photo-1576633587382-13ddf37b1fc1?w=400',
  'https://images.unsplash.com/photo-1704189125621-55e8c6cfd166?w=400',
];

export function getDefaultAvatarUrl(profile: { avatarUrl?: string | null; gender?: string | null } | null): string {
  if (profile?.avatarUrl) {
    if (profile.avatarUrl.startsWith('http')) return profile.avatarUrl;
    return UPLOADS_BASE + profile.avatarUrl;
  }
  if (!profile?.gender) return AVATAR_OPTIONS[0];
  if (profile.gender === 'FEMALE') return AVATAR_OPTIONS[1];
  if (profile.gender === 'OTHER') return AVATAR_OPTIONS[2];
  return AVATAR_OPTIONS[0];
}

interface AvatarSelectModalProps {
  visible: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
  onSelectAvatar: (url: string) => void | Promise<void>;
  isPremium?: boolean;
  onUploadCustom?: () => void | Promise<void>;
  uploading?: boolean;
}

export default function AvatarSelectModal({
  visible,
  onClose,
  currentAvatarUrl,
  onSelectAvatar,
  isPremium,
  onUploadCustom,
  uploading = false,
}: AvatarSelectModalProps) {
  const { height: winHeight } = useWindowDimensions();
  const modalHeight = Math.min(winHeight * 0.85, 560);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View
          style={[styles.modalContent, { height: modalHeight }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Avatar Seç</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((url, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.avatarGridItem, currentAvatarUrl === url && styles.avatarGridItemSelected]}
                  onPress={() => onSelectAvatar(url)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: url }} style={styles.avatarGridImg} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.premiumCta, isPremium && styles.premiumCtaActive]}
              onPress={isPremium ? onUploadCustom : undefined}
              disabled={!isPremium || uploading}
              activeOpacity={0.85}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#0a1628" />
              ) : (
                <>
                  <View style={styles.premiumCtaIconRow}>
                    <Ionicons name="trophy" size={28} color="#facc15" />
                    <Ionicons name="cloud-upload" size={22} color="#fde047" />
                  </View>
                  <Text style={styles.premiumCtaTitle}>
                    {isPremium ? 'Kendi Fotoğrafını Kullan' : 'Premium ile Kendi Fotoğrafını Kullan'}
                  </Text>
                  <Text style={styles.premiumCtaDesc}>
                    {isPremium
                      ? 'Galeriden bir fotoğraf seç, profil resmin olsun.'
                      : 'Premium üye ol, özel fotoğrafını avatar yap.'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.premiumInfo}>
              <Ionicons name="trophy" size={20} color="#facc15" style={{ marginRight: Spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumInfoTitle}>
                  {isPremium
                    ? 'Kendi fotoğrafını yükleyebilirsin.'
                    : 'Premium Üyelik ile Kendi Fotoğrafını Kullan'}
                </Text>
                <Text style={styles.premiumInfoDesc}>
                  {isPremium
                    ? 'Yukarıdaki butona dokun ve galeriden bir resim seç.'
                    : 'Premium üyelik satın alarak özel fotoğrafını profil resmi olarak kullanabilirsin.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0a1628',
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontFamily: Fonts.heading, fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  modalClose: { fontSize: 20, color: '#94a3b8' },
  modalScroll: { flex: 1, minHeight: 0 },
  modalScrollContent: { paddingBottom: Spacing.xxl },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  avatarGridItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarGridItemSelected: {
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  avatarGridImg: { width: '100%', height: '100%' },
  premiumCta: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(250, 204, 21, 0.5)',
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  premiumCtaActive: {
    borderColor: 'rgba(250, 204, 21, 0.9)',
    backgroundColor: 'rgba(250, 204, 21, 0.18)',
  },
  premiumCtaIconRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  premiumCtaTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#fef08a',
    marginBottom: 4,
  },
  premiumCtaDesc: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: '#94a3b8' },
  premiumInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(250, 204, 21, 0.08)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    padding: Spacing.md,
  },
  premiumInfoTitle: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: '#fef08a', marginBottom: 4 },
  premiumInfoDesc: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: '#94a3b8' },
});
