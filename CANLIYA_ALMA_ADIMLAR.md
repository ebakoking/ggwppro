# GGWP – Canlıya Alma Adımları (Step by Step)

**Hedef:** İlk 1 haftada 5.000–10.000 indirme / kayıt / profil kullanımı.  
**Öncelik:** Ücretsiz sistemler; sadece zorunlu yerde ücretli hizmet.

---

## Genel sıra (özet)

| Step | Ne yapıyoruz | Ücret |
|------|----------------|--------|
| **1** | Canlı PostgreSQL + backend deploy (Render ücretsiz) | Ücretsiz |
| **2** | Mobil uygulamayı canlı API’ye bağlama + token güvenliği | Ücretsiz |
| **3** | E-posta doğrulama (ücretsiz kotayla başlama) | Ücretsiz kota, gerekirse ücretli |
| **4** | Domain + HTTPS (isteğe bağlı ücretsiz alt alan) | Ücretsiz / ~$10 yıllık |
| **5** | EAS + iOS TestFlight / App Store hazırlık | EAS ücretsiz kota, Apple $99/yıl |
| **6** | Yayın + izleme (TestFlight / mağaza) | — |

---

## STEP 1 – Canlı veritabanı + backend deploy (ÜCRETSİZ)

**Amaç:** API’yi internette çalışır hale getirmek. Ücretsiz PostgreSQL + ücretsiz Node hosting.

**Süre:** Yaklaşık 30–45 dakika.

### 1.1 Yapılacaklar listesi

0. [ ] **(Gerekirse) Kodu GitHub’a push et**
   - Render, deploy için GitHub repo’ya bağlanır. Projeyi bir GitHub repo’ya push ettiysen bu adım tamam.
   - Henüz push etmediysen: `git init`, `git add .`, `git commit -m "Initial"`, GitHub’da yeni repo oluştur, `git remote add origin ...`, `git push -u origin main`.

1. [ ] **Neon veya Render’da ücretsiz PostgreSQL aç**
   - [Neon](https://neon.tech) – Ücretsiz tier, iyi kotası.
   - Veya [Render](https://render.com) – Dashboard > New > PostgreSQL (free).
   - Oluşan **connection string**’i kopyala (örn. `postgresql://user:pass@host/db?sslmode=require`).

2. [ ] **Render’da ücretsiz Web Service aç (backend için)**
   - Render > New > Web Service.
   - Repo: Bu projenin GitHub’a push edilmiş hali (veya “Deploy from Git” ile `server` klasörü).
   - Root directory: `server` (veya repoda server kökü).
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npm run start:prod` veya `node dist/main.js`
   - **Environment Variables** ekle:
     - `DATABASE_URL` = Neon/Render’dan kopyaladığın connection string
     - `JWT_SECRET` = (terminalde `openssl rand -hex 32` çıktısı)
     - `JWT_REFRESH_SECRET` = (başka bir `openssl rand -hex 32` çıktısı)
     - `PORT` = `3000` (Render kendi PORT’u veriyorsa onu kullan; genelde `PORT` otomatik set edilir)
     - İsteğe bağlı: `JWT_EXPIRATION` = `15m`, `JWT_REFRESH_EXPIRATION` = `7d`

3. [ ] **Veritabanı şemasını canlı DB’ye uygula**
   - **Seçenek A (lokal):** Bilgisayarında `server/.env` içine canlı `DATABASE_URL`’i koy. Sonra: `cd server && npx prisma migrate deploy`
   - **Seçenek B (Render):** Render dashboard’da Web Service → Settings → **Release Command** alanına yaz: `npx prisma migrate deploy`  
     Böylece her deploy’da migration otomatik çalışır. İlk deploy öncesi en az bir kez Seçenek A ile de çalıştırabilirsin.

4. [ ] **Deploy et ve API’yi test et**
   - Render deploy’u tetikle.
   - Servis URL’i: `https://ggwp-api-xxxx.onrender.com` (veya senin verdiğin isim).
   - **Health check:** Tarayıcıda aç: `https://ggwp-api-xxxx.onrender.com/api/health` → `{"ok":true,"timestamp":"..."}` dönmeli.
   - **Kayıt testi:** `POST https://ggwp-api-xxxx.onrender.com/api/auth/register`  
     Body (JSON): `{"email":"test@test.com","username":"testuser","password":"Test1234","passwordConfirm":"Test1234"}`  
     → 201 veya validation/conflict hatası dönmeli (yani API erişilebilir).
   - **Not:** Render ücretsiz planda 15 dk hareketsizlikten sonra uyur; ilk istek 30–60 sn sürebilir.

### 1.2 Step 1 bitti sayılır ne zaman?

- Canlı PostgreSQL çalışıyor.
- Backend canlı URL’den yanıt veriyor.
- `POST /api/auth/register` ile test kaydı başarılı (veya validation hatası alıyorsun, yani API erişilebilir).

**Step 1 tamamlandıktan sonra Step 2’ye geçeceğiz** (mobil .env + Secure Store + canlı API bağlantısı).

---

## STEP 2 – (Step 1 bittikten sonra açılacak)

Mobil uygulamada:
- `EXPO_PUBLIC_API_URL` = Step 1’deki canlı API URL (örn. `https://ggwp-api-xxxx.onrender.com/api`).
- Token’ları `expo-secure-store` ile saklama (güvenlik).
- Uygulamayı cihazda/emülatörde canlı API’ye karşı test etme.

---

## STEP 3 – (Step 2 bittikten sonra)

E-posta doğrulama: Resend/SendGrid ücretsiz tier; günlük limit aşılınca plan yükseltme.

---

## STEP 4 – (İsteğe bağlı)

Kendi domain (örn. `api.ggwp.app`) + Render’da custom domain + HTTPS.

---

## STEP 5 – iOS / TestFlight

EAS Build, Apple Developer, sertifika, TestFlight yükleme.

---

## STEP 6 – Yayın ve izleme

App Store / TestFlight dağıtımı, geri bildirim, basit izleme.

---

**Şu an sadece STEP 1’i tamamlayalım.** Step 1’deki kutucukları sırayla işaretle; bittiğinde haber ver, Step 2’ye geçelim.
