import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useForumStore } from '@/stores/forumStore';
import { useGameStore } from '@/stores/gameStore';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'şimdi';
  if (mins < 60) return `${mins}dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa`;
  return `${Math.floor(hours / 24)}g`;
}

export default function ForumScreen() {
  const { posts, isLoading, loadPosts, loadPost, createPost, addComment, toggleLike, currentPost } = useForumStore();
  const { myGames, loadMyGames, catalog, loadCatalog } = useGameStore();
  const [filterGameId, setFilterGameId] = useState<string | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newGameId, setNewGameId] = useState('');
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => { loadMyGames(); loadCatalog(); }, []);
  useEffect(() => { loadPosts(filterGameId); }, [filterGameId]);
  useEffect(() => {
    if (commentPostId) loadPost(commentPostId);
  }, [commentPostId]);

  const handleCreate = async () => {
    if (!newTitle || !newContent || !newGameId) {
      Alert.alert('Hata', 'Başlık, içerik ve oyun seçimi zorunlu');
      return;
    }
    const ok = await createPost({ gameId: newGameId, title: newTitle, content: newContent });
    if (ok) {
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      setNewGameId('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>TOPLULUK</Text>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={22} color={Colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.xxl }}>
        <TouchableOpacity style={[styles.filterChip, !filterGameId && styles.filterChipActive]} onPress={() => setFilterGameId(undefined)}>
          <Text style={[styles.filterText, !filterGameId && styles.filterTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {myGames.map((ug) => (
          <TouchableOpacity key={ug.gameId} style={[styles.filterChip, filterGameId === ug.gameId && styles.filterChipActive]} onPress={() => setFilterGameId(ug.gameId)}>
            <Text style={[styles.filterText, filterGameId === ug.gameId && styles.filterTextActive]}>{ug.game.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.postList} showsVerticalScrollIndicator={false}>
        {isLoading && posts.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
        ) : posts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Henüz paylaşım yok</Text>
            <Text style={styles.emptySubtext}>İlk paylaşımı sen yap!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postAuthor}>{post.author?.username || 'Anonim'}</Text>
                <Text style={styles.postTime}>{timeAgo(post.createdAt)}</Text>
              </View>
              <View style={styles.postGameBadge}>
                <Text style={styles.postGameText}>{post.game?.name}</Text>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent} numberOfLines={4}>{post.content}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction} onPress={() => toggleLike(post.id)} activeOpacity={0.7}>
                  <Ionicons name="heart-outline" size={18} color={Colors.error} />
                  <Text style={styles.postActionText}>{post.likeCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.postAction}
                  onPress={() => setCommentPostId(post.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
                  <Text style={styles.postActionText}>{post.commentCount}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Yorum modalı */}
      <Modal visible={!!commentPostId} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { setCommentPostId(null); setCommentText(''); }} />
          <View style={styles.commentModalContent}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.modalTitle}>Yorumlar</Text>
              <TouchableOpacity onPress={() => { setCommentPostId(null); setCommentText(''); }}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            {currentPost && currentPost.id === commentPostId ? (
              <>
                <View style={styles.commentPostPreview}>
                  <Text style={styles.postTitle}>{currentPost.title}</Text>
                  <Text style={styles.postContent} numberOfLines={2}>{currentPost.content}</Text>
                  <Text style={styles.postTime}>{timeAgo(currentPost.createdAt)} • {currentPost.author?.username}</Text>
                </View>
                <ScrollView style={styles.commentList} keyboardShouldPersistTaps="handled">
                  {(currentPost.comments || []).length === 0 ? (
                    <Text style={styles.commentEmpty}>Henüz yorum yok. İlk yorumu sen yap!</Text>
                  ) : (
                    (currentPost.comments || []).map((c) => (
                      <View key={c.id} style={styles.commentRow}>
                        <Text style={styles.commentAuthor}>{c.author?.username}</Text>
                        <Text style={styles.commentBody}>{c.content}</Text>
                        <Text style={styles.commentTime}>{timeAgo(c.createdAt)}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Yorum yaz..."
                    placeholderTextColor={Colors.textMuted}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[styles.commentSendBtn, (!commentText.trim() || sendingComment) && styles.commentSendBtnDisabled]}
                    onPress={async () => {
                      if (!commentText.trim() || !commentPostId || sendingComment) return;
                      setSendingComment(true);
                      const ok = await addComment(commentPostId, commentText.trim());
                      setSendingComment(false);
                      if (ok) setCommentText('');
                    }}
                    disabled={!commentText.trim() || sendingComment}
                  >
                    <Text style={styles.commentSendText}>{sendingComment ? '...' : 'Gönder'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxl }} />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showCreate} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowCreate(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Paylaşım</Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>OYUN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg, maxHeight: 40 }} contentContainerStyle={{ gap: Spacing.sm }}>
                {catalog.map((g) => (
                  <TouchableOpacity key={g.id} style={[styles.filterChip, newGameId === g.id && styles.filterChipActive]} onPress={() => setNewGameId(g.id)}>
                    <Text style={[styles.filterText, newGameId === g.id && styles.filterTextActive]}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.modalLabel}>BAŞLIK</Text>
              <TextInput style={styles.modalInput} placeholder="Başlık gir..." placeholderTextColor={Colors.textMuted} value={newTitle} onChangeText={setNewTitle} />

              <Text style={styles.modalLabel}>İÇERİK</Text>
              <TextInput style={[styles.modalInput, { minHeight: 100, textAlignVertical: 'top' }]} placeholder="Ne paylaşmak istiyorsun?" placeholderTextColor={Colors.textMuted} value={newContent} onChangeText={setNewContent} multiline />

              <TouchableOpacity style={styles.modalCta} onPress={handleCreate}>
                <Text style={styles.modalCtaText}>PAYLAŞ</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xxl, marginBottom: Spacing.md },
  logo: { fontFamily: Fonts.heading, fontSize: FontSize.xxl, color: Colors.text, fontWeight: '700' },
  createBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  filterRow: { marginBottom: Spacing.md, maxHeight: 40 },
  filterChip: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, color: Colors.textSecondary },
  filterTextActive: { color: Colors.background },
  postList: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
  emptyBox: { alignItems: 'center', marginTop: Spacing.xxxl * 2, gap: Spacing.sm },
  emptyText: { fontFamily: Fonts.heading, fontSize: FontSize.lg, color: Colors.textSecondary },
  emptySubtext: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textMuted },
  postCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  postAuthor: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: Colors.text },
  postTime: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.textMuted },
  postGameBadge: { backgroundColor: 'rgba(0,229,255,0.1)', borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: Spacing.sm },
  postGameText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.primary },
  postTitle: { fontFamily: Fonts.heading, fontSize: FontSize.lg, color: Colors.text, fontWeight: '700', marginBottom: Spacing.xs },
  postContent: { fontFamily: Fonts.body, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md },
  linkText: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.primary, flex: 1 },
  postActions: { flexDirection: 'row', gap: Spacing.xxl, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  postAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  postActionText: { fontFamily: Fonts.bodyMedium, fontSize: FontSize.sm, color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.xxl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  modalTitle: { fontFamily: Fonts.heading, fontSize: FontSize.xxl, color: Colors.text, fontWeight: '700' },
  modalLabel: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.sm },
  modalInput: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, fontFamily: Fonts.body, fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  modalCta: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, paddingVertical: Spacing.lg, alignItems: 'center', marginTop: Spacing.md },
  modalCtaText: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.background, fontWeight: '700' },

  commentModalContent: { backgroundColor: Colors.background, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.xxl, maxHeight: '85%' },
  commentModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  commentPostPreview: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  commentList: { maxHeight: 240, marginBottom: Spacing.md },
  commentEmpty: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xl },
  commentRow: { marginBottom: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  commentAuthor: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: Colors.text, marginBottom: 2 },
  commentBody: { fontFamily: Fonts.body, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 20 },
  commentTime: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  commentInput: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontFamily: Fonts.body, fontSize: FontSize.md, color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 44, maxHeight: 100 },
  commentSendBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, justifyContent: 'center', minHeight: 44 },
  commentSendBtnDisabled: { opacity: 0.5 },
  commentSendText: { fontFamily: Fonts.heading, fontSize: FontSize.sm, fontWeight: '700', color: Colors.background },
});
