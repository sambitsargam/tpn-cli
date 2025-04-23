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
const __dirname = dirname(__filename);

// —— Load validators
const validators = JSON.parse(
  readFileSync(join(__dirname, 'validators.json'), 'utf8')
);

// —— Register autocomplete
inquirer.registerPrompt('autocomplete', AutocompletePrompt);

// —— Full country names
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// —— Helper: fetch public IP
async function getPublicIP() {
  try {
    const res = await axios.get('https://api.ipify.org?format=json');
    return res.data.ip;
  } catch {
    return 'unknown';
  }
}

async function ensureWireGuard() {
  try {
    await execaCommand('which wg');
  } catch {
    console.log(chalk.yellow('⚠ wireguard-tools not found; installing…'));
    const platform = os.platform();
    if (platform === 'linux') {
      await execa('sudo', ['apt', 'update']);
      await execa('sudo', ['apt', 'install', '-y', 'wireguard-tools']);
    } else if (platform === 'darwin') {
      await execa('brew', ['install', 'wireguard-tools']);
    } else {
      console.error(chalk.red('Unsupported OS — install wireguard-tools manually.'));
      process.exit(1);
    }
    console.log(chalk.green('✔ wireguard-tools installed.'));
  }
}

async function main() {
  const program = new Command();
  program
    .name('tpn-cli')
    .description('🌈 A CLI for TPN VPN')
    .option('-v, --validator <uid>', 'TPN validator UID')
    .option('-c, --country <code|name>', 'Exit country (ISO code or full name)')
    .option('-l, --leasemins <minutes>', 'Lease duration in minutes')
    .parse(process.argv);

  const opts = program.opts();
  const useNonInteractive = opts.country && opts.leasemins;

  console.log(gradient.rainbow.multiline(figlet.textSync('TPN CLI', { horizontalLayout: 'full' })));
  const rainbow = chalkAnimation.rainbow('🔐 Decentralized VPN at your fingertips\n');
  await new Promise(res => setTimeout(res, 1000));
  rainbow.stop();

  let API_BASE;
  if (opts.validator) {
    const found = validators.find(v => v.UID === opts.validator);
    if (!found) {
      console.error(chalk.red(`Validator UID "${opts.validator}" not found in validators.json`));
      process.exit(1);
    }
    API_BASE = found.Axon;
  } else if (useNonInteractive) {
    API_BASE = validators[0].Axon;
  } else {
    const { axon } = await inquirer.prompt([{
      type: 'list',
      name: 'axon',
      message: chalk.cyan('Select a TPN validator:'),
      choices: validators.map(v => ({
        name: `UID ${v.UID} — ${v.Axon}`,
        value: v.Axon
      }))
    }]);
    API_BASE = axon;
  }
  console.log(chalk.gray(`🌐 Validator: ${API_BASE}\n`));

  await ensureWireGuard();

  const spinner1 = ora({ text: 'Fetching regions…', spinner: 'dots12' }).start();
  const rawCodes = await axios.get(`http://${API_BASE}/api/config/countries`)
    .then(r => r.data)
    .catch(() => {
      spinner1.fail(chalk.red('Could not fetch regions'));
      process.exit(1);
    });
  spinner1.succeed(chalk.green(`Found ${rawCodes.length} regions`));

  let geo, countryName, leaseMinutes;
  if (useNonInteractive) {
    const codeMatch = rawCodes.find(c => c.toLowerCase() === opts.country.toLowerCase());
    if (codeMatch) geo = codeMatch;
    else {
      geo = rawCodes.find(c => regionNames.of(c).toLowerCase() === opts.country.toLowerCase());
    }
    if (!geo) {
      console.error(chalk.red(`Country "${opts.country}" not found!`));
      process.exit(1);
    }
    countryName = regionNames.of(geo);
    leaseMinutes = parseFloat(opts.leasemins);
    if (isNaN(leaseMinutes) || leaseMinutes <= 0) {
      console.error(chalk.red('Lease duration must be a positive number!'));
      process.exit(1);
    }
    console.log(chalk.gray(`🚩 Selected country: ${countryName}`));
    console.log(chalk.gray(`⏱ Lease: ${leaseMinutes} minutes`));
  } else {
    const countryAnswer = await inquirer.prompt([{
      type: 'autocomplete',
      name: 'countryName',
      message: chalk.cyan('Select exit country:'),
      pageSize: 6,
      source: (_, input = '') => rawCodes
        .map(code => ({ name: regionNames.of(code), code }))
        .filter(c => c.name.toLowerCase().includes(input.toLowerCase()))
        .map(c => c.name)
    }]);
    countryName = countryAnswer.countryName;
    geo = rawCodes.find(c => regionNames.of(c) === countryName);
    const leaseAnswer = await inquirer.prompt([{
      type: 'input',
      name: 'lease',
      message: chalk.cyan('Lease duration (minutes):'),
      default: '15',
      validate: v => (!isNaN(parseFloat(v)) && parseFloat(v) > 0) || 'Enter a positive number'
    }]);
    leaseMinutes = parseFloat(leaseAnswer.lease);
  }

  const ipBefore = await getPublicIP();
  console.log(chalk.yellow(`📡 Your IP before: ${ipBefore}`));

  const spinner2 = ora({ text: `Leasing ${countryName} for ${leaseMinutes}m…`, spinner: 'moon' }).start();
  const peerConfig = await axios.get(`http://${API_BASE}/api/config/new`, {
    params: { format: 'text', geo, lease_minutes: leaseMinutes }
  }).then(r => r.data).catch(() => {
    spinner2.fail(chalk.red('Lease failed'));
    process.exit(1);
  });
  spinner2.succeed(chalk.green(`Leased for ${leaseMinutes}m!`));

  const cfgPath = process.getuid && process.getuid() === 0
    ? '/etc/wireguard/tpn.conf'
    : './tpn.conf';
  fs.writeFileSync(cfgPath, peerConfig);
  console.log(boxen(chalk.blue(`⚙ Bringing up WireGuard with TPN VPN (${countryName})`), {
    padding: 1,
    borderColor: 'blue',
    borderStyle: 'round'
  }));
  await execa('wg-quick', ['up', cfgPath], { stdio: 'ignore' });

  const ipAfter = await getPublicIP();
  console.log(chalk.green(`📡 Your IP after: ${ipAfter}`));
  console.log(chalk.green('\n✅ Tunnel is live! \n Enjoy your TPN VPN!'));
  console.log(chalk.gray('⚠️  Press Ctrl+C to tear down the tunnel\n'));

  const totalSec = leaseMinutes * 60;
  const bar = new cliProgress.SingleBar({
    format: chalk.magenta('Lease 🔒 [{bar}] {percentage}% | {value}/{total}s'),
    hideCursor: true
  }, cliProgress.Presets.shades_classic);
  bar.start(totalSec, 0);
  let elapsed = 0;
  const timer = setInterval(async () => {
    elapsed++;
    bar.update(elapsed);
    if (elapsed >= totalSec) {
      clearInterval(timer);
      bar.stop();
      console.log(chalk.red('\n⏰ Lease expired! Tearing down…'));
      try {
        await execa('wg-quick', ['down', cfgPath], { stdio: 'ignore' });
      } catch { }
      process.exit(0);
    }
  }, 1000);

  let sigintHandled = false;
  process.on('SIGINT', async () => {
    if (sigintHandled) return;
    sigintHandled = true;

    bar.stop();
    console.log();
    const { shouldTearDown } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldTearDown',
      message: 'Do you want to tear down the tunnel?',
      default: true
    }]);
    if (shouldTearDown) {
      console.log(chalk.red('\nTearing down tunnel…'));
      try {
        await execa('wg-quick', ['down', cfgPath], { stdio: 'ignore' });
      } catch { }
      process.exit(0);
    } else {
      console.log(chalk.yellow('Tunnel will remain active.'));
      sigintHandled = false; // allow prompt again later
      bar.start(totalSec, elapsed);
    }
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
