ESP32 firmware that serves [itsPLK's WebKit Autoloader](https://github.com/itsPLK/ps5-webkit-autoloader) **{{VER}}** to the PS5 over its own Wi-Fi, `ESP32_PORTAL`.

## Flash it

**Easiest:** open the [web flasher](https://percdotdev.github.io/ps5-webkit-autoloader-esp32/) in Chrome or Edge. Choose your board, plug it in holding **BOOT**, press Install. It writes this release, checks it and restarts the board into the portal.

**By hand** with [esptool](https://docs.espressif.com/projects/esptool/): put the board in download mode, then write the file for your board at `0x0`.

| Board | File | Command |
| --- | --- | --- |
| ESP32-S2 Mini | `esp32-arduino.s2.merged.bin` | `esptool.py --chip esp32s2 write_flash 0x0 esp32-arduino.s2.merged.bin` |
| ESP32-S3 DevKitC | `esp32-arduino.s3.merged.bin` | `esptool.py --chip esp32s3 write_flash 0x0 esp32-arduino.s3.merged.bin` |
| ESP32-C3 Super Mini | `esp32-arduino.c3.merged.bin` | `esptool.py --chip esp32c3 write_flash 0x0 esp32-arduino.c3.merged.bin` |
| ESP32 PICO-KIT | `esp32-arduino.pico.merged.bin` | `esptool.py --chip esp32 write_flash 0x0 esp32-arduino.pico.merged.bin` |

Check your download first:

```sh
sha256sum -c SHA256SUMS --ignore-missing
```

## On the PS5

Plug the board into the PS5, join `ESP32_PORTAL` (password `12345678`), then open **Settings → Guide and Tips → User’s Guide**. Full steps are in the [README](https://github.com/{{REPO}}#use-it-on-the-ps5).

| Exploit | PS5 system software |
| --- | --- |
| poops | 7.00–12.00 |
| Relapse | 7.00–13.60 except 9.05 |

## Inside

- Payload: itsPLK/ps5-webkit-autoloader {{VER}}, commit [`{{PSHA}}`](https://github.com/itsPLK/ps5-webkit-autoloader/commit/{{PSHA}})
- Firmware: commit [`{{SHORT}}`](https://github.com/{{REPO}}/commit/{{SHA}})
