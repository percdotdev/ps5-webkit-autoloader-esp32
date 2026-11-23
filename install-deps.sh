#!/usr/bin/env bash

set -euo pipefail

CORE_VERSION="2.0.11"
ARDUINO_INDEX="https://espressif.github.io/arduino-esp32/package_esp32_index.json"
ESP8266_INDEX="https://arduino.esp8266.com/stable/package_esp8266com_index.json"
ESP8266_CORE_VERSION="3.1.2"

ARDUINO_DATA_DIR="$HOME/.arduino15-esp32-2"
ARDUINO_STAGING_DIR="$HOME/.arduino15/staging"
ARDUINO_CONFIG="$HOME/.arduino15/arduino-cli-esp32-2.yaml"

if [ "$(id -u)" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Commands the build needs. CI runners already have them, so apt only runs when one is missing.
NEED=(curl git openssl python3 unzip xz)
PKGS=(ca-certificates curl git openssl python3 unzip xz-utils)
if [ "${COMPILE_ONLY:-0}" != 1 ]; then
    NEED+=(jq node npm)
    PKGS+=(jq nodejs npm)
fi
for cmd in "${NEED[@]}"; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        $SUDO apt-get update
        $SUDO apt-get install -y "${PKGS[@]}"
        break
    fi
done

if [ "${COMPILE_ONLY:-0}" != 1 ]; then
    for cmd in cleancss html-minifier-terser svgo terser; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            $SUDO npm install --global clean-css-cli html-minifier-terser svgo terser
            break
        fi
    done
fi

if ! command -v arduino-cli >/dev/null 2>&1; then
    TMP_DIR="$(mktemp -d)"
    trap 'rm -rf "$TMP_DIR"' EXIT

    curl -fsSL \
        https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh \
        -o "$TMP_DIR/install.sh"

    # Current install.sh refuses to create BINDIR itself.
    mkdir -p "$TMP_DIR/bin"
    BINDIR="$TMP_DIR/bin" sh "$TMP_DIR/install.sh"

    $SUDO install -m 755 \
        "$TMP_DIR/bin/arduino-cli" \
        /usr/local/bin/arduino-cli
fi

mkdir -p "$ARDUINO_DATA_DIR"
mkdir -p "$ARDUINO_STAGING_DIR"

cat > "$ARDUINO_CONFIG" <<EOF
directories:
  data: $ARDUINO_DATA_DIR
  downloads: $ARDUINO_STAGING_DIR
board_manager:
  additional_urls:
    - $ARDUINO_INDEX
    - $ESP8266_INDEX
EOF

ARDUINO_CLI=(
    arduino-cli
    --config-file "$ARDUINO_CONFIG"
)

# The index is only needed to install a core; skip the download when both are cached.
# ESP8266=0 skips the ESP8266 core (CI never builds it).
install_core() {
    local core=$1 version=$2 installed
    installed="$("${ARDUINO_CLI[@]}" core list | awk -v c="$core" '$1 == c {print $2}')"
    if [ "$installed" != "$version" ]; then
        "${ARDUINO_CLI[@]}" core update-index
        "${ARDUINO_CLI[@]}" core install "$core@$version"
    fi
}

install_core esp32:esp32 "$CORE_VERSION"
if [ "${ESP8266:-1}" != 0 ]; then
    install_core esp8266:esp8266 "$ESP8266_CORE_VERSION"
fi

echo
"${ARDUINO_CLI[@]}" version
"${ARDUINO_CLI[@]}" core list
