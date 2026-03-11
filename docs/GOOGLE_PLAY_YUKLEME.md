# GGWP – Google Play Store’a Yükleme Rehberi

Bu rehber, uygulamayı **ilk kez** Google Play Store’a yüklemek ve hem **Android** hem **iOS** kullanıcılarının aynı backend’i kullanması için gereken adımları anlatır.

---

## 1. Google Play Console Hesabı

1. **https://play.google.com/console** adresine git.
2. Google hesabınla giriş yap.
3. **Geliştirici olarak kaydol** (tek seferlik **25 USD** ücret gerekir).
4. Ödeme ve geliştirici sözleşmesini tamamla.

---

## 2. Yeni Uygulama Oluşturma

1. Play Console’da **“Uygulama oluştur”** butonuna tıkla.
2. **Uygulama adı:** GGWP  
3. **Varsayılan dil:** Türkçe (veya İngilizce)  
4. **Uygulama veya oyun:** Oyun  
5. **Ücretsiz veya ücretli:** Ücretsiz  
6. Onay kutusunu işaretleyip **“Uygulama oluştur”** de.

---

## 3. Mağaza Ayarları (Store Listing)

**Play Console → Uygulamanı seç → Büyüme → Mağaza varlıkları → Ana mağaza listesi**

- **Kısa açıklama (80 karakter):**  
  `Gamer’lar için eşleşme. Oyun arkadaşı bul, sohbet et, birlikte oyna.`
- **Tam açıklama:**  
  App Store’daki açıklamanın aynısını kullanabilirsin (GGWP – Oyun Arkadaşı Bul metni).
- **Uygulama simgesi:** 512 x 512 PNG (mevcut icon’dan üretebilirsin).
- **Öne çıkan grafik:** 1024 x 500 PNG (isteğe bağlı).
- **Ekran görüntüleri:** En az 2 telefon ekran görüntüsü (App Store’dakilerle aynı olabilir).

---

## 4. İçerik Derecelendirmesi

1. **Politika → Uygulama içeriği → İçerik derecelendirmesi** bölümüne gir.
2. **Anketi başlat** de.
3. E-posta adresini ver, **Kategori seç** (ör. “Oyun” veya “Sosyal”).
4. Soruları yanıtla (şiddet, kumar, reklam vb.).
5. Sonuçta çıkan **derecelendirmeyi** (ör. PEGI 12, 16) kaydet; mağaza listesinde göstereceksin.

---

## 5. Gizlilik Politikası ve Uygulama Erişimi

- **Gizlilik politikası URL:**  
  `https://ebakoking.github.io/ggwppro/privacy-policy.html`  
  (Zaten kullanıyorsun, aynı link yeterli.)
- **Uygulama erişimi:**  
  Gerekirse “Tüm işlevler internet bağlantısı gerektirir” gibi kısa bir açıklama ekle.

---

## 6. Hedef Kitle ve Reklam

- **Hedef kitle:** 18+ (uygulaman zaten 18+).
- Uygulamada **reklam yoksa** “Reklam içermez” seçeneğini işaretle.

---

## 7. Android Build (AAB) Alma

Proje zaten Android için yapılandırıldı. Build’i EAS ile al:

**İlk kez Android build alıyorsan** (keystore henüz yok) komutu **interaktif** çalıştır; EAS keystore oluşturmak için soracak:

```bash
cd mobile
eas build --platform android --profile production
```

- “Generate a new Android Keystore” sorusuna **Yes** de.
- Keystore EAS sunucusunda saklanır, sonraki build’lerde tekrar sormaz.

**Sonraki build’lerde** (keystore zaten varsa):

```bash
eas build --platform android --profile production --non-interactive
```

- Build bittikten sonra **.aab** dosyasının linki verilir (veya https://expo.dev adresinden indirirsin).
- **İlk yükleme için AAB gerekir** (APK değil).

---

## 8. İlk Sürümü Yükleme (Production / Internal testing)

1. Play Console’da uygulamayı seç.
2. **Yayınlama → Üretim** (veya **Test → Dahili test**) bölümüne git.
3. **“Yeni sürüm oluştur”** de.
4. **App bundle’ı yükle** kısmından indirdiğin **.aab** dosyasını seç.
5. **Sürüm adı:** 1.2.0 (veya “İlk sürüm”).
6. **Sürüm notları** (Türkçe):  
   `İlk sürüm. Oyun arkadaşı eşleşmesi, sohbet ve keşfet özellikleri.`
7. **İncelemeye gönder** (veya dahili test için **“İncelemeyi başlat”**).

---

## 9. İnceleme Sonrası

- Google incelemesi genelde **birkaç saat – birkaç gün** sürer.
- Onaylanınca seçtiğin izleme kanalına (dahili / kapalı / açık / üretim) göre yayına alırsın.
- **Üretim**e çıkarmak için: **Yayınlama → Üretim → Sürümü yayınla**.

---

## 10. iOS ve Android’in Aynı Anda Çalışması

- **Backend (NestJS)** zaten tek: Render’daki API hem iOS hem Android istemcilerine hizmet veriyor.
- **Veritabanı** tek: Tüm kullanıcılar (iOS + Android) aynı hesap, eşleşme ve mesaj verisini kullanır.
- **Yapman gereken ekstra bir şey yok:**  
  iOS uygulaması `https://ggwp-api.onrender.com` (veya senin API URL’in) kullanıyorsa, Android build’de de aynı `EXPO_PUBLIC_API_URL` kullanılıyor. Böylece her iki platform da aynı sunucuya bağlanır.

**Kontrol:**  
`mobile/services/api.ts` (veya `.env`) içinde `EXPO_PUBLIC_API_URL` canlı API adresine işaret ediyorsa, Android build de aynı adresi kullanır.

---

## 11. Sonraki Güncellemeler (Android)

1. `app.json` içinde `version` ve `android.versionCode` değerini artır:
   - `version`: "1.2.1" (kullanıcının gördüğü)
   - `android.versionCode`: 2, 3, 4... (her yeni yükleme için artan tam sayı)
2. Tekrar build al:  
   `eas build --platform android --profile production`
3. Play Console’da **Yayınlama → Üretim → Yeni sürüm oluştur** ile yeni AAB’yi yükle.

---

## Özet Kontrol Listesi

- [ ] Play Console hesabı açıldı (25 USD ödendi)
- [ ] Uygulama oluşturuldu (GGWP, ücretsiz, oyun)
- [ ] Mağaza listesi (açıklama, ikon, ekran görüntüleri) dolduruldu
- [ ] İçerik derecelendirmesi anketi tamamlandı
- [ ] Gizlilik politikası URL eklendi
- [ ] Hedef kitle ve reklam bilgisi ayarlandı
- [ ] `eas build --platform android --profile production` ile AAB alındı
- [ ] İlk sürüm (AAB) Play Console’a yüklendi
- [ ] İnceleme tamamlandı, yayın seçildi (dahili / üretim)

Bu adımları tamamladığında uygulama hem **Google Play** hem **App Store** üzerinden aynı backend’i kullanarak çalışır; iOS ve Android kullanıcıları birbirleriyle eşleşip sohbet edebilir.
