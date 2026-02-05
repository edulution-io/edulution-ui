#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
UI_KIT_DIR="$ROOT_DIR/libs/ui-kit"
DIST_DIR="$UI_KIT_DIR/dist"

cd "$ROOT_DIR"

echo "Building ui-kit..."
npx nx build ui-kit

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: Build output not found at $DIST_DIR"
  exit 1
fi

echo "Checking NPM_TOKEN..."
if [ -z "${NPM_TOKEN:-}" ]; then
  echo "Warning: NPM_TOKEN not set. Using local npm config."
fi

echo "Publishing from $DIST_DIR..."
cd "$DIST_DIR"

if [ "${DRY_RUN:-}" = "true" ]; then
  echo "Dry run mode - would publish:"
  npm pack --dry-run
else
  npm publish
fi

echo "Done!"
