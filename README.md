# RIMAP MESSAGE Terminal

Gri tonlu terminal arayüzü ve geliştirilmiş Web Bluetooth tanılama sürümü.

## Çalıştırma

```bash
cd rimap-terminal-grey
python3 -m http.server 8000
```

Chrome veya Edge:

```text
http://localhost:8000
```

## macOS'ta seçici anında kapanıyorsa

1. Sistem Ayarları'nı aç.
2. Gizlilik ve Güvenlik bölümüne gir.
3. Bluetooth'u aç.
4. Google Chrome iznini etkinleştir.
5. Chrome'u tamamen kapat: `Cmd + Q`
6. Chrome'u yeniden aç.
7. `http://localhost:8000` adresine tekrar gir.

Ayrıca ESP32 başka bir telefona veya uygulamaya bağlı olmamalı.
