#!/usr/bin/env bash
# Đếm số dòng code trong project.
# Cách chạy trong Git Bash:  ./count-loc.sh   (hoặc: bash count-loc.sh)

set -e

echo "=== Đếm dòng code trong src/ ==="
npx cloc src/

echo
echo "=== Đếm dòng code những file còn lại (ngoài src/) ==="
# Chỉ lấy file được git quản lý, bỏ src/ và package-lock.json (file sinh tự động).
other_files=$(mktemp)
trap 'rm -f "$other_files"' EXIT
git ls-files | grep -v '^src/' | grep -v '^package-lock.json$' > "$other_files"
npx cloc --list-file="$other_files"
