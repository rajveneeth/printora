#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const jestBin = require.resolve('jest-cli/bin/jest');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const result = spawnSync(process.execPath, [jestBin, ...args], { stdio: 'inherit' });

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
