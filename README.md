# TPN CLI

**The decentralized CLI for spinning up WireGuard tunnels in the TPN validator network.**

Leverage TPN’s mesh of validator nodes to lease WireGuard peer‑configs in any geo‑zone, on‑demand, via a single command.

---

## 🧩 Protocol Overview

TPN CLI acts as your on‑chain interface to the Tao Private Network validator set:

1. **Validator Discovery**  
   Queries multiple **validator Axons** to build a roster of live exit nodes.

2. **Lease Transaction**  
   Executes an off‑chain “lease” on a chosen node — your ephemeral **WireGuard peer contract** is minted for a configurable duration.

3. **Peer‑to‑Peer Tunnel**  
   Writes the `tpn.conf` asset and launches the WireGuard interface, creating a trustless, encrypted channel between your client and the miner node.

---

## 🔗 Installation

```bash
npm install -g tpn-cli
```

> Pre‑install “hook” ensures `wireguard-tools` is present, bootstrapping your environment like a genesis block.

---

## 🚀 Fast‑Start Usage

```bash
tpn-cli
```

1. **Select** your exit country (fuzzy‑search picker against the validator ledger).  
2. **Specify** your lease duration in minutes (your peer‑config’s TTL).  
3. **Confirm** — the CLI submits your lease transaction, writes `tpn.conf`, and calls `wg-quick up`.  
4. **Tear Down** your tunnel with:
   ```bash
   wg-quick down ./tpn.conf
   ```

---

## ⚙️ Configuration & Governance

- **validators.json**  
  Manage your on‑chain validator set. By default, TPN CLI randomizes among the official network Axons. To override, edit `validators.json`:

  ```json
  [
    { "UID": 0,   "Axon": "185.189.44.166:3000" },
    { "UID": 4,   "Axon": "185.141.218.102:3000" },
    …
  ]
  ```

- **CLI Flags & Governance Proposals**  
  ```bash
  tpn-cli --help
  ```
  Propose new flags or node-selection logic via GitHub issues — community governance in action.

---

## 🏗️ Architecture

```
┌─────────────┐        Lease API         ┌────────────────┐
│  tpn-cli    │ ────────────────────▶   │ Validator Node │
│ (your wallet)│                          │ (WireGuard WG) │
└─────────────┘ ◀─────────────────── ACK └────────────────┘
         │
         │ spawn interface
         ▼
   [ WireGuard Tunnel ]
```

- **Leasing Layer**: off‑chain API calls to `/config/countries` and `/config/new`.
- **Peer Layer**: WireGuard tunnel as the P2P encrypted channel.
- **Control Layer**: CLI spinners, colored logs, and ASCII banners for a smooth UX “gasless” experience.

---

## 🤝 Contributing

TPN CLI is fully open‑source under MIT. All contributions—PRs, validator proposals, bug bounties—are welcome:

1. Fork the repo  
2. Create your feature branch (`git checkout -b feature/awesome-node`)  
3. Commit your changes (`git commit -m 'feat: add new flag'`)  
4. Push & open a PR  

---

## 📜 License

TPN CLI is released under the [MIT License](LICENSE).

---
