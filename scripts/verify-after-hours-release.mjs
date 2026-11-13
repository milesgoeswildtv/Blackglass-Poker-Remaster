import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const requiredCoreAssets = [
  'afterhours_home_lobby_background.png',
  'afterhours_create_game_panel.png',
  'afterhours_join_game_panel.png',
  'afterhours_profile_panel.png',
  'afterhours_info_row_panel.png',
  'afterhours_gameplay_background_mobile.png',
  'afterhours_gameplay_background_desktop.png',
  'afterhours_gameplay_action_button_shell.png',
  'afterhours_hero_active_seat_ticket.png',
  'afterhours_standard_seat_ticket.png'
];

const homeCss = await readFile(join(root, 'src/home.css'), 'utf8');
if (!homeCss.includes('/remaster/afterhours_home_lobby_background.png')) {
  throw new Error('Release rejected: src/home.css is not the approved After Hours Home presentation.');
}
if (homeCss.includes('CRASHOUT_DESKTOP_BG') || homeCss.includes('CRASHOUT_MOBILE_BG') || homeCss.includes('CRASHOUT_CREATE_GAME_PANEL')) {
  throw new Error('Release rejected: legacy Home presentation markers detected.');
}

const publicAssetNames = await readdir(join(root, 'public/remaster'));
const requiredAssets = [...new Set([
  ...requiredCoreAssets,
  ...publicAssetNames.filter(name => name.startsWith('afterhours_'))
])].sort();

const assetRecords = [];
for (const name of requiredAssets) {
  const bytes = await readFile(join(root, 'dist/remaster', name)).catch(() => {
    throw new Error(`Release rejected: required After Hours asset missing from dist/remaster: ${name}`);
  });
  assetRecords.push({
    path: `/remaster/${name}`,
    bytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex')
  });
}

const html = await readFile(join(root, 'dist/index.html'), 'utf8');
if (!html.includes('assets/index-') || !html.includes('.js') || !html.includes('.css')) {
  throw new Error('Release rejected: Vite production HTML is missing fingerprinted JS/CSS entrypoints.');
}

const manifest = {
  application: 'Crashout Poker',
  presentation: 'After Hours',
  sourceRef: process.env.BLACKGLASS_SOURCE_REF || 'unknown',
  sourceSha: process.env.BLACKGLASS_SOURCE_SHA || 'unknown',
  workflowRunId: process.env.GITHUB_RUN_ID || 'local',
  sourceHomeCssSha256: createHash('sha256').update(homeCss).digest('hex'),
  assets: assetRecords
};
await writeFile(join(root, 'dist/BLACKGLASS_BUILD.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Verified After Hours release: ${assetRecords.length} required assets; source ${manifest.sourceSha}`);
