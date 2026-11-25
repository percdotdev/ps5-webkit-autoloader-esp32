# PS5 WebKit Autoloader para ESP32

[English](README.md) · Español

[![Flasher web: conecta la placa y pulsa Instalar](flasher/share/og.png)](https://percdotdev.github.io/ps5-webkit-autoloader-esp32/?lang=es)

Esto convierte una placa ESP32 barata en un punto de acceso Wi-Fi. Conectas la placa a la PS5, te unes a esa red y abres la **Guía del usuario** oficial. La guía carga una página desde la placa (no desde internet). Esa página instala [itsPLK/ps5-webkit-autoloader](https://github.com/itsPLK/ps5-webkit-autoloader). Después, **Multimedia → WebKit Autoloader** abre Payload Manager.

Úsalo en una consola tuya. El homebrew y los exploits de WebKit pueden incumplir los términos de Sony. La consola o la cuenta de PSN pueden ser baneadas si esa consola se conecta a internet. Este proyecto no te oculta de Sony.

Qué versiones del software de la PS5 funcionan, y qué exploit se usa en cada una, depende del payload. Consulta el [README de itsPLK](https://github.com/itsPLK/ps5-webkit-autoloader#readme).

## Qué necesitas

- Una PS5 en una versión que soporte el payload ([lista](https://github.com/itsPLK/ps5-webkit-autoloader#readme))
- Una placa ESP32 con puerto USB: **ESP32-S2 Mini** (TENSTAR y similares), ESP32-S3, ESP32-C3, ESP32 DevKit (WROOM-32 / ESP-32S, la típica de 30 o 38 pines) o ESP32-PICO
- Un cable USB de datos, no uno que solo carga
- Chrome o Edge en un PC para grabar el firmware (Firefox y Safari no pueden)

## Graba el firmware (una sola vez)

La placa viene vacía. Le grabas nuestra imagen desde un PC. Después la pasas a la PS5.

### Flasher web

1. Abre el [flasher web](https://percdotdev.github.io/ps5-webkit-autoloader-esp32/?lang=es) en Chrome o Edge.
2. Conecta la placa al PC y pulsa **Instalar**. Chrome pregunta qué dispositivo usar: elige el ESP32 (un puerto COM, o “USB JTAG/serial debug unit”). El flasher detecta la placa y graba la imagen correcta. No cierres la pestaña mientras graba.
3. Sigue las siguientes pantallas: te guían con la parte de la PS5.

Si la placa no aparece, prueba otro cable o mantén **BOOT** al conectarla. La versión, la placa, el borrado completo, tu propio `.bin` y el registro están en **Avanzado**, abajo de la página.

El flasher comprueba que el firmware escrito coincide con el archivo y después reinicia la placa directamente en el portal, así que no hace falta desconectarla. Si la placa no puede reiniciarse sola, la página te lo dice: pulsa **RST** o vuelve a conectarla.

Al reiniciarse puede desaparecer de Windows. Es normal. Estas imágenes apagan el USB nativo tras arrancar para que la PS5 no se pelee con el puerto serie.

También puedes descargar una [release](https://github.com/percdotdev/ps5-webkit-autoloader-esp32/releases/latest) y grabar el `.merged.bin` que toque en la dirección `0x0` con esptool. La misma versión del payload actualiza la release `latest`. Una versión nueva del payload tiene su propia release. Cuando itsPLK publica una pre-release, aquí sale una pre-release equivalente para probarla; `latest` y el flasher web siguen en la estable. Cada release trae un archivo `SHA256SUMS`: `sha256sum -c SHA256SUMS --ignore-missing` comprueba tu descarga.

| Placa | Archivo | LED de la placa |
| --- | --- | --- |
| ESP32-S2 | `esp32-arduino.s2.merged.bin` | GPIO 15 |
| ESP32-S3 | `esp32-arduino.s3.merged.bin` | GPIO 21 |
| ESP32 DevKit | `esp32-arduino.devkit.merged.bin` | GPIO 2 |
| ESP32-PICO | `esp32-arduino.pico.merged.bin` | GPIO 10 |
| ESP32-C3 | `esp32-arduino.c3.merged.bin` | GPIO 8 |

El LED se queda encendido mientras la placa arranca y luego da un parpadeo corto cada par de segundos cuando el punto de acceso está activo. Parpadea con cada petición de página. Si parpadea rápido, el Wi-Fi no pudo arrancar.

## Úsalo en la PS5

1. Pasa la placa del PC a un puerto USB de la PS5. Déjala ahí.
2. En la PS5: **Ajustes → Red → Ajustes → Configurar conexión a Internet**. Únete al Wi-Fi **`ESP32_PORTAL`**, contraseña **`12345678`**.
3. Quédate en esa red. La PS5 dirá que no hay internet. Es lo esperado: no hay internet y no hace falta.
4. **Ajustes → Guía y consejos → Guía del usuario**. Espera a que termine de guardar los archivos. La página lanza el exploit e instala el acceso directo en la pantalla de inicio.
5. Reinicia la PS5. Abre **Multimedia → WebKit Autoloader**. Payload Manager se abre si no tienes `autoload.txt`.

Las siguientes veces solo necesitas la placa conectada, el Wi-Fi en `ESP32_PORTAL` y luego **Multimedia → WebKit Autoloader**.


## Compilar desde el código

```sh
./install-deps.sh
python3 pack/pack_payload.py --web /ruta/a/ps5-webkit-autoloader
make
```

Solo Arduino-ESP32 **2.0.11**. Las imágenes quedan en `build/{pico,devkit,s2,s3,c3}/`. `make debug` / `make debug-s2` mantiene el USB serie para que puedas leer los logs.

## Problemas

¿Algo falla con el flasher, la placa o `ESP32_PORTAL`? [Abre un issue](https://github.com/percdotdev/ps5-webkit-autoloader-esp32/issues/new/choose) y pega el log del flasher (Instalar → Registro → Copiar). Los problemas del payload van a [itsPLK](https://github.com/itsPLK/ps5-webkit-autoloader/issues).

## Créditos

Payload: [itsPLK](https://github.com/itsPLK/ps5-webkit-autoloader). Cadenas: [slopkit](https://github.com/jordyidk/slopkit), [Relapse](https://github.com/ntfargo/Relapse-Exploit). Flasher: [esptool-js](https://github.com/espressif/esptool-js).

## Licencia

Firmware y build: MIT. Los payloads incluidos mantienen sus propios términos. Ver [LICENSE](LICENSE).
