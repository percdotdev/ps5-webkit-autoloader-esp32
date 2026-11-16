#!/usr/bin/env bash
# Keeps one open issue labelled `build-failure` while firmware builds fail on main,
# and closes it on the next green run. Users are never affected: a failed build
# publishes nothing and every release stays on its last good version.
set -euo pipefail
: "${REPO:?}" "${RUN_ID:?}" "${RUN_URL:?}"

failed=$(gh api "repos/$REPO/actions/runs/$RUN_ID/jobs?per_page=100" \
  --jq '[.jobs[] | select(.conclusion == "failure") | .name] | join(", ")')
# A scheduled run with nothing new to build proves nothing, so leave the issue as is.
if [ -z "$failed" ] && [ "${BUILT:-[]}" = "[]" ]; then exit 0; fi
open=$(gh issue list --repo "$REPO" --label build-failure --state open --json number --jq '.[0].number // empty')

if [ -z "$failed" ]; then
  if [ -n "$open" ]; then
    gh issue close "$open" --repo "$REPO" --comment "Builds are green again: $RUN_URL"
  fi
  exit 0
fi

body="Failed jobs: ${failed}

Run: ${RUN_URL}

Nothing was published from the failed jobs. Every release, \`latest\` and the web flasher stay on the last good build. This is usually upstream itsPLK changing its build; the fix tends to live in \`pack/pack_payload.py\`."

if [ -n "$open" ]; then
  gh issue comment "$open" --repo "$REPO" --body "$body"
else
  gh label create build-failure --repo "$REPO" --color B60205 \
    --description "Firmware build is failing on main" --force >/dev/null
  gh issue create --repo "$REPO" --label build-failure \
    --title "Firmware build failing: ${failed}" --body "$body"
fi
