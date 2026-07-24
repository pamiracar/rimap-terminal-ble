# RIMAP MESSAGE

<p align="center">
  ESP32 ve SH1106 OLED ekran kullanılarak geliştirilen, Web Bluetooth üzerinden kablosuz mesaj göndermeye yarayan modern bir BLE mesajlaşma projesi.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ESP32-BLE-111111?style=for-the-badge&logo=espressif" alt="ESP32">
  <img src="https://img.shields.io/badge/OLED-SH1106-2f2f2f?style=for-the-badge" alt="SH1106 OLED">
  <img src="https://img.shields.io/badge/Web-Bluetooth-4b4b4b?style=for-the-badge&logo=googlechrome" alt="Web Bluetooth">
  <img src="https://img.shields.io/badge/Firmware-v1.2.2-666666?style=for-the-badge" alt="Firmware v1.2.2">
  <img src="https://img.shields.io/badge/Web-v1.2.1-888888?style=for-the-badge" alt="Web v1.2.1">
</p>

<p align="center">
  <a href="https://rimapble.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo-rimapble.vercel.app-d9d9d9?style=for-the-badge&logo=vercel&logoColor=000000" alt="RIMAP MESSAGE Live Demo">
  </a>
</p>

<p align="center">
  <strong>Canlı uygulama:</strong>
  <a href="https://rimapble.vercel.app">rimapble.vercel.app</a>
</p>

---

## Proje Hakkında

**RIMAP MESSAGE**, bir bilgisayar veya mobil cihazdaki web arayüzünden ESP32'ye Bluetooth Low Energy üzerinden mesaj göndermeyi sağlar.

Gönderilen mesaj ESP32 tarafından alınır ve bağlı olan SH1106 OLED ekranda gösterilir. Web arayüzü klasik bir uygulama görünümü yerine terminal temalı, sade ve gri tonlarda tasarlanmıştır.

Proje iki bağımsız bölümden oluşur:

- **ESP32 firmware**
- **Web Bluetooth arayüzü**

Bu iki bölüm ayrı ayrı sürümlenir.

---

## Özellikler

- Web Bluetooth üzerinden kablosuz mesaj gönderme
- SH1106 128x64 OLED ekran desteği
- ESP32 BLE sunucu modu
- Nordic UART Service uyumlu UUID yapısı
- Tarayıcı üzerinden cihaz seçme
- Terminal temalı web arayüzü
- Canlı bağlantı durumu
- OLED ekran ön izlemesi
- Mesaj geçmişi
- Hızlı mesaj butonları
- ESP32'den web sitesine bildirim gönderme
- Bağlantı kesildiğinde OLED durumunu güncelleme
- Bağlantı kesildiğinde son mesajı temizleme
- ESP32'nin bağlantı sonrasında tekrar reklam yayınına başlaması
- Firmware ve web sürüm numarası gösterimi
- Masaüstü ve mobil ekranlara uyumlu tasarım

---

## Sistem Mimarisi

```text
┌──────────────────────────────┐
│ Bilgisayar / Mobil Tarayıcı  │
│ RIMAP MESSAGE Web Arayüzü    │
│ Chrome / Edge                │
└──────────────┬───────────────┘
               │ Web Bluetooth / BLE
┌──────────────▼───────────────┐
│ ESP32                        │
│ RIMAP MESSAGE Firmware       │
│ BLE Server                   │
└──────────────┬───────────────┘
               │ I2C
┌──────────────▼───────────────┐
│ SH1106 OLED                  │
│ 128x64                       │
│ Mesaj ve bağlantı durumu     │
└──────────────────────────────┘
```

---

## Kullanılan Donanımlar

| Donanım | Açıklama |
|---|---|
| ESP32 | Klasik ESP32 geliştirme kartı |
| SH1106 OLED | 128x64 I2C OLED ekran |

---

## OLED Bağlantıları

| SH1106 OLED | ESP32 |
|---|---|
| VCC | 3V3 |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

```text
SH1106 OLED        ESP32
-----------        -----
VCC      ────────  3V3
GND      ────────  GND
SDA      ────────  GPIO 21
SCL      ────────  GPIO 22
```

---

## Yazılım Gereksinimleri

### ESP32 tarafı

- Arduino IDE
- ESP32 board package
- Adafruit GFX Library
- Adafruit SH110X
- ESP32 ile birlikte gelen BLE kütüphaneleri

### Web tarafı

- Google Chrome veya Microsoft Edge
- Bluetooth destekli cihaz
- Yerel sunucu veya HTTPS bağlantısı
- Python 3 önerilir

---

## Arduino Kütüphaneleri

Arduino IDE içinde:

```text
Tools > Manage Libraries
```

bölümünden aşağıdaki kütüphaneleri yükle:

```text
Adafruit GFX Library
Adafruit SH110X
```

BLE kütüphaneleri ESP32 kart paketiyle birlikte gelir:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
```

---

## ESP32 Kurulumu

1. Arduino IDE'yi aç.
2. ESP32 kart paketini yükle.
3. Doğru ESP32 kartını seç.
4. OLED ekranı bağlantı tablosuna göre bağla.
5. Firmware kodunu Arduino IDE'ye yapıştır.
6. Doğru seri portu seç.
7. Kodu ESP32'ye yükle.
8. Seri Monitör'ü `115200 baud` hızında aç.

Başarılı açılışta seri monitörde:

```text
RIMAP MESSAGE FW v1.2.2
BLE yayini basladi.
```

OLED ekranında:

```text
RIMAP MESSAGE
Baglanti bekleniyor
Cihazdan mesaj bekleniyor...
FW v1.2.2
```

---

## Canlı Demo

RIMAP MESSAGE web arayüzünün yayınlanmış sürümüne doğrudan erişebilirsin:

### [rimapble.vercel.app](https://rimapble.vercel.app)

Vercel üzerinden yayınlanan sürüm HTTPS kullandığı için Web Bluetooth için gerekli olan güvenli bağlantı şartını karşılar. Tarayıcıda uygulamayı açtıktan sonra `connect --device RIMAP` butonunu kullanarak ESP32'ye bağlanabilirsin.

> Web Bluetooth desteği için Google Chrome veya Microsoft Edge kullanılması önerilir.

---

## Web Arayüzünü Çalıştırma

Web Bluetooth doğrudan `file://` üzerinden açılan sayfalarda düzgün çalışmayabilir. Projeyi `localhost` üzerinden çalıştır:

```bash
python3 -m http.server 8000
```

Ardından Chrome veya Edge üzerinden:

```text
http://localhost:8000
```

---

## Kullanım

1. ESP32'yi çalıştır.
2. [rimapble.vercel.app](https://rimapble.vercel.app) adresini Chrome veya Edge ile aç.
3. `connect --device RIMAP` butonuna bas.
4. Açılan listeden `RIMAP MESSAGE` cihazını seç.
5. Mesaj kutusuna metin yaz.
6. `send --oled` butonuna bas.
7. Mesaj OLED ekranda görünür.
8. Bağlantıyı sonlandırmak için `disconnect --force` butonunu kullan.

Klavye kısayolu:

```text
Ctrl + Enter
```

macOS:

```text
Command + Enter
```

---

## BLE UUID Yapısı

### Servis UUID

```text
6E400001-B5A3-F393-E0A9-E50E24DCCA9E
```

### RX Characteristic

Web arayüzünden ESP32'ye veri gönderir.

```text
6E400002-B5A3-F393-E0A9-E50E24DCCA9E
```

### TX Characteristic

ESP32'den web arayüzüne bildirim gönderir.

```text
6E400003-B5A3-F393-E0A9-E50E24DCCA9E
```

---

## Özel Bağlantı Kesme Komutu

Web sitesi bağlantıyı kesmeden önce ESP32'ye şu komutu gönderir:

```text
__RIMAP_DISCONNECT__
```

ESP32 bu komutu aldığında:

1. OLED ekranında `Baglanti kesildi` gösterir.
2. Son gönderilen mesajı temizler.
3. Mesaj alanını varsayılan duruma getirir.
4. BLE bağlantı durumunu günceller.
5. Reklam yayınını yeniden başlatır.
6. Başka cihazların ESP32'yi tekrar seçebilmesini sağlar.

---

## OLED Durumları

### Bağlantı bekleniyor

```text
RIMAP MESSAGE
Baglanti bekleniyor
Cihazdan mesaj bekleniyor...
FW v1.2.2          READY
```

### Cihaz bağlı

```text
RIMAP MESSAGE
Cihaz bagli
Cihazdan mesaj bekleniyor...
FW v1.2.2         ONLINE
```

### Mesaj alındı

```text
RIMAP MESSAGE
Cihaz bagli
Merhaba!
FW v1.2.2         ONLINE
```

### Bağlantı kesildi

```text
RIMAP MESSAGE
Baglanti kesildi
Cihazdan mesaj bekleniyor...
FW v1.2.2          READY
```

---

## Proje Klasör Yapısı

```text
RIMAP-MESSAGE/
├── firmware/
│   └── rimap_message.ino
├── web/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── assets/
│   ├── web-terminal.png
│   ├── oled-connected.jpg
│   └── oled-message.jpg
├── LICENSE
└── README.md
```

---

## Sürüm Sistemi

ESP32 firmware ve web arayüzü birbirinden bağımsız sürümlenir.

| Bileşen | Sürüm |
|---|---|
| ESP32 Firmware | `v1.2.2` |
| Web Arayüzü | `v1.2.1` |

Sadece ESP32 değişirse:

```text
Firmware: v1.2.2 → v1.2.3
Web: v1.2.1
```

Sadece site değişirse:

```text
Firmware: v1.2.2
Web: v1.2.1 → v1.2.2
```

---

## Sürüm Geçmişi

### Firmware v1.2.2

- Bağlantı kesildiğinde son mesaj temizleniyor.
- OLED mesaj alanı varsayılan metne dönüyor.
- Firmware sürümü OLED alt kısmında gösteriliyor.

### Firmware v1.2.1

- Web arayüzünden özel bağlantı kesme komutu desteği eklendi.
- Bağlantı kesildiğinde OLED durumu güncelleniyor.
- BLE reklamının yeniden başlatılması iyileştirildi.

### Firmware v1.2.0

- Firmware sürüm sistemi eklendi.
- OLED alt durum çubuğu eklendi.
- Bağlantı durumları geliştirildi.

### Web v1.2.1

- ESP32'ye özel bağlantı kesme komutu gönderme eklendi.
- Bağlantı temizleme akışı geliştirildi.
- Web ve firmware sürüm bilgileri ayrıldı.

### Web v1.2.0

- Gri tonlu terminal tasarımı eklendi.
- Cihaz bilgileri paneli geliştirildi.
- Mesaj geçmişi ve OLED ön izlemesi eklendi.

---

## Sorun Giderme

### Bluetooth seçici açılmıyor

- Chrome veya Edge kullan.
- Sayfayı `localhost` üzerinden aç.
- Bilgisayar Bluetooth'unu etkinleştir.
- Tarayıcı Bluetooth iznini kontrol et.
- ESP32'nin başka bir cihaza bağlı olmadığından emin ol.

### macOS üzerinde seçici hemen kapanıyor

```text
Sistem Ayarları
Gizlilik ve Güvenlik
Bluetooth
Google Chrome
```

Chrome iznini etkinleştir, ardından Chrome'u `Command + Q` ile tamamen kapatıp yeniden aç.

### ESP32 listede görünmüyor

- Seri monitörde `BLE yayini basladi.` yazdığını kontrol et.
- nRF Connect bağlantısını kapat.
- ESP32'yi yeniden başlat.
- Bluetooth'u kapatıp tekrar aç.

### OLED açılmıyor

- OLED adresinin `0x3C` olduğunu kontrol et.
- SDA bağlantısını GPIO 21'e bağla.
- SCL bağlantısını GPIO 22'ye bağla.
- VCC için 3V3 kullan.
- Adafruit SH110X kütüphanesinin kurulu olduğundan emin ol.

### Mesaj OLED'e gelmiyor

- Web arayüzünde bağlantının `ONLINE` olduğunu kontrol et.
- ESP32 ve web UUID değerlerinin aynı olduğundan emin ol.
- Seri monitörde gelen mesajın görünüp görünmediğini kontrol et.
- Tarayıcı geliştirici konsolunu incele.

---

## Güvenlik Notları

Bu proje eğitim ve yerel kullanım amacıyla geliştirilmiştir.

- Uygulama katmanı kimlik doğrulaması bulunmaz.
- Yakındaki uygun bir BLE istemcisi servise bağlanabilir.
- Hassas veya kişisel veri göndermek için tasarlanmamıştır.
- Üretim ortamında kullanılacaksa kimlik doğrulama ve güvenli mesajlaşma eklenmelidir.

---
