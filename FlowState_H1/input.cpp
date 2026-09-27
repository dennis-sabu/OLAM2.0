#include "input.h"
#include "config.h"

InputManager inputManager;

InputManager::InputManager()
  : buttonPin(PIN_BUTTON_ACTION),
    lastState(HIGH),
    isPressed(false),
    pressStartTime(0),
    longPressDispatched(false),
    buttonCallback(nullptr) {}

void InputManager::init(uint8_t pin) {
  buttonPin = pin;
  pinMode(buttonPin, INPUT_PULLUP);
  lastState = digitalRead(buttonPin);
}

void InputManager::onButton(ButtonCallback cb) {
  buttonCallback = cb;
}

void InputManager::update() {
  bool currentState = digitalRead(buttonPin);
  unsigned long now = millis();

  // Active LOW button press detection
  if (currentState == LOW && lastState == HIGH) {
    // Just pressed
    isPressed = true;
    pressStartTime = now;
    longPressDispatched = false;
  } else if (currentState == LOW && isPressed) {
    // Button is held down
    if (!longPressDispatched && (now - pressStartTime >= LONG_PRESS_DELAY_MS)) {
      longPressDispatched = true;
      if (buttonCallback) {
        buttonCallback(BTN_LONG_PRESS);
      }
    }
  } else if (currentState == HIGH && lastState == LOW) {
    // Just released
    if (isPressed) {
      isPressed = false;
      unsigned long duration = now - pressStartTime;
      if (duration >= DEBOUNCE_DELAY_MS && !longPressDispatched) {
        if (buttonCallback) {
          buttonCallback(BTN_SHORT_PRESS);
        }
      }
    }
  }

  lastState = currentState;
}
