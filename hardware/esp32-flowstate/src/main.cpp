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

// DevKit BOOT button for interactive control
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

SPIClass spi(VSPI);
Adafruit_ST7789 tft = Adafruit_ST7789(&spi, TFT_CS, TFT_DC, TFT_RST);

BLEServer* pServer = nullptr;
BLECharacteristic* pTxCharacteristic = nullptr;
bool deviceConnected = false;
bool oldDeviceConnected = false;

String incomingBuffer = "";
String serialBuffer = "";

struct CompanionState {
  String focusTitle = "Electronics Assignment";
  String focusSubtitle = "Problem Set 4";
  int remainingSeconds = 45 * 60;
  int initialSeconds = 45 * 60;
  String status = "IN PROGRESS";
  int energy = 75;
  int capacityMins = 210;
  String keep1 = "Lab Prep";
  String keep2 = "Math PSet";
  String reduceTask = "Physics Notes";
  int moveCount = 3;
  bool isTimerRunning = true;
  bool hasData = false;
};

CompanionState currentState;
unsigned long lastSecondTick = 0;
unsigned long lastButtonCheck = 0;
bool lastButtonState = HIGH;

void renderWaitingScreen();
void renderFullState();
void updateTimerDisplay();

// ==================================================
// 5. BLE CALLBACKS
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
    
    if (doc["focus"].is<const char*>()) {
      currentState.focusTitle = doc["focus"].as<String>();
    }
    if (doc["sub"].is<const char*>()) {
      currentState.focusSubtitle = doc["sub"].as<String>();
    }
    if (doc["mins"].is<int>()) {
      currentState.initialSeconds = doc["mins"].as<int>() * 60;
      currentState.remainingSeconds = currentState.initialSeconds;
    }
    if (doc["status"].is<const char*>()) {
      currentState.status = doc["status"].as<String>();
    }
    if (doc["energy"].is<int>()) {
      currentState.energy = doc["energy"].as<int>();
    }
    if (doc["capacity"].is<int>()) {
      currentState.capacityMins = doc["capacity"].as<int>();
    }
    if (doc["keep1"].is<const char*>()) {
      currentState.keep1 = doc["keep1"].as<String>();
    }
    if (doc["keep2"].is<const char*>()) {
      currentState.keep2 = doc["keep2"].as<String>();
    }
    if (doc["reduce"].is<const char*>()) {
      currentState.reduceTask = doc["reduce"].as<String>();
    }
    if (doc["moveCount"].is<int>()) {
      currentState.moveCount = doc["moveCount"].as<int>();
    }
    if (doc["running"].is<bool>()) {
      currentState.isTimerRunning = doc["running"].as<bool>();
    } else {
      currentState.isTimerRunning = (currentState.status == "IN PROGRESS");
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
  tft.print("Web Bluetooth");

  tft.setTextColor(COLOR_GREY);
  tft.setTextSize(1);
  tft.setCursor(30, 135);
  tft.print("1. Open FlowState Web App");
  tft.setCursor(30, 155);
  tft.print("2. Click 'Connect Device'");
  tft.setCursor(30, 175);
  tft.print("3. Select 'FlowState-Display'");

  tft.setTextColor(COLOR_YELLOW);
  tft.setTextSize(1);
  tft.setCursor(30, 200);
  tft.print("Advertising BLE: Ready");

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

void renderFullState() {
  tft.fillScreen(COLOR_BLACK);
  drawHeader();

  tft.setTextColor(COLOR_CYAN);
  tft.setTextSize(2);
  tft.setCursor(10, 48);
  tft.print("CURRENT FOCUS");

  tft.setTextColor(COLOR_WHITE);
  tft.setTextSize(2);
  
  String title = currentState.focusTitle;
  if (title.length() > 16) {
    int splitIdx = title.lastIndexOf(' ', 16);
    if (splitIdx == -1) splitIdx = 16;
    String line1 = title.substring(0, splitIdx);
    String line2 = title.substring(splitIdx + 1);
    tft.setCursor(10, 74);
    tft.print(line1);
    tft.setCursor(10, 96);
    tft.print(line2.substring(0, 16));
  } else {
    tft.setCursor(10, 74);
    tft.print(title);
  }

  tft.fillRoundRect(10, 126, 220, 58, 6, COLOR_DARKGREY);
  tft.drawRoundRect(10, 126, 220, 58, 6, COLOR_PURPLE);
  updateTimerDisplay();

  uint16_t badgeColor = (currentState.status == "IN PROGRESS") ? COLOR_GREEN :
                        (currentState.status == "REDUCE") ? COLOR_ORANGE : COLOR_CYAN;
  tft.setTextColor(badgeColor);
  tft.setTextSize(2);
  tft.setCursor(10, 196);
  tft.print(currentState.status);

  tft.drawLine(10, 224, 230, 224, COLOR_DARKGREY);
  
  tft.setTextColor(COLOR_GREY);
  tft.setTextSize(1);
  tft.setCursor(10, 232);
  tft.printf("Energy: %d%%  |  Cap: %d hrs", currentState.energy, currentState.capacityMins / 60);

  tft.setTextColor(COLOR_GREEN);
  tft.setCursor(10, 252);
  tft.print("KEEP: ");
  tft.setTextColor(COLOR_WHITE);
  tft.print(currentState.keep1.substring(0, 18));

  if (currentState.keep2.length() > 0) {
    tft.setTextColor(COLOR_GREEN);
    tft.setCursor(10, 268);
    tft.print("KEEP: ");
    tft.setTextColor(COLOR_WHITE);
    tft.print(currentState.keep2.substring(0, 18));
  }

  if (currentState.reduceTask.length() > 0) {
    tft.setTextColor(COLOR_ORANGE);
    tft.setCursor(10, 284);
    tft.print("REDUCE: ");
    tft.setTextColor(COLOR_WHITE);
    tft.print(currentState.reduceTask.substring(0, 16));
  }

  tft.setTextColor(COLOR_GREY);
  tft.setCursor(10, 304);
  tft.printf("Postponed: %d tasks to tomorrow", currentState.moveCount);
}

void updateTimerDisplay() {
  int totalSec = currentState.remainingSeconds;
  if (totalSec < 0) totalSec = 0;
  int m = totalSec / 60;
  int s = totalSec % 60;

  char timeBuf[12];
  snprintf(timeBuf, sizeof(timeBuf), "%02d:%02d", m, s);

  tft.fillRect(20, 134, 200, 42, COLOR_DARKGREY);
  tft.setTextColor(COLOR_YELLOW);
  tft.setTextSize(4);
  tft.setCursor(55, 138);
  tft.print(timeBuf);
}

// ==================================================
// 7. SETUP & MAIN LOOP
// ==================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[FlowState] Initializing Companion Firmware...");

  pinMode(BUTTON_BOOT, INPUT_PULLUP);

  spi.begin(
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

  if (currentState.hasData && currentState.isTimerRunning) {
    if (now - lastSecondTick >= 1000) {
      lastSecondTick = now;
      if (currentState.remainingSeconds > 0) {
        currentState.remainingSeconds--;
        updateTimerDisplay();
      } else {
        currentState.isTimerRunning = false;
        currentState.status = "COMPLETED";
        renderFullState();
        if (pTxCharacteristic && deviceConnected) {
          pTxCharacteristic->setValue("{\"event\":\"timer_done\"}");
          pTxCharacteristic->notify();
        }
      }
    }
  }

  if (now - lastButtonCheck >= 50) {
    lastButtonCheck = now;
    bool btnState = digitalRead(BUTTON_BOOT);
    if (btnState == LOW && lastButtonState == HIGH) {
      Serial.println("[Hardware] BOOT Button Pressed!");
      currentState.isTimerRunning = !currentState.isTimerRunning;
      currentState.status = currentState.isTimerRunning ? "IN PROGRESS" : "PAUSED";
      renderFullState();

      if (pTxCharacteristic && deviceConnected) {
        String msg = currentState.isTimerRunning ? "{\"event\":\"resume\"}" : "{\"event\":\"pause\"}";
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
