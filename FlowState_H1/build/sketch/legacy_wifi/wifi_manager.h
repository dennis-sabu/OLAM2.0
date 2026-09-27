#line 1 "C:\\Users\\denni\\OneDrive\\Documents\\vs code\\websites\\hackethons\\bluebee\\FlowState_H1\\legacy_wifi\\wifi_manager.h"
#ifndef FLOWSTATE_WIFI_MANAGER_H
#define FLOWSTATE_WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>

class WiFiManager {
public:
  WiFiManager();
  bool begin(unsigned long timeoutMs = 15000);
  void update();
  bool isConnected() const;
  String getLocalIP() const;
  int getRSSI() const;

private:
  bool connected;
  unsigned long lastReconnectAttempt;
  unsigned long reconnectInterval;
};

extern WiFiManager wifiManager;

#endif // FLOWSTATE_WIFI_MANAGER_H
