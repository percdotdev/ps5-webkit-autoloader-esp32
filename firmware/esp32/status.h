#pragma once

#include <Arduino.h>

// Last request bookkeeping for /status.json. Cheap, best-effort, and safe to
// call from both the HTTP and HTTPS server tasks.
void portalStatusTrackPath(const String &path);
void portalStatusTrackError(const String &path, int status);

// Machine-readable board state: payload version, board, LittleFS usage,
// last chain, last error and uptime.
String portalStatusJson();
