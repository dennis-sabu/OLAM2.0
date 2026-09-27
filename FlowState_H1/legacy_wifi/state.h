#ifndef FLOWSTATE_STATE_H
#define FLOWSTATE_STATE_H

#include <Arduino.h>

enum ScreenState {
  SCREEN_CONNECTING,
  SCREEN_HOME,
  SCREEN_FOCUS,
  SCREEN_COMPLETED,
  SCREEN_OFFLINE
};

struct TaskInfo {
  String id;
  String title;
  String category;
  String decision; // "KEEP", "REDUCE", "MOVE"
  int plannedMinutes;
  String status;
  bool valid;
};

class AppState {
public:
  AppState();

  ScreenState currentScreen;
  TaskInfo currentTask;
  TaskInfo nextTask;

  bool isOnline;
  bool hasTask;
  bool timerRunning;

  unsigned long sessionRemainingSeconds;
  unsigned long sessionTotalSeconds;

  void updateTask(const TaskInfo& task);
  void clearTask();
  void setOnline(bool online);
};

extern AppState state;

#endif // FLOWSTATE_STATE_H
