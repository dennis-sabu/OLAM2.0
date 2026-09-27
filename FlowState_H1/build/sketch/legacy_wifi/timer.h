#line 1 "C:\\Users\\denni\\OneDrive\\Documents\\vs code\\websites\\hackethons\\bluebee\\FlowState_H1\\legacy_wifi\\timer.h"
#ifndef FLOWSTATE_TIMER_H
#define FLOWSTATE_TIMER_H

#include <Arduino.h>

typedef void (*TimerTickCallback)(unsigned long remainingSeconds);
typedef void (*TimerCompleteCallback)();

class LocalFocusTimer {
public:
  LocalFocusTimer();

  void start(int plannedMinutes);
  void stop();
  void resume();
  void reset();
  void update();

  bool isRunning() const;
  bool isCompleted() const;
  unsigned long getRemainingSeconds() const;
  unsigned long getElapsedSeconds() const;
  int getElapsedMinutes() const;

  void onTick(TimerTickCallback cb);
  void onComplete(TimerCompleteCallback cb);

private:
  bool running;
  bool completed;
  unsigned long totalSeconds;
  unsigned long remainingSeconds;
  unsigned long lastTickMillis;

  TimerTickCallback tickCallback;
  TimerCompleteCallback completeCallback;
};

extern LocalFocusTimer focusTimer;

#endif // FLOWSTATE_TIMER_H
