#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import AutocompletePrompt from 'inquirer-autocomplete-prompt';
import axios from 'axios';
import { execa, execaCommand } from 'execa';
import fs, { readFileSync } from 'fs';
import os from 'os';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import boxen from 'boxen';
import ora from 'ora';
import cliProgress from 'cli-progress';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// —— ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// —— Load validators
const validators = JSON.parse(
  readFileSync(join(__dirname, 'validators.json'), 'utf8')
);

// —— Register autocomplete
inquirer.registerPrompt('autocomplete', AutocompletePrompt);

// —— Full country names
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

async function ensureWireGuard() {
  try {
    await execaCommand('which wg');
  } catch {
    console.log(chalk.yellow('⚠ wireguard-tools not found; installing…'));
    const platform = os.platform();
    if (platform === 'linux') {
      await execa('sudo', ['apt','update']);
      await execa('sudo', ['apt','install','-y','wireguard-tools']);
    } else if (platform === 'darwin') {
      await execa('brew', ['install','wireguard-tools']);
    } else {
      console.error(chalk.red('Unsupported OS — install wireguard-tools manually.'));
      process.exit(1);
    }
    console.log(chalk.green('✔ wireguard-tools installed.'));
  }
}

async function main() {
  // —— Gradient Banner ——
  const txt = figlet.textSync('TPN CLI', { horizontalLayout: 'full' });
  console.log( gradient.rainbow.multiline(txt) );

  // —— Animated subtitle ——
  const rainbow = chalkAnimation.rainbow('🔐 Decentralized VPN at your fingertips\n');
  await new Promise(res => setTimeout(res, 1500));
  rainbow.stop();

  // —— Validator picker ——
  const { axon } = await inquirer.prompt([{
    type:    'list',
    name:    'axon',
    message: chalk.cyan('Select a TPN validator:'),
    choices: validators.map(v => ({
      name: `UID ${v.UID} — ${v.Axon}`,
      value: v.Axon
    }))
  }]);
  const API_BASE = axon;
  console.log(chalk.gray(`🌐 Validator: ${API_BASE}\n`));

  // —— Ensure WireGuard ——
  await ensureWireGuard();

  // —— Fetch regions ——
  const spinner1 = ora({ text: 'Fetching regions…', spinner: 'dots12' }).start();
  const rawCodes = await axios.get(`http://${API_BASE}/api/config/countries`)
    .then(r => r.data)
    .catch(() => { spinner1.fail(chalk.red('Could not fetch regions')); process.exit(1) });
  spinner1.succeed(chalk.green(`Found ${rawCodes.length} regions`));

  // —— Country picker ——
  const { countryName } = await inquirer.prompt([{
    type:    'autocomplete',
    name:    'countryName',
    message: chalk.cyan('Select exit country:'),
    pageSize: 6,
    source:  (_, input = '') => {
      input = input.toLowerCase();
      return rawCodes
        .map(code => ({ name: regionNames.of(code), code }))
        .filter(c => c.name.toLowerCase().includes(input))
        .map(c => c.name);
    }
  }]);
  const geo = rawCodes.find(c => regionNames.of(c) === countryName);

  // —— Lease time ——
  const { lease } = await inquirer.prompt([{
    type:    'input',
    name:    'lease',
    message: chalk.cyan('Lease duration (minutes):'),
    default: '15',
    validate: v => (!isNaN(parseFloat(v)) && parseFloat(v) > 0) || 'Enter a positive number'
  }]);
  const leaseMinutes = parseFloat(lease);

  // —— Lease tunnel ——
  const spinner2 = ora({ text: `Leasing ${countryName} for ${leaseMinutes}m…`, spinner: 'moon' }).start();
  const peerConfig = await axios.get(`http://${API_BASE}/api/config/new`, {
    params: { format: 'text', geo, lease_minutes: leaseMinutes }
  })
  .then(r => r.data)
  .catch(() => { spinner2.fail(chalk.red('Lease failed')); process.exit(1) });
  spinner2.succeed(chalk.green(`Leased for ${leaseMinutes}m!`));

  // —— Write + Up ——
  const cfgPath = process.getuid && process.getuid() === 0
    ? '/etc/wireguard/tpn.conf'
    : './tpn.conf';
  fs.writeFileSync(cfgPath, peerConfig);

  console.log(boxen(chalk.blue(`⚙ Bringing up WireGuard: ${cfgPath}`), {
    padding: 1, borderColor: 'blue', borderStyle: 'round'
  }));
  await execa('wg-quick', ['up', cfgPath], { stdio: 'inherit' });

  console.log(chalk.green('\n✅ Tunnel is live! \n Enjoy your TPN VPN!'));
  console.log(chalk.gray('⚠️  Press Ctrl+C to tear down the tunnel\n'));

  // —— Lease countdown bar ——
  const totalSec = leaseMinutes * 60;
  const bar = new cliProgress.SingleBar({
    format: chalk.magenta('Lease 🔒 [{bar}] {percentage}% | {value}/{total}s'),
    hideCursor: true
  }, cliProgress.Presets.shades_classic);
  bar.start(totalSec, 0);

  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed++;
    bar.update(elapsed);
    if (elapsed >= totalSec) {
      clearInterval(timer);
      bar.stop();
      console.log(chalk.red('\n⏰ Lease expired! Tearing down…'));
      execa('wg-quick', ['down', cfgPath]).catch(()=>{});
      process.exit(0);
    }
  }, 1000);

  // Keep process alive until lease expires
}

new Command()
  .name('tpn-cli')
  .description('🌈 A CLI for TPN VPN')
  .action(main)
  .parse(process.argv);
