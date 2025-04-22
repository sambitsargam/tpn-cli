<h1 align="center">🌐 tpn-cli</h1>

<pre>
████████╗██████╗ ███╗   ██╗     ██████╗██╗     ██╗
╚══██╔══╝██╔══██╗████╗  ██║    ██╔════╝██║     ██║
   ██║   ██████╔╝██╔██╗ ██║    ██║     ██║     ██║
   ██║   ██╔═══╝ ██║╚██╗██║    ██║     ██║     ██║
   ██║   ██║     ██║ ╚████║    ╚██████╗███████╗██║
   ╚═╝   ╚═╝     ╚═╝  ╚═══╝     ╚═════╝╚══════╝╚═╝
</pre>
<p align="center">
  <b>Decentralized VPN at your fingertips</b><br>
  A stylish, zero-config WireGuard tunnel CLI with country search, lease timer & live progress.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tpn-cli"><img src="https://img.shields.io/npm/v/tpn-cli.svg" alt="npm version"></a>
  <a href="https://img.shields.io/npm/dw/tpn-cli.svg"><img src="https://img.shields.io/npm/dw/tpn-cli.svg" alt="downloads/week"></a>
</p>

## 🚀 Features

- 🔍 **Autocomplete Country Picker** – fuzzy search your desired VPN exit country  
- ⏲️ **Set Lease Duration** – specify how long the VPN should run (in minutes)  
- ⚙️ **Auto Installs WireGuard** – detects & installs `wireguard-tools` (Linux/macOS)  
- 🧠 **Non-Interactive Mode** – pass flags like `--country` and `--leasemins` to skip prompts  
- 📡 **IP Check** – shows your public IP before & after connecting  
- 📦 **npx-Friendly** – run instantly with `npx` without installing globally  
- ⏹️ **Graceful Teardown** – prompts to confirm when pressing `Ctrl+C`  
- ⌛ **Live Timer Bar** – see your lease countdown visually

## 💿 Installation

```bash
npm install -g tpn-cli
```

> Installs the CLI globally so you can use `tpn-cli` anywhere on your system.

✅ **No install? No problem. Just run:**

```bash
npx tpn-cli
```

> Works exactly the same without polluting global space. Great for CI or quick tests.

## 🧑‍💻 Usage ( Add npx before the command if you don't want to install the CLI globally )

### 🔘 Interactive Mode

```bash
tpn-cli
```

- Search for your desired country
- Enter lease time in minutes
- VPN is up in seconds

### ⚡ Non-Interactive Mode

```bash
tpn-cli --country NL --leasemins 10
```

## ✍️ Author

**Sambit Sargam**  
GitHub: [@sambitsargam](https://github.com/sambitsargam)  
Twitter: [@sambitsargam](https://x.com/sambitsargam)


> ✨ If you enjoy this tool, a star ⭐ on GitHub would mean a lot!
