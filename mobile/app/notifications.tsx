import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore, type AppNotification } from '@/stores/notificationStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { items, load, markAllRead } = useNotificationStore();

  useEffect(() => {
    load(userId);
  }, [userId]);

  const handleMarkAllRead = () => {
    markAllRead(userId);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'match': return 'heart';
      case 'community_like': return 'heart';
      case 'community_comment': return 'chatbubble';
      case 'new_game': return 'game-controller';
      default: return 'notifications';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Bildirimler</Text>
        {items.some((n) => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markRead}>Tümünü okundu işaretle</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
            <Text style={styles.emptySub}>
              Yeni eşleşmeler, toplulukta paylaşımlarınıza gelen beğeni ve yorumlar, sistemine eklenen yeni oyunlar burada görünecek.
            </Text>
          </View>
        ) : (
          items.map((n) => (
            <View key={n.id} style={[styles.card, !n.read && styles.cardUnread]}>
              <View style={styles.iconWrap}>
                <Ionicons name={getIcon(n.type) as any} size={22} color={Colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.cardBodyText}>{n.body}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: Spacing.md, padding: Spacing.xs },
  title: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.text, fontWeight: '700', flex: 1 },
  markRead: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, color: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  empty: { alignItems: 'center', paddingTop: 48 },
  emptyTitle: { fontFamily: Fonts.heading, fontSize: FontSize.lg, color: Colors.text, marginTop: Spacing.lg },
  emptySub: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardUnread: { borderColor: Colors.primary, backgroundColor: 'rgba(34,211,238,0.06)' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(34,211,238,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: Fonts.heading, fontSize: FontSize.sm, color: Colors.text, fontWeight: '700' },
  cardBodyText: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
});
