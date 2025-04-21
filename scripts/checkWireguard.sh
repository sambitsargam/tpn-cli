#!/usr/bin/env bash
# Preinstall script to ensure wireguard-tools
if ! command -v wg &> /dev/null; then
  echo "🔍 wireguard-tools not found; installing…"
  unameOut="$(uname)"
  if [[ "$unameOut" == "Linux" ]]; then
    sudo apt update && sudo apt install -y wireguard-tools
  elif [[ "$unameOut" == "Darwin" ]]; then
    brew install wireguard-tools
  else
    echo "❌ Unsupported OS — please install wireguard-tools manually."
    exit 1
  fi
  echo "✔ wireguard-tools installed."
fi
