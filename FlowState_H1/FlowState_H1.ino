#include <Arduino.h>
#include "config.h"
#include "state.h"
#include "display.h"
#include "wifi_manager.h"
#include "api_client.h"
#include "timer.h"
#include "input.h"

// Forward declarations
void handleButtonEvent(ButtonEvent event);
void handleTimerTick(unsigned long remainingSeconds);
void handleTimerComplete();
void renderCurrentScreen();

unsigned long lastPollMillis = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n==========================================");
  Serial.println("  FlowState ESP32-S3 Physical Companion   ");
  Serial.println("==========================================");

  // 1. Initialize Display
  display.init();

  // Milestone 1 Verification Screen
  display.showConnecting("Hardware connected.");
  delay(1500);

  // 2. Initialize Hardware Input (BOOT Button on GPIO 0)
  inputManager.init(PIN_BUTTON_ACTION);
  inputManager.onButton(handleButtonEvent);

  // 3. Initialize Focus Timer Callbacks
  focusTimer.onTick(handleTimerTick);
  focusTimer.onComplete(handleTimerComplete);

  // 4. Connect to Wi-Fi
  display.showConnecting("Connecting to Wi-Fi...");
  bool wifiSuccess = wifiManager.begin(WIFI_TIMEOUT_MS);

  if (wifiSuccess) {
    display.showConnecting("Syncing with FlowState API...");
    bool syncSuccess = apiClient.fetchState();

    if (syncSuccess && state.hasTask) {
      state.currentScreen = SCREEN_HOME;
    } else if (syncSuccess && !state.hasTask) {
      state.currentScreen = SCREEN_HOME;
    } else {
      Serial.println("[Setup] API sync failed, continuing to Home screen");
      state.currentScreen = SCREEN_HOME;
    }
  } else {
    Serial.println("[Setup] Starting in Offline mode");
    state.currentScreen = state.hasTask ? SCREEN_HOME : SCREEN_OFFLINE;
  }

  // Render initial screen
  renderCurrentScreen();
  lastPollMillis = millis();
}

void loop() {
  // Update hardware button debouncing and state
  inputManager.update();

  // Update background Wi-Fi connection state
  wifiManager.update();

  // Update local focus countdown timer
  focusTimer.update();

  // Background polling (Only when on Home screen, not during focus)
  if (state.currentScreen == SCREEN_HOME && !state.timerRunning) {
    unsigned long now = millis();
    if (now - lastPollMillis >= POLLING_INTERVAL_MS) {
      lastPollMillis = now;
      if (wifiManager.isConnected()) {
        String prevTaskId = state.currentTask.id;
        bool success = apiClient.fetchState();
        if (success && (prevTaskId != state.currentTask.id || !state.hasTask)) {
          renderCurrentScreen();
        }
      }
    }
  }

  delay(10);
}

void renderCurrentScreen() {
  switch (state.currentScreen) {
    case SCREEN_CONNECTING:
      display.showConnecting("Connecting...");
      break;

    case SCREEN_HOME:
      if (state.hasTask) {
        display.showHome(state.currentTask, state.isOnline);
      } else {
        display.showNoTasks(state.isOnline);
      }
      break;

    case SCREEN_FOCUS:
      display.showFocus(state.currentTask, state.sessionRemainingSeconds);
      break;

    case SCREEN_COMPLETED:
      display.showCompleted(state.currentTask.title, state.nextTask.title);
      break;

    case SCREEN_OFFLINE:
      if (state.hasTask) {
        display.showHome(state.currentTask, false);
      } else {
        display.showOfflineNotice();
      }
      break;
  }
}

void handleTimerTick(unsigned long remainingSeconds) {
  if (state.currentScreen == SCREEN_FOCUS) {
    display.updateTimerDigits(remainingSeconds);
  }
}

void handleTimerComplete() {
  Serial.println("[Timer] Focus session complete!");
  if (state.currentScreen == SCREEN_FOCUS) {
    TaskInfo nextTask;
    apiClient.completeTask(state.currentTask.id, focusTimer.getElapsedMinutes(), nextTask);

    state.nextTask = nextTask;
    state.currentScreen = SCREEN_COMPLETED;
    renderCurrentScreen();
  }
}

void handleButtonEvent(ButtonEvent event) {
  Serial.printf("[Button] Event: %s\n", event == BTN_SHORT_PRESS ? "SHORT" : "LONG");

  if (state.currentScreen == SCREEN_HOME) {
    if (event == BTN_SHORT_PRESS) {
      if (state.hasTask) {
        Serial.println("[Action] Starting focus session...");
        apiClient.startSession(state.currentTask.id);
        focusTimer.start(state.currentTask.plannedMinutes);
        state.currentScreen = SCREEN_FOCUS;
        renderCurrentScreen();
      } else {
        // Refresh state
        Serial.println("[Action] Refreshing task state...");
        apiClient.fetchState();
        renderCurrentScreen();
      }
    }
  }
  else if (state.currentScreen == SCREEN_FOCUS) {
    if (event == BTN_SHORT_PRESS) {
      // Pause / Stop session
      Serial.println("[Action] Pausing/Stopping focus session...");
      focusTimer.stop();
      apiClient.stopSession(state.currentTask.id, focusTimer.getElapsedMinutes());
      state.currentScreen = SCREEN_HOME;
      renderCurrentScreen();
    }
    else if (event == BTN_LONG_PRESS) {
      // Mark task as Completed
      Serial.println("[Action] Marking task complete...");
      focusTimer.stop();
      TaskInfo nextTask;
      apiClient.completeTask(state.currentTask.id, focusTimer.getElapsedMinutes(), nextTask);

      state.nextTask = nextTask;
      state.currentScreen = SCREEN_COMPLETED;
      renderCurrentScreen();
    }
  }
  else if (state.currentScreen == SCREEN_COMPLETED) {
    if (event == BTN_SHORT_PRESS) {
      Serial.println("[Action] Continuing to next task...");
      if (state.nextTask.valid) {
        state.updateTask(state.nextTask);
        state.nextTask.valid = false;
        state.currentScreen = SCREEN_HOME;
        renderCurrentScreen();
      } else {
        // Fetch fresh state from server
        apiClient.fetchState();
        state.currentScreen = SCREEN_HOME;
        renderCurrentScreen();
      }
    }
  }
  else if (state.currentScreen == SCREEN_OFFLINE) {
    if (event == BTN_SHORT_PRESS) {
      Serial.println("[Action] Retrying Wi-Fi in offline screen...");
      wifiManager.begin(5000);
      if (wifiManager.isConnected()) {
        apiClient.fetchState();
        state.currentScreen = SCREEN_HOME;
        renderCurrentScreen();
      }
    }
  }
}