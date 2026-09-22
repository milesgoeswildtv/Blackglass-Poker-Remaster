import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const evidenceDir = 'artifacts/browser-qa-internal';

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
      stats: {
        handsPlayed: 1284,
        tournamentsPlayed: 42,
        tournamentWins: 6,
        finalTables: 14,
        knockouts: 93,
        biggestPot: 28750
      },
      notifications: { tournamentStart: true, tableMove: true, turnReminder: false },
      links: {
        telegram: {
          username: 'blackglassqa',
          displayName: 'Miles QA'
        }
      },
      purchases: [{
        purchaseId: 'qa-purchase-001',
        purchaseKey: 'constellation',
        reference: 'QA-REF-001',
        source: 'stripe',
        status: 'paid',
        amountTotal: 999,
        amountRefunded: 0,
        currency: 'usd',
        at: '2026-09-22T12:00:00Z'
      }],
      access: {
        canHost: true,
        permanentHost: false,
        hostCredits: 3,
        invites: []
      }
    }
  };
}

const catalogFixture = {
  configured: true,
  mode: 'test',
  products: [
    { key: 'constellation', available: true, unitAmount: 999, currency: 'usd' },
    { key: 'deadMansHand', available: true, unitAmount: 999, currency: 'usd' },
    { key: 'regalia', available: true, unitAmount: 999, currency: 'usd' },
    { key: 'tripleThreat', available: true, unitAmount: 2499, currency: 'usd', bundle: true, grants: ['constellation','deadMansHand','regalia'] }
  ]
};

async function mockApis(page, displayName = 'Miles QA') {
  const observed = [];
  await page.route('https://telegram.org/js/telegram-web-app.js?*', route =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  await page.route('**/api/**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    observed.push({ method, path, body: req.postData() || '' });

    if (path === '/api/auth/me') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(accountFixture(displayName)) });
    }
    if (path === '/api/shop/catalog') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(catalogFixture) });
    }
    if (path === '/api/access/key/redeem') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ redeemed: false }) });
    }
    if (path === '/api/account/equip') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(accountFixture(displayName).account) });
    }
    if (path === '/api/account/notifications') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ account: accountFixture(displayName).account }) });
    }
    if (path === '/api/access/invite/claim') {
      return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'BLACKGLASS QA stop after wiring check' }) });
    }
    if (path === '/api/tables' || path === '/api/tournaments') {
      return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'BLACKGLASS QA stop after wiring check' }) });
    }
    if (path === '/api/auth/logout') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    if (path === '/api/shop/refund' || path === '/api/shop/stars/refund') {
      return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'BLACKGLASS QA refund not executed' }) });
    }
    return route.fulfill({ status: 501, contentType: 'application/json', body: JSON.stringify({ error: 'Unexpected BLACKGLASS QA API request' }) });
  });
  return observed;
}

async function openHome(page, { displayName = 'Miles QA', url = '/' } = {}) {
  const observed = await mockApis(page, displayName);
  await page.goto(url);
  await expect(page.getByRole('heading', { name: 'CRASHOUT POKER' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return observed;
}

async function shot(page, name) {
  await fs.mkdir(evidenceDir, { recursive: true });
  await page.screenshot({ path: `${evidenceDir}/${name}.png`, animations: 'disabled', fullPage: false });
}

test.beforeEach(async () => {
  await fs.mkdir(evidenceDir, { recursive: true });
});

test('Join real body, six-character semantics and both action wiring paths survive', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 760 });
  const observed = await openHome(page);
  await page.getByRole('button', { name: /JOIN GAME/i }).click();
  const dialog = page.getByRole('dialog', { name: /Got a code/i });
  await expect(dialog).toBeVisible();

  const input = dialog.locator('input').first();
  await expect(input).toHaveAttribute('maxlength', '6');
  await input.fill('ab-cd');
  await expect(input).toHaveValue('ABCD');
  await expect(dialog.getByRole('button', { name: /Join Tournament/i })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: /Join Quick Table/i })).toBeDisabled();

  await input.fill('ab12cd');
  await expect(input).toHaveValue('AB12CD');
  await dialog.getByRole('button', { name: /Join Quick Table/i }).click();
  await expect.poll(() => observed.some(x => x.path === '/api/access/invite/claim' && x.body.includes('"kind":"table"') && x.body.includes('"code":"AB12CD"'))).toBeTruthy();

  await dialog.getByRole('button', { name: /Join Tournament/i }).click();
  await expect.poll(() => observed.some(x => x.path === '/api/access/invite/claim' && x.body.includes('"kind":"tournament"') && x.body.includes('"code":"AB12CD"'))).toBeTruthy();

  await shot(page, 'internal-join-desktop');
});

test('Create retains presets, custom fields, toggles and both create action payload paths', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 820 });
  const observed = await openHome(page);
  await page.getByRole('button', { name: /CREATE GAME/i }).click();

  const dialog = page.getByRole('dialog', { name: /Build the room/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: /STACK 2,500/i })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /BLINDS 10m/i })).toBeVisible();

  const inputs = dialog.locator('input');
  await inputs.nth(0).fill('7777');
  await inputs.nth(1).fill('12');

  await dialog.getByRole('button', { name: /ON|OFF/ }).first().click();
  const breakToggle = dialog.locator('.homeCreateBreakToggle');
  await breakToggle.click();
  await expect(dialog.locator('.homeCreateBreakEvery')).toHaveCount(0);
  await breakToggle.click();
  await expect(dialog.locator('.homeCreateBreakEvery input')).toBeVisible();

  await dialog.getByRole('button', { name: /QUICK TABLE/i }).click();
  await expect.poll(() => observed.some(x => x.path === '/api/tables' && x.method === 'POST' && x.body.includes('"startingChips":7777') && x.body.includes('"blindMinutes":12'))).toBeTruthy();

  await dialog.getByRole('button', { name: /MULTI-TABLE TOURNAMENT/i }).click();
  await expect.poll(() => observed.some(x => x.path === '/api/tournaments' && x.method === 'POST' && x.body.includes('"startingChips":7777') && x.body.includes('"blindMinutes":12'))).toBeTruthy();

  await shot(page, 'internal-create-desktop');
});

test('Profile drawer retains account sections, Purchase History and refund-confirm adjacency', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await openHome(page, { displayName: 'AshesToAshesAndBackAgain' });
  await page.getByRole('button', { name: /Open player profile/i }).click();

  const drawer = page.locator('.profileDrawer');
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText('Lifetime Stats');
  await expect(drawer).toContainText('Booster Loadout');
  await expect(drawer).toContainText('Connected Accounts');
  await expect(drawer).toContainText('Telegram Notifications');
  await expect(drawer).toContainText('Purchases');
  await expect(drawer).toContainText('AshesToAshesAndBackAgain');

  await shot(page, 'internal-profile-desktop');

  await drawer.getByRole('button', { name: /REQUEST REFUND/i }).click();
  const refund = page.getByRole('dialog', { name: /Confirm refund/i });
  await expect(refund).toBeVisible();
  await expect(refund).toContainText('Constellation');
  await shot(page, 'internal-profile-refund-confirm');
});

test('Booster Shop, nested detail and public identity converge without commerce mutation', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await openHome(page);
  await page.getByRole('button', { name: /BOOSTER SHOP/i }).click();

  const shop = page.getByRole('dialog', { name: 'Booster Shop' });
  await expect(shop).toBeVisible();
  await expect(shop).toContainText('Build your table identity.');
  await expect(shop).toContainText('Constellation');
  await expect(shop).toContainText('Dead Man');
  await expect(shop).toContainText('Regalia');

  await shop.getByRole('button', { name: /VIEW INCLUDED COSMETICS/i }).first().click();
  const detail = page.getByRole('dialog', { name: /Constellation details/i });
  await expect(detail).toBeVisible();
  await expect(detail).toContainText('CRASHOUT POKER COSMETICS');
  await expect(detail).not.toContainText('FULL TILT COSMETICS');
  await shot(page, 'internal-shop-detail-desktop');
});

test('PurchaseUnlock uses real Shop lifecycle after checkout-return reconciliation', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 820 });
  await openHome(page, { url: '/?shop=success&pack=constellation' });
  const unlock = page.getByRole('dialog', { name: /Constellation unlocked/i });
  await expect(unlock).toBeVisible({ timeout: 10000 });
  await expect(unlock).toContainText('PURCHASE COMPLETE');
  await expect(unlock).toContainText('KEEP BROWSING');
  await shot(page, 'internal-shop-purchase-unlock');
});

test('Engine Why/Audit local-state navigation and close semantics survive', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 820 });
  await openHome(page);
  await page.getByRole('button', { name: /ENGINE \+ FAIRNESS/i }).click();

  const engine = page.getByRole('dialog', { name: /Crashout Poker engine information/i });
  await expect(engine).toBeVisible();
  await expect(engine).toContainText('ENGINE AUDIT');
  await shot(page, 'internal-engine-why');

  await engine.getByRole('button', { name: /ENGINE AUDIT/i }).click();
  await expect(engine).toContainText('BACK TO WHY');
  await shot(page, 'internal-engine-audit');

  await page.keyboard.press('Escape');
  await expect(engine).toBeHidden();
});

for (const [surface, open] of [
  ['create', async page => page.getByRole('button', { name: /CREATE GAME/i }).click()],
  ['join', async page => page.getByRole('button', { name: /JOIN GAME/i }).click()],
  ['profile', async page => page.getByRole('button', { name: /Open player profile/i }).click()],
  ['shop', async page => page.getByRole('button', { name: /BOOSTER SHOP/i }).click()],
  ['engine', async page => page.getByRole('button', { name: /ENGINE \+ FAIRNESS/i }).click()]
]) {
  test(`${surface} remains coherent at 390px compact width`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openHome(page);
    await open(page);
    await shot(page, `internal-${surface}-mobile-390`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('Create remains usable under independent short-height pressure', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 600 });
  await openHome(page);
  await page.getByRole('button', { name: /CREATE GAME/i }).click();
  const dialog = page.getByRole('dialog', { name: /Build the room/i });
  await expect(dialog).toBeVisible();
  await shot(page, 'internal-create-short-height');
});

test('focus-visible survives on converged internal controls', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 760 });
  await openHome(page);
  await page.getByRole('button', { name: /JOIN GAME/i }).click();
  const input = page.getByRole('dialog', { name: /Got a code/i }).locator('input').first();
  await input.focus();
  await expect(input).toBeFocused();
  const focus = await input.evaluate(el => {
    const style = getComputedStyle(el);
    return {
      outlineStyle: style.outlineStyle,
      outlineColor: style.outlineColor,
      outlineWidth: style.outlineWidth,
      outlineOffset: style.outlineOffset
    };
  });
  expect(focus.outlineStyle).not.toBe('none');
  expect(focus.outlineColor).toBe('rgb(242, 196, 95)');
  expect(focus.outlineWidth).toBe('2px');
  expect(focus.outlineOffset).toBe('2px');
  await shot(page, 'internal-focus-visible');
});


async function rect(locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box;
}

function overlaps(a, b, gap = 0) {
  return !(a.x + a.width + gap <= b.x || b.x + b.width + gap <= a.x || a.y + a.height + gap <= b.y || b.y + b.height + gap <= a.y);
}

test('Join body has non-colliding code help and stacked actions at desktop and compact width', async ({ page }) => {
  for (const viewport of [{ width: 1100, height: 760 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openHome(page);
    await page.getByRole('button', { name: /JOIN GAME/i }).click();
    const dialog = page.getByRole('dialog', { name: /Got a code/i });
    const input = dialog.locator('.homeJoinCode input');
    const help = dialog.locator('.homeJoinCode small');
    const tournament = dialog.locator('.homeJoinTournament');
    const quick = dialog.locator('.homeJoinQuick');

    const modalBox = await rect(dialog);
    const inputBox = await rect(input);
    const helpBox = await rect(help);
    const tournamentBox = await rect(tournament);
    const quickBox = await rect(quick);

    expect(inputBox.width).toBeGreaterThanOrEqual(modalBox.width * 0.75);
    expect(helpBox.y).toBeGreaterThanOrEqual(inputBox.y + inputBox.height + 3);
    expect(tournamentBox.width).toBeGreaterThanOrEqual(modalBox.width * 0.75);
    expect(quickBox.width).toBeGreaterThanOrEqual(modalBox.width * 0.75);
    expect(quickBox.y).toBeGreaterThanOrEqual(tournamentBox.y + tournamentBox.height + 7);
    expect(overlaps(tournamentBox, quickBox)).toBeFalsy();

    await dialog.getByLabel('Close join game').click();
  }
});

test('Create compact title does not collide with the close control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await page.getByRole('button', { name: /CREATE GAME/i }).click();
  const dialog = page.getByRole('dialog', { name: /Build the room/i });
  const title = await rect(dialog.locator('.homeCreateTitle h2'));
  const close = await rect(dialog.getByLabel('Close create game settings'));
  expect(overlaps(title, close, 6)).toBeFalsy();
});

test('Profile long identity stays contained inside the drawer', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await openHome(page, { displayName: 'AshesToAshesAndBackAgain' });
  await page.getByRole('button', { name: /Open player profile/i }).click();
  const drawer = page.locator('.profileDrawer');
  const header = drawer.locator('header');
  const title = drawer.locator('h2');
  const drawerBox = await rect(drawer);
  const headerBox = await rect(header);
  const titleBox = await rect(title);
  expect(titleBox.x).toBeGreaterThanOrEqual(headerBox.x);
  expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(drawerBox.x + drawerBox.width - 16);
  const overflow = await drawer.evaluate(el => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
