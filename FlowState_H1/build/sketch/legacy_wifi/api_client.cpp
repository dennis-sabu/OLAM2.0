#line 1 "C:\\Users\\denni\\OneDrive\\Documents\\vs code\\websites\\hackethons\\bluebee\\FlowState_H1\\legacy_wifi\\api_client.cpp"
#include "api_client.h"
#include "config.h"
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

ApiClient apiClient;

ApiClient::ApiClient() {}

String ApiClient::makeUrl(const String& endpoint) const {
  String base = API_BASE_URL;
  if (base.endsWith("/")) {
    base.remove(base.length() - 1);
  }
  return base + endpoint;
}

void ApiClient::setAuthHeaders(HTTPClient& http) const {
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  http.addHeader("User-Agent", "FlowState-ESP32-S3/1.0");
  http.setTimeout(8000);
}

bool ApiClient::fetchState() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] Cannot fetch state: WiFi not connected");
    return false;
  }

  String url = makeUrl("/api/device/state");
  Serial.print("[API] GET ");
  Serial.println(url);

  HTTPClient http;
  bool isHttps = url.startsWith("https://");
  WiFiClientSecure secureClient;

  if (isHttps) {
    secureClient.setInsecure(); // Accept self-signed or CA certs for IoT simplicity
    http.begin(secureClient, url);
  } else {
    WiFiClient client;
    http.begin(client, url);
  }

  setAuthHeaders(http);

  int httpCode = http.GET();
  Serial.printf("[API] HTTP Response: %d\n", httpCode);

  if (httpCode != HTTP_CODE_OK) {
    String err = http.getString();
    Serial.printf("[API] Error response: %s\n", err.c_str());
    http.end();
    return false;
  }

  String payload = http.getString();
  http.end();

#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument doc;
#else
  DynamicJsonDocument doc(2048);
#endif

  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.print("[API] JSON parsing failed: ");
    Serial.println(err.c_str());
    return false;
  }

  if (doc["task"].isNull()) {
    state.clearTask();
    Serial.println("[API] No pending/in-progress tasks returned.");
    return true;
  }

  JsonObject t = doc["task"];
  TaskInfo task;
  task.id = t["id"].as<String>();
  task.title = t["title"].as<String>();
  task.category = t["category"] | "General";
  task.decision = t["decision"] | "KEEP";
  task.plannedMinutes = t["plannedMinutes"] | 25;
  task.status = t["status"] | "Pending";
  task.valid = true;

  state.updateTask(task);

  if (!doc["nextTask"].isNull()) {
    JsonObject nt = doc["nextTask"];
    state.nextTask.id = nt["id"].as<String>();
    state.nextTask.title = nt["title"].as<String>();
    state.nextTask.category = nt["category"] | "General";
    state.nextTask.decision = nt["decision"] | "KEEP";
    state.nextTask.plannedMinutes = nt["plannedMinutes"] | 25;
    state.nextTask.valid = true;
  } else {
    state.nextTask.valid = false;
  }

  Serial.printf("[API] Synced task: %s (%d mins, %s)\n",
    task.title.c_str(), task.plannedMinutes, task.decision.c_str());

  return true;
}

bool ApiClient::startSession(const String& taskId) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] Session started offline (cached locally)");
    return false;
  }

  String url = makeUrl("/api/device/session/start");
  HTTPClient http;
  bool isHttps = url.startsWith("https://");
  WiFiClientSecure secureClient;

  if (isHttps) {
    secureClient.setInsecure();
    http.begin(secureClient, url);
  } else {
    WiFiClient client;
    http.begin(client, url);
  }

  setAuthHeaders(http);

  String body = "{\"taskId\":\"" + taskId + "\"}";
  int code = http.POST(body);
  http.end();

  Serial.printf("[API] POST /session/start -> %d\n", code);
  return code == HTTP_CODE_OK;
}

bool ApiClient::stopSession(const String& taskId, int actualMinutes) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] Session stopped offline");
    return false;
  }

  String url = makeUrl("/api/device/session/stop");
  HTTPClient http;
  bool isHttps = url.startsWith("https://");
  WiFiClientSecure secureClient;

  if (isHttps) {
    secureClient.setInsecure();
    http.begin(secureClient, url);
  } else {
    WiFiClient client;
    http.begin(client, url);
  }

  setAuthHeaders(http);

  String body = "{\"taskId\":\"" + taskId + "\",\"actualMinutes\":" + String(actualMinutes) + "}";
  int code = http.POST(body);
  http.end();

  Serial.printf("[API] POST /session/stop -> %d\n", code);
  return code == HTTP_CODE_OK;
}

bool ApiClient::completeTask(const String& taskId, int actualMinutes, TaskInfo& outNextTask) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] Complete task called offline");
    return false;
  }

  String url = makeUrl("/api/device/task/complete");
  HTTPClient http;
  bool isHttps = url.startsWith("https://");
  WiFiClientSecure secureClient;

  if (isHttps) {
    secureClient.setInsecure();
    http.begin(secureClient, url);
  } else {
    WiFiClient client;
    http.begin(client, url);
  }

  setAuthHeaders(http);

  String body = "{\"taskId\":\"" + taskId + "\",\"actualMinutes\":" + String(actualMinutes) + "}";
  int code = http.POST(body);

  if (code != HTTP_CODE_OK) {
    Serial.printf("[API] Complete failed with code %d\n", code);
    http.end();
    return false;
  }

  String payload = http.getString();
  http.end();

#if ARDUINOJSON_VERSION_MAJOR >= 7
  JsonDocument doc;
#else
  DynamicJsonDocument doc(2048);
#endif

  DeserializationError err = deserializeJson(doc, payload);
  if (!err && !doc["nextTask"].isNull()) {
    JsonObject nt = doc["nextTask"];
    outNextTask.id = nt["id"].as<String>();
    outNextTask.title = nt["title"].as<String>();
    outNextTask.category = nt["category"] | "General";
    outNextTask.decision = nt["decision"] | "KEEP";
    outNextTask.plannedMinutes = nt["plannedMinutes"] | 25;
    outNextTask.valid = true;
  } else {
    outNextTask.valid = false;
  }

  Serial.println("[API] Task completed successfully on server.");
  return true;
}
