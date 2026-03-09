import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '@/constants/theme';
import { useMessageStore } from '@/stores/messageStore';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { swipeApi } from '@/services/api';
import { getDefaultAvatarUrl } from '@/components/AvatarSelectModal';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Şimdi';
  if (mins < 60) return `${mins}dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Dün';
  return `${days}g`;
}

interface ChatItem {
  key: string;
  name: string;
  avatarUrl: string;
  lastMsg: string;
  time: string;
  isOnline: boolean;
  unread: boolean;
  onPress: () => void;
}

interface NewDuo {
  key: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
  onPress: () => void;
}

export default function MessagesScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { matches, localChats, isLoading, loadMatches, loadLocalChats } = useMessageStore();
  const { profile } = useProfileStore();
  const [tab, setTab] = useState<'msg' | 'req'>('msg');
  const isPremium = profile?.isPremium ?? false;
  const [likedMeList, setLikedMeList] = useState<any[]>([]);
  const [likedMeLoading, setLikedMeLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMatches();
      loadLocalChats(userId);
      if (isPremium) {
        setLikedMeLoading(true);
        swipeApi.whoLikedMe()
          .then((data) => setLikedMeList(data))
          .catch(() => {})
          .finally(() => setLikedMeLoading(false));
      }
    }, [userId, isPremium]),
  );

  const newDuos: NewDuo[] = [
    ...localChats
      .filter((lc) => lc.messages.length === 0)
      .map((lc) => ({
        key: `duo-local-${lc.id}`,
        name: lc.name.toUpperCase(),
        avatarUrl: lc.avatarUrl,
        isOnline: true,
        onPress: () =>
          router.push({
            pathname: '/chat',
            params: {
              matchId: '',
              name: lc.name,
              avatarUrl: lc.avatarUrl,
              userId: lc.userId,
              bio: lc.bio ?? '',
              gender: lc.gender ?? '',
              playStyle: lc.playStyle ?? '',
              usesMic: lc.usesMic ?? 'false',
              games: lc.games ?? '[]',
            },
          } as any),
      })),
    ...matches
      .filter((m) => !m.lastMessage)
      .map((m) => {
        const op = (m.otherUser as any)?.profile;
        const name = op?.displayName || m.otherUser.username;
        const av = getDefaultAvatarUrl(op ?? null);
        return {
          key: `duo-match-${m.matchId}`,
          name: name.toUpperCase(),
          avatarUrl: av,
          isOnline: false,
          onPress: () =>
            router.push({
              pathname: '/chat',
              params: { matchId: m.matchId, name, avatarUrl: av, userId: m.otherUser.id },
            } as any),
        };
      }),
  ];

  const allChats: ChatItem[] = [
    ...localChats
      .filter((lc) => lc.messages.length > 0)
      .map((lc) => ({
        key: `local-${lc.id}`,
        name: lc.name,
        avatarUrl: lc.avatarUrl,
        lastMsg: lc.messages[lc.messages.length - 1].content,
        time: lc.messages[lc.messages.length - 1].createdAt,
        isOnline: true,
        unread: false,
        onPress: () =>
          router.push({
            pathname: '/chat',
            params: {
              matchId: '',
              name: lc.name,
              avatarUrl: lc.avatarUrl,
              userId: lc.userId,
              bio: lc.bio ?? '',
              gender: lc.gender ?? '',
              playStyle: lc.playStyle ?? '',
              usesMic: lc.usesMic ?? 'false',
              games: lc.games ?? '[]',
            },
          } as any),
      })),
    ...matches
      .filter((m) => !!m.lastMessage)
      .map((m) => {
        const op = (m.otherUser as any)?.profile;
        const name = op?.displayName || m.otherUser.username;
        const av = getDefaultAvatarUrl(op ?? null);
        return {
          key: `match-${m.matchId}`,
          name,
          avatarUrl: av,
          lastMsg: m.lastMessage!.content,
          time: m.lastMessage!.createdAt,
          isOnline: false,
          unread: !m.lastMessage!.read,
          onPress: () =>
            router.push({
              pathname: '/chat',
              params: { matchId: m.matchId, name, avatarUrl: av, userId: m.otherUser.id },
            } as any),
        };
      }),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>SOHBETLER</Text>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={18} color="#d1d5db" />
            <View style={s.notifDot} />
          </TouchableOpacity>
        </View>

        {/* YENİ DUO'LAR - her zaman göster */}
        <View style={s.duoSection}>
          <Text style={s.duoLabel}>YENİ DUO'LAR</Text>
          {newDuos.length > 0 ? (
            <FlatList
              data={newDuos}
              keyExtractor={(item) => item.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.duoList}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.duoItem} onPress={item.onPress} activeOpacity={0.8}>
                  <View style={s.duoAvatarWrap}>
                    {item.isOnline && <View style={s.duoGlow} />}
                    <LinearGradient
                      colors={item.isOnline ? ['#22d3ee', '#06b6d4'] : ['#4b5563', '#374151']}
                      style={s.duoAvatarRing}
                    >
                      <View style={s.duoAvatarInner}>
                        <Image source={{ uri: item.avatarUrl }} style={s.duoAvatarImg} />
                      </View>
                    </LinearGradient>
                    <View style={s.duoZapBadge}>
                      <Ionicons name="flash" size={12} color="#000" />
                    </View>
                    {item.isOnline && <View style={s.duoOnline} />}
                  </View>
                  <Text style={s.duoName} numberOfLines={1}>{item.name}</Text>
                  <View style={s.duoMatchBadge}>
                    <Text style={s.duoMatchTxt}>⚡ MATCH</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={s.duoEmpty}>Henüz yeni eşleşme yok</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tab]}
            onPress={() => setTab('msg')}
            activeOpacity={0.7}
          >
            <Text style={[s.tabTxt, tab === 'msg' && s.tabTxtActive]}>MESAJLAR</Text>
            {tab === 'msg' && <View style={s.tabLine} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab]}
            onPress={() => setTab('req')}
            activeOpacity={0.7}
          >
            <Text style={[s.tabTxt, tab === 'req' && s.tabTxtActive]}>DUO İSTEKLERİ 👑</Text>
            {tab === 'req' && <View style={s.tabLine} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
        {tab === 'msg' ? (
          isLoading ? (
            <View style={s.empty}>
              <ActivityIndicator size="large" color="#22d3ee" />
            </View>
          ) : allChats.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color="#4b5563" />
              <Text style={s.emptyTxt}>Henüz sohbetin yok.{'\n'}Keşfet'ten kaydırarak eşleş!</Text>
            </View>
          ) : (
            <View style={s.chatList}>
              {allChats.map((chat) => (
                <TouchableOpacity
                  key={chat.key}
                  style={[s.chatCard, chat.unread && s.chatCardUnread]}
                  onPress={chat.onPress}
                  activeOpacity={0.7}
                >
                  <View style={s.chatRow}>
                    {/* Avatar */}
                    <View style={s.chatAvatarWrap}>
                      <LinearGradient
                        colors={chat.unread ? ['#22d3ee', '#06b6d4'] : ['#4b5563', '#374151']}
                        style={s.chatAvatarRing}
                      >
                        <View style={s.chatAvatarInner}>
                          <Image source={{ uri: chat.avatarUrl }} style={s.chatAvatarImg} />
                        </View>
                      </LinearGradient>
                      {chat.isOnline && <View style={s.chatOnline} />}
                      {chat.unread && (
                        <View style={s.unreadBadge}>
                          <View style={s.unreadDot} />
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View style={s.chatInfo}>
                      <Text style={s.chatName}>{chat.name}</Text>
                      <Text style={[s.chatMsg, chat.unread && s.chatMsgUnread]} numberOfLines={1}>
                        {chat.lastMsg}
                      </Text>
                    </View>

                    {/* Time */}
                    <Text style={[s.chatTime, chat.unread && s.chatTimeUnread]}>
                      {timeAgo(chat.time)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          <View style={s.reqContent}>
            {!isPremium ? (
              <View style={s.lockedCard}>
                <LinearGradient
                  colors={['#facc15', '#f59e0b']}
                  style={s.lockedIcon}
                >
                  <Text style={{ fontSize: 28 }}>👑</Text>
                </LinearGradient>
                <Text style={s.lockedTitle}>DUO İSTEKLERİ</Text>
                <Text style={s.lockedDesc}>Seni beğenen oyuncuları görmek için Premium'a geç.</Text>
                <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/premium' as any)}>
                  <LinearGradient
                    colors={['#facc15', '#f59e0b', '#ea580c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.lockedBtn}
                  >
                    <Text style={s.lockedBtnTxt}>PREMIUM'U KEŞFET</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : likedMeLoading ? (
              <View style={s.empty}>
                <ActivityIndicator size="large" color="#22d3ee" />
              </View>
            ) : likedMeList.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="people-outline" size={48} color="#4b5563" />
                <Text style={s.emptyTxt}>Henüz duo isteği yok.</Text>
              </View>
            ) : (
              <View style={s.chatList}>
                {likedMeList.map((item) => {
                  const user = item.from;
                  const prof = user?.profile;
                  const name = prof?.displayName || user?.username || 'Oyuncu';
                  const av = getDefaultAvatarUrl(prof ?? null);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={s.chatCard}
                      onPress={() =>
                        router.push({
                          pathname: '/user-profile',
                          params: {
                            userId: user.id,
                            name,
                            avatarUrl: av,
                          },
                        } as any)
                      }
                      activeOpacity={0.7}
                    >
                      <View style={s.chatRow}>
                        <View style={s.chatAvatarWrap}>
                          <LinearGradient
                            colors={['#facc15', '#f59e0b']}
                            style={s.chatAvatarRing}
                          >
                            <View style={s.chatAvatarInner}>
                              <Image source={{ uri: av }} style={s.chatAvatarImg} />
                            </View>
                          </LinearGradient>
                        </View>
                        <View style={s.chatInfo}>
                          <Text style={s.chatName}>{name}</Text>
                          <Text style={s.chatMsg}>Seni beğendi!</Text>
                        </View>
                        <Ionicons name="heart" size={20} color="#f43f5e" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },
  header: { backgroundColor: '#0f1c2e', paddingHorizontal: 16, paddingTop: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontFamily: Fonts.heading, fontSize: 24, fontWeight: '800', color: '#fff', flex: 1 },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#0a1628',
  },

  duoSection: { marginBottom: 20 },
  duoLabel: { fontSize: 10, fontWeight: '800', color: '#6b7280', letterSpacing: 2, marginBottom: 12 },
  duoList: { gap: 16, paddingRight: 16 },
  duoItem: { alignItems: 'center', width: 72 },
  duoAvatarWrap: { position: 'relative', marginBottom: 8 },
  duoGlow: {
    position: 'absolute', width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(34,211,238,0.2)',
  },
  duoAvatarRing: {
    width: 64, height: 64, borderRadius: 32, padding: 2,
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  duoAvatarInner: {
    flex: 1, borderRadius: 30, overflow: 'hidden', backgroundColor: '#0a1628',
  },
  duoAvatarImg: { width: '100%', height: '100%' },
  duoZapBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#22d3ee', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0a1628',
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 10, elevation: 5,
  },
  duoOnline: {
    position: 'absolute', top: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#4ade80', borderWidth: 2, borderColor: '#0a1628',
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6, elevation: 5,
  },
  duoName: { fontSize: 10, fontWeight: '800', color: '#fff', marginBottom: 4, textAlign: 'center' },
  duoMatchBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
    backgroundColor: 'rgba(34,211,238,0.2)',
    borderWidth: 0.5, borderColor: 'rgba(34,211,238,0.4)',
  },
  duoMatchTxt: { fontSize: 8, fontWeight: '800', color: '#22d3ee' },
  duoEmpty: { fontSize: 12, color: '#6b7280', paddingVertical: 8 },

  tabs: {
    flexDirection: 'row', gap: 32,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: { paddingBottom: 12, position: 'relative' },
  tabTxt: { fontSize: 14, fontWeight: '800', color: '#6b7280' },
  tabTxtActive: { color: '#22d3ee' },
  tabLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: '#22d3ee', borderRadius: 1,
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 10, elevation: 5,
  },

  content: { flex: 1 },
  chatList: { padding: 16, gap: 12 },
  chatCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  chatCardUnread: {
    borderWidth: 1, borderColor: 'rgba(34,211,238,0.6)',
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatAvatarWrap: { position: 'relative' },
  chatAvatarRing: { width: 56, height: 56, borderRadius: 28, padding: 2 },
  chatAvatarInner: { flex: 1, borderRadius: 26, overflow: 'hidden', backgroundColor: '#0a1628' },
  chatAvatarImg: { width: '100%', height: '100%' },
  chatOnline: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#4ade80', borderWidth: 2, borderColor: '#0a1628',
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6, elevation: 5,
  },
  unreadBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#22d3ee', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0a1628',
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 10, elevation: 5,
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0a1628' },

  chatInfo: { flex: 1 },
  chatName: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 4 },
  chatMsg: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  chatMsgUnread: { color: '#d1d5db', fontWeight: '700' },
  chatTime: { fontSize: 10, fontWeight: '700', color: '#4b5563' },
  chatTimeUnread: { color: '#22d3ee' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyTxt: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },

  reqContent: { padding: 16 },
  lockedCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 24,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  lockedIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#eab308', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 30, elevation: 10,
  },
  lockedTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  lockedDesc: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  lockedBtn: {
    width: '100%', minWidth: 280, paddingVertical: 14, borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#eab308', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 25, elevation: 10,
  },
  lockedBtnTxt: { fontSize: 14, fontWeight: '800', color: '#000' },
});
