# EAS Build Nasıl Alınır?

**Önemli:** Build komutlarını **her zaman `mobile` klasörünün içinden** çalıştır.

Yanlış (eski proje çıkar):
```bash
cd ggwppro
eas build --platform android --profile production
```

Doğru:
```bash
cd ggwppro/mobile
eas build --platform android --profile production
```

Veya Cursor/VS Code ile proje kökü `ggwppro` ise:
```bash
cd mobile
eas build --platform android --profile production
```

iOS build:
```bash
cd mobile
eas build --platform ios --profile production --non-interactive
```
