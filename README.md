# RIMAP Terminal BLE — Düzeltilmiş sürüm

Bu sürüm cihaz adı filtresini kaldırır. Bağlan düğmesine basınca çevredeki
BLE cihazları görünür. Listeden **RIMAP OLED** cihazını seç.

## Çalıştırma

```bash
cd rimap-terminal-ble-fixed
python3 -m http.server 8000
```

Chrome veya Edge:

```text
http://localhost:8000
```

## Bağlantıdan önce

1. ESP32 açık olmalı.
2. OLED'de `Baglanti bekleniyor` yazmalı.
3. ESP32 telefondaki nRF Connect uygulamasına bağlı olmamalı.
4. Bilgisayarda Bluetooth açık olmalı.
5. Tarayıcı cihaz penceresinde `RIMAP OLED` seçilmeli; pencere kapatılmamalı.

`RIMAP OLED` görünmüyorsa ESP32'ye yüklenen BLE kodunun seri monitöründe:

```text
RIMAP OLED BLE yayini basladi.
```

mesajı görünmeli.
