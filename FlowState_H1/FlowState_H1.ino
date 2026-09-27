/**
 * FlowState Physical Companion Firmware
 * 
 * Hardware Target:
 * - MCU: ESP32-WROOM-32 (Standard ESP32 DevKit)
 * - Display: GMT028-05 V1.1 (2.8" 240x320 TFT, ST7789, Portrait)
 * - Communication: Web Bluetooth (BLE GATT Server) + USB Serial (115200)
 * 
 * Wiring (LOCKED):
 *   GND       -> GND
 *   VCC       -> 3.3V
 *   SCK       -> GPIO 18
 *   SDA/MOSI  -> GPIO 23
 *   RST       -> GPIO 22
 *   DC        -> GPIO 21
 *   CS        -> GPIO 5
 *   MISO      -> NOT CONNECTED
 *   BOOT BTN  -> GPIO 0 (On-board)
 */

#include <Arduino.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>
#include <ArduinoJson.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ==================================================
// 1. HARDWARE PIN DEFINITIONS (LOCKED BASELINE)
// ==================================================
#define TFT_CS    5
#define TFT_DC    21
#define TFT_RST   22
#define TFT_SCLK  18
#define TFT_MOSI  23

#define BUTTON_BOOT 0

// ==================================================
// 2. COLOR DEFINITIONS (16-bit Hex)
// ==================================================
#define COLOR_BLACK    0x0000
#define COLOR_WHITE    0xFFFF
#define COLOR_GREEN    0x07E0
#define COLOR_YELLOW   0xFFE0
#define COLOR_CYAN     0x07FF
#define COLOR_GREY     0x7BEF
#define COLOR_DARKGREY 0x3186
#define COLOR_PURPLE   0x8A3E  // FlowState Primary Violet
#define COLOR_ORANGE   0xFD20

// ==================================================
// 3. BLE GATT UUIDs
// ==================================================
#define SERVICE_UUID           "19b10000-e8f2-537e-4f6c-d104768a1214"
#define CHARACTERISTIC_RX_UUID "19b10001-e8f2-537e-4f6c-d104768a1214" // Web -> ESP32
#define CHARACTERISTIC_TX_UUID "19b10002-e8f2-537e-4f6c-d104768a1214" // ESP32 -> Web

// ==================================================
// 4. DISPLAY & BLE GLOBALS
// ==================================================

// ESP32 Arduino core 3.x removed VSPI/HSPI defines.
// VSPI was SPI bus 3 on classic ESP32 — define it if missing.
#ifndef VSPI
  #define VSPI 3
#endif

SPIClass tftSpi(VSPI);
Adafruit_ST7789 tft = Adafruit_ST7789(&tftSpi, TFT_CS, TFT_DC, TFT_RST);

BLEServer* pServer = nullptr;
BLECharacteristic* pTxCharacteristic = nullptr;
bool deviceConnected = false;
bool oldDeviceConnected = false;

String incomingBuffer = "";
String serialBuffer = "";

struct CompanionState {
  String task1Title = "Electronics Assignment";
  String task1Category = "Academics";
  int task1Mins = 45;
  String task1Status = "IN PROGRESS";

  String task2Title = "Lab Prep & Simulation";
  String task2Category = "Engineering";
  int task2Mins = 30;
  String task2Status = "KEEP";

  int energy = 75;
  int capacityMins = 210;
  String reduceTask = "Physics Notes";
  int moveCount = 2;
  bool hasData = false;
};

CompanionState currentState;
unsigned long lastButtonCheck = 0;
bool lastButtonState = HIGH;

void renderWaitingScreen();
void renderFullState();
void drawWrappedText(String text, int startX, int startY, int maxCharsPerLine, int lineSpacing, uint16_t color, int textSize);

// ==================================================
// 5. BLE CALLBACKS & PAYLOAD PROCESSOR
// ==================================================
class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) override {
    deviceConnected = true;
    Serial.println("[BLE] Web client connected!");
  }

  void onDisconnect(BLEServer* pServer) override {
    deviceConnected = false;
    Serial.println("[BLE] Web client disconnected.");
  }
};

bool processJsonPayload(String jsonStr) {
  JsonDocument doc;
  DeserializationError err = deserializeJson(doc, jsonStr);

  if (!err) {
    Serial.println("[Payload] Valid FlowState JSON received!");
    
    // Top Task #1 (Focus / High Priority)
    if (doc["focus"].is<const char*>()) {
      currentState.task1Title = doc["focus"].as<String>();
    }
    if (doc["sub"].is<const char*>()) {
      currentState.task1Category = doc["sub"].as<String>();
    }
    if (doc["mins"].is<int>()) {
      currentState.task1Mins = doc["mins"].as<int>();
    }
    if (doc["status"].is<const char*>()) {
      currentState.task1Status = doc["status"].as<String>();
    }

    // Top Task #2 (Next Most Important / Keep)
    if (doc["keep1"].is<const char*>() && strlen(doc["keep1"].as<const char*>()) > 0) {
      currentState.task2Title = doc["keep1"].as<String>();
    } else if (doc["t2"].is<const char*>()) {
      currentState.task2Title = doc["t2"].as<String>();
    }
    if (doc["keep1_sub"].is<const char*>()) {
      currentState.task2Category = doc["keep1_sub"].as<String>();
    }
    if (doc["keep1_mins"].is<int>()) {
      currentState.task2Mins = doc["keep1_mins"].as<int>();
    }

    // Capacity & Adaptive recommendations
    if (doc["energy"].is<int>()) {
      currentState.energy = doc["energy"].as<int>();
    }
    if (doc["capacity"].is<int>()) {
      currentState.capacityMins = doc["capacity"].as<int>();
    }
    if (doc["reduce"].is<const char*>()) {
      currentState.reduceTask = doc["reduce"].as<String>();
    }
    if (doc["moveCount"].is<int>()) {
      currentState.moveCount = doc["moveCount"].as<int>();
    }

    currentState.hasData = true;
    renderFullState();
    return true;
  } else {
    Serial.print("[JSON Error] ");
    Serial.println(err.c_str());
    return false;
  }
}

class RxCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) override {
    // ESP32 Arduino 3.x: getValue() returns Arduino String, not std::string
    String rxValue = pCharacteristic->getValue();
    if (rxValue.length() == 0) return;

    incomingBuffer += rxValue;

    int openBrace = incomingBuffer.indexOf('{');
    int closeBrace = incomingBuffer.lastIndexOf('}');

    if (openBrace >= 0 && closeBrace > openBrace) {
      String jsonStr = incomingBuffer.substring(openBrace, closeBrace + 1);
      incomingBuffer = incomingBuffer.substring(closeBrace + 1);

      if (processJsonPayload(jsonStr)) {
        if (pTxCharacteristic) {
          String ack = "{\"status\":\"ok\",\"received\":true}";
          pTxCharacteristic->setValue(ack.c_str());
          pTxCharacteristic->notify();
        }
      }
    }
  }
};

// ==================================================
// 6. UI RENDERING (240x320 PORTRAIT)
// ==================================================
void drawHeader() {
  tft.setTextColor(COLOR_PURPLE);
  tft.setTextSize(2);
  tft.setCursor(10, 12);
  tft.print("FLOWSTATE");

  tft.setTextSize(1);
  if (deviceConnected) {
    tft.fillRect(180, 12, 50, 16, COLOR_DARKGREY);
    tft.drawRect(180, 12, 50, 16, COLOR_GREEN);
    tft.setTextColor(COLOR_GREEN);
    tft.setCursor(187, 16);
    tft.print("BLE ON");
  } else {
    tft.fillRect(175, 12, 55, 16, COLOR_DARKGREY);
    tft.drawRect(175, 12, 55, 16, COLOR_GREY);
    tft.setTextColor(COLOR_GREY);
    tft.setCursor(182, 16);
    tft.print("STANDBY");
  }

  tft.drawLine(10, 34, 230, 34, COLOR_DARKGREY);
}

void renderWaitingScreen() {
  tft.fillScreen(COLOR_BLACK);
  drawHeader();

  tft.setTextColor(COLOR_CYAN);
  tft.setTextSize(2);
  tft.setCursor(10, 52);
  tft.print("READY TO PAIR");

  tft.drawRoundRect(15, 85, 210, 140, 8, COLOR_PURPLE);
  tft.fillRoundRect(16, 86, 208, 138, 7, COLOR_BLACK);

  tft.setTextColor(COLOR_WHITE);
  tft.setTextSize(2);
  tft.setCursor(30, 105);
  tft.print("FlowState Companion");

  tft.setTextColor(COLOR_GREY);
  tft.setTextSize(1);
  tft.setCursor(30, 135);
  tft.print("1. Open FlowState Web App");
  tft.setCursor(30, 155);
  tft.print("2. Click 'Pair Companion'");
  tft.setCursor(30, 175);
  tft.print("3. Web Bluetooth or USB Serial");

  tft.setTextColor(COLOR_YELLOW);
  tft.setTextSize(1);
  tft.setCursor(30, 200);
  tft.print("Waiting for data...");

  tft.setTextColor(COLOR_WHITE);
  tft.setTextSize(1);
  tft.setCursor(20, 250);
  tft.print("Physical Companion for");
  tft.setTextColor(COLOR_PURPLE);
  tft.setTextSize(2);
  tft.setCursor(20, 268);
  tft.print("Adaptive Workload");

  tft.setTextColor(COLOR_DARKGREY);
  tft.setTextSize(1);
  tft.setCursor(20, 302);
  tft.print("ST7789 240x320 | ESP32");
}

void drawWrappedText(String text, int startX, int startY, int maxCharsPerLine, int lineSpacing, uint16_t color, int textSize) {
  tft.setTextColor(color);
  tft.setTextSize(textSize);
  if (text.length() <= maxCharsPerLine) {
    tft.setCursor(startX, startY);
    tft.print(text);
  } else {
    int splitIdx = text.lastIndexOf(' ', maxCharsPerLine);
    if (splitIdx == -1 || splitIdx < 4) splitIdx = maxCharsPerLine;
    String l1 = text.substring(0, splitIdx);
    String l2 = text.substring(splitIdx + 1);
    tft.setCursor(startX, startY);
    tft.print(l1);
    tft.setCursor(startX, startY + lineSpacing);
    if (l2.length() > maxCharsPerLine) {
      tft.print(l2.substring(0, maxCharsPerLine - 2) + "..");
    } else {
      tft.print(l2);
    }
  }
}

void renderFullState() {
  tft.fillScreen(COLOR_BLACK);
  drawHeader();

  // Top stats bar
  tft.setTextColor(COLOR_GREY);
  tft.setTextSize(1);
  tft.setCursor(10, 40);
  tft.printf("Energy: %d%%  |  Cap: %d hrs  |  Postponed: %d", currentState.energy, currentState.capacityMins / 60, currentState.moveCount);
  tft.drawLine(10, 50, 230, 50, COLOR_DARKGREY);

  // ==========================================
  // CARD 1: TOP PRIORITY TASK (#1 FOCUS)
  // ==========================================
  uint16_t card1Border = (currentState.task1Status == "IN PROGRESS") ? COLOR_GREEN : COLOR_PURPLE;
  tft.fillRoundRect(8, 56, 224, 114, 6, COLOR_DARKGREY);
  tft.drawRoundRect(8, 56, 224, 114, 6, card1Border);

  // Card 1 Header Strip
  tft.setTextColor(COLOR_YELLOW);
  tft.setTextSize(1);
  tft.setCursor(16, 64);
  tft.print("#1 FOCUS");

  uint16_t badgeColor = (currentState.task1Status == "IN PROGRESS") ? COLOR_GREEN :
                        (currentState.task1Status == "REDUCE") ? COLOR_ORANGE : COLOR_CYAN;
  tft.setTextColor(badgeColor);
  tft.setCursor(130, 64);
  tft.print(currentState.task1Status.substring(0, 14));

  // Card 1 Title (Size 2, wraps up to 2 lines)
  drawWrappedText(currentState.task1Title, 16, 80, 16, 18, COLOR_WHITE, 2);

  // Card 1 Meta
  tft.drawLine(16, 126, 224, 126, 0x528A);
  tft.setTextColor(COLOR_CYAN);
  tft.setTextSize(1);
  tft.setCursor(16, 134);
  tft.printf("Cat: %s", currentState.task1Category.substring(0, 14).c_str());

  tft.setTextColor(COLOR_YELLOW);
  tft.setCursor(140, 134);
  tft.printf("Est: %d min", currentState.task1Mins);

  tft.setTextColor(COLOR_GREY);
  tft.setCursor(16, 150);
  tft.print("Priority: Top Focus for Today");

  // ==========================================
  // CARD 2: NEXT MOST IMPORTANT TASK (#2 UP NEXT)
  // ==========================================
  tft.fillRoundRect(8, 176, 224, 106, 6, COLOR_DARKGREY);
  tft.drawRoundRect(8, 176, 224, 106, 6, 0x4A69);

  // Card 2 Header Strip
  tft.setTextColor(COLOR_CYAN);
  tft.setTextSize(1);
  tft.setCursor(16, 184);
  tft.print("#2 UP NEXT");

  tft.setTextColor(COLOR_GREEN);
  tft.setCursor(150, 184);
  tft.print("KEEP");

  // Card 2 Title (Size 2, wraps up to 2 lines)
  drawWrappedText(currentState.task2Title, 16, 200, 16, 18, COLOR_WHITE, 2);

  // Card 2 Meta
  tft.drawLine(16, 242, 224, 242, 0x528A);
  tft.setTextColor(COLOR_CYAN);
  tft.setTextSize(1);
  tft.setCursor(16, 250);
  tft.printf("Cat: %s", currentState.task2Category.substring(0, 14).c_str());

  tft.setTextColor(COLOR_YELLOW);
  tft.setCursor(140, 250);
  tft.printf("Est: %d min", currentState.task2Mins);

  tft.setTextColor(COLOR_GREY);
  tft.setCursor(16, 266);
  tft.print("Status: Scheduled after #1");

  // ==========================================
  // FOOTER ADAPTIVE SUMMARY
  // ==========================================
  if (currentState.reduceTask.length() > 0 && currentState.reduceTask != "None") {
    tft.setTextColor(COLOR_ORANGE);
    tft.setTextSize(1);
    tft.setCursor(10, 290);
    tft.printf("REDUCE: %s", currentState.reduceTask.substring(0, 20).c_str());

    tft.setTextColor(COLOR_GREY);
    tft.setCursor(10, 304);
    tft.printf("Adaptive: %d tasks postponed to tomorrow", currentState.moveCount);
  } else {
    tft.setTextColor(COLOR_GREY);
    tft.setTextSize(1);
    tft.setCursor(10, 298);
    tft.printf("Adaptive Plan: %d tasks moved to tomorrow", currentState.moveCount);
  }
}

// ==================================================
// 7. SETUP & MAIN LOOP
// ==================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[FlowState] Initializing Companion Firmware...");

  pinMode(BUTTON_BOOT, INPUT_PULLUP);

  tftSpi.begin(
    TFT_SCLK,
    -1, // MISO unused
    TFT_MOSI,
    TFT_CS
  );

  tft.init(240, 320);
  tft.setRotation(0);

  renderWaitingScreen();

  BLEDevice::init("FlowState-Display");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService* pService = pServer->createService(SERVICE_UUID);

  BLECharacteristic* pRxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_RX_UUID,
    BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
  );
  pRxCharacteristic->setCallbacks(new RxCallbacks());

  pTxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_TX_UUID,
    BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ
  );
  pTxCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[FlowState] BLE Advertising as 'FlowState-Display'");
}

void loop() {
  unsigned long now = millis();

  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("[BLE] Restarted advertising");
    oldDeviceConnected = deviceConnected;
    if (!currentState.hasData) {
      renderWaitingScreen();
    } else {
      drawHeader();
    }
  }

  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
    // Don't set hasData=true here; wait for actual JSON payload to arrive
    // Just update the header to show BLE is connected
    drawHeader();
  }

  // 3. Physical BOOT Button: Toggles Task 1 Focus / In Progress status
  if (now - lastButtonCheck >= 50) {
    lastButtonCheck = now;
    bool btnState = digitalRead(BUTTON_BOOT);
    if (btnState == LOW && lastButtonState == HIGH) {
      Serial.println("[Hardware] BOOT Button Pressed!");
      currentState.task1Status = (currentState.task1Status == "IN PROGRESS") ? "PAUSED" : "IN PROGRESS";
      renderFullState();

      if (pTxCharacteristic && deviceConnected) {
        String msg = (currentState.task1Status == "IN PROGRESS") ? "{\"event\":\"resume\"}" : "{\"event\":\"pause\"}";
        pTxCharacteristic->setValue(msg.c_str());
        pTxCharacteristic->notify();
      }
    }
    lastButtonState = btnState;
  }

  // 4. USB Serial JSON Input (Plugged-in companion)
  while (Serial.available()) {
    char c = (char)Serial.read();
    serialBuffer += c;

    // Guard against unbounded buffer growth (max 1KB)
    if (serialBuffer.length() > 1024) {
      Serial.println("[Serial] Buffer overflow, clearing.");
      serialBuffer = "";
    }

    if (c == '\n' || c == '}') {
      int openBrace = serialBuffer.indexOf('{');
      int closeBrace = serialBuffer.lastIndexOf('}');
      if (openBrace >= 0 && closeBrace > openBrace) {
        String jsonStr = serialBuffer.substring(openBrace, closeBrace + 1);
        serialBuffer = serialBuffer.substring(closeBrace + 1);
        Serial.print("[Serial] Received JSON: ");
        Serial.println(jsonStr);
        if (processJsonPayload(jsonStr)) {
          Serial.println("{\"status\":\"ok\",\"source\":\"serial\"}");
        }
      }
    }
  }

  delay(20);
}