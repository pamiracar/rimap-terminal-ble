# RIMAP Terminal BLE

Terminal görünümünde Web Bluetooth arayüzü.

## Dosyalar

- `index.html`
- `style.css`
- `app.js`

## Çalıştırma

Arayüzü görmek için `index.html` dosyasını açabilirsin.

BLE bağlantısının çalışması için klasörde terminal açıp:

```bash
python3 -m http.server 8000
```

komutunu çalıştır.

Sonra Chrome veya Edge üzerinden:

```text
http://localhost:8000
```

adresini aç.

## ESP32 BLE UUID'leri

Servis:

```text
6E400001-B5A3-F393-E0A9-E50E24DCCA9E
```

RX:

```text
6E400002-B5A3-F393-E0A9-E50E24DCCA9E
```

TX:

```text
6E400003-B5A3-F393-E0A9-E50E24DCCA9E
```
