#include "status.h"

#include <LittleFS.h>
#include <WiFi.h>

#include "config.h"
#include "host_files.h"

static char portalLastChain[16] = "";
static char portalLastPath[96] = "";
static char portalLastError[96] = "";
static int portalLastStatus = 0;

static const char *portalBoardName()
{
#if defined(CONFIG_IDF_TARGET_ESP32S2)
    return "ESP32-S2";
#elif defined(CONFIG_IDF_TARGET_ESP32S3)
    return "ESP32-S3";
#elif defined(CONFIG_IDF_TARGET_ESP32C3)
    return "ESP32-C3";
#else
    return "ESP32";
#endif
}

static void portalCopyBounded(char *dst, size_t size, const String &value)
{
    if (size == 0)
        return;
    size_t length = value.length();
    if (length >= size)
        length = size - 1;
    memcpy(dst, value.c_str(), length);
    dst[length] = 0;
}

static void portalAppendJsonString(String &out, const char *value)
{
    out += '"';
    for (const char *p = value; *p; ++p)
    {
        char c = *p;
        if (c == '"' || c == '\\')
        {
            out += '\\';
            out += c;
        }
        else if ((unsigned char)c < 0x20)
        {
            char escaped[8];
            snprintf(escaped, sizeof(escaped), "\\u%04x", (unsigned char)c);
            out += escaped;
        }
        else
        {
            out += c;
        }
    }
    out += '"';
}

void portalStatusTrackPath(const String &path)
{
    portalCopyBounded(portalLastPath, sizeof(portalLastPath), path);

    if (path.indexOf("/poops.html") >= 0)
        snprintf(portalLastChain, sizeof(portalLastChain), "poops");
    else if (path.indexOf("/relapse.html") >= 0)
        snprintf(portalLastChain, sizeof(portalLastChain), "relapse");
}

void portalStatusTrackError(const String &path, int status)
{
    portalCopyBounded(portalLastError, sizeof(portalLastError), path);
    portalLastStatus = status;
}

// /version.json is written by pack/pack_payload.py and left uncompressed so the
// firmware can read it without a gzip decoder.
static String portalPayloadMeta()
{
    File file = LittleFS.open("/version.json", "r");
    if (!file || file.isDirectory())
    {
        if (file)
            file.close();
        return "null";
    }
    if (file.size() > 512)
    {
        file.close();
        return "null";
    }

    String meta = file.readString();
    file.close();
    meta.trim();
    if (!meta.startsWith("{"))
        return "null";
    return meta;
}

String portalStatusJson()
{
    String json;
    json.reserve(768);
    json += "{";
    json += "\"firmware\":\"ps5-webkit-autoloader-esp32\",";
    json += "\"built\":\"";
    json += __DATE__;
    json += " ";
    json += __TIME__;
    json += "\",";
    json += "\"board\":";
    portalAppendJsonString(json, portalBoardName());
    json += ",\"chip\":";
    portalAppendJsonString(json, ESP.getChipModel());
    json += ",\"ssid\":";
    portalAppendJsonString(json, PORTAL_AP_SSID);
    json += ",\"ip\":";
    portalAppendJsonString(json, WiFi.softAPIP().toString().c_str());
    json += ",\"manifest\":";
    portalAppendJsonString(json, portalManifestVersion);
    json += ",\"uptime\":";
    json += String((unsigned long)(millis() / 1000));
    json += ",\"free_heap\":";
    json += String((unsigned long)ESP.getFreeHeap());
    json += ",\"fs_total\":";
    json += String((unsigned long)LittleFS.totalBytes());
    json += ",\"fs_used\":";
    json += String((unsigned long)LittleFS.usedBytes());
    json += ",\"last_chain\":";
    portalAppendJsonString(json, portalLastChain);
    json += ",\"last_path\":";
    portalAppendJsonString(json, portalLastPath);
    json += ",\"last_error\":";
    portalAppendJsonString(json, portalLastError);
    json += ",\"last_status\":";
    json += String(portalLastStatus);
    json += ",\"payload\":";
    json += portalPayloadMeta();
    json += "}";
    return json;
}
