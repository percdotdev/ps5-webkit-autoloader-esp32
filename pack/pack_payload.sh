#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB="${WEBKIT_AUTOLOADER:-$ROOT/webkit-autoloader}"
if [ ! -f "$WEB/Makefile" ]; then
    echo "Error: itsPLK tree missing at $WEB" >&2
    echo "Clone it with: git clone https://github.com/itsPLK/ps5-webkit-autoloader.git webkit-autoloader" >&2
    exit 1
fi
python3 "$ROOT/pack/pack_payload.py" --web "$WEB" --out "$ROOT/host/packed"
