#line 1 "C:\\Users\\denni\\OneDrive\\Documents\\vs code\\websites\\hackethons\\bluebee\\FlowState_H1\\legacy_wifi\\display.h"
#ifndef FLOWSTATE_DISPLAY_H
#define FLOWSTATE_DISPLAY_H

#include <Arduino.h>
#include <TFT_eSPI.h>
#include "state.h"

class DisplayManager {
public:
  DisplayManager();
  void init();

  void showConnecting(const String& message);
  void showHome(const TaskInfo& task, bool isOnline);
  void showNoTasks(bool isOnline);
  void showFocus(const TaskInfo& task, unsigned long remainingSeconds);
  void updateTimerDigits(unsigned long remainingSeconds);
  void showCompleted(const String& completedTitle, const String& nextTitle);
  void showOfflineNotice();

private:
  TFT_eSPI tft;
  unsigned long lastRenderedSeconds;

  void drawHeader(const String& subtitle, bool isOnline);
  void drawDecisionBadge(const String& decision, int x, int y);
  uint16_t getDecisionColor(const String& decision);
};

extern DisplayManager display;

#endif // FLOWSTATE_DISPLAY_H
