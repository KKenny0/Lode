#!/usr/bin/env bash
# git-stats.sh — 提取指定日期的 git 提交信息并输出结构化 JSON
# Usage: bash git-stats.sh <repo_path> <date> [date_end]
#   repo_path: git 仓库路径
#   date: 日期，格式 YYYY-MM-DD
#   date_end: 可选，结束日期（不含），默认为 date+1天

set -euo pipefail

REPO_PATH="${1:?Usage: git-stats.sh <repo_path> <date> [date_end]}"
DATE="${2:?Usage: git-stats.sh <repo_path> <date> [date_end]}"
DATE_END="${3:-}"

cd "$REPO_PATH" || { echo '{"error": "repo not found"}' >&2; exit 1; }

# 验证是 git 仓库
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo '{"error": "not a git repo"}'
  exit 1
fi

# 计算日期范围
if [ -z "$DATE_END" ]; then
  # 默认取当天
  DATE_START="${DATE} 00:00:00"
  DATE_UNTIL="${DATE} 23:59:59"
else
  DATE_START="${DATE} 00:00:00"
  DATE_UNTIL="${DATE_END} 23:59:59"
fi

# 获取提交列表
COMMITS=$(git log --since="$DATE_START" --until="$DATE_UNTIL" --pretty=format:"%h" 2>/dev/null || true)

if [ -z "$COMMITS" ]; then
  echo '{"repo": "'"$REPO_PATH"'", "date": "'"$DATE"'", "commits": []}'
  exit 0
fi

# reflog 交叉验证：找出可能遗漏的提交
REFLOG_COMMITS=$(git reflog --since="$DATE_START" | awk '{print $1}' 2>/dev/null || true)

# 合并并去重
ALL_COMMITS=$(echo -e "$COMMITS\n$REFLOG_COMMITS" | sort -u | grep -v '^$')

# 开始输出 JSON
echo "{"
echo "  \"repo\": \"$REPO_PATH\","
echo "  \"date\": \"$DATE\","
echo "  \"commits\": ["

FIRST=true
for HASH in $ALL_COMMITS; do
  # 验证 commit hash 有效
  if ! git rev-parse --verify "$HASH" &>/dev/null; then
    continue
  fi

  # 检查该 commit 是否在日期范围内（reflog 可能引入范围外的）
  COMMIT_DATE=$(git log -1 --format="%ai" "$HASH" 2>/dev/null | cut -d' ' -f1 || continue)
  if [ "$COMMIT_DATE" != "$DATE" ] && [ -z "$DATE_END" ]; then
    continue
  fi

  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    echo ","
  fi

  # 提取提交信息
  SUBJECT=$(git log -1 --format="%s" "$HASH" 2>/dev/null || echo "")
  BODY=$(git log -1 --format="%b" "$HASH" 2>/dev/null || echo "")
  AUTHOR=$(git log -1 --format="%an" "$HASH" 2>/dev/null || echo "")
  STAT=$(git show "$HASH" --stat --format="" 2>/dev/null || echo "")

  # 计算 diff 统计
  INSERTIONS=0
  DELETIONS=0
  FILES_CHANGED=""

  if [ -n "$STAT" ]; then
    # 最后一行通常包含汇总：X files changed, Y insertions(+), Z deletions(-)
    SUMMARY=$(echo "$STAT" | tail -1)
    INSERTIONS=$(echo "$SUMMARY" | grep -oP '\d+(?= insertion)' || echo "0")
    DELETIONS=$(echo "$SUMMARY" | grep -oP '\d+(?= deletion)' || echo "0")
    FILES_CHANGED=$(echo "$STAT" | head -n -1 | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
  fi

  # JSON 转义
  SUBJECT_ESCAPED=$(echo "$SUBJECT" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ')
  BODY_ESCAPED=$(echo "$BODY" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' '\\n')
  STAT_ESCAPED=$(echo "$STAT" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' '\\n')
  FILES_ESCAPED=$(echo "$FILES_CHANGED" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' '\\n')

  echo "    {"
  echo "      \"hash\": \"$HASH\","
  echo "      \"subject\": \"$SUBJECT_ESCAPED\","
  echo "      \"body\": \"$BODY_ESCAPED\","
  echo "      \"author\": \"$AUTHOR\","
  echo "      \"date\": \"$COMMIT_DATE\","
  echo "      \"insertions\": $INSERTIONS,"
  echo "      \"deletions\": $DELETIONS,"
  echo "      \"files_changed\": \"$FILES_ESCAPED\","
  echo "      \"stat\": \"$STAT_ESCAPED\""
  echo -n "    }"
done

echo ""
echo "  ]"
echo "}"
