import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts } from '@/constants/theme';
import { profileApi } from '@/services/api';
import { useProfileStore } from '@/stores/profileStore';
import Slider from '@react-native-community/slider';

const GENDERS = [
  { id: 'ERKEK', label: 'ERKEK' },
  { id: 'KADIN', label: 'KADIN' },
  { id: 'DIGER', label: 'DİĞER' },
];

const PLAY_STYLES = [
  { id: 'REKABETCI', label: 'REKABETÇİ', icon: '⚡' },
  { id: 'EGLENCE', label: 'EĞLENCE', icon: '🎮' },
  { id: 'TAKIM', label: 'TAKIM\nOYUNCUSU', icon: '👥' },
  { id: 'KESIF', label: 'KEŞİF', icon: '🔍' },
];

const ACTIVITIES = [
  { id: 'ONLINE', label: 'ONLINE' },
  { id: 'YAKIN', label: 'SON GÖRÜLME YAKIN' },
  { id: 'FARKETMEZ', label: 'FARK ETMEZ' },
];

export default function FiltersScreen() {
  const router = useRouter();
  const { profile, fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);

  const [gender, setGender] = useState<string | null>(null);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(50);
  const [micOnly, setMicOnly] = useState(false);
  const [playStyles, setPlayStyles] = useState<string[]>([]);
  const [activity, setActivity] = useState('FARKETMEZ');

  useEffect(() => {
    if (profile) {
      setGender(profile.filterGender ?? null);
      setAgeMin(profile.filterAgeMin ?? 18);
      setAgeMax(profile.filterAgeMax ?? 50);
      setMicOnly(profile.filterMicOnly ?? false);
      setPlayStyles(profile.filterPlayStyles ?? []);
      setActivity(profile.filterActivity ?? 'FARKETMEZ');
    }
  }, [profile]);

  const togglePlayStyle = (id: string) => {
    setPlayStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await profileApi.saveFilters({
        filterGender: gender ?? undefined,
        filterAgeMin: ageMin,
        filterAgeMax: ageMax,
        filterMicOnly: micOnly,
        filterPlayStyles: playStyles,
        filterActivity: activity,
      });
      await fetchProfile();
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'Filtreler kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color="#d1d5db" />
            </TouchableOpacity>
            <View style={s.headerText}>
              <Text style={s.title}>FİLTRELEME AYARLARI</Text>
              <Text style={s.subtitle}>Premium filtrelerle sana en uygun oyuncuları bul.</Text>
            </View>
          </View>

          {/* 1. Gender */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="people-outline" size={18} color="#22d3ee" />
              <Text style={s.sectionTitle}>Cinsiyet Seçimi</Text>
            </View>
            <View style={s.genderRow}>
              {GENDERS.map((g) => {
                const active = gender === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[s.genderBtn, active && s.genderBtnActive]}
                    onPress={() => setGender(active ? null : g.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.genderBtnTxt, active && s.genderBtnTxtActive]}>{g.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Age Range */}
          <View style={s.section}>
            <View style={s.sectionHeaderRow}>
              <View style={s.sectionHeader}>
                <Ionicons name="calendar-outline" size={18} color="#22d3ee" />
                <Text style={s.sectionTitle}>Yaş Aralığı</Text>
              </View>
              <Text style={s.ageLabel}>{ageMin} - {ageMax >= 50 ? '50+' : ageMax}</Text>
            </View>
            <View style={s.sliderCard}>
              <Text style={s.sliderLabel}>Min: {ageMin}</Text>
              <Slider
                style={s.slider}
                minimumValue={18}
                maximumValue={50}
                step={1}
                value={ageMin}
                onValueChange={(v) => setAgeMin(Math.min(Math.round(v), ageMax - 1))}
                minimumTrackTintColor="#22d3ee"
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="#22d3ee"
              />
              <Text style={s.sliderLabel}>Max: {ageMax >= 50 ? '50+' : ageMax}</Text>
              <Slider
                style={s.slider}
                minimumValue={18}
                maximumValue={50}
                step={1}
                value={ageMax}
                onValueChange={(v) => setAgeMax(Math.max(Math.round(v), ageMin + 1))}
                minimumTrackTintColor="#22d3ee"
                maximumTrackTintColor="rgba(255,255,255,0.1)"
                thumbTintColor="#22d3ee"
              />
              <View style={s.sliderLabels}>
                <Text style={s.sliderEdge}>18</Text>
                <Text style={s.sliderEdge}>50+</Text>
              </View>
            </View>
          </View>

          {/* 3. Mic */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="mic-outline" size={18} color="#22d3ee" />
              <Text style={s.sectionTitle}>Sesli İletişim</Text>
            </View>
            <TouchableOpacity style={s.micCard} onPress={() => setMicOnly(!micOnly)} activeOpacity={0.8}>
              <View style={s.micLeft}>
                <Text style={s.micTitle}>Sadece Mikrofonu Açık Olanlar</Text>
                <Text style={s.micDesc}>Yalnızca sesli sohbete hazır oyuncuları eşleştirir.</Text>
              </View>
              <Switch
                value={micOnly}
                onValueChange={setMicOnly}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#22d3ee' }}
                thumbColor="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* 4. Play Style */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="game-controller-outline" size={18} color="#22d3ee" />
              <Text style={s.sectionTitle}>Oyun Tarzı</Text>
            </View>
            <View style={s.playGrid}>
              {PLAY_STYLES.map((ps) => {
                const active = playStyles.includes(ps.id);
                return (
                  <TouchableOpacity
                    key={ps.id}
                    style={[s.playBtn, active && s.playBtnActive]}
                    onPress={() => togglePlayStyle(ps.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.playIcon}>{ps.icon}</Text>
                    <Text style={[s.playLabel, active && s.playLabelActive]}>{ps.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Activity */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="pulse-outline" size={18} color="#22d3ee" />
              <Text style={s.sectionTitle}>Aktivite Durumu</Text>
            </View>
            <View style={s.activityList}>
              {ACTIVITIES.map((a) => {
                const active = activity === a.id;
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[s.activityBtn, active && s.activityBtnActive]}
                    onPress={() => setActivity(a.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.activityTxt, active && s.activityTxtActive]}>{a.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save */}
          <TouchableOpacity activeOpacity={0.85} onPress={handleSave} disabled={loading} style={{ marginTop: 8 }}>
            <LinearGradient
              colors={['#22d3ee', '#06b6d4', '#0891b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.saveBtn}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={s.saveBtnTxt}>AYARLARI KAYDET VE KEŞFET 🚀</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a1628' },
  scroll: { flexGrow: 1, padding: 16, paddingVertical: 24 },
  card: {
    backgroundColor: '#0f1c2e', borderRadius: 24, padding: 24,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)',
  },

  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 24 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontFamily: Fonts.heading, fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 12, color: '#9ca3af' },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#fff' },
  ageLabel: { fontSize: 14, fontWeight: '700', color: '#22d3ee' },

  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  genderBtnActive: {
    backgroundColor: '#22d3ee', borderWidth: 0,
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 6,
  },
  genderBtnTxt: { fontSize: 11, fontWeight: '800', color: '#d1d5db' },
  genderBtnTxtActive: { color: '#000' },

  sliderCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    padding: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  slider: { width: '100%', height: 40 },
  sliderLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', marginBottom: 2 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderEdge: { fontSize: 10, color: '#6b7280', fontWeight: '700' },

  micCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    padding: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  micLeft: { flex: 1, marginRight: 12 },
  micTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  micDesc: { fontSize: 12, color: '#9ca3af', lineHeight: 18 },

  playGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  playBtn: {
    width: '48%', flexGrow: 1, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  playBtnActive: {
    backgroundColor: '#22d3ee', borderWidth: 0,
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 6,
  },
  playIcon: { fontSize: 14 },
  playLabel: { fontSize: 11, fontWeight: '800', color: '#d1d5db', textAlign: 'center' },
  playLabelActive: { color: '#000' },

  activityList: { gap: 8 },
  activityBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  activityBtnActive: {
    backgroundColor: '#22d3ee', borderWidth: 0,
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 6,
  },
  activityTxt: { fontSize: 11, fontWeight: '800', color: '#d1d5db' },
  activityTxtActive: { color: '#000' },

  saveBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 30, elevation: 12,
  },
  saveBtnTxt: { fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
});
