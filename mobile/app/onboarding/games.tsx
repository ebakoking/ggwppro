import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { useGameStore } from '@/stores/gameStore';

const CATEGORY_ICONS: Record<string, string> = {
  FPS: '🎯',
  MOBA: '⚔️',
  RPG: '🗡️',
  BATTLE_ROYALE: '🪂',
  SANDBOX: '🧱',
  SPORTS: '⚽',
  STRATEGY: '♟️',
  OTHER: '🎮',
};

export default function OnboardingGamesScreen() {
  const router = useRouter();
  const { catalog, loadCatalog, setMyGames, isLoading } = useGameStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCatalog();
  }, []);

  const toggleGame = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('Hata', 'En az bir oyun seç');
      return;
    }

    await setMyGames([...selectedIds].map((gameId) => ({ gameId })));
    router.replace('/onboarding/preview');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <Text style={styles.stepLabel}>ADIM 2/3</Text>
          <Text style={styles.stepPercent}>66%</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: '66%' }]}
          />
        </View>

        <Text style={styles.title}>OYUNLARINI SEÇ</Text>
        <Text style={styles.subtitle}>Hangi oyunları oynuyorsun? Sana uygun oyuncu arkadaşlar bulalım.</Text>

        {isLoading && catalog.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
        ) : (
          <View style={styles.grid}>
            {catalog.map((game) => {
              const selected = selectedIds.has(game.id);
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.gameCard, selected && styles.gameCardSelected]}
                  onPress={() => toggleGame(game.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.gameIcon}>{CATEGORY_ICONS[game.category] || '🎮'}</Text>
                  <Text style={[styles.gameName, selected && styles.gameNameSelected]} numberOfLines={2}>
                    {game.name}
                  </Text>
                  {selected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.selectedCount}>
          {selectedIds.size} oyun seçildi
        </Text>

        <TouchableOpacity style={styles.ctaWrapper} onPress={handleNext} activeOpacity={0.85} disabled={isLoading}>
          <LinearGradient colors={['#FF00FF', '#C850C0', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
            {isLoading ? <ActivityIndicator color={Colors.background} /> : (
              <>
                <Text style={styles.ctaText}>ÖNİZLEMEYE GEÇ</Text>
                <Ionicons name="arrow-forward" size={22} color={Colors.background} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.xxl, paddingTop: Spacing.lg, paddingBottom: Spacing.xxxl },
  progressSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  stepLabel: { fontFamily: Fonts.heading, fontSize: FontSize.sm, color: Colors.primary, letterSpacing: 1 },
  stepPercent: { fontFamily: Fonts.bodyMedium, fontSize: FontSize.sm, color: Colors.textSecondary },
  progressBar: { width: '100%', height: 4, backgroundColor: Colors.surface, borderRadius: 2, marginBottom: Spacing.xxl },
  progressFill: { height: '100%', borderRadius: 2 },
  title: { fontFamily: Fonts.heading, fontSize: FontSize.display, color: Colors.text, fontWeight: '700', marginBottom: Spacing.sm },
  subtitle: { fontFamily: Fonts.body, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  gameCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 90,
    justifyContent: 'center',
  },
  gameCardSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(0,229,255,0.08)' },
  gameIcon: { fontSize: 28, marginBottom: Spacing.xs },
  gameName: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, color: Colors.text, textAlign: 'center' },
  gameNameSelected: { color: Colors.primary },
  checkBadge: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  selectedCount: { fontFamily: Fonts.bodyMedium, fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.xxl },
  ctaWrapper: { width: '100%', borderRadius: BorderRadius.xl, overflow: 'hidden' },
  ctaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg + 2, gap: Spacing.sm },
  ctaText: { fontFamily: Fonts.heading, fontSize: FontSize.xl, color: Colors.background, fontWeight: '700', letterSpacing: 1 },
});
