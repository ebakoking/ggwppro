import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, FontSize } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';

const BG = '#0a1628';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, isLoading } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const clearForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setPasswordConfirm('');
  };

  const handleSubmit = async () => {
    if (isSignUp) {
      if (!email.trim() || !email.includes('@')) {
        Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
        return;
      }
      if (!username.trim()) {
        Alert.alert('Hata', 'Kullanıcı adı girin.');
        return;
      }
      if (username.length < 4 || !/^[a-zA-Z0-9]+$/.test(username)) {
        Alert.alert('Hata', 'Kullanıcı adı minimum 4 karakter, sadece harf ve rakam.');
        return;
      }
      if (password.length < 8) {
        Alert.alert('Hata', 'Şifre en az 8 karakter olmalı.');
        return;
      }
      if (!/(?=.*[A-Z])/.test(password) || !/(?=.*[0-9])/.test(password)) {
        Alert.alert('Hata', 'Şifre bir büyük harf ve bir rakam içermelidir.');
        return;
      }
      if (password !== passwordConfirm) {
        Alert.alert('Hata', 'Şifre ve şifre tekrarı eşleşmiyor.');
        return;
      }
      const success = await register(email.trim(), username.trim().toLowerCase(), password, passwordConfirm);
      if (success) {
        router.replace('/onboarding/customize');
      } else {
        Alert.alert('Hata', useAuthStore.getState().error || 'Kayıt başarısız.');
      }
      return;
    }

    const identifier = email.trim();
    if (!identifier) {
      Alert.alert('Hata', 'E-posta girin.');
      return;
    }
    if (!password) {
      Alert.alert('Hata', 'Şifre girin.');
      return;
    }
    const success = await login(identifier, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Hata', useAuthStore.getState().error || 'Giriş başarısız.');
    }
  };

  const switchMode = (toSignUp: boolean) => {
    clearForm();
    useAuthStore.setState({ error: null });
    setIsSignUp(toSignUp);
  };

  const inputBorder = (key: string) => ({
    borderColor: focused === key ? '#22d3ee' : 'rgba(255,255,255,0.1)',
    borderWidth: focused === key ? 2 : 1,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]} edges={['top']}>
      {/* Ambient glow */}
      <View style={styles.glowWrap} pointerEvents="none">
        <View style={styles.glowCyan} />
        <View style={styles.glowPurple} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <Text style={styles.logo}>GGWP</Text>

          {/* Segmented control */}
          <View style={styles.segmentedWrap}>
            <TouchableOpacity
              style={[styles.segmentedBtn, isSignUp && styles.segmentedBtnActive]}
              onPress={() => switchMode(true)}
              activeOpacity={0.9}
            >
              {isSignUp && (
                <LinearGradient
                  colors={['#22d3ee', '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.segmentedText, isSignUp && styles.segmentedTextActive]}>Kayıt Ol</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentedBtn, !isSignUp && styles.segmentedBtnActive]}
              onPress={() => switchMode(false)}
              activeOpacity={0.9}
            >
              {!isSignUp && (
                <LinearGradient
                  colors={['#22d3ee', '#a855f7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.segmentedText, !isSignUp && styles.segmentedTextActive]}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* E-POSTA */}
            <View style={styles.field}>
              <Text style={styles.label}>E-POSTA</Text>
              <TextInput
                style={[styles.input, inputBorder('email')]}
                placeholder="ornek@ggwp.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            {/* KULLANICI ADI - only sign up */}
            {isSignUp && (
              <View style={styles.field}>
                <Text style={styles.label}>KULLANICI ADI</Text>
                <TextInput
                  style={[styles.input, inputBorder('username')]}
                  placeholder="kralarthur"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.hint}>Minimum 4 karakter, sadece harf ve rakam.</Text>
              </View>
            )}

            {/* ŞİFRE */}
            <View style={styles.field}>
              <Text style={styles.label}>ŞİFRE</Text>
              <View style={[styles.inputRow, inputBorder('password')]}>
                <TextInput
                  key={`pwd-${showPassword}`}
                  style={styles.inputInner}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="oneTimeCode"
                  autoComplete="off"
                />
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={showPassword ? '#22d3ee' : '#9ca3af'} />
                </TouchableOpacity>
              </View>
              {isSignUp && (
                <Text style={styles.hint}>En az 8 karakter, bir büyük harf ve bir rakam içermelidir.</Text>
              )}
            </View>

            {/* ŞİFRE TEKRAR - only sign up */}
            {isSignUp && (
              <View style={styles.field}>
                <Text style={styles.label}>ŞİFRE TEKRAR</Text>
                <View style={[styles.inputRow, inputBorder('confirm')]}>
                  <TextInput
                    key={`confirm-${showConfirmPassword}`}
                    style={styles.inputInner}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    onFocus={() => setFocused('confirm')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    textContentType="oneTimeCode"
                    autoComplete="off"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword((p) => !p)} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={showConfirmPassword ? '#22d3ee' : '#9ca3af'} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* DEVAM ET */}
            <TouchableOpacity
              style={[styles.ctaWrap, isLoading && styles.ctaDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#22d3ee', '#3b82f6', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>DEVAM ET</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
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
    top: -100,
    left: '50%',
    marginLeft: -192,
    width: 384,
    height: 384,
    borderRadius: 192,
    backgroundColor: 'rgba(34,211,238,0.1)',
  },
  glowPurple: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(147,51,234,0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 40,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontFamily: Fonts.heading,
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 32,
  },
  segmentedWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 9999,
    padding: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  segmentedBtnActive: {
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  segmentedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.md,
    color: '#9ca3af',
  },
  segmentedTextActive: {
    color: '#FFFFFF',
  },
  form: { width: '100%' },
  field: { marginBottom: 16 },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#9ca3af',
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputInner: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.md,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 6,
    marginLeft: 16,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 24,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 50,
    elevation: 12,
  },
  ctaDisabled: { opacity: 0.8 },
  ctaText: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
