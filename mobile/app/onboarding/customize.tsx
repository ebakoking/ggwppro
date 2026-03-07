import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, FontSize } from '@/constants/theme';
import { useProfileStore } from '@/stores/profileStore';
import { useAuthStore } from '@/stores/authStore';
import type { Gender, PlayStyle, GameLevel } from '@/types/api';

const BG = '#0a1628';

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const MIN_AGE = 18;
const MAX_BIRTH_YEAR = CURRENT_YEAR - MIN_AGE;
const YEARS = Array.from({ length: MAX_BIRTH_YEAR - 1920 + 1 }, (_, i) => MAX_BIRTH_YEAR - i);

type GenderChoice = 'male' | 'female' | 'other';
type PlayStyleChoice = 'competitive' | 'casual' | 'team-player' | 'explorer';
type GameLevelChoice = 'beginner' | 'intermediate' | 'advanced';

const PLAY_STYLES: { key: PlayStyleChoice; title: string; desc: string; api: PlayStyle }[] = [
  { key: 'competitive', title: 'Competitive', desc: 'Rekabeti seviyorsun. Kazanmak için oynarsın.', api: 'COMPETITIVE' },
  { key: 'casual', title: 'Casual', desc: 'Rahat oyna, eğlen, stres yok.', api: 'CASUAL' },
  { key: 'team-player', title: 'Team Player', desc: 'Takım oyunu ve iletişim senin için önemli.', api: 'TEAM_PLAYER' },
  { key: 'explorer', title: 'Explorer', desc: 'Yeni oyunlar ve farklı deneyimler keşfetmeyi seviyorsun.', api: 'EXPLORER' },
];

const GAME_LEVELS: { key: GameLevelChoice; title: string; desc: string; api: GameLevel }[] = [
  { key: 'beginner', title: 'Beginner', desc: 'Yeni başlıyorum', api: 'BEGINNER' },
  { key: 'intermediate', title: 'Intermediate', desc: 'Orta seviye oyuncu', api: 'INTERMEDIATE' },
  { key: 'advanced', title: 'Advanced', desc: 'Deneyimli oyuncu', api: 'ADVANCED' },
];

const GENDER_TO_API: Record<GenderChoice, Gender> = {
  male: 'MALE',
  female: 'FEMALE',
  other: 'OTHER',
};

type DatePickerMode = 'day' | 'month' | 'year' | null;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { updateProfile, isLoading } = useProfileStore();
  const logout = useAuthStore((s) => s.logout);
  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [datePickerMode, setDatePickerMode] = useState<DatePickerMode>(null);
  const [gender, setGender] = useState<GenderChoice | null>(null);
  const [playStyle, setPlayStyle] = useState<PlayStyleChoice | null>(null);
  const [gameLevel, setGameLevel] = useState<GameLevelChoice | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);

  const isFormComplete = !!(day && month && year && gender && playStyle && gameLevel);

  const handleGoBack = async () => {
    await logout();
    router.replace('/');
  };

  useEffect(() => {
    const onBack = () => {
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  const handleNext = async () => {
    if (!day || !month || !year || !gender || !playStyle || !gameLevel) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    if (age < MIN_AGE) {
      Alert.alert('Yaş sınırı', 'Uygulamayı kullanmak için en az 18 yaşında olmalısınız.');
      return;
    }
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const playStyleApi = PLAY_STYLES.find((p) => p.key === playStyle)!.api;
    const gameLevelApi = GAME_LEVELS.find((g) => g.key === gameLevel)!.api;

    try {
      await updateProfile({
        dateOfBirth: isoDate,
        gender: GENDER_TO_API[gender],
        playStyle: playStyleApi,
        gameLevel: gameLevelApi,
        usesMic: micEnabled,
      });
      router.replace('/onboarding/preview');
    } catch {
      Alert.alert('Uyarı', 'Profil kaydedilemedi. Tekrar deneyin.');
    }
  };

  const renderDatePickerModal = () => {
    if (!datePickerMode) return null;
    const isDay = datePickerMode === 'day';
    const isMonth = datePickerMode === 'month';
    const items = isDay ? DAYS : isMonth ? MONTHS : YEARS;
    return (
      <Modal visible transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setDatePickerMode(null)}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.pickerScroll} keyboardShouldPersistTaps="handled">
              {items.map((item, index) => {
                const value = isDay ? item : isMonth ? index + 1 : item;
                const label = isDay ? String(item) : isMonth ? item : String(item);
                return (
                  <TouchableOpacity
                    key={isMonth ? item : value}
                    style={styles.pickerRow}
                    onPress={() => {
                      if (datePickerMode === 'day') setDay(value as number);
                      else if (datePickerMode === 'month') setMonth(value as number);
                      else setYear(value as number);
                      setDatePickerMode(null);
                    }}
                  >
                    <Text style={styles.pickerRowText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setDatePickerMode(null)}>
              <Text style={styles.pickerCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]} edges={['top']}>
      {/* Ambient glow */}
      <View style={styles.glowWrap} pointerEvents="none">
        <View style={styles.glowCyan} />
        <View style={styles.glowPurple} />
        <View style={styles.glowCyanSmall} />
        <View style={styles.glowBlue} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Profilini Oluştur</Text>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.stepLabel}>ADIM 1/2</Text>
          <Text style={styles.stepPercent}>50%</Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#22d3ee', '#3b82f6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: '50%' }]}
          />
        </View>

        {/* DOĞUM TARİHİ - Gün / Ay / Yıl */}
        <View style={styles.field}>
          <Text style={styles.label}>DOĞUM TARİHİ</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerMode('day')}>
              <Text style={styles.dateBtnLabel}>Gün</Text>
              <Text style={styles.dateBtnValue}>{day != null ? day : '—'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerMode('month')}>
              <Text style={styles.dateBtnLabel}>Ay</Text>
              <Text style={styles.dateBtnValue}>{month != null ? MONTHS[month - 1] : '—'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerMode('year')}>
              <Text style={styles.dateBtnLabel}>Yıl</Text>
              <Text style={styles.dateBtnValue}>{year != null ? year : '—'}</Text>
            </TouchableOpacity>
          </View>
          {renderDatePickerModal()}
        </View>

        {/* CİNSİYET */}
        <View style={styles.field}>
          <Text style={styles.label}>CİNSİYET</Text>
          <View style={styles.genderRow}>
            {(['male', 'female', 'other'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                  {g === 'male' ? 'Erkek' : g === 'female' ? 'Kadın' : 'Diğer'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* OYUN TARZINI BELİRLE */}
        <View style={styles.field}>
          <Text style={styles.label}>OYUN TARZINI BELİRLE</Text>
          {PLAY_STYLES.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.card, playStyle === p.key && styles.cardActive]}
              onPress={() => setPlayStyle(p.key)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardDesc}>{p.desc}</Text>
              </View>
              {playStyle === p.key && (
                <View style={styles.checkWrap}>
                  <Ionicons name="checkmark" size={14} color="#000" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* OYUN SEVİYESİ */}
        <View style={styles.field}>
          <Text style={styles.label}>OYUN SEVİYESİ</Text>
          {GAME_LEVELS.map((g) => (
            <TouchableOpacity
              key={g.key}
              style={[styles.card, gameLevel === g.key && styles.cardActive]}
              onPress={() => setGameLevel(g.key)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{g.title}</Text>
                <Text style={styles.cardDesc}>{g.desc}</Text>
              </View>
              {gameLevel === g.key && (
                <View style={styles.checkWrap}>
                  <Ionicons name="checkmark" size={14} color="#000" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Mikrofon */}
        <View style={[styles.micWrap, micEnabled && styles.micWrapActive]}>
          <View>
            <Text style={styles.micTitle}>Mikrofon Kullanımı</Text>
            <Text style={styles.micDesc}>Oyun sırasında sesli konuşur musun?</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, micEnabled && styles.toggleOn]}
            onPress={() => setMicEnabled(!micEnabled)}
            activeOpacity={0.9}
          >
            {micEnabled && (
              <LinearGradient
                colors={['#22d3ee', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={[styles.toggleThumb, micEnabled && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>

        {/* Devam Et */}
        <TouchableOpacity
          style={[styles.ctaWrap, isFormComplete && styles.ctaWrapActive]}
          onPress={handleNext}
          disabled={!isFormComplete || isLoading}
          activeOpacity={0.9}
        >
          {isFormComplete && (
            <LinearGradient
              colors={['#22d3ee', '#3b82f6', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          {isLoading ? (
            <ActivityIndicator color={isFormComplete ? '#fff' : '#6b7280'} />
          ) : (
            <>
              <Text style={[styles.ctaText, isFormComplete && styles.ctaTextActive]}>Devam Et</Text>
              <Text style={[styles.ctaArrow, isFormComplete && styles.ctaTextActive]}>→</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glowWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glowCyan: {
    position: 'absolute',
    top: -80,
    left: '50%',
    marginLeft: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(34,211,238,0.1)',
  },
  glowPurple: {
    position: 'absolute',
    bottom: -80,
    right: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(147,51,234,0.1)',
  },
  glowCyanSmall: {
    position: 'absolute',
    top: '25%',
    left: 24,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(34,211,238,0.05)',
  },
  glowBlue: {
    position: 'absolute',
    bottom: '30%',
    right: 24,
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: 'rgba(59,130,246,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#22d3ee',
  },
  stepPercent: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#9ca3af',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1f2937',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  field: { marginBottom: 16 },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#9ca3af',
    letterSpacing: 2,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  dateBtnLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#9ca3af',
    marginBottom: 4,
  },
  dateBtnValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: '50%',
  },
  pickerScroll: {
    maxHeight: 280,
  },
  pickerRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pickerRowText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.lg,
    color: '#FFFFFF',
  },
  pickerCancel: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pickerCancelText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.md,
    color: '#9ca3af',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(34,211,238,0.2)',
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  genderText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#9ca3af',
  },
  genderTextActive: {
    color: '#67e8f9',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardActive: {
    borderWidth: 2,
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cardLeft: { flex: 1 },
  cardTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.md,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: '#b8c5d6',
    lineHeight: 20,
  },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22d3ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  micWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  micWrapActive: {
    borderWidth: 2,
    borderColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  micTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  micDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: '#b8c5d6',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  toggleOn: {},
  toggleThumb: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  toggleThumbOn: {
    left: 22,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#374151',
    position: 'relative',
  },
  ctaWrapActive: {
    backgroundColor: 'transparent',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 50,
    elevation: 12,
  },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  ctaTextActive: {
    color: '#FFFFFF',
  },
  ctaArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
