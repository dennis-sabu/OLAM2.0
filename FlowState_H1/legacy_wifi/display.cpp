#include "display.h"
#include "config.h"

DisplayManager display;

DisplayManager::DisplayManager() : tft(TFT_eSPI()), lastRenderedSeconds(999999) {}

void DisplayManager::init() {
  tft.init();
  tft.setRotation(1); // Landscape mode: 320x240
  tft.fillScreen(COLOR_BG);
}

uint16_t DisplayManager::getDecisionColor(const String& decision) {
  if (decision == "KEEP") return COLOR_KEEP;
  if (decision == "REDUCE") return COLOR_REDUCE;
  if (decision == "MOVE") return COLOR_MOVE;
  return COLOR_PRIMARY;
}

void DisplayManager::drawHeader(const String& subtitle, bool isOnline) {
  tft.setTextFont(2);
  tft.setTextColor(COLOR_PRIMARY, COLOR_BG);
  tft.drawString("FLOWSTATE", 14, 12);

  if (subtitle.length() > 0) {
    tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
    tft.drawString("· " + subtitle, 115, 12);
  }

  // Online indicator dot
  uint16_t dotColor = isOnline ? COLOR_KEEP : COLOR_TEXT_MUTED;
  tft.fillCircle(304, 18, 4, dotColor);

  // Subtle separator line
  tft.drawLine(14, 32, 306, 32, COLOR_CARD_BORDER);
}

void DisplayManager::drawDecisionBadge(const String& decision, int x, int y) {
  uint16_t color = getDecisionColor(decision);
  tft.fillRoundRect(x, y, 70, 22, 4, color);
  tft.setTextColor(COLOR_BG, color);
  tft.setTextFont(2);
  tft.setTextDatum(MC_DATUM);
  tft.drawString(decision, x + 35, y + 11);
  tft.setTextDatum(TL_DATUM); // restore datum
}

void DisplayManager::showConnecting(const String& message) {
  tft.fillScreen(COLOR_BG);
  drawHeader("STARTUP", false);

  tft.setTextColor(COLOR_TEXT_WHITE, COLOR_BG);
  tft.setTextFont(4);
  tft.drawString("FlowState Companion", 14, 65);

  tft.setTextColor(COLOR_PRIMARY, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString("ESP32-S3 + ILI9341", 14, 100);

  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.drawString(message, 14, 140);

  // Progress/status bar
  tft.drawRoundRect(14, 175, 292, 10, 5, COLOR_CARD_BORDER);
  tft.fillRoundRect(16, 177, 120, 6, 3, COLOR_PRIMARY);
}

void DisplayManager::showHome(const TaskInfo& task, bool isOnline) {
  tft.fillScreen(COLOR_BG);
  drawHeader("DESK COMPANION", isOnline);

  // Decision badge & category
  drawDecisionBadge(task.decision, 14, 44);

  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString(task.category, 95, 47);

  // Task title (large, 2 lines max)
  tft.setTextColor(COLOR_TEXT_WHITE, COLOR_BG);
  tft.setTextFont(4);

  if (task.title.length() > 20) {
    int splitIdx = task.title.lastIndexOf(' ', 18);
    if (splitIdx == -1) splitIdx = 18;
    tft.drawString(task.title.substring(0, splitIdx), 14, 76);
    tft.drawString(task.title.substring(splitIdx + 1, 38), 14, 104);
  } else {
    tft.drawString(task.title, 14, 82);
  }

  // Duration
  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString("PLANNED FOCUS:", 14, 142);
  tft.setTextColor(COLOR_PRIMARY, COLOR_BG);
  tft.setTextFont(4);
  tft.drawString(String(task.plannedMinutes) + " MIN", 140, 138);

  // Bottom action bar
  tft.drawRoundRect(14, 185, 292, 42, 6, COLOR_CARD_BORDER);
  tft.fillRoundRect(15, 186, 290, 40, 5, 0x10A2); // dark violet fill
  tft.setTextColor(COLOR_TEXT_WHITE, 0x10A2);
  tft.setTextFont(4);
  tft.setTextDatum(MC_DATUM);
  tft.drawString("CLICK BOOT TO START", 160, 206);
  tft.setTextDatum(TL_DATUM);
}

void DisplayManager::showNoTasks(bool isOnline) {
  tft.fillScreen(COLOR_BG);
  drawHeader("READY", isOnline);

  tft.setTextColor(COLOR_KEEP, COLOR_BG);
  tft.setTextFont(4);
  tft.drawString("You're all clear.", 14, 70);

  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString("No planned work right now.", 14, 110);
  tft.drawString("Add tasks on FlowState web app to sync.", 14, 135);

  tft.drawRoundRect(14, 185, 292, 42, 6, COLOR_CARD_BORDER);
  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextDatum(MC_DATUM);
  tft.drawString("SYNCING WITH SERVER...", 160, 206);
  tft.setTextDatum(TL_DATUM);
}

void DisplayManager::showFocus(const TaskInfo& task, unsigned long remainingSeconds) {
  tft.fillScreen(COLOR_BG);
  drawHeader("FOCUS SESSION", true);

  // Task title preview
  tft.setTextColor(COLOR_TEXT_WHITE, COLOR_BG);
  tft.setTextFont(2);
  String cleanTitle = task.title.length() > 26 ? task.title.substring(0, 24) + "..." : task.title;
  tft.drawString(cleanTitle, 14, 42);

  // Decision Pill
  drawDecisionBadge(task.decision, 236, 38);

  // Render initial timer
  lastRenderedSeconds = remainingSeconds + 1;
  updateTimerDigits(remainingSeconds);

  // Bottom action hints
  tft.drawLine(14, 185, 306, 185, COLOR_CARD_BORDER);
  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString("CLICK: PAUSE", 24, 200);
  tft.drawString("HOLD: DONE", 200, 200);
}

void DisplayManager::updateTimerDigits(unsigned long remainingSeconds) {
  if (remainingSeconds == lastRenderedSeconds) return;
  lastRenderedSeconds = remainingSeconds;

  unsigned int mins = remainingSeconds / 60;
  unsigned int secs = remainingSeconds % 60;

  char buf[12];
  snprintf(buf, sizeof(buf), "%02u:%02u", mins, secs);

  // Clear timer region and draw in large font 6
  tft.fillRect(40, 75, 240, 85, COLOR_BG);

  tft.setTextColor(COLOR_TEXT_WHITE, COLOR_BG);
  tft.setTextFont(6);
  tft.setTextDatum(MC_DATUM);
  tft.drawString(buf, 160, 118);

  tft.setTextColor(COLOR_KEEP, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString("FOCUSING", 160, 162);
  tft.setTextDatum(TL_DATUM);
}

void DisplayManager::showCompleted(const String& completedTitle, const String& nextTitle) {
  tft.fillScreen(COLOR_BG);
  drawHeader("DONE", true);

  tft.setTextColor(COLOR_KEEP, COLOR_BG);
  tft.setTextFont(4);
  tft.drawString("v TASK COMPLETE!", 14, 45);

  tft.setTextColor(COLOR_TEXT_WHITE, COLOR_BG);
  tft.setTextFont(2);
  String cleanDone = completedTitle.length() > 30 ? completedTitle.substring(0, 28) + "..." : completedTitle;
  tft.drawString(cleanDone, 14, 80);

  tft.drawLine(14, 110, 306, 110, COLOR_CARD_BORDER);

  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString("NEXT PLANNED TASK:", 14, 125);

  tft.setTextColor(COLOR_PRIMARY, COLOR_BG);
  tft.setTextFont(4);
  String cleanNext = nextTitle.length() > 0 ? (nextTitle.length() > 22 ? nextTitle.substring(0, 20) + "..." : nextTitle) : "None (All done!)";
  tft.drawString(cleanNext, 14, 148);

  tft.drawRoundRect(14, 185, 292, 42, 6, COLOR_CARD_BORDER);
  tft.fillRoundRect(15, 186, 290, 40, 5, 0x10A2);
  tft.setTextColor(COLOR_TEXT_WHITE, 0x10A2);
  tft.setTextFont(4);
  tft.setTextDatum(MC_DATUM);
  tft.drawString("CLICK TO START NEXT", 160, 206);
  tft.setTextDatum(TL_DATUM);
}

void DisplayManager::showOfflineNotice() {
  tft.fillScreen(COLOR_BG);
  drawHeader("OFFLINE", false);

  tft.setTextColor(COLOR_REDUCE, COLOR_BG);
  tft.setTextFont(4);
  tft.drawString("Offline Mode", 14, 60);

  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextFont(2);
  tft.drawString("Wi-Fi connection lost.", 14, 95);
  tft.drawString("Showing last cached state.", 14, 118);
  tft.drawString("Any active timers continue locally.", 14, 140);

  tft.drawRoundRect(14, 185, 292, 42, 6, COLOR_CARD_BORDER);
  tft.setTextColor(COLOR_TEXT_MUTED, COLOR_BG);
  tft.setTextDatum(MC_DATUM);
  tft.drawString("RETRYING WI-FI IN BACKGROUND", 160, 206);
  tft.setTextDatum(TL_DATUM);
}
