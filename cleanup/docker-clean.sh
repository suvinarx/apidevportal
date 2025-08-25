#!/usr/bin/env bash
set -euo pipefail

# Docker Cleanup Utility
# Usage:
#   ./docker-clean.sh [options]
#
# Options:
#   --dry-run       Show what would run, don't execute
#   --force         Skip confirmation prompt
#   --all           Remove ALL images (not just unused)
#   --volumes       Prune unused volumes
#   --networks      Prune unused networks
#   --nuke          Equivalent to: docker system prune -a --volumes -f
#   --keep-cache    Keep builder cache (skip buildx/builder prune)
#   -h, --help      Show help

DRY_RUN=false
FORCE=false
REMOVE_ALL_IMAGES=false
PRUNE_VOLUMES=false
PRUNE_NETWORKS=false
NUKE=false
KEEP_CACHE=false

log() { printf "[docker-clean] %s\n" "$*"; }
run() { if $DRY_RUN; then echo "+ $*"; else eval "$@"; fi; }

usage() {
  sed -n '2,60p' "$0"
  exit 0
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Error: '$1' not found in PATH." >&2
    exit 1
  }
}

confirm() {
  $FORCE && return 0
  read -r -p "Proceed? [y/N] " ans
  [[ "${ans:-}" =~ ^[Yy]$ ]]
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true ;;
    --force) FORCE=true ;;
    --all) REMOVE_ALL_IMAGES=true ;;
    --volumes) PRUNE_VOLUMES=true ;;
    --networks) PRUNE_NETWORKS=true ;;
    --nuke) NUKE=true ;;
    --keep-cache) KEEP_CACHE=true ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1" >&2; usage ;;
  esac
  shift
done

need_cmd docker

# Quick nuke path
if $NUKE; then
  log "Full cleanup: containers, images, networks, volumes, and cache."
  if confirm; then
    run "docker system prune -a --volumes -f"
    $KEEP_CACHE || run "docker builder prune -a -f || true"
  else
    log "Aborted."
  fi
  exit 0
fi

# Stop & remove all containers (if any)
CONTAINERS="$(docker ps -aq || true)"
if [[ -n "${CONTAINERS}" ]]; then
  log "Stopping all containers..."
  run "docker stop ${CONTAINERS} >/dev/null 2>&1 || true"
  log "Removing all containers..."
  run "docker rm ${CONTAINERS} >/dev/null 2>&1 || true"
else
  log "No containers to stop/remove."
fi

# Images
if $REMOVE_ALL_IMAGES; then
  IMAGES="$(docker images -q || true)"
  if [[ -n "${IMAGES}" ]]; then
    log "Removing ALL images (${IMAGES//[$'\n']/ })..."
    if confirm; then
      run "docker rmi ${IMAGES} >/dev/null 2>&1 || true"
    else
      log "Skipped removing images."
    fi
  else
    log "No images to remove."
  fi
else
  log "Pruning unused images, containers, and build cache (safe prune)..."
  if confirm; then
    run "docker system prune -f"
  else
    log "Skipped system prune."
  fi
fi

# Optional: prune networks
if $PRUNE_NETWORKS; then
  log "Pruning unused networks..."
  if confirm; then
    run "docker network prune -f || true"
  else
    log "Skipped network prune."
  fi
fi

# Optional: prune volumes
if $PRUNE_VOLUMES; then
  log "Pruning unused volumes..."
  if confirm; then
    run "docker volume prune -f || true"
  else
    log "Skipped volume prune."
  fi
fi

# Optional: prune builder cache
if ! $KEEP_CACHE; then
  log "Pruning builder cache..."
  if confirm; then
    run "docker builder prune -a -f || true"
  else
    log "Skipped builder cache prune."
  fi
fi

log "Done."

