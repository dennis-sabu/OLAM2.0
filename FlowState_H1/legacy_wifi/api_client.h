#ifndef FLOWSTATE_API_CLIENT_H
#define FLOWSTATE_API_CLIENT_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "state.h"

class ApiClient {
public:
  ApiClient();

  // Requests state from /api/device/state
  bool fetchState();

  // Tells server focus session has started
  bool startSession(const String& taskId);

  // Tells server focus session was paused/stopped
  bool stopSession(const String& taskId, int actualMinutes);

  // Tells server task is completed
  bool completeTask(const String& taskId, int actualMinutes, TaskInfo& outNextTask);

private:
  String makeUrl(const String& endpoint) const;
  void setAuthHeaders(HTTPClient& http) const;
};

extern ApiClient apiClient;

#endif // FLOWSTATE_API_CLIENT_H
