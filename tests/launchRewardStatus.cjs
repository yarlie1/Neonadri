const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path, dependencies = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, require: name => dependencies[name], console: { error() {} } });
  return exports;
}
const statusModule = load('lib/launchRewardStatus.ts');
const status = statusModule.buildLaunchRewardStatus;
for (const n of [0, 1, 69]) assert.equal(status(n, 0).displayMessage, 'First 100 eligible participants.');
for (const n of [70, 71, 89]) assert.equal(status(n, 0).displayMessage, 'Over 70 rewards claimed — limited spots remaining.');
assert.equal(status(90, 0).displayMessage, 'Only 10 rewards left!');
assert.equal(status(92, 0).displayMessage, 'Only 8 rewards left!');
assert.equal(status(99, 0).displayMessage, 'Only 1 reward left!');
assert.equal(status(100, 99).displayMessage, 'All 100 Launch Reward spots are currently claimed.');
assert.equal(status(100, 100).displayMessage, 'All 100 Launch Rewards Have Been Claimed!');
assert.equal(status(101, 100).remaining, 0);
assert.equal(status(99, 99).isFull, false);
assert.equal(status(100, 0).isFull, true);
let rows = [];
let failure = false;
const query = {
  select(columns) { assert.equal(columns, 'status'); return this; },
  eq(key, value) { assert.equal(key, 'campaign_code'); assert.equal(value, 'launch10'); return this; },
  async in(key, values) { assert.equal(key, 'status'); return failure ? {error: new Error('offline')} : {data: rows.filter(row => values.includes(row.status))}; }
};
const {getLaunchRewardStatus} = load('lib/launchReward.ts', {
  './launchRewardStatus': statusModule,
  './supabase/admin': {createAdminClient: () => ({from(table) {assert.equal(table, 'launch_reward_claims'); return query;}})}
});
(async () => {
  rows = [...Array.from({length:85}, () => ({status:'approved'})), ...Array.from({length:15}, () => ({status:'reserved'})), {status:'rejected'}];
  let result = await getLaunchRewardStatus();
  assert.equal(result.activeClaimCount, 100);
  assert.equal(result.finalizedClaimCount, 85);
  assert.equal(result.isFull, true);
  assert.equal(result.isFinalized, false);
  rows[99].status = 'rejected';
  assert.equal((await getLaunchRewardStatus()).displayMessage, 'Only 1 reward left!');
  rows = [...Array.from({length:40}, () => ({status:'approved'})), ...Array.from({length:60}, () => ({status:'reward_sent'}))];
  assert.equal((await getLaunchRewardStatus()).isFinalized, true);
  failure = true;
  result = await getLaunchRewardStatus();
  assert.equal(result.isFull, true);
  assert.match(result.displayMessage, /temporarily unavailable/);
  console.log('PASS: stage boundaries, reserved inclusion, rejected reopening, approved + sent finalization, lookup failure');
})().catch(error => { console.error(error); process.exitCode = 1; });
