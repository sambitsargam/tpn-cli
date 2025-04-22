# 📘 TPN-CLI Documentation

Welcome to the comprehensive documentation for **tpn-cli**, the command-line interface for connecting to TPN's decentralized VPN network over WireGuard.


## 🔧 What is TPN-CLI?

**tpn-cli** is a lightweight, stylish, and interactive CLI that allows users to:
- Search and select VPN exit countries
- Automatically lease a secure WireGuard tunnel
- View public IP before and after connection
- Auto-install missing dependencies like `wireguard-tools`

It supports both interactive and non-interactive usage, making it suitable for developers, power users, and automation scripts.


## 💿 Installation

### Global Install
```bash
npm install -g tpn-cli
```

### One-Time Use
```bash
npx tpn-cli
```
This method does not require a global install and is perfect for quick usage or CI/CD.


## 🚀 Features Overview

| Feature                  | Description                                                      |
|--------------------------|------------------------------------------------------------------|
| 🌍 Country Picker        | Fuzzy-search with autocomplete to select your desired country   |
| ⏱ Lease Duration        | Define how many minutes the tunnel should remain active         |
| 📦 npx Support           | No install required with `npx tpn-cli`                           |
| 📡 IP Display            | See your public IP before and after connection                   |
| ⌛ Live Progress Bar     | Visual countdown of lease time                                   |
| ⏹ Graceful Ctrl+C Exit  | Prompts user before tearing down on interrupt                   |
| 🧠 Non-Interactive Mode  | Provide flags like `--country` and `--leasemins` to skip prompts |


## 🧑‍💻 Usage Guide

### Interactive Mode
```bash
tpn-cli
```

#### Example Output
```
tpn-cli
  _____   ____    _   _      ____   _       ___ 
 |_   _| |  _ \  | \ | |    / ___| | |     |_ _|
   | |   | |_) | |  \| |   | |     | |      | | 
   | |   |  __/  | |\  |   | |___  | |___   | | 
   |_|   |_|     |_| \_|    \____| |_____| |___|
                                                
🔐 Decentralized VPN at your fingertips

? Select a TPN validator: UID 0 — 185.189.44.166:3000
🌐 Validator: 185.189.44.166:3000

✔ Found 88 regions
? Select exit country: Israel
? Lease duration (minutes): 1
📡 Your IP before: 152.58.148.220
✔ Leased for 1m!
╭───────────────────────────────────────────────────╮
│                                                   │
│   ⚙ Bringing up WireGuard with TPN VPN (Israel)   │
│                                                   │
╰───────────────────────────────────────────────────╯
📡 Your IP after: 192.71.27.191

✅ Tunnel is live! 
 Enjoy your TPN VPN!
⚠️  Press Ctrl+C to tear down the tunnel

Lease 🔒 [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 20% | 12/60s.
```

### Non-Interactive Mode
```bash
tpn-cli --country NL --leasemins 10
```

#### Example Output
```
tpn-cli --country NL --leasemins 10
  _____   ____    _   _      ____   _       ___ 
 |_   _| |  _ \  | \ | |    / ___| | |     |_ _|
   | |   | |_) | |  \| |   | |     | |      | | 
   | |   |  __/  | |\  |   | |___  | |___   | | 
   |_|   |_|     |_| \_|    \____| |_____| |___|
                                                
🔐 Decentralized VPN at your fingertips

🌐 Validator: 185.189.44.166:3000

✔ Found 88 regions
🚩 Selected country: Netherlands
⏱ Lease: 10 minutes
📡 Your IP before: 152.58.148.220
✔ Leased for 10m!
╭────────────────────────────────────────────────────────╮
│                                                        │
│   ⚙ Bringing up WireGuard with TPN VPN (Netherlands)   │
│                                                        │
╰────────────────────────────────────────────────────────╯
📡 Your IP after: 152.58.148.220

✅ Tunnel is live! 
 Enjoy your TPN VPN!
⚠️  Press Ctrl+C to tear down the tunnel

Lease 🔒 [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 1% | 7/600s
```


## 🧠 Non-Interactive Flags

| Flag            | Alias | Description                            |
|-----------------|-------|----------------------------------------|
| `--country`     | `-c`  | ISO code or full name of country       |
| `--leasemins`   | `-l`  | Tunnel duration in minutes             |
| `--validator`   | `-v`  | Validator UID from validators.json     |


## 🔐 How It Works

1. tpn-cli displays your **current IP address**.
2. You select a **VPN exit region** (country).
3. The CLI fetches a **peer config** via the selected validator.
4. It installs WireGuard if not already installed.
5. The config is saved to a `.conf` file and brought up using `wg-quick`.
6. A **countdown timer** begins showing your tunnel lease duration.
7. After expiry or on confirmed interrupt (Ctrl+C), it tears down automatically.

## 🧪 Example Scenarios

### VPN for 10 minutes in the Netherlands
```bash
tpn-cli --country NL --leasemins 10
```

### Quick connect from Germany using validator UID 3
```bash
tpn-cli --validator 3 --country DE --leasemins 15
```


## 📌 Best Practices

- Always verify the validator endpoints you use.
- Run the CLI with elevated permissions if writing to `/etc/wireguard`.
- For scripts, check the exit code and use `--leasemins` to auto-expire.
- Use `npx` for minimal system impact and always the latest version.

## ✨ Final Notes

If you're enjoying **tpn-cli**, feel free to star the repo, contribute a feature, or just share it with your fellow devs ❤️

**GitHub:** [@sambitsargam](https://github.com/sambitsargam)  
**Twitter/X:** [@sambitsargam](https://x.com/sambitsargam)

