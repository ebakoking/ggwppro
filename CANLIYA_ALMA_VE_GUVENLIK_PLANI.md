# GGWP – Canlıya Alma ve Güvenlik Planı

Bu doküman: (1) ilk sürümü canlıya almak için adım adım yapılacaklar listesi, (2) profil ve sohbet güvenliği ince ayrıntıları, (3) verilerin nerede nasıl saklandığı özetini içerir.

---

## Bölüm 1: Güvenlik Özeti ve Veri Saklama

### 1.1 Profil ve hesap bilgileri – nerede, nasıl saklanıyor?

| Veri | Nerede saklanıyor | Güvenlik durumu |
|------|-------------------|------------------|
| **Şifre** | **Hiçbir yerde saklanmıyor.** Sadece giriş/kayıt anında sunucuya gönderiliyor, sunucuda bcrypt ile hash’lenip veritabanında sadece hash tutuluyor. | ✅ Doğru yaklaşım. |
| **E-posta / kullanıcı adı** | Sunucu veritabanında (User tablosu). Uygulama tarafında sadece oturum bilgisiyle birlikte token yenileme için kullanılıyor; şu an **AsyncStorage**’da (güvenli değil – aşağıda iyileştirme var). | ⚠️ Sunucu tarafı iyi; mobil tarafta token’lar Secure Store’a taşınmalı. |
| **Access / Refresh token** | **Mobil:** AsyncStorage (`accessToken`, `refreshToken`). **Sunucu:** Refresh token bcrypt hash’i User tablosunda. | ⚠️ Mobilde token’lar güvenli depolamaya (expo-secure-store) taşınmalı. |
| **Profil (avatar, bio, yaş, cinsiyet, oyun tercihleri)** | Sunucu veritabanında (Profile tablosu). Uygulama sadece API’den çekiyor, kalıcı olarak cihazda profil “depolanmıyor” (sadece RAM’de cache). | ✅ Veri sunucuda, yetkisiz erişim JWT ile kısıtlı. |

**Özet:** Şifre asla cihazda veya düz metin olarak sunucuda tutulmuyor. Profil bilgileri sunucuda; erişim JWT ile korunuyor. Tek kritik iyileştirme: **token’ları cihazda güvenli depolamada (Secure Store) tutmak.**

---

### 1.2 Sohbet (mesajlar) – güvenli mi, başkaları erişebilir mi?

| Konu | Açıklama |
|------|----------|
| **Nerede saklanıyor?** | Gerçek eşleşme sohbetleri **sadece sunucu veritabanında** (Message tablosu). Cihazda sadece açık oturumda çekilen mesajlar bellek/cache’te; kalıcı yerel mesaj DB’si yok (demo sohbetler hariç). |
| **Kim erişebilir?** | Sunucu kodu (message.service): Sadece **ilgili eşleşmenin iki kullanıcısı** (userAId / userBId) o match’e ait mesajları okuyup yazabiliyor. Başka kullanıcı ID’si ile istek 403 Forbidden. | ✅ Doğru yetkilendirme. |
| **Başkaları ulaşabilir mi?** | Hayır. API JWT ile korumalı; her istekte “kim olduğun” belli. Sunucu her mesaj/match isteğinde “bu kullanıcı bu match’in tarafı mı?” diye kontrol ediyor. | ✅ Sadece sohbetin iki tarafı erişir. |
| **Şifreleme** | Mesajlar şu an veritabanında **düz metin**. Taşıma katmanı: Canlıda **mutlaka HTTPS** kullanılacak; böylece ağ üzerinden okunamaz. İleride istenirse “rest’te şifreleme” (DB’de şifreli alan) eklenebilir. | ⚠️ Canlıda HTTPS zorunlu. İsteğe bağlı: DB tarafında mesaj şifreleme. |

**Demo / yerel sohbetler:** Demo kullanıcılarla (henüz gerçek sunucu eşleşmesi olmayan) sohbetler **sadece cihazda** AsyncStorage’da (`ggwp_local_chats_<userId>`). Bu veriler sunucuya gitmiyor; sadece o cihazda.

---

### 1.3 Sunucu tarafı güvenlik (mevcut durum)

- **Şifre:** bcrypt, cost 12. ✅  
- **JWT:** Access ve refresh token ayrı secret’larla imzalanıyor; refresh token veritabanında hash’lenerek tutuluyor. ✅  
- **API:** Korumalı endpoint’ler JWT Guard ile korunuyor; profil, eşleşme, mesaj, forum vb. sadece giriş yapmış kullanıcıya açık. ✅  
- **CORS / HTTPS:** Canlıda HTTPS ve CORS’un doğru ayarlanması “Yapılacaklar” listesinde.  

---

### 1.4 Yapılması gereken güvenlik iyileştirmeleri (öncelik sırasıyla)

1. **Token’ları güvenli depolamaya taşımak (mobil)**  
   - **Şu an:** `accessToken`, `refreshToken`, `userId`, `username`, `email` AsyncStorage’da.  
   - **Hedef:** Bu 5’ini **expo-secure-store** (iOS Keychain / Android Keystore) kullanarak saklamak.  
   - Böylece cihaz ele geçse veya yedekten okunsa bile token’lar standart depodan okunamaz.

2. **Canlı ortamda sadece HTTPS**  
   - API adresi `https://` ile başlamalı; `.env` ve sunucu ters proxy (Nginx vb.) sadece HTTPS kullanmalı.

3. **Sunucu .env / sırlar**  
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` canlıda **güçlü, rastgele ve benzersiz** olmalı (ör. 64 karakter hex).  
   - `DATABASE_URL` sadece sunucu ortamında, hiçbir zaman git’e veya log’a yazılmamalı.

4. **İsteğe bağlı (sonraki aşama)**  
   - Mesajlar için “rest’te şifreleme” (veritabanında şifreli alan).  
   - Rate limiting (davet / giriş / mesaj).  
   - Log’larda hassas alan (şifre, token, e-posta) basılmadığından emin olmak.

---

## Bölüm 2: Canlıya Alma – Adım Adım Yapılacaklar

### Faz 1: Hazırlık (sunucu + mobil)

- [ ] **2.1 Sunucu ortam değişkenleri**  
  - Canlı sunucuda `.env` (veya hosting’in env ayarları):  
    - `DATABASE_URL`: Canlı PostgreSQL bağlantı dizesi.  
    - `JWT_SECRET`, `JWT_REFRESH_SECRET`: Güçlü, rastgele (örn. `openssl rand -hex 32`).  
    - `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`: Örn. 15m / 7d.  
  - E-posta doğrulama için SMTP (SendGrid, Mailgun vb.) ayarları.

- [ ] **2.2 Veritabanı**  
  - Canlı PostgreSQL oluşturuldu mu?  
  - `npx prisma migrate deploy` ile şema canlı DB’ye uygulandı mı?

- [ ] **2.3 API adresi**  
  - Canlı API URL’i belirlendi (örn. `https://api.ggwp.app`).  
  - Mobil `.env`: `EXPO_PUBLIC_API_URL=https://api.ggwp.app/api` (veya sizin canlı API path’iniz).

- [ ] **2.4 Mobil: Token’ları Secure Store’a taşıma (önerilen)**  
  - `expo-secure-store` ekle.  
  - `authStore` içinde token ve kullanıcı bilgilerini AsyncStorage yerine Secure Store’dan oku/yaz.  
  - Eski AsyncStorage key’lerini bir kez okuyup Secure Store’a taşıyıp silebilirsin (tek seferlik migrasyon).

---

### Faz 2: Sunucuyu canlıya alma

- [ ] **2.5 Hosting seçimi**  
  - Örnek: Railway, Render, Fly.io, DigitalOcean, AWS, vb.  
  - Node/NestJS + PostgreSQL destekleyen bir plan.

- [ ] **2.6 HTTPS**  
  - Tüm trafik HTTPS. Hosting’in SSL’i (Let’s Encrypt vb.) veya önüne Nginx/Caddy ile SSL.

- [ ] **2.7 Domain**  
  - API için domain (örn. `api.ggwp.app`). DNS’i hosting’e yönlendir.

- [ ] **2.8 CORS**  
  - Sunucuda CORS sadece kullanacağın origin’lere açık (mobil bundle’dan gelen istekler genelde “origin” vermez; yine de production domain’leri whitelist’le).

- [ ] **2.9 Sunucuyu çalıştırma**  
  - `npm run build` + `node dist/main` (veya hosting’in start komutu).  
  - Health check endpoint’i varsa kontrol et.

---

### Faz 3: Mobil uygulamayı canlıya alma

- [ ] **2.10 app.json / app.config**  
  - Versiyon (version / ios.buildNumber, android.versionCode) canlı sürüm için güncellendi mi?

- [ ] **2.11 EAS (Expo Application Services)**  
  - `eas build:configure` (yapılmadıysa).  
  - `eas.json`: production profile (production channel, gerekirse farklı API URL).

- [ ] **2.12 Ortam bazlı API URL**  
  - Production build’de `EXPO_PUBLIC_API_URL` canlı API olacak (EAS env veya `.env.production`).

---

### Faz 4: iOS üzerinden yayına alma

- [ ] **2.13 Apple Developer hesabı**  
  - Üyelik aktif, Team ID belli.

- [ ] **2.14 Sertifika ve provisioning**  
  - EAS ile genelde otomatik yönetilir; gerekirse App Store Connect’te uygulama kaydı, bundle id.

- [ ] **2.15 İlk production build**  
  - `eas build --platform ios --profile production`.  
  - Build bitince TestFlight’a yükle (veya doğrudan App Store’a gönder).

- [ ] **2.16 TestFlight**  
  - İç test / dış test ile gerçek cihazda canlı API’yi test et (giriş, profil, sohbet, bildirim).

- [ ] **2.17 App Store gönderimi**  
  - Gerekli ekran görüntüleri, açıklama, gizlilik politikası URL’i.  
  - İlk inceleme gönderimi.

---

### Faz 5: Kullanıcı toplama ve izleme

- [ ] **2.18 Geri bildirim kanalı**  
  - E-posta veya in-app “Bize ulaşın” ile hata/öneri toplama.

- [ ] **2.19 Basit analitik (isteğe bağlı)**  
  - Crash’ler için (örn. Sentry), kullanım için (anonim event’ler) düşünülebilir; gizlilik politikasına yansıt.

- [ ] **2.20 KVKK / Gizlilik**  
  - Uygulama içi gizlilik metni ve kullanım şartları canlı URL’lere bağlı mı?  
  - Sunucu log’larında kişisel veri minimumda mı?

---

## Bölüm 3: Veri Akışı Özeti (Nerede Ne Var?)

```
[Kullanıcı cihazı]
  ├── Şifre: Hiç saklanmaz. Sadece giriş/kayıt anında API’ye gider.
  ├── Token’lar: Şu an AsyncStorage → Hedef: Secure Store.
  ├── Demo sohbetler: Sadece cihazda (AsyncStorage).
  └── Gerçek sohbet içeriği: Sadece geçici (bellek); kalıcı kopya sunucuda.

[Sunucu]
  ├── Veritabanı (PostgreSQL)
  │   ├── User: email, username, passwordHash, refreshToken (hash).
  │   ├── Profile: avatar, bio, yaş, cinsiyet, oyun tercihleri, vb.
  │   ├── Match / Message: Eşleşmeler ve mesajlar (sadece eşleşen iki kullanıcı erişir).
  │   └── Forum, oyunlar, swipe, vb.
  └── Tüm API istekleri: JWT ile kimlik doğrulama; yetkisiz erişim engelli.
```

---

## Bölüm 4: Hızlı Kontrol Listesi (Güvenlik)

- [ ] Şifre sadece sunucuda hash’li; cihazda asla saklanmıyor.  
- [ ] Token’lar mobilde güvenli depolamada (Secure Store) veya en azından canlıda HTTPS ile taşınıyor.  
- [ ] Canlı API sadece HTTPS.  
- [ ] JWT secret’lar canlıda güçlü ve benzersiz.  
- [ ] Mesajlar sadece ilgili iki kullanıcı tarafından okunup yazılabiliyor (sunucu kodu doğrulandı).  
- [ ] CORS ve sunucu sırları (`.env`) production’da doğru ve güvenli.

Bu planı takip ederek önce güvenlik iyileştirmelerini (özellikle token depolama ve HTTPS), sonra sunucu ve mobil canlıya alma adımlarını uygulayabilirsin. İlk sürüm için kullanıcı toplamak ve gerçek entegrasyonları (e-posta, push, ödeme vb.) bu fazların ardından ekleyebilirsin.
