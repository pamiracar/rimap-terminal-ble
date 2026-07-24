# RIMAP MESSAGE Web v1.2.1

Bu sürümde site bağlantıyı kesmeden önce ESP32'ye:

```text
__RIMAP_DISCONNECT__
```

kontrol komutunu yollar.

ESP32 bu komutu alınca:

1. OLED'de `Baglanti kesildi` gösterir.
2. İstemci bağlantısını ESP32 tarafından kapatır.
3. BLE reklamını yeniden başlatır.
4. Başka cihazların ESP32'yi seçebilmesini sağlar.

## Çalıştırma

```bash
cd rimap-message-web-v1.2.1
python3 -m http.server 8000
```

Tarayıcı:

```text
http://localhost:8000
```
