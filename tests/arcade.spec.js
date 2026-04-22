const { test, expect } = require("playwright/test");

test("menu shows all arcade modes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Play Pulse Grid" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play Word Rush" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play Echo Reactor" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play Neon Brawl" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Music:/ })).toBeVisible();
});

test("pulse grid awards a correctly timed hit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Pulse Grid" }).click();
  await page.keyboard.press("Space");

  await page.evaluate(() => {
    const board = document.getElementById("rhythmGame");
    window.__arcadeTest.clearRhythmNotes();
    window.__arcadeTest.spawnRhythmNote(0, board.clientHeight * 0.82);
  });

  await page.keyboard.press("W");

  await expect
    .poll(async () => page.evaluate(() => window.__arcadeTest.getRhythmState().score))
    .toBeGreaterThan(0);
});

test("pulse grid ends the run after a bad tap with low shield", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Pulse Grid" }).click();
  await page.keyboard.press("Space");

  await page.evaluate(() => {
    window.__arcadeTest.clearRhythmNotes();
    window.__arcadeTest.setRhythmHealth(18);
  });

  await page.keyboard.press("W");

  await expect(page.locator("#rhythmOverlayTitle")).toHaveText("Run Over");
  await expect
    .poll(async () => page.evaluate(() => window.__arcadeTest.getRhythmState().running))
    .toBe(false);
});

test("echo reactor clears a round and fails on a wrong answer", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Echo Reactor" }).click();

  await page.evaluate(() => {
    window.__arcadeTest.setEchoSequence([0], { lives: 3, score: 0, round: 1 });
  });

  await page.keyboard.press("ArrowUp");

  await expect
    .poll(async () => page.evaluate(() => window.__arcadeTest.getEchoState().round))
    .toBe(2);

  await page.evaluate(() => {
    window.__arcadeTest.setEchoSequence([0], { lives: 1, score: 0, round: 1 });
  });

  await page.keyboard.press("ArrowRight");

  await expect(page.locator("#echoOverlayTitle")).toHaveText("Reactor Down");
});

test("neon brawl rewards the right counter and loses on a bad read", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Play Neon Brawl" }).click();

  await page.evaluate(() => {
    const arena = document.getElementById("brawlArena");
    window.__arcadeTest.stopBrawlLoop();
    window.__arcadeTest.clearBrawlEnemies();
    window.__arcadeTest.setBrawlState({ running: true, health: 100, combo: 0, score: 0, wave: 1 });
    window.__arcadeTest.spawnBrawlEnemy({
      side: "left",
      height: "mid",
      x: arena.clientWidth / 2 - 110,
      speed: 0
    });
  });

  await page.keyboard.press("ArrowLeft");

  await expect
    .poll(async () => page.evaluate(() => window.__arcadeTest.getBrawlState().score))
    .toBeGreaterThan(0);

  await page.evaluate(() => {
    const arena = document.getElementById("brawlArena");
    window.__arcadeTest.clearBrawlEnemies();
    window.__arcadeTest.setBrawlState({ running: true, health: 12, combo: 0, score: 0, wave: 1 });
    window.__arcadeTest.spawnBrawlEnemy({
      side: "left",
      height: "mid",
      x: arena.clientWidth / 2 - 100,
      speed: 0
    });
  });

  await page.keyboard.press("ArrowUp");

  await expect(page.locator("#brawlOverlayTitle")).toHaveText("Fight Over");
});
