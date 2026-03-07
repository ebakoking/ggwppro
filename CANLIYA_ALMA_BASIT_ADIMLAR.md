# GGWP Canlıya Alma – Sıfırdan Adım Adım (Yazılımcı Olmayanlar İçin)

Her adımı sırayla yap. Bir adımı bitirmeden sonrakine geçme.

---

## ADIM 1: GitHub hesabı açmak

GitHub, kodlarını internet üzerinde saklayacağın ve canlı sunucunun (Render) bağlanacağı yerdir.

### 1.1 Hesap oluştur

1. Tarayıcıda **https://github.com** adresine git.
2. Sağ üstte **“Sign up”** (Kayıt ol) tıkla.
3. E‑posta adresini yaz, **Continue** de.
4. Bir şifre belirle (en az 8 karakter, bir büyük harf, bir rakam olsun), **Continue** de.
5. Kullanıcı adı seç (örn. `ggwpapp`), **Continue** de.
6. “Would you like to receive product updates?” sorusunda **y** veya **n** yazıp **Continue** de.
7. “Verify your account” ekranında sana gelen **6 haneli kodu** gir, **Continue** de.
8. “Welcome to GitHub” ekranında **Skip personalization** veya istersen soruları doldur; sonra **Finish** / **Complete setup** de.

**Bitti:** GitHub hesabın hazır. Giriş yapmış olmalısın (sağ üstte avatarın görünür).

---

## ADIM 2: Bilgisayarında “Git” kurulu mu kontrol et

Render ve GitHub ile çalışmak için bilgisayarında **Git** programı olmalı.

### 2.1 Kontrol

1. **Mac:** “Terminal” uygulamasını aç (Spotlight’ta “Terminal” yaz).
2. Şunu yaz ve **Enter**’a bas:  
   `git --version`
3. **“git version 2.x.x”** gibi bir satır görürsen Git kurulu demektir → **ADIM 3**e geç.
4. Hata verirse veya “command not found” yazıyorsa Git’i kur:
   - **Mac:** https://git-scm.com/download/mac adresinden indirip kur veya App Store’dan “Xcode Command Line Tools” ara ve kur.
   - Kurduktan sonra Terminal’i kapatıp tekrar aç; tekrar `git --version` yazıp kontrol et.

---

## ADIM 3: Proje klasörünü GitHub’a yüklemek

Bilgisayarındaki GGWP projesini GitHub’da bir “depo” (repository) olarak oluşturacaksın.

### 3.1 GitHub’da yeni depo oluştur

1. https://github.com adresine git, giriş yap.
2. Sağ üstte **“+”** → **“New repository”** tıkla.
3. **Repository name:** `ggwppro` (veya istediğin isim, boşluksuz).
4. **Description** boş bırakabilirsin.
5. **Public** seçili olsun.
6. **“Add a README file”** işaretleme (zaten projede dosyalar var).
7. **“Create repository”** tıkla.
8. Açılan sayfada **“uploading an existing file”** veya **“push an existing repository from the command line”** bölümünü göreceksin. Şimdi bilgisayar tarafına geçiyoruz.

### 3.2 Bilgisayarında projeyi bu depoya bağlamak

1. **Terminal** aç.
2. Proje klasörüne git. Örnek (kendi kullanıcı adını değiştir):
   ```bash
   cd /Users/ergunberkatikkurt/ggwppro
   ```
3. GitHub’a ilk kez bağlanıyorsan kimlik bilgisi isteyebilir. Aşağıdaki komutları **sırayla** yaz (her satırdan sonra Enter).  
   **Not:** `YOUR_GITHUB_USERNAME` yerine kendi GitHub kullanıcı adını, `ggwppro` yerine 3.1’de yazdığın repo adını yaz.

   ```bash
   git init
   git add .
   git commit -m "Ilk yukleme"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ggwppro.git
   git push -u origin main
   ```

4. **Şifre / token:** `git push` dediğinde kullanıcı adı ve şifre isteyebilir. GitHub artık hesap şifresi kabul etmiyor; **Personal Access Token** kullanman gerekir:
   - GitHub’da: Sağ üst **avatar** → **Settings** → sol menüden **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**.
   - Note: `ggwp-push` yaz. Expiration: 90 days veya No expiration. Scope’lardan **repo** işaretle. **Generate token** tıkla.
   - Çıkan token’ı kopyala (bir daha gösterilmez). Terminal’de şifre istenince bu token’ı yapıştır (yazarken görünmez, normal).

**Bitti:** Proje GitHub’da görünüyor olmalı. Tarayıcıda `https://github.com/YOUR_GITHUB_USERNAME/ggwppro` adresini açıp dosyaları görüyorsan ADIM 3 tamam.

---

## ADIM 4: Render’da hesap açmak

Render, backend’ini (API) ücretsiz çalıştıracak sunucu hizmetidir.

1. Tarayıcıda **https://render.com** adresine git.
2. **Get Started for Free** tıkla.
3. **Sign up with GitHub** seç; GitHub hesabınla giriş yap.
4. “Authorize Render” ekranında **Authorize** de.
5. E‑posta doğrulama istenirse e‑postayı onayla.

**Bitti:** Render hesabın hazır.

---

## ADIM 5: Render’da ücretsiz veritabanı (PostgreSQL) açmak

1. Render’da giriş yaptıktan sonra **Dashboard** görünür.
2. **New +** → **PostgreSQL** tıkla.
3. **Name:** `ggwp-db` (veya istediğin isim).
4. **Region:** En yakın bölgeyi seç (örn. Frankfurt).
5. **PostgreSQL Version:** Varsayılan (en son sürüm) kalsın.
6. **Plan:** **Free** seçili olsun.
7. **Create Database** tıkla.
8. Birkaç dakika bekleyeceksin. Oluşunca **Connections** bölümünde **Internal Database URL** satırı çıkar. Yanındaki **Copy** ile kopyala.  
   Bu metin şöyle bir şey olacak:  
   `postgresql://ggwp_xxx:yyy@dpg-xxx-a.oregon-postgres.render.com/ggwp_zzz`  
   Bunu bir yere (Not Defteri) yapıştırıp sakla; bir sonraki adımda kullanacaksın.

**Bitti:** Canlı veritabanın hazır. Bu adımı tamamladıysan ADIM 6’ya geç.

---

## ADIM 6: JWT şifreleri oluşturmak (güvenlik için)

API’nin güvenli çalışması için iki rastgele “gizli anahtar” üreteceksin.

1. **Terminal** aç.
2. Şunu yaz, Enter’a bas:  
   `openssl rand -hex 32`  
   Çıkan uzun harf‑rakam dizisini kopyala (örn. `a1b2c3d4e5...`). Bunu **JWT_SECRET** olarak sakla (Not Defteri’ne yaz).
3. Tekrar yaz:  
   `openssl rand -hex 32`  
   Yeni çıkan farklı diziyi kopyala. Bunu **JWT_REFRESH_SECRET** olarak sakla.

**Bitti:** İki anahtarın da hazır. ADIM 7’de bunları Render’a gireceksin.

---

## ADIM 7: Render’da Web Service (backend API) oluşturmak

1. Render Dashboard’da **New +** → **Web Service** tıkla.
2. **Connect a repository** bölümünde GitHub’daki **ggwppro** (veya verdiğin repo adı) görünmeli. Yanındaki **Connect** tıkla. Görünmüyorsa **Configure account** ile GitHub izinlerini kontrol et.
3. Repo bağlandıktan sonra:
   - **Name:** `ggwp-api` (veya istediğin isim).
   - **Region:** Veritabanıyla aynı bölgeyi seç (örn. Frankfurt).
   - **Branch:** `main`.
   - **Root Directory:** Bu alanı **boş bırak** (Render’da dist’in taşınmaması sorununu önlemek için).
   - **Runtime:** **Node**.
   - **Build Command:** Şunu yaz:  
     `cd server && npm install && npx prisma generate && npm run build`
   - **Start Command:** Şunu yaz:  
     `cd server && npx prisma migrate deploy && npm run start:prod`
4. **Instance Type:** **Free** seçili olsun.
5. **Environment Variables** (Ortam Değişkenleri) bölümüne gel. **Add Environment Variable** ile aşağıdakileri tek tek ekle:

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | ADIM 5’te kopyaladığın Internal Database URL (PostgreSQL bağlantı adresi). |
   | `JWT_SECRET` | ADIM 6’da ilk ürettiğin 64 karakterlik anahtar. |
   | `JWT_REFRESH_SECRET` | ADIM 6’da ikinci ürettiğin 64 karakterlik anahtar. |
   | `PORT` | `3000` yaz. |

6. **Advanced** (Gelişmiş) bölümüne gir. **Release Command** alanına şunu yaz:  
   `npx prisma migrate deploy`  
   (Böylece her deploy’da veritabanı şeması güncellenir.)
7. **Create Web Service** tıkla.

Render, projeyi build edip çalıştıracak. İlk seferde 3–5 dakika sürebilir. Sayfada **Logs** sekmesinden ilerlemeyi izleyebilirsin. Hata varsa kırmızı satırlarda yazar.

**Bitti:** Backend’in canlıda çalışıyor olmalı. ADIM 8’de test edeceksin.

---

## ADIM 8: Canlı API’yi test etmek

1. Render’da Web Service sayfasında üstte **URL** yazar (örn. `https://ggwp-api-xxxx.onrender.com`). Bu adresi kopyala.
2. Tarayıcıda şunu aç (URL’i kendi adresinle değiştir):  
   `https://ggwp-api-xxxx.onrender.com/api/health`  
   Yeşil tikli sayfada `{"ok":true,"timestamp":"..."}` gibi bir metin görürsen API ayakta demektir.
3. **İlk açılış yavaş olabilir:** Ücretsiz planda 15 dakika kullanılmazsa sunucu uyur; ilk istek 30–60 saniye sürebilir. Sayfa sonunda yine `ok: true` görürsen sorun yok.

**Bitti:** Step 1 tamamlandı. Canlı API adresini (örn. `https://ggwp-api-xxxx.onrender.com/api`) bir yere not et; mobil uygulamayı bağlarken (Step 2) bu adresi kullanacaksın.

---

## Özet – Sıra

1. GitHub hesabı aç.
2. Bilgisayarında Git kurulu olsun.
3. Projeyi GitHub’a yükle (repo oluştur + Terminal komutları + gerekirse token).
4. Render hesabı aç (GitHub ile).
5. Render’da PostgreSQL (veritabanı) oluştur, connection URL’i kopyala.
6. Terminal’de iki kez `openssl rand -hex 32` ile JWT anahtarlarını üret.
7. Render’da Web Service oluştur; repo’yu bağla, Root Directory: `server`, Build/Start komutlarını ve environment variable’ları gir.
8. `/api/health` ile test et, API adresini not et.

Takıldığın adımı yazarsan, o adımı birlikte tek tek çözebiliriz.
