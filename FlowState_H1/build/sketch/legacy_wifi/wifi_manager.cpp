#line 1 "C:\\Users\\denni\\OneDrive\\Documents\\vs code\\websites\\hackethons\\bluebee\\FlowState_H1\\legacy_wifi\\wifi_manager.cpp"
#include "wifi_manager.h"
#include "config.h"
#include "state.h"

WiFiManager wifiManager;

WiFiManager::WiFiManager()
  : connected(false), lastReconnectAttempt(0), reconnectInterval(5000) {}

bool WiFiManager::begin(unsigned long timeoutMs) {
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  Serial.print("[WiFi] Connecting to SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start < timeoutMs)) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    connected = true;
    reconnectInterval = 5000;
    state.setOnline(true);
    Serial.print("[WiFi] Connected! IP: ");
    Serial.println(WiFi.localIP());
    return true;
  } else {
    connected = false;
    state.setOnline(false);
    Serial.println("[WiFi] Connection timeout, proceeding in offline mode.");
    return false;
  }
}

void WiFiManager::update() {
  wl_status_t status = WiFi.status();

  if (status == WL_CONNECTED) {
    if (!connected) {
      connected = true;
      state.setOnline(true);
      reconnectInterval = 5000;
      Serial.print("[WiFi] Reconnected! IP: ");
      Serial.println(WiFi.localIP());
    }
  } else {
    if (connected) {
      connected = false;
      state.setOnline(false);
      Serial.println("[WiFi] Disconnected.");
    }

    // Attempt non-blocking reconnection with backoff (capped at 60s)
    unsigned long now = millis();
    if (now - lastReconnectAttempt >= reconnectInterval) {
      lastReconnectAttempt = now;
      Serial.println("[WiFi] Attempting background reconnect...");
      WiFi.reconnect();
      
      // Step backoff up to 60s
      if (reconnectInterval < 60000) {
        reconnectInterval = min(reconnectInterval * 2, (unsigned long)60000);
      }
    }
  }
}

bool WiFiManager::isConnected() const {
  return connected && (WiFi.status() == WL_CONNECTED);
}

String WiFiManager::getLocalIP() const {
  if (isConnected()) {
    return WiFi.localIP().toString();
  }
  return "0.0.0.0";
}

int WiFiManager::getRSSI() const {
  return WiFi.RSSI();
}
