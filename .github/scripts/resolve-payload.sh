#!/usr/bin/env bash
# Finds what itsPLK has published and decides which channels to build.
#   stable: itsPLK's latest release.
#   pre:    itsPLK's newest pre-release, only while it is newer than stable.
# A channel is skipped when our release was already built from the same payload and
# the same firmware source. The release notes carry the marker
# `payload-ref: <tag>@<sha> fw:<source hash>`. Pull requests and manual runs with
# force=true always build.
# Writes `prepare` (matrix entries), `channels` (names) and `fw` to $GITHUB_OUTPUT.
set -euo pipefail

UP=itsPLK/ps5-webkit-autoloader
: "${REPO:?}" "${EVENT:?}"

# Everything that ends up in the image. CI-only files (workflows, scripts) are left
# out on purpose, so tweaking the pipeline does not rebuild identical firmware.
# host/packed is left out too: CI repacks it from itsPLK every build and commits the
# stable copy back, so including it would rebuild forever.
FW=$(git ls-tree HEAD -- firmware host/installer pack vendor Makefile install-deps.sh .gitmodules .github/release-notes.md | sha256sum | cut -c1-12)
echo "firmware source: $FW"

stable_tag=$(gh api "repos/$UP/releases/latest" --jq .tag_name)
stable_date=$(gh api "repos/$UP/releases/latest" --jq .published_at)
pre_line=$(gh api "repos/$UP/releases?per_page=30" --jq \
  '[.[] | select(.prerelease and (.draft | not))] | sort_by(.published_at) | last // empty | "\(.tag_name) \(.published_at)"')
pre_tag=""
if [ -n "$pre_line" ]; then
  read -r tag date <<< "$pre_line"
  # ISO-8601 UTC timestamps sort as strings.
  if [[ "$date" > "$stable_date" ]]; then pre_tag=$tag; fi
fi
echo "itsPLK stable: $stable_tag"
echo "itsPLK pre:    ${pre_tag:-none newer than stable}"

short_sha() {
  gh api "repos/$UP/commits/$1" --jq .sha | cut -c1-7
}

# Is this payload already published? stable must be on `latest`, pre on any release.
published() {
  local channel=$1 marker=$2
  if [ "$channel" = stable ]; then
    gh api "repos/$REPO/releases/tags/latest" --jq .body 2>/dev/null | grep -qF "$marker"
  else
    gh api "repos/$REPO/releases?per_page=30" --jq '.[].body' 2>/dev/null | grep -qF "$marker"
  fi
}

entries=()
names=()
add() {
  local channel=$1 ref=$2 build_type=$3
  local sha marker
  sha=$(short_sha "$ref")
  marker="payload-ref: ${ref}@${sha} fw:${FW}"
  if [ "$EVENT" != pull_request ] && [ "${FORCE:-false}" != true ] && published "$channel" "$marker"; then
    echo "$channel: $ref with this firmware is already published, skipping"
    return
  fi
  echo "$channel: building $ref"
  entries+=("{\"channel\":\"$channel\",\"ref\":\"$ref\",\"build_type\":\"$build_type\"}")
  names+=("\"$channel\"")
}

add stable "$stable_tag" stable
if [ -n "$pre_tag" ]; then add pre "$pre_tag" pre-release; fi

join() { local IFS=,; echo "[$*]"; }
{
  echo "prepare=$(join "${entries[@]+"${entries[@]}"}")"
  echo "channels=$(join "${names[@]+"${names[@]}"}")"
  echo "fw=$FW"
} | tee -a "$GITHUB_OUTPUT"
