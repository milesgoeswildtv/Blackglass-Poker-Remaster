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
  await input.fill('ab-12cd34');
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
