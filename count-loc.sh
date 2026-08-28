#!/usr/bin/env bash
# Đếm số dòng code trong project.
# Cách chạy trong Git Bash:  ./count-loc.sh   (hoặc: bash count-loc.sh)

set -e

SRC_DIRS="app be db lib scripts"

# Chỉ đếm file được git quản lý: bỏ luôn node_modules, dist và nextjs_model mà không cần liệt kê.
# package-lock.json bị loại vì là file sinh tự động.
src_files=$(mktemp)
other_files=$(mktemp)
trap 'rm -f "$src_files" "$other_files"' EXIT

src_pattern="^($(echo "$SRC_DIRS" | tr ' ' '|'))/"

git ls-files | grep -E "$src_pattern" > "$src_files"
git ls-files | grep -vE "$src_pattern" | grep -v '^package-lock.json$' > "$other_files"

echo "=== Đếm dòng code trong $SRC_DIRS ==="
npx cloc --list-file="$src_files"

echo
echo "=== Đếm dòng code những file còn lại ==="
npx cloc --list-file="$other_files"
