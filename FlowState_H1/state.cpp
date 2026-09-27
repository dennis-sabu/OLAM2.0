#include "state.h"

AppState state;

AppState::AppState() {
  currentScreen = SCREEN_CONNECTING;
  isOnline = false;
  hasTask = false;
  timerRunning = false;
  sessionRemainingSeconds = 0;
  sessionTotalSeconds = 0;

  currentTask.valid = false;
  nextTask.valid = false;
}

void AppState::updateTask(const TaskInfo& task) {
  currentTask = task;
  currentTask.valid = true;
  hasTask = true;
}

void AppState::clearTask() {
  currentTask.valid = false;
  hasTask = false;
  currentTask.id = "";
  currentTask.title = "";
}

void AppState::setOnline(bool online) {
  isOnline = online;
}
