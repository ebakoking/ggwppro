import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useMessageStore } from '@/stores/messageStore';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import { getDefaultAvatarUrl } from '@/components/AvatarSelectModal';
import { messageApi, reportApi, UPLOADS_BASE } from '@/services/api';

const QUICK_REPLIES = ['Rank nedir?', 'Hangi oyun?', 'Hadi girelim! 🎮'];
const REACTIONS = ['🔥', '👍', 'GG'];

function VoicePlayButton({ audioUrl, label }: { audioUrl: string; label: string }) {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const togglePlay = async () => {
    try {
      if (playing && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlaying(false);
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (s) => {
          if (s.isLoaded && s.didJustFinish) {
            soundRef.current?.unloadAsync();
            soundRef.current = null;
            setPlaying(false);
          }
        },
      );
      soundRef.current = sound;
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <TouchableOpacity onPress={togglePlay} style={s.voiceBtn} activeOpacity={0.8}>
      <Ionicons name={playing ? 'pause' : 'play'} size={20} color="#22d3ee" />
      <Text style={s.voiceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    matchId: string;
    name: string;
    avatarUrl: string;
    userId: string;
    bio: string;
    gender: string;
    playStyle: string;
    usesMic: string;
    games: string;
  }>();

  const userId = useAuthStore((s) => s.userId);
  const { currentMessages, isLoading, loadMessages, sendMessage, saveLocalChat, addLocalMessage, getLocalChat, deleteLocalChat } = useMessageStore();
  const { profile: myProfile } = useProfileStore();

  const [input, setInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const matchId = params.matchId ?? '';
  const otherName = params.name ?? 'Oyuncu';
  const otherAvatar = params.avatarUrl ?? '';
  const otherUserId = params.userId ?? '';
  const isLocalChat = !matchId;
  const localChatId = otherUserId || `local-${otherName}`;

  useEffect(() => {
    if (matchId) {
      loadMessages(matchId);
    } else if (userId) {
      saveLocalChat({
        id: localChatId,
        name: otherName,
        avatarUrl: otherAvatar,
        userId: otherUserId,
        bio: params.bio ?? '',
        gender: params.gender ?? '',
        playStyle: params.playStyle ?? '',
        usesMic: params.usesMic ?? 'false',
        games: params.games ?? '[]',
      }, userId);
    }
  }, [matchId, userId]);

  const localChat = getLocalChat(localChatId);
  const allMessages = isLocalChat ? (localChat?.messages ?? []) : currentMessages;

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    if (isLocalChat) {
      addLocalMessage(localChatId, text, userId ?? 'me', userId);
    } else {
      sendMessage(matchId, text);
    }
    setInput('');
    setShowQuickReplies(false);
  }, [input, matchId, sendMessage, isLocalChat, localChatId, addLocalMessage, userId]);

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('İzin Gerekli', 'Mikrofon izni verilmedi.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimer.current = setInterval(() => setRecordingDuration((d) => d + 1), 1000);
    } catch {
      Alert.alert('Hata', 'Ses kaydı başlatılamadı.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    clearInterval(recordingTimer.current!);
    setIsRecording(false);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      if (uri) {
        const dur = recordingDuration;
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        const label = `${mins}:${secs.toString().padStart(2, '0')}`;
        if (isLocalChat) {
          addLocalMessage(localChatId, `🎤 Ses mesajı (${label})`, myProfile?.userId ?? 'me', userId);
        } else if (matchId) {
          try {
            const { audioUrl } = await messageApi.uploadVoice(matchId, uri);
            sendMessage(matchId, `🎤 Ses mesajı (${label})`, { audioUrl });
          } catch (err: any) {
            Alert.alert('Ses Gönderilemedi', err?.message || 'Ses mesajı yüklenemedi, metin olarak gönderildi.');
            sendMessage(matchId, `🎤 Ses mesajı (${label})`);
          }
        }
      }
    } catch {
      recordingRef.current = null;
    }
    setRecordingDuration(0);
  };

  const addReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [msgId]: [...(prev[msgId] ?? []), emoji],
    }));
  };

  const endChat = async () => {
    if (isLocalChat) await deleteLocalChat(localChatId, userId);
    router.back();
  };

  const doReport = (reason?: string) => {
    if (!otherUserId || isLocalChat) {
      Alert.alert('Bilgi', 'Sadece eşleştiğiniz kullanıcıları raporlayabilirsiniz.');
      return;
    }
    const sendReport = async (r: string) => {
      try {
        await reportApi.report({
          reportedId: otherUserId,
          reason: r,
          matchId: matchId || undefined,
        });
        Alert.alert('Teşekkürler', 'Şikayetiniz admin panele iletildi. İncelenecektir.');
      } catch {
        Alert.alert('Hata', 'Şikayet gönderilemedi.');
      }
    };
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Şikayet Sebebi',
        'Neden şikayet ediyorsunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Gönder', onPress: (r) => r?.trim() && sendReport(r.trim()) },
        ],
        'plain-text',
      );
    } else {
      Alert.alert(
        'Şikayet Sebebi',
        'Sebep seçin:',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Spam / Reklam', onPress: () => sendReport('Spam / Reklam') },
          { text: 'Hakaret / Taciz', onPress: () => sendReport('Hakaret / Taciz') },
          { text: 'Sahte hesap', onPress: () => sendReport('Sahte hesap') },
          { text: 'Diğer', onPress: () => sendReport('Diğer') },
        ],
      );
    }
  };

  const showMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Şikayet Et', 'Engelle', 'Sohbeti Bitir', 'İptal'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 3,
        },
        (idx) => {
          if (idx === 0) doReport();
          else if (idx === 1) {
            if (!otherUserId || isLocalChat) {
              Alert.alert('Bilgi', 'Sadece eşleştiğiniz kullanıcıları engelleyebilirsiniz.');
              return;
            }
            Alert.alert('Engelle', 'Bu kullanıcıyı engellemek istediğinize emin misiniz?', [
              { text: 'İptal', style: 'cancel' },
              { text: 'Engelle', style: 'destructive', onPress: async () => {
                try {
                  await reportApi.report({ reportedId: otherUserId, reason: 'Engelleme İsteği', matchId: matchId || undefined });
                  Alert.alert('Engellendi', 'Kullanıcı engellendi ve raporlandı.');
                } catch { Alert.alert('Hata', 'İşlem başarısız.'); }
              }},
            ]);
          } else if (idx === 2) {
            Alert.alert('Sohbeti Bitir', 'Sohbet sonlandırılsın mı?', [
              { text: 'İptal' },
              { text: 'Bitir', style: 'destructive', onPress: endChat },
            ]);
          }
        },
      );
    } else {
      Alert.alert('Seçenekler', undefined, [
        { text: 'Şikayet Et', onPress: doReport },
        { text: 'Engelle', onPress: () => {
          if (!otherUserId || isLocalChat) {
            Alert.alert('Bilgi', 'Sadece eşleştiğiniz kullanıcıları engelleyebilirsiniz.');
            return;
          }
          Alert.alert('Engelle', 'Bu kullanıcıyı engellemek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Engelle', style: 'destructive', onPress: async () => {
              try {
                await reportApi.report({ reportedId: otherUserId, reason: 'Engelleme İsteği', matchId: matchId || undefined });
                Alert.alert('Engellendi', 'Kullanıcı engellendi ve raporlandı.');
              } catch { Alert.alert('Hata', 'İşlem başarısız.'); }
            }},
          ]);
        }},
        {
          text: 'Sohbeti Bitir',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sohbeti Bitir', 'Sohbet sonlandırılsın mı?', [
              { text: 'İptal' },
              { text: 'Bitir', style: 'destructive', onPress: endChat },
            ]);
          },
        },
        { text: 'İptal', style: 'cancel' },
      ]);
    }
  };

  const openProfile = () => {
    if (otherUserId) {
      router.push({
        pathname: '/user-profile',
        params: {
          userId: otherUserId,
          name: otherName,
          avatarUrl: otherAvatar,
          bio: params.bio ?? '',
          gender: params.gender ?? '',
          playStyle: params.playStyle ?? '',
          usesMic: params.usesMic ?? 'false',
          games: params.games ?? '[]',
        },
      } as any);
    }
  };

  const isMe = (senderId: string) => senderId === userId;

  const renderMessage = ({ item }: { item: (typeof currentMessages)[0] }) => {
    const me = isMe(item.senderId);
    const msgReactions = reactions[item.id] ?? [];
    const time = new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const isVoice = !!(item as any).audioUrl;

    return (
      <View style={[s.msgRow, me ? s.msgRowMe : s.msgRowThem]}>
        {!me && (
          <TouchableOpacity onPress={openProfile} activeOpacity={0.8}>
            <Image source={{ uri: otherAvatar }} style={s.msgAvatar} />
          </TouchableOpacity>
        )}
        <View style={[s.msgCol, me ? s.msgColMe : s.msgColThem]}>
          <View style={[s.bubble, me ? s.bubbleMe : s.bubbleThem]}>
            {isVoice ? (
              <VoicePlayButton
                audioUrl={(item as any).audioUrl?.startsWith('http') ? (item as any).audioUrl : UPLOADS_BASE + (item as any).audioUrl}
                label={item.content || '🎤 Ses mesajı'}
              />
            ) : (
              <Text style={s.bubbleText}>{item.content}</Text>
            )}
            {msgReactions.length > 0 && (
              <View style={s.reactionsRow}>
                {msgReactions.map((r, i) => (
                  <Text key={i} style={s.reactionEmoji}>{r}</Text>
                ))}
              </View>
            )}
          </View>
          <Text style={[s.timestamp, me && s.timestampMe]}>{time}</Text>
          {!me && (
            <View style={s.reactionBtns}>
              {REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={s.reactionBtn}
                  onPress={() => addReaction(item.id, emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={s.reactionBtnTxt}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View style={s.headerLeft}>
              <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={18} color="#d1d5db" />
              </TouchableOpacity>
              <TouchableOpacity onPress={openProfile} activeOpacity={0.8} style={s.headerAvatarWrap}>
                <Image source={{ uri: otherAvatar }} style={s.headerAvatar} />
                <View style={s.onlineDot} />
              </TouchableOpacity>
              <View style={s.headerInfo}>
                <Text style={s.headerName}>{otherName}</Text>
                <Text style={s.headerStatus}>ÇEVRİMİÇİ <Text style={{ color: '#22d3ee' }}>⚡</Text></Text>
              </View>
            </View>
            <TouchableOpacity style={s.menuBtn} onPress={showMenu} activeOpacity={0.7}>
              <Ionicons name="ellipsis-vertical" size={18} color="#d1d5db" />
            </TouchableOpacity>
          </View>
          <View style={s.matchLabel}>
            <Text style={s.matchLabelTxt}>{otherName} ile eşleştin ⚡</Text>
          </View>
        </View>

        {/* Quick Replies */}
        {showQuickReplies && currentMessages.length === 0 && (
          <View style={s.quickSection}>
            <Text style={s.quickTitle}>🎮 İLK MESAJ ÖNERİSİ:</Text>
            <View style={s.quickRow}>
              {QUICK_REPLIES.map((r) => (
                <TouchableOpacity key={r} style={s.quickBtn} onPress={() => handleQuickReply(r)} activeOpacity={0.7}>
                  <Text style={s.quickBtnTxt}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={s.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        {/* Recording overlay */}
        {isRecording && (
          <View style={s.recordingOverlay}>
            <View style={s.recordingPulse} />
            <Ionicons name="mic" size={48} color="#ef4444" />
            <Text style={s.recordingTime}>
              {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={s.recordingHint}>Kaydediliyor... Durdurmak için dokun</Text>
          </View>
        )}

        <View style={s.inputBar}>
          <TouchableOpacity
            style={[s.micBtn, isRecording && s.micBtnRecording]}
            activeOpacity={0.7}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic-outline'} size={22} color={isRecording ? '#ef4444' : '#d1d5db'} />
          </TouchableOpacity>
          <TextInput
            style={s.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Mesaj yaz..."
            placeholderTextColor="#6b7280"
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, input.trim() ? s.sendBtnActive : s.sendBtnInactive]}
            onPress={handleSend}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={input.trim() ? '#000' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },

  header: {
    backgroundColor: '#0f1c2e',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: 'rgba(34,211,238,0.6)',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#4ade80', borderWidth: 2, borderColor: '#0a1628',
    shadowColor: '#4ade80', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6, elevation: 5,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 2 },
  headerStatus: { fontSize: 10, fontWeight: '700', color: '#4ade80' },
  menuBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  matchLabel: {
    alignSelf: 'center', marginTop: 12,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(34,211,238,0.4)',
  },
  matchLabelTxt: { fontSize: 10, fontWeight: '800', color: '#22d3ee', letterSpacing: 0.5 },

  quickSection: { paddingHorizontal: 16, paddingVertical: 12 },
  quickTitle: { fontSize: 10, fontWeight: '700', color: '#6b7280', letterSpacing: 0.5, marginBottom: 8 },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(34,211,238,0.3)',
  },
  quickBtnTxt: { fontSize: 11, fontWeight: '700', color: '#22d3ee' },

  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgRowThem: { flexDirection: 'row' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16 },
  msgCol: { maxWidth: '75%' },
  msgColMe: { alignItems: 'flex-end' },
  msgColThem: { alignItems: 'flex-start' },

  bubble: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 16, borderWidth: 0.5,
  },
  bubbleMe: {
    backgroundColor: 'rgba(34,211,238,0.2)',
    borderColor: 'rgba(34,211,238,0.4)',
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 15, elevation: 3,
  },
  bubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bubbleText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  voiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voiceLabel: { fontSize: 14, color: '#fff', fontWeight: '600' },

  reactionsRow: {
    flexDirection: 'row', gap: 4,
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  reactionEmoji: { fontSize: 12 },

  timestamp: { fontSize: 10, color: '#6b7280', fontWeight: '700', marginTop: 4, paddingHorizontal: 4 },
  timestampMe: { textAlign: 'right' },

  reactionBtns: { flexDirection: 'row', gap: 4, marginTop: 4 },
  reactionBtn: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  reactionBtnTxt: { fontSize: 10, fontWeight: '700' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#0f1c2e',
    borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  micBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  textInput: {
    flex: 1, height: 44, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    color: '#fff', fontSize: 14,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#22d3ee',
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 6,
  },
  sendBtnInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  micBtnRecording: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: 'rgba(239,68,68,0.5)',
  },
  recordingOverlay: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 20, gap: 8,
    backgroundColor: 'rgba(10,22,40,0.95)',
    borderTopWidth: 0.5, borderTopColor: 'rgba(239,68,68,0.3)',
  },
  recordingPulse: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  recordingTime: { fontSize: 24, fontWeight: '800', color: '#ef4444' },
  recordingHint: { fontSize: 12, color: '#9ca3af' },
});
