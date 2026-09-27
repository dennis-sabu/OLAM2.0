#line 1 "C:\\Users\\denni\\OneDrive\\Documents\\vs code\\websites\\hackethons\\bluebee\\FlowState_H1\\legacy_wifi\\input.h"
#ifndef FLOWSTATE_INPUT_H
#define FLOWSTATE_INPUT_H

#include <Arduino.h>

enum ButtonEvent {
  BTN_NONE,
  BTN_SHORT_PRESS,
  BTN_LONG_PRESS
};

typedef void (*ButtonCallback)(ButtonEvent event);

class InputManager {
public:
  InputManager();
  void init(uint8_t pin = 0);
  void update();
  void onButton(ButtonCallback cb);

private:
  uint8_t buttonPin;
  bool lastState;
  bool isPressed;
  unsigned long pressStartTime;
  bool longPressDispatched;
  ButtonCallback buttonCallback;
};

extern InputManager inputManager;

#endif // FLOWSTATE_INPUT_H
