#!/usr/bin/env bash
# Sanity checks on host/packed before it goes into an image, so a build that
# "succeeds" with a half-staged payload never reaches a release.
# Usage: pack/check_packed.sh <version> <upstream tag>   e.g. 0.8.0-pre-627ba8c v0.8.0-pre-627ba8c
set -euo pipefail
VER=$1
REF=$2
DIR="${PACKED_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/host/packed}"
fail() { echo "packed payload check failed: $*" >&2; exit 1; }

for f in index.html cache.html cache.appcache app/index.html "app/$VER/index.html"; do
  [ -s "$DIR/$f" ] || fail "missing $f"
done
elf="$DIR/app/$VER/webkit-autoloader-installer_${REF}.elf"
[ -f "$elf" ] || fail "missing installer $(basename "$elf")"
[ "$(stat -c %s "$elf")" -gt 100000 ] || fail "installer is too small"
grep -qF "$VER" "$DIR/app/index.html" || fail "app/index.html does not point at $VER"
grep -qF "$VER" "$DIR/cache.appcache" || fail "cache.appcache does not list $VER"
echo "packed payload $VER looks complete ($(du -sh "$DIR" | cut -f1))"
