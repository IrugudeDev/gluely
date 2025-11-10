#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install it from https://cli.github.com/" >&2
  exit 1
fi

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  echo "Usage: $0 <github-username>/<repo-name>" >&2
  exit 1
fi

WORKFLOW_NAME="Build Windows desktop package"
ARTIFACT_NAME="gluely-copilot-win-portable"

run_id=$(gh run list \
  --workflow "$WORKFLOW_NAME" \
  --repo "$REPO" \
  --limit 1 \
  --json databaseId,status,conclusion \
  --jq 'map(select(.status == "completed" and .conclusion == "success"))[0].databaseId')

if [[ -z "$run_id" ]]; then
  echo "No successful workflow runs found for $WORKFLOW_NAME" >&2
  exit 1
fi

echo "Downloading artifact $ARTIFACT_NAME from run $run_id..."

gh run download "$run_id" \
  --repo "$REPO" \
  --name "$ARTIFACT_NAME" \
  --dir ./downloads

echo "Artifact downloaded to ./downloads/$ARTIFACT_NAME"
echo "Unzip the archive to retrieve 'Gluely Copilot.exe'."
