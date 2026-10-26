import { chromium, devices } from "playwright";
import path from "path";
import fs from "fs";

const MEDIA =
  process.env.MEDIA_DIR ||
  "C:/Users/Akshit/AppData/Local/Cursor/AgentStores/cursor_agent_stores/bc-9d9862da-9b2d-4dd2-bf9a-423224c7ef8d/files/media";
const BASE = process.env.BASE_URL || "http://localhost:3000";

fs.mkdirSync(MEDIA, { recursive: true });

async function dismissName(page, name = "Agent Ace") {
  const input = page.getByPlaceholder("Your name");
  try {
    await input.waitFor({ timeout: 5000 });
    await input.fill(name);
    await page.getByRole("button", { name: "Enter" }).click();
    await page.waitForTimeout(600);
  } catch {
    // already named / skipped
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktop.goto(BASE, { waitUntil: "networkidle" });
  await dismissName(desktop);
  await desktop.waitForTimeout(800);
  await desktop.screenshot({ path: path.join(MEDIA, "spycy-lobby.png"), fullPage: false });

  const mobile = await browser.newPage({ ...devices["iPhone 13"] });
  await mobile.goto(BASE, { waitUntil: "networkidle" });
  await dismissName(mobile, "Host");
  await mobile.getByRole("button", { name: /Pass & play/i }).click({ timeout: 10000 });
  await mobile.waitForURL(/\/lobby\//, { timeout: 15000 });
  await mobile.waitForTimeout(800);

  for (const name of ["Blake", "Casey"]) {
    await mobile.getByPlaceholder("Player name").fill(name);
    await mobile.getByRole("button", { name: "Add" }).click();
    await mobile.waitForTimeout(400);
  }

  // Overwrite lobby shot with in-lobby players (more useful)
  await mobile.screenshot({ path: path.join(MEDIA, "spycy-lobby.png"), fullPage: false });

  await mobile.getByRole("button", { name: /Start game/i }).click();
  await mobile.waitForTimeout(1200);

  await mobile.getByText(/Pass to/i).waitFor({ timeout: 8000 });
  await mobile.screenshot({ path: path.join(MEDIA, "spycy-pass.png"), fullPage: false });

  for (let i = 0; i < 8; i++) {
    const ready = mobile.getByRole("button", { name: /I'm ready|Show ballot/i });
    const reveal = mobile.getByRole("button", { name: /^Reveal$/i });
    const hide = mobile.getByRole("button", { name: /Hide & pass/i });
    if (await ready.isVisible().catch(() => false)) {
      await ready.click();
      await mobile.waitForTimeout(400);
    } else if (await reveal.isVisible().catch(() => false)) {
      await reveal.click();
      await mobile.waitForTimeout(350);
      if (await hide.isVisible().catch(() => false)) {
        await hide.click();
        await mobile.waitForTimeout(500);
      }
    } else if (await mobile.getByText(/Discussion/i).isVisible().catch(() => false)) {
      break;
    } else {
      await mobile.waitForTimeout(400);
    }
  }

  await mobile.waitForTimeout(600);
  await mobile.screenshot({ path: path.join(MEDIA, "spycy-game-mobile.png"), fullPage: false });

  await browser.close();
  console.log("Wrote screenshots to", MEDIA);
  for (const f of ["spycy-lobby.png", "spycy-pass.png", "spycy-game-mobile.png"]) {
    const p = path.join(MEDIA, f);
    console.log(f, fs.existsSync(p) ? fs.statSync(p).size + " bytes" : "MISSING");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
