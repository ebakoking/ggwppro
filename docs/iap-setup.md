# Uygulama İçi Satın Alma (IAP) Kurulumu

## 1. App Store Connect’te Ürünleri Ekleme

### 1.1 Giriş

1. [App Store Connect](https://appstoreconnect.apple.com) → giriş yapın.
2. **My Apps** → **GGWP** uygulamanızı seçin.
3. Sol menüden **Monetization** (veya **Features**) → **In-App Purchases**’a girin.

**Not:** In-App Purchase kullanmak için **Agreements, Tax, and Banking** (Sözleşmeler, Vergi ve Banka) bölümündeki sözleşmelerin imzalanmış olması gerekir. İlk kez IAP ekliyorsanız bu sayfada uyarı çıkabilir; sözleşmeyi tamamlayın.

---

### 1.2 Abonelik Grubu (Premium)

Abonelikler için önce bir **Subscription Group** gerekir.

1. **In-App Purchases** sayfasında **Subscriptions** sekmesine geçin.
2. **Subscription Groups** bölümünde **+** (Create Subscription Group) tıklayın.
3. **Reference Name:** `GGWP Premium` (sadece sizin gördüğünüz isim).
4. **Group Name** (kullanıcıya görünen): örn. `Premium Abonelik`.
5. Kaydedin.

---

### 1.3 Premium Abonelikleri (Haftalık / Aylık)

Aynı grupta iki abonelik oluşturacağız. **Product ID’leri aşağıdaki gibi bire bir yazın;** uygulama ve sunucu bu ID’lere göre çalışıyor.

#### Haftalık Premium

1. Oluşturduğunuz abonelik grubuna girin → **+** ile yeni abonelik ekleyin.
2. **Reference Name:** `Premium Haftalık`.
3. **Product ID:** `com.ggwp.app.premium.weekly`  
   (küçük harf, nokta ile; değiştirmeyin.)
4. **Subscription Duration:** 1 Week.
5. **Price:** İstediğiniz fiyat (örn. 199,90 ₺).
6. **Display Name** (App Store’da): örn. `Haftalık Premium`.
7. **Description:** Kısa açıklama (opsiyonel).
8. Gerekli lokalizasyonları doldurup kaydedin.
9. **Submit for Review** ile incelemeye gönderin (uygulama incelemeye giderken birlikte onaylanır).

#### Aylık Premium

1. Aynı abonelik grubunda tekrar **+** ile yeni abonelik.
2. **Reference Name:** `Premium Aylık`.
3. **Product ID:** `com.ggwp.app.premium.monthly`
4. **Subscription Duration:** 1 Month.
5. **Price:** İstediğiniz fiyat (örn. 399,90 ₺).
6. **Display Name:** örn. `Aylık Premium`.
7. Kaydedin ve gerekirse incelemeye gönderin.

---

### 1.4 Tüketilebilir Ürünler (Pentakill)

1. **In-App Purchases** ana sayfasında **Manage** (veya **+**) → **Consumable** (Tüketilebilir) seçin.

#### Tekli Pentakill

- **Reference Name:** `Pentakill Tekli`
- **Product ID:** `com.ggwp.app.pentakill.single`
- **Price:** örn. 29,90 ₺
- **Display Name:** örn. `1 Pentakill`

#### Takım Savaşı (5’li)

- **Reference Name:** `Pentakill 5’li`
- **Product ID:** `com.ggwp.app.pentakill.pack`
- **Price:** örn. 119,90 ₺
- **Display Name:** örn. `5 Pentakill`

#### Pentakill Serisi (20’li)

- **Reference Name:** `Pentakill 20’li`
- **Product ID:** `com.ggwp.app.pentakill.series`
- **Price:** örn. 399,90 ₺
- **Display Name:** örn. `20 Pentakill`

Her biri için gerekli lokalizasyonları ekleyip kaydedin.

---

### 1.5 App-Specific Shared Secret (Makbuz doğrulama)

Sunucuda Apple makbuzunu doğrulamak için gerekli.

1. App Store Connect’te **My Apps** → **GGWP**.
2. Sol menü **App Information** (veya uygulama sayfasında **App Information** bölümü).
3. **App-Specific Shared Secret** alanına gidin.
4. **Generate** ile yeni secret oluşturun (veya mevcut olanı kopyalayın).
5. Bu değeri sunucu `.env` dosyasına `APPLE_IAP_SHARED_SECRET` olarak ekleyin (aşağıda).

---

### Özet: Product ID’ler (bire bir kullanın)

| Tür            | Product ID                          | Açıklama        |
|----------------|-------------------------------------|-----------------|
| Abonelik       | `com.ggwp.app.premium.weekly`       | Haftalık Premium |
| Abonelik       | `com.ggwp.app.premium.monthly`      | Aylık Premium   |
| Tüketilebilir  | `com.ggwp.app.pentakill.single`    | 1 Pentakill     |
| Tüketilebilir  | `com.ggwp.app.pentakill.pack`      | 5 Pentakill     |
| Tüketilebilir  | `com.ggwp.app.pentakill.series`     | 20 Pentakill    |

## 2. Sunucu (Backend)

`.env` dosyasına ekleyin:

```env
APPLE_IAP_SHARED_SECRET=your_shared_secret_here
```

Makbuz önce production, 21007 dönerse sandbox ile doğrulanır.

## 3. Mobil (Expo)

- **expo-iap** kullanılıyor; **development build** gerekir (Expo Go’da IAP çalışmaz).
- Ürün fiyatları App Store’dan çekilir; yoksa ekrandaki sabit fiyatlar gösterilir.
- Şu an sadece **iOS** satın alma backend’de destekleniyor; Android eklenebilir.

## 4. Test

- TestFlight build ile test edin.
- Cihazda App Store’dan çıkış yapıp, satın alma sırasında **Sandbox** test hesabı ile giriş yapın (App Store Connect → Users and Access → Sandbox → Testers).
