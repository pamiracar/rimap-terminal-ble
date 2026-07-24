# RIMAP MESSAGE Web v1.2.0

Firmware eşleşmesi: **RIMAP MESSAGE FW v1.2.0**

## Çalıştırma

```bash
cd rimap-message-web-v1.2.0
python3 -m http.server 8000
```

Chrome veya Edge:

```text
http://localhost:8000
```

## Sürümler

- Web: v1.2.0
- Beklenen ESP32 firmware: v1.2.0

## Bağlantı davranışı

- Web sitesindeki `disconnect --force` düğmesi tarayıcının GATT bağlantısını kapatır.
- ESP32 firmware, bağlantı kesilince OLED durumunu günceller.
- ESP32 otomatik olarak tekrar reklam yayınına başlar ve başka cihazlardan seçilebilir olur.
