import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const approved = {
  'src/home.css': '395fdc1e2b69feeb20a8369e34e5b6356be414ea',
  'src/private-access.css': '11d02619b4505939dab2b5c9a648c7863684fb2d'
};
const requiredAssets = {
  'assets/remaster/entry-gate/CRASHOUT_APPROVED_ENTRY_GATE_REFERENCE.PNG': 'f1ab9556f9afa424f43f00547283496703383cb3',
  'assets/remaster/entry-gate/CRASHOUT_DESKTOP_BG.PNG': '2c81b8717e4dc4fbf878392d7266583a296a8053',
  'assets/remaster/entry-gate/CRASHOUT_INFO_BAR_2.PNG': 'df82eb64b282d04b6413ed16257dce0952b8f2b2',
  'assets/remaster/entry-gate/CRASHOUT_INPUT_FIELD.PNG': '48468b532e6bb111467d4c99d19cc19f4630e644',
  'assets/remaster/entry-gate/CRASHOUT_LANDSCAPE_BG.PNG': 'ebab402f2b080bf4b5dc19f144b3f38b8f49f76c',
  'assets/remaster/entry-gate/CRASHOUT_LOGO.PNG': 'd0b3ddb8c33f0a544c21ae5aec0af05b5d18b0fe',
  'assets/remaster/entry-gate/CRASHOUT_MASTER_FULL_SCREEN_PANEL.PNG': 'b487bfa486ac712e13a31449127014352408fe85',
  'assets/remaster/entry-gate/CRASHOUT_MOBILE_BG.PNG': '1272fc256f8613473cea5c98f541c4ed622969f5',
  'assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG': 'a6d64912acb261b0678576acf8f1dd21b7820801',
  'assets/remaster/entry-gate/UTILITY_INFO_BADGE.PNG': '1718cf294ba86af124d0e578ed81b65a09abc144',
  'assets/remaster/homescreen/CRASHOUT_APPROVED_HOMESCREEN_REFERENCE.PNG': '9c1380927ad774cc0ed7462798e85ef9fb7c6ffc',
  'assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG': '7b724906f5fc5345a12528630ed857364ed0daf4',
  'assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG': '5b64bf92400e5474a7913daf63014aeef879897d',
  'assets/remaster/homescreen/CRASHOUT_DESKTOP_BG.PNG': '2c81b8717e4dc4fbf878392d7266583a296a8053',
  'assets/remaster/homescreen/CRASHOUT_INPUT_FIELD.PNG': '48468b532e6bb111467d4c99d19cc19f4630e644',
  'assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG': '85906c7d174a44ad32bac203c217c5a9f392daab',
  'assets/remaster/homescreen/CRASHOUT_LANDSCAPE_BG.PNG': 'ebab402f2b080bf4b5dc19f144b3f38b8f49f76c',
  'assets/remaster/homescreen/CRASHOUT_MOBILE_BG.PNG': '1272fc256f8613473cea5c98f541c4ed622969f5',
  'assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG': 'ba79c4d6cbac653ec0832b66abafc6789af1da23'
};

function gitBlobSha(bytes) {
  return createHash('sha1')
    .update(Buffer.from(`blob ${bytes.byteLength}\\0`))
    .update(bytes)
    .digest('hex');
}

const cssRecords = {};
for (const [path, expectedSha] of Object.entries(approved)) {
  const bytes = await readFile(join(root, path));
  const actualSha = gitBlobSha(bytes);
  if (actualSha !== expectedSha) {
    throw new Error(`Release rejected: ${path} differs from the version 300 approved visual baseline (expected ${expectedSha}, got ${actualSha}).`);
  }
  cssRecords[path] = { gitBlobSha: actualSha };
}

const homeCss = await readFile(join(root, 'src/home.css'), 'utf8');
const requiredCssMarkers = [
  '/assets/remaster/homescreen/CRASHOUT_DESKTOP_BG.PNG',
  '/assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG',
  '/assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG',
  '/assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG',
  '/assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG'
];
for (const marker of requiredCssMarkers) {
  if (!homeCss.includes(marker)) throw new Error(`Release rejected: approved Home asset is not wired into CSS: ${marker}`);
}
if (homeCss.includes('/remaster/afterhours_')) {
  throw new Error('Release rejected: unapproved After Hours replacement artwork is still wired into the Home presentation.');
}

const assetRecords = [];
for (const [relativePath, expectedSha] of Object.entries(requiredAssets)) {
  const sourcePath = join(root, 'public', relativePath);
  const distPath = join(root, 'dist', relativePath);
  const sourceBytes = await readFile(sourcePath);
  const distBytes = await readFile(distPath).catch(() => {
    throw new Error(`Release rejected: approved asset missing from production build: /${relativePath}`);
  });
  const sourceSha = gitBlobSha(sourceBytes);
  const distSha = gitBlobSha(distBytes);
  if (sourceSha !== expectedSha || distSha !== expectedSha) {
    throw new Error(`Release rejected: approved asset hash mismatch for /${relativePath}.`);
  }
  assetRecords.push({
    path: `/${relativePath}`,
    bytes: distBytes.byteLength,
    gitBlobSha: distSha,
    sha256: createHash('sha256').update(distBytes).digest('hex')
  });
}

const html = await readFile(join(root, 'dist/index.html'), 'utf8');
if (!html.includes('assets/index-') || !html.includes('.js') || !html.includes('.css')) {
  throw new Error('Release rejected: Vite production HTML is missing fingerprinted JS/CSS entrypoints.');
}

const manifest = {
  application: 'Crashout Poker',
  presentation: 'Version 300 approved visual baseline',
  sourceRef: process.env.BLACKGLASS_SOURCE_REF || 'unknown',
  sourceSha: process.env.BLACKGLASS_SOURCE_SHA || 'unknown',
  workflowRunId: process.env.GITHUB_RUN_ID || 'local',
  approvedVisualCss: cssRecords,
  assets: assetRecords
};
await writeFile(join(root, 'dist/BLACKGLASS_BUILD.json'), JSON.stringify(manifest, null, 2) + '\\n');
console.log(`Verified version 300 visual baseline: ${assetRecords.length} exact approved image assets; source ${manifest.sourceSha}`);
