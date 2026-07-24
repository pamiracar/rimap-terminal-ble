#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define FIRMWARE_VERSION "1.2.2"
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDRESS 0x3C
#define OLED_RESET -1
#define OLED_SDA 21
#define OLED_SCL 22
#define SERVICE_UUID "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define RX_CHARACTERISTIC_UUID "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define TX_CHARACTERISTIC_UUID "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
#define DISCONNECT_COMMAND "__RIMAP_DISCONNECT__"

Adafruit_SH1106G display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

BLEServer* bleServer = nullptr;
BLECharacteristic* rxCharacteristic = nullptr;
BLECharacteristic* txCharacteristic = nullptr;

volatile bool cihazBagli = false;
volatile bool yeniMesajVar = false;
volatile bool baglandiOlayiVar = false;
volatile bool kesildiOlayiVar = false;
volatile bool webKesmeKomutuVar = false;

String gelenMesaj = "";
String ekrandakiMesaj = "Cihazdan mesaj bekleniyor...";

enum EkranDurumu {
  DURUM_BEKLENIYOR,
  DURUM_BAGLI,
  DURUM_KESILDI
};

EkranDurumu ekranDurumu = DURUM_BEKLENIYOR;

unsigned long baglantiKesilmeZamani = 0;
const unsigned long KESILDI_MESAJ_SURESI = 1500;

void ortaliYaz(const String& metin, int y, int boyut) {
  display.setTextSize(boyut);
  int genislik = metin.length() * 6 * boyut;
  int x = (SCREEN_WIDTH - genislik) / 2;
  if (x < 0) x = 0;
  display.setCursor(x, y);
  display.print(metin);
}

String metniTemizle(String metin) {
  metin.replace("\r", " ");
  metin.replace("\n", " ");
  metin.replace("\t", " ");
  while (metin.indexOf("  ") >= 0) metin.replace("  ", " ");
  metin.trim();
  return metin;
}

void mesajAlaniniTemizle() {
  gelenMesaj = "";
  ekrandakiMesaj = "Cihazdan mesaj bekleniyor...";
}

void mesajiYazdir(String mesaj, int baslangicY) {
  const int SATIR_KARAKTERI = 21;
  const int MAKSIMUM_SATIR = 3;
  mesaj = metniTemizle(mesaj);
  display.setTextSize(1);
  display.setTextColor(SH110X_WHITE);
  int mevcutKonum = 0;
  int satirNumarasi = 0;

  while (mevcutKonum < mesaj.length() && satirNumarasi < MAKSIMUM_SATIR) {
    int kalanKarakter = mesaj.length() - mevcutKonum;
    int alinacakKarakter = min(SATIR_KARAKTERI, kalanKarakter);
    int satirSonu = mevcutKonum + alinacakKarakter;

    if (satirSonu < mesaj.length() && mesaj.charAt(satirSonu) != ' ') {
      int boslukKonumu = mesaj.lastIndexOf(' ', satirSonu);
      if (boslukKonumu > mevcutKonum) satirSonu = boslukKonumu;
    }

    String satirMetni = mesaj.substring(mevcutKonum, satirSonu);
    satirMetni.trim();
    display.setCursor(2, baslangicY + satirNumarasi * 9);
    display.print(satirMetni);
    mevcutKonum = satirSonu;

    while (mevcutKonum < mesaj.length() && mesaj.charAt(mevcutKonum) == ' ') {
      mevcutKonum++;
    }

    satirNumarasi++;
  }

  if (mevcutKonum < mesaj.length()) {
    display.fillRect(108, baslangicY + 18, 20, 9, SH110X_BLACK);
    display.setCursor(108, baslangicY + 18);
    display.print("...");
  }
}

String durumMetni() {
  switch (ekranDurumu) {
    case DURUM_BAGLI:
      return "Cihaz bagli";
    case DURUM_KESILDI:
      return "Baglanti kesildi";
    case DURUM_BEKLENIYOR:
    default:
      return "Baglanti bekleniyor";
  }
}

void anaEkraniCiz() {
  display.clearDisplay();
  display.setTextColor(SH110X_WHITE);
  display.setTextSize(1);
  display.setCursor(2, 2);
  display.print("RIMAP MESSAGE");

  if (cihazBagli) {
    display.fillCircle(122, 5, 3, SH110X_WHITE);
  } else {
    display.drawCircle(122, 5, 3, SH110X_WHITE);
  }

  display.drawLine(0, 12, 127, 12, SH110X_WHITE);
  display.setCursor(2, 16);
  display.print(durumMetni());
  display.drawLine(0, 26, 127, 26, SH110X_WHITE);
  mesajiYazdir(ekrandakiMesaj, 29);
  display.drawLine(0, 54, 127, 54, SH110X_WHITE);
  display.setCursor(2, 56);
  display.print("FW v");
  display.print(FIRMWARE_VERSION);
  display.setCursor(91, 56);
  display.print(cihazBagli ? "ONLINE" : "READY");
  display.display();
}

void acilisEkrani() {
  display.clearDisplay();
  display.setTextColor(SH110X_WHITE);
  display.drawRoundRect(2, 2, 124, 60, 5, SH110X_WHITE);
  ortaliYaz("RIMAP", 12, 2);
  ortaliYaz("MESSAGE", 32, 2);
  ortaliYaz("FW v" FIRMWARE_VERSION, 52, 1);
  display.display();
  delay(1500);
}

class SunucuCallback : public BLEServerCallbacks {
  void onConnect(BLEServer* server) override {
    cihazBagli = true;
    baglandiOlayiVar = true;
    Serial.println("BLE cihaz baglandi.");
  }

  void onDisconnect(BLEServer* server) override {
    cihazBagli = false;
    kesildiOlayiVar = true;
    Serial.println("BLE baglantisi kesildi.");
  }
};

class MesajCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* characteristic) override {
    String veri = characteristic->getValue();
    if (veri.length() == 0) return;

    veri = metniTemizle(veri);

    if (veri == DISCONNECT_COMMAND) {
      webKesmeKomutuVar = true;
      Serial.println("Web sitesinden baglanti kesme komutu geldi.");
      return;
    }

    if (veri.length() > 120) veri = veri.substring(0, 120);
    if (veri.length() == 0) return;

    gelenMesaj = veri;
    yeniMesajVar = true;
    Serial.print("Gelen mesaj: ");
    Serial.println(gelenMesaj);
  }
};

void reklamiBaslat() {
  if (bleServer == nullptr || cihazBagli) return;
  BLEDevice::getAdvertising()->start();
  Serial.println("BLE reklami yeniden baslatildi.");
}

void bleBaslat() {
  BLEDevice::init("RIMAP MESSAGE");
  BLEDevice::setMTU(185);

  bleServer = BLEDevice::createServer();
  bleServer->setCallbacks(new SunucuCallback());

  BLEService* mesajServisi = bleServer->createService(SERVICE_UUID);

  txCharacteristic = mesajServisi->createCharacteristic(
    TX_CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_NOTIFY
  );

  txCharacteristic->addDescriptor(new BLE2902());

  rxCharacteristic = mesajServisi->createCharacteristic(
    RX_CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_WRITE_NR
  );

  rxCharacteristic->setCallbacks(new MesajCallback());
  mesajServisi->start();

  BLEAdvertising* advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  advertising->setMinPreferred(0x06);
  advertising->setMaxPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.print("RIMAP MESSAGE FW v");
  Serial.println(FIRMWARE_VERSION);
  Serial.println("BLE yayini basladi.");
}

void mesajAlindiBildirimiGonder() {
  if (!cihazBagli || txCharacteristic == nullptr) return;
  String cevap = "Mesaj OLED ekraninda gosterildi";
  txCharacteristic->setValue(cevap.c_str());
  txCharacteristic->notify();
}

void baglandiOlayiniIsle() {
  if (!baglandiOlayiVar) return;
  baglandiOlayiVar = false;
  cihazBagli = true;
  ekranDurumu = DURUM_BAGLI;
  mesajAlaniniTemizle();
  anaEkraniCiz();
  Serial.println("OLED: Cihaz bagli");
}

void kesildiOlayiniIsle() {
  if (!kesildiOlayiVar) return;
  kesildiOlayiVar = false;
  cihazBagli = false;
  ekranDurumu = DURUM_KESILDI;
  baglantiKesilmeZamani = millis();
  mesajAlaniniTemizle();
  anaEkraniCiz();
  Serial.println("OLED: Baglanti kesildi");
  delay(250);
  reklamiBaslat();
}

void webKesmeKomutunuIsle() {
  if (!webKesmeKomutuVar) return;
  webKesmeKomutuVar = false;
  cihazBagli = false;
  ekranDurumu = DURUM_KESILDI;
  baglantiKesilmeZamani = millis();
  mesajAlaniniTemizle();
  anaEkraniCiz();
  Serial.println("OLED: Web sitesinden baglanti kesildi");
}

void kesildiMesajiniKontrolEt() {
  if (ekranDurumu != DURUM_KESILDI) return;
  if (millis() - baglantiKesilmeZamani < KESILDI_MESAJ_SURESI) return;

  ekranDurumu = DURUM_BEKLENIYOR;
  mesajAlaniniTemizle();
  anaEkraniCiz();
  Serial.println("OLED: Baglanti bekleniyor");
}

void setup() {
  Serial.begin(115200);
  delay(300);

  Wire.begin(OLED_SDA, OLED_SCL);
  Wire.setClock(100000);

  if (!display.begin(OLED_ADDRESS, true)) {
    Serial.println("SH1106 OLED bulunamadi.");
    while (true) delay(1000);
  }

  display.clearDisplay();
  display.setTextColor(SH110X_WHITE);
  display.display();

  acilisEkrani();
  ekranDurumu = DURUM_BEKLENIYOR;
  mesajAlaniniTemizle();
  anaEkraniCiz();
  bleBaslat();
}

void loop() {
  baglandiOlayiniIsle();
  webKesmeKomutunuIsle();
  kesildiOlayiniIsle();
  kesildiMesajiniKontrolEt();

  if (yeniMesajVar) {
    yeniMesajVar = false;
    ekrandakiMesaj = gelenMesaj;
    anaEkraniCiz();
    mesajAlindiBildirimiGonder();
  }

  delay(20);
}