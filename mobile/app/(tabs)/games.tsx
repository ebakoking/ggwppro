import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/stores/gameStore';

type PlatformTab = 'MOBİL' | 'PC' | 'KONSOL';
const TAB_LIST: PlatformTab[] = ['MOBİL', 'PC', 'KONSOL'];

interface GameMeta {
  platform: PlatformTab;
  rank: string;
  color: string;
}

const GAME_META: Record<string, GameMeta> = {
  'pubg-mobile':     { platform: 'MOBİL', rank: 'ACE', color: '#F97316' },
  'cod-mobile':      { platform: 'MOBİL', rank: 'LEGENDARY', color: '#10B981' },
  'free-fire':       { platform: 'MOBİL', rank: 'HEROIC', color: '#EF4444' },
  'mobile-legends':  { platform: 'MOBİL', rank: 'MYTHIC', color: '#8B5CF6' },
  'clash-royale':    { platform: 'MOBİL', rank: 'CHALLENGER II', color: '#3B82F6' },
  'brawlstars':      { platform: 'MOBİL', rank: 'DIAMOND', color: '#F59E0B' },
  'wildrift':        { platform: 'MOBİL', rank: 'EMERALD III', color: '#10B981' },
  'arena-breakout':  { platform: 'MOBİL', rank: 'ELITE', color: '#6366F1' },
  'standoff-2':      { platform: 'MOBİL', rank: 'GLOBAL', color: '#EF4444' },
  'among-us':        { platform: 'MOBİL', rank: 'CREWMATE', color: '#EC4899' },

  'valorant':        { platform: 'PC', rank: 'PLATINUM II', color: '#EF4444' },
  'lol':             { platform: 'PC', rank: 'GOLD IV', color: '#F59E0B' },
  'cs2':             { platform: 'PC', rank: 'GLOBAL ELITE', color: '#F97316' },
  'dota2':           { platform: 'PC', rank: 'LEGEND', color: '#DC2626' },
  'fortnite':        { platform: 'PC', rank: 'UNREAL', color: '#8B5CF6' },
  'apex':            { platform: 'PC', rank: 'DIAMOND', color: '#06B6D4' },
  'overwatch2':      { platform: 'PC', rank: 'PLATINUM', color: '#F97316' },
  'r6siege':         { platform: 'PC', rank: 'GOLD', color: '#F59E0B' },
  'rust':            { platform: 'PC', rank: 'SURVIVOR', color: '#78716C' },
  'pubg':            { platform: 'PC', rank: 'MASTER', color: '#F97316' },

  'warzone':         { platform: 'KONSOL', rank: 'ELITE', color: '#10B981' },
  'eafc':            { platform: 'KONSOL', rank: 'DIVISION 1', color: '#10B981' },
  'nba2k':           { platform: 'KONSOL', rank: 'PRO', color: '#EF4444' },
  'rocket-league':   { platform: 'KONSOL', rank: 'GRAND CHAMPION', color: '#3B82F6' },
  'destiny-2':       { platform: 'KONSOL', rank: 'LEGEND', color: '#6366F1' },
  'halo-infinite':   { platform: 'KONSOL', rank: 'ONYX', color: '#06B6D4' },
  'gtav':            { platform: 'KONSOL', rank: 'LEVEL 120', color: '#10B981' },
  'tekken-8':        { platform: 'KONSOL', rank: 'TEKKEN KING', color: '#DC2626' },
  'street-fighter-6': { platform: 'KONSOL', rank: 'DIAMOND', color: '#3B82F6' },
};

const SECTION_LABELS: Record<PlatformTab, string> = {
  'MOBİL': 'MOBİL OYUNLARI',
  'PC': 'PC OYUNLARI',
  'KONSOL': 'KONSOL OYUNLARI',
};

export default function GamesScreen() {
  const router = useRouter();
  const { catalog, myGames, isLoading, loadCatalog, loadMyGames, addGame, removeGame } = useGameStore();

  const [activeTab, setActiveTab] = useState<PlatformTab>('PC');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCatalog();
    loadMyGames();
  }, []);

  const myGameIds = new Set(myGames.map((g) => g.gameId));

  const gamesForTab = useMemo(() => {
    return catalog.filter((g) => {
      const meta = GAME_META[g.slug];
      return meta?.platform === activeTab;
    });
  }, [catalog, activeTab]);

  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return gamesForTab;
    const q = searchQuery.trim().toLowerCase();
    return gamesForTab.filter((g) => g.name.toLowerCase().includes(q));
  }, [gamesForTab, searchQuery]);

  const toggleGame = async (gameId: string) => {
    if (myGameIds.has(gameId)) {
      await removeGame(gameId);
    } else {
      await addGame(gameId);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              SAVAŞ ALANINI{' '}
              <Text style={{ color: Colors.primary }}>SEÇ</Text>
            </Text>
            <Text style={styles.helper}>
              Oynadığın oyunları seç. Keşfet buna göre oluşur.
            </Text>
          </View>
        </View>

        {/* Platform Tabs */}
        <View style={styles.tabs}>
          {TAB_LIST.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
                activeOpacity={0.8}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#22d3ee', '#06b6d4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tabActiveGrad}
                  >
                    <Text style={styles.tabTextActive}>{tab}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.tabText}>{tab}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: Spacing.sm }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Oyun ara..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>{SECTION_LABELS[activeTab]}</Text>

        {/* Game List */}
        {isLoading && catalog.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxl }} />
        ) : (
          <View style={styles.list}>
            {filteredGames.map((game) => {
              const selected = myGameIds.has(game.id);
              const meta = GAME_META[game.slug];
              const rank = meta?.rank || '';
              const accentColor = meta?.color || Colors.primary;

              return (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.gameRow, selected && styles.gameRowSelected]}
                  onPress={() => toggleGame(game.id)}
                  activeOpacity={0.7}
                >
                  {/* Thumbnail */}
                  <View style={styles.thumbWrap}>
                    {game.iconUrl ? (
                      <Image source={{ uri: game.iconUrl }} style={styles.thumb} resizeMode="cover" />
                    ) : (
                      <View style={[styles.thumbFallback, { backgroundColor: `${accentColor}30` }]}>
                        <Ionicons name="game-controller" size={20} color={accentColor} />
                      </View>
                    )}
                    {game.iconUrl && (
                      <LinearGradient
                        colors={[`${accentColor}80`, `${accentColor}20`, 'transparent']}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.thumbOverlay}
                      />
                    )}
                    {selected && <View style={styles.thumbSelectedBorder} />}
                  </View>

                  {/* Name + Rank */}
                  <View style={styles.gameInfo}>
                    <Text style={[styles.gameName, selected && { color: Colors.text }]} numberOfLines={1}>{game.name}</Text>
                    {rank ? <Text style={[styles.gameRank, { color: accentColor }]}>{rank}</Text> : null}
                  </View>

                  {/* Selection Indicator */}
                  <View style={styles.gameRight}>
                    {selected ? (
                      <>
                        <View style={styles.checkCircle}>
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        </View>
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>AKTİF SEÇİM</Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.emptyCircle} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* More Games */}
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <Text style={styles.moreBtnText}>DAHA FAZLA OYUN</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaWrap} onPress={() => router.push('/(tabs)')} activeOpacity={0.9}>
          <LinearGradient
            colors={['#22d3ee', '#06b6d4', '#0891b2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGrad}
          >
            <Text style={styles.ctaText}>ONAYLA VE KEŞFETE GEÇ</Text>
            <Ionicons name="flash" size={20} color="#0a1628" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  scroll: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl + 30 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl },
  title: { fontFamily: Fonts.heading, fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, fontStyle: 'italic' },
  helper: { fontFamily: Fonts.body, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },

  tabs: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  tab: { flex: 1, borderRadius: BorderRadius.lg, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', height: 42 },
  tabActive: { borderColor: Colors.primary, backgroundColor: 'transparent' },
  tabActiveGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  tabText: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm, color: '#0a1628', fontWeight: '700' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: BorderRadius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: Spacing.xl, paddingHorizontal: Spacing.lg },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: FontSize.md, color: Colors.text, paddingVertical: Spacing.md },

  sectionLabel: { fontFamily: Fonts.heading, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, letterSpacing: 1, marginBottom: Spacing.md },

  list: { gap: Spacing.sm, marginBottom: Spacing.xxl },

  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: Spacing.sm + 2,
  },
  gameRowSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(34,211,238,0.06)' },

  thumbWrap: { width: 52, height: 52, borderRadius: BorderRadius.md, overflow: 'hidden', position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md },
  thumbOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: BorderRadius.md },
  thumbSelectedBorder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: Colors.primary },

  gameInfo: { flex: 1, marginLeft: Spacing.md },
  gameName: { fontFamily: Fonts.heading, fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  gameRank: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, marginTop: 2 },

  gameRight: { alignItems: 'flex-end', gap: 6, marginLeft: Spacing.sm },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  activeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: Colors.primary },
  activeBadgeText: { fontFamily: Fonts.bodySemiBold, fontSize: 8, fontWeight: '700', color: Colors.primary, letterSpacing: 0.3 },
  emptyCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },

  moreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  moreBtnText: { fontFamily: Fonts.heading, fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },

  ctaWrap: { width: '100%', borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg + 4 },
  ctaText: { fontFamily: Fonts.heading, fontSize: FontSize.lg, fontWeight: '800', color: '#0a1628', letterSpacing: 0.3 },
});
