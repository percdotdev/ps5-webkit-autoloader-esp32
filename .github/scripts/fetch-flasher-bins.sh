#!/usr/bin/env bash
# Puts the images the web flasher installs into flasher/bin:
#   bin/*.merged.bin      stable, from GitHub's "Latest" release
#   bin/pre/*.merged.bin  the newest pre-release, only while it is newer than stable
#   bin/channels.json     what the version switch shows
set -euo pipefail
: "${REPO:?}"
OUT=flasher/bin
mkdir -p "$OUT"

FIELDS='{tag: .tag_name, name: .name, date: .published_at, url: .html_url}'
stable=$(gh api "repos/$REPO/releases/latest" --jq "$FIELDS")
stable_tag=$(jq -r .tag <<< "$stable")
stable_date=$(jq -r .date <<< "$stable")
gh release download "$stable_tag" --repo "$REPO" --pattern '*.merged.bin' --dir "$OUT"

pre=$(gh api "repos/$REPO/releases?per_page=30" --jq \
  "[.[] | select(.prerelease and (.draft | not) and .published_at > \"$stable_date\")] | sort_by(.published_at) | last // empty | $FIELDS")
if [ -n "$pre" ]; then
  pre_tag=$(jq -r .tag <<< "$pre")
  mkdir -p "$OUT/pre"
  gh release download "$pre_tag" --repo "$REPO" --pattern '*.merged.bin' --dir "$OUT/pre"
  # Only offer it when every board's image is there.
  for b in pico devkit s2 s3 c3; do
    [ -s "$OUT/pre/esp32-arduino.$b.merged.bin" ] || { echo "pre-release $pre_tag lacks $b, not offering it"; rm -rf "$OUT/pre"; pre=""; break; }
  done
fi

jq -n --argjson stable "$stable" --argjson pre "${pre:-null}" '{stable: $stable, pre: $pre}' > "$OUT/channels.json"
cat "$OUT/channels.json"
ls -lhR "$OUT"
