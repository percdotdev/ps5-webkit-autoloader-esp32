#!/usr/bin/env bash
# Finds what itsPLK has published and decides which channels to build.
#   stable: itsPLK's latest release.
#   pre:    itsPLK's newest pre-release, only while it is newer than stable.
# On the daily schedule a channel is skipped when our release already carries that
# exact payload (the notes hold a `payload-ref: <tag>@<sha>` marker). Pushes and
# manual runs always build.
# Writes `prepare` (matrix entries) and `channels` (names) to $GITHUB_OUTPUT.
set -euo pipefail

UP=itsPLK/ps5-webkit-autoloader
: "${REPO:?}" "${EVENT:?}"

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
  local marker="payload-ref: ${ref}@$(short_sha "$ref")"
  if [ "$EVENT" = schedule ] && published "$channel" "$marker"; then
    echo "$channel: $ref already published, skipping"
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
} | tee -a "$GITHUB_OUTPUT"
