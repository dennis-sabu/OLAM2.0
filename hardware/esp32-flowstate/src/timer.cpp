#include "timer.h"
#include "state.h"

LocalFocusTimer focusTimer;

LocalFocusTimer::LocalFocusTimer()
  : running(false), completed(false), totalSeconds(0), remainingSeconds(0),
    lastTickMillis(0), tickCallback(nullptr), completeCallback(nullptr) {}

void LocalFocusTimer::start(int plannedMinutes) {
  totalSeconds = (unsigned long)plannedMinutes * 60;
  remainingSeconds = totalSeconds;
  running = true;
  completed = false;
  lastTickMillis = millis();

  state.sessionTotalSeconds = totalSeconds;
  state.sessionRemainingSeconds = remainingSeconds;
  state.timerRunning = true;
}

void LocalFocusTimer::stop() {
  running = false;
  state.timerRunning = false;
}

void LocalFocusTimer::resume() {
  if (remainingSeconds > 0) {
    running = true;
    lastTickMillis = millis();
    state.timerRunning = true;
  }
}

void LocalFocusTimer::reset() {
  running = false;
  completed = false;
  totalSeconds = 0;
  remainingSeconds = 0;
  state.timerRunning = false;
  state.sessionRemainingSeconds = 0;
}

void LocalFocusTimer::update() {
  if (!running) return;

  unsigned long now = millis();
  if (now - lastTickMillis >= 1000) {
    lastTickMillis = now;

    if (remainingSeconds > 0) {
      remainingSeconds--;
      state.sessionRemainingSeconds = remainingSeconds;

      if (tickCallback) {
        tickCallback(remainingSeconds);
      }
    } else {
      running = false;
      completed = true;
      state.timerRunning = false;

      if (completeCallback) {
        completeCallback();
      }
    }
  }
}

bool LocalFocusTimer::isRunning() const {
  return running;
}

bool LocalFocusTimer::isCompleted() const {
  return completed;
}

unsigned long LocalFocusTimer::getRemainingSeconds() const {
  return remainingSeconds;
}

unsigned long LocalFocusTimer::getElapsedSeconds() const {
  if (totalSeconds >= remainingSeconds) {
    return totalSeconds - remainingSeconds;
  }
  return 0;
}

int LocalFocusTimer::getElapsedMinutes() const {
  unsigned long elapsedSec = getElapsedSeconds();
  int mins = elapsedSec / 60;
  // If at least 30s elapsed, round up to 1 min if 0
  if (mins == 0 && elapsedSec >= 30) return 1;
  return mins;
}

void LocalFocusTimer::onTick(TimerTickCallback cb) {
  tickCallback = cb;
}

void LocalFocusTimer::onComplete(TimerCompleteCallback cb) {
  completeCallback = cb;
}
