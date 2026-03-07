#!/bin/bash
# GGWP - Komple terminal / cache temizliği. Çalıştırdıktan sonra iki ayrı terminalde server ve expo başlat.

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 1. Portları kullanan süreçleri kapatıyorum (3000, 8081, 19000-19002) ==="
for port in 3000 8081 19000 19001 19002; do
  pid=$(lsof -ti:$port 2>/dev/null) || true
  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null && echo "  Port $port: kapatıldı" || true
  fi
done

echo "=== 2. Expo / Metro / Nest süreçlerini kapatıyorum ==="
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "nest start" 2>/dev/null || true
pkill -f "node.*expo" 2>/dev/null || true
echo "  Tamamlandı."

echo "=== 3. Mobil cache temizleniyor (.expo, node_modules/.cache) ==="
rm -rf "$ROOT/mobile/.expo" "$ROOT/mobile/node_modules/.cache" 2>/dev/null || true
echo "  Tamamlandı."

echo "=== 4. Watchman (varsa) cache ==="
watchman watch-del-all 2>/dev/null && echo "  Watchman cache temizlendi." || echo "  Watchman yok/atlandı."

echo ""
echo "✅ Temizlik bitti. Şimdi iki ayrı terminal aç:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd $ROOT/server && npm run start:dev"
echo ""
echo "  Terminal 2 (Expo - cache temiz başlat):"
echo "    cd $ROOT/mobile && npx expo start -c"
echo ""
