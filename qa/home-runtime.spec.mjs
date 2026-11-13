import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const evidenceDir = 'artifacts/browser-qa';

function accountFixture(displayName = 'Miles QA') {
  return {
    canonicalAccountId: 'blackglass-qa-account',
    identity: {
      provider: 'discord',
      displayName,
      username: 'blackglassqa',
      avatarUrl: ''
    },
    account: {
      equipped: 'default',
      inventory: ['default', 'deadMansHand', 'regalia', 'constellation'],
      notifications: {},
      links: {},
      access: {
        canHost: true,
        permanentHost: false,
        hostCredits: 3,
        invites: []
      }
    }
  };
}

async function mockHomeApis(page, displayName = 'Miles QA') {
  const unexpected = [];
  await page.route('https://telegram.org/js/telegram-web-app.js?*', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  await page.route('**/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/auth/me') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(accountFixture(displayName))
      });
    }
    if (path === '/api/access/key/redeem') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ redeemed: false })
      });
    }
    unexpected.push(`${request.method()} ${path}`);
    return route.fulfill({
      status: 501,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unexpected BLACKGLASS QA API request' })
    });
  });
  return unexpected;
}

async function openHome(page, displayName = 'Miles QA') {
  const unexpected = await mockHomeApis(page, displayName);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CRASHOUT POKER' })).toBeVisible();
  await expect(page.getByRole('button', { name: /CREATE GAME/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /JOIN GAME/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /BOOSTER SHOP/i })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(unexpected).toEqual([]);
}

async function shot(page, name) {
  await fs.mkdir(evidenceDir, { recursive: true });
  await page.screenshot({
    path: `${evidenceDir}/${name}.png`,
    animations: 'disabled',
    fullPage: false
  });
}

function relativeLuminance([r, g, b]) {
  const channel = value => {
    const s = value / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function rgb(value) {
  const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) throw new Error(`Could not parse CSS color: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

test.beforeEach(async () => {
  await fs.mkdir(evidenceDir, { recursive: true });
});

for (const [name, width, height] of [
  ['home-1366x768', 1366, 768],
  ['home-1440x900', 1440, 900],
  ['home-1920x1080', 1920, 1080],
  ['home-mobile-760x1000', 760, 1000],
  ['home-mobile-390x844', 390, 844],
  ['home-short-1100x600', 1100, 600]
]) {
  test(`renders real Home/Lobby at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openHome(page);
    await shot(page, name);
  });
}

test('Booster Shop label meets locked contrast in real computed CSS', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await openHome(page);
  const shop = page.getByRole('button', { name: /BOOSTER SHOP/i });
  const values = await shop.evaluate(button => {
    const label = button.querySelector('b');
    const labelStyle = getComputedStyle(label);
    const buttonStyle = getComputedStyle(button);
    return {
      color: labelStyle.color,
      backgroundColor: buttonStyle.backgroundColor
    };
  });
  const contrast = ratio(rgb(values.color), rgb(values.backgroundColor));
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test('Join entry preserves six-character code semantics and real modal body', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 760 });
  await openHome(page);
  await page.getByRole('button', { name: /JOIN GAME/i }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const input = dialog.locator('input').first();
  await expect(input).toHaveAttribute('maxlength', '6');
  await input.fill('ab12cd');
  await expect(input).toHaveValue('AB12CD');
  await input.fill('ab-cd');
  await expect(input).toHaveValue('ABCD');
  await input.fill('ab12cd');
  await expect(input).toHaveValue('AB12CD');
  await shot(page, 'home-modal-open-actual-join');
});

test('focus-visible treatment is rendered by the real app', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 760 });
  await openHome(page);
  const join = page.getByRole('button', { name: /JOIN GAME/i });
  await join.focus();
  await expect(join).toBeFocused();
  await shot(page, 'home-focus-visible');
});

test('long player identity compresses without replacing Home architecture', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 760 });
  await openHome(page, 'AshesToAshesAndBackAgain');
  await expect(page.getByRole('button', { name: /Open player profile/i })).toContainText('AshesToAshesAndBackAgain');
  await shot(page, 'home-long-name');
});


async function mockEntryGateApis(page) {
  const unexpected = [];
  await page.route('https://telegram.org/js/telegram-web-app.js?*', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  await page.route('**/api/**', async route => {
    const request = route.request();
    const apiPath = new URL(request.url()).pathname;
    if (apiPath === '/api/auth/me') {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Account required' })
      });
    }
    unexpected.push(`${request.method()} ${apiPath}`);
    return route.fulfill({
      status: 501,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unexpected Entry Gate QA API request' })
    });
  });
  return unexpected;
}

async function openEntryGate(page) {
  const unexpected = await mockEntryGateApis(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'CRASHOUT POKER' })).toBeVisible();
  await expect(page.getByRole('button', { name: /ENTER KEY/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /ENTER INVITE CODE/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /ENGINE \+ FAIRNESS/i })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(unexpected).toEqual([]);
}

for (const [name, width, height] of [
  ['entry-gate-390x844', 390, 844],
  ['entry-gate-430x932', 430, 932],
  ['entry-gate-landscape-844x390', 844, 390],
  ['entry-gate-desktop-1440x900', 1440, 900]
]) {
  test(`renders approved Entry Gate at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openEntryGate(page);
    await shot(page, name);
  });
}

for (const [name, width, height] of [
  ['home-approved-390x844', 390, 844],
  ['home-approved-430x932', 430, 932],
  ['home-approved-landscape-844x390', 844, 390],
  ['home-approved-desktop-1440x900', 1440, 900]
]) {
  test(`renders approved Home composition at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await openHome(page);
    await shot(page, name);
  });
}

test('Entry Gate action surfaces preserve existing interaction ownership', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openEntryGate(page);
  await page.getByRole('button', { name: /ENTER KEY/i }).click();
  await expect(page.locator('.privateCodeEntry input')).toBeVisible();
  await page.getByRole('button', { name: /ENTER INVITE CODE/i }).click();
  await expect(page.locator('.privateCodeEntry input')).toBeVisible();
  await page.getByRole('button', { name: /ENGINE \+ FAIRNESS/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});


test('version 300 approved visual assets are actually wired and served', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const home = await page.evaluate(() => {
    const shell = document.querySelector('.homeShell');
    const pseudo = getComputedStyle(shell, '::before').backgroundImage;
    const identity = getComputedStyle(document.querySelector('.homeIdentityTicket')).backgroundImage;
    const actions = [...document.querySelectorAll('.homeActionPrimary')].map(el => getComputedStyle(el).backgroundImage);
    const shop = getComputedStyle(document.querySelector('.homeActionShop')).backgroundImage;
    const logo = getComputedStyle(document.querySelector('.homeBrand h1')).backgroundImage;
    return { pseudo, identity, actions, shop, logo };
  });
  expect(home.pseudo).toContain('/assets/remaster/homescreen/CRASHOUT_DESKTOP_BG.PNG');
  expect(home.identity).toContain('/assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG');
  expect(home.actions[0]).toContain('/assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG');
  expect(home.actions[1]).toContain('/assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG');
  expect(home.shop).toContain('/assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG');
  expect(home.logo).toContain('/assets/remaster/entry-gate/CRASHOUT_LOGO.PNG');

  const entryUnexpected = await mockEntryGateApis(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /ENTER KEY/i })).toBeVisible();
  await page.getByRole('button', { name: /ENTER KEY/i }).click();
  const gate = await page.evaluate(() => ({
    background: getComputedStyle(document.querySelector('.homeShell'), '::before').backgroundImage,
    action: getComputedStyle(document.querySelector('.privateGateChoices button')).backgroundImage,
    input: getComputedStyle(document.querySelector('.privateCodeEntry input')).backgroundImage
  }));
  expect(gate.background).toContain('/assets/remaster/entry-gate/CRASHOUT_MOBILE_BG.PNG');
  expect(gate.action).toContain('/assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG');
  expect(gate.input).toContain('/assets/remaster/entry-gate/CRASHOUT_INPUT_FIELD.PNG');
  expect(entryUnexpected).toEqual([]);

  const assetPaths = [
    '/assets/remaster/entry-gate/CRASHOUT_APPROVED_ENTRY_GATE_REFERENCE.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_DESKTOP_BG.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_INFO_BAR_2.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_INPUT_FIELD.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_LANDSCAPE_BG.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_LOGO.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_MASTER_FULL_SCREEN_PANEL.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_MOBILE_BG.PNG',
    '/assets/remaster/entry-gate/CRASHOUT_PRIMARY_ACTION.PNG',
    '/assets/remaster/entry-gate/UTILITY_INFO_BADGE.PNG',
    '/assets/remaster/homescreen/CRASHOUT_APPROVED_HOMESCREEN_REFERENCE.PNG',
    '/assets/remaster/homescreen/CRASHOUT_BOOSTER_PANEL.PNG',
    '/assets/remaster/homescreen/CRASHOUT_CREATE_GAME_PANEL.PNG',
    '/assets/remaster/homescreen/CRASHOUT_DESKTOP_BG.PNG',
    '/assets/remaster/homescreen/CRASHOUT_INPUT_FIELD.PNG',
    '/assets/remaster/homescreen/CRASHOUT_JOIN_GAME_PANEL.PNG',
    '/assets/remaster/homescreen/CRASHOUT_LANDSCAPE_BG.PNG',
    '/assets/remaster/homescreen/CRASHOUT_MOBILE_BG.PNG',
    '/assets/remaster/homescreen/CRASHOUT_PLAYER_IDENTITY.PNG'
  ];
  const results = await page.evaluate(async paths => Promise.all(paths.map(async path => {
    const response = await fetch(path, { cache: 'no-store' });
    return { path, status: response.status, type: response.headers.get('content-type') };
  })), assetPaths);
  expect(results.filter(item => item.status !== 200 || !item.type?.startsWith('image/')).map(item => item.path)).toEqual([]);
});
