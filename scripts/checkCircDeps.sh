#!/bin/bash

# Get the list of changed files
CHANGED_FILES=$(git diff --name-only --cached)

# Filter the changed files to include only .ts and .tsx files
FILTERED_FILES=$(echo "$CHANGED_FILES" | grep -E '\.ts$|\.tsx$')

# If there are no changed files, exit
if [ -z "$FILTERED_FILES" ]; then
  echo "No TypeScript files changed."
  exit 0
fi

# Run Madge on the filtered files
npx madge --circular --extensions ts,tsx --ts-config ./tsconfig.base.json $FILTERED_FILES
