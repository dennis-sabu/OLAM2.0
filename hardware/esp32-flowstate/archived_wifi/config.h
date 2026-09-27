#ifndef FLOWSTATE_CONFIG_H
#define FLOWSTATE_CONFIG_H

#include <Arduino.h>

// ==============================================================================
// 1. NETWORK & API CONFIGURATION
// ==============================================================================

// Replace with your local 2.4 GHz Wi-Fi credentials
#define WIFI_SSID     "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// FlowState Web Server URL (use https://olam-2-0.vercel.app for production, or local IP for dev)
#define API_BASE_URL  "https://olam-2-0.vercel.app"

// Device Authentication Token (Generate this in FlowState Web > Settings > Devices)
#define DEVICE_TOKEN  "fs_dev_replace_with_your_token_from_settings"

// State polling interval (milliseconds) when sitting on Home screen
#define POLLING_INTERVAL_MS 20000

// Wi-Fi connection timeout
#define WIFI_TIMEOUT_MS 15000

// ==============================================================================
// 2. HARDWARE PIN DEFINITIONS (ESP32-S3 + GMT028-05 V1.1 ILI9341 SPI)
// ==============================================================================

// Confirmed GPIO mapping from local User_Setup.h
#define PIN_TFT_SCLK 12  // Display SCK
#define PIN_TFT_MOSI 11  // Display SDA (SPI MOSI, NOT I2C)
#define PIN_TFT_CS   14  // Display CS
#define PIN_TFT_DC    9  // Display DC
#define PIN_TFT_RST  10  // Display RST

// User Input Button
// ESP32-S3 has the onboard BOOT button on GPIO 0 (Active LOW, internal pull-up)
#define PIN_BUTTON_ACTION 0

// Button timing (milliseconds)
#define DEBOUNCE_DELAY_MS   40
#define LONG_PRESS_DELAY_MS 800

// ==============================================================================
// 3. COLOR PALETTE (FlowState Violet Theme - RGB565)
// ==============================================================================

#define COLOR_BG          0x0000 // Deep Black
#define COLOR_PRIMARY     0x79FF // FlowState Violet/Purple (#7b39fc)
#define COLOR_KEEP        0x36B3 // Mint/Emerald Green (#34d399)
#define COLOR_REDUCE      0xFBE4 // Amber/Orange (#fbbf24)
#define COLOR_MOVE        0xABBD // Soft Violet (#a78bfa)
#define COLOR_TEXT_WHITE  0xFFFF // White
#define COLOR_TEXT_MUTED  0x7BEF // Gray (#7c7c8c)
#define COLOR_CARD_BORDER 0x2124 // Subtle glass border (#211f30)

#endif // FLOWSTATE_CONFIG_H
