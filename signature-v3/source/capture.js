/* Capture the agent-mesh mark frame by frame from headless Chromium.
   seek(t) is deterministic, so each screenshot is exactly the frame we
   asked for rather than whatever rAF happened to land on. */
const fs = require("fs");
const path = require("path");

let puppeteer;
try { puppeteer = require("puppeteer-core"); }
catch (e) { puppeteer = require("puppeteer"); }

const CHROME = process.env.CHROME_PATH ||
  "C:\\Users\\amalr\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const HERE = __dirname;
const OUT = path.join(HERE, "frames");
const PAGE = "matrix.html";
const W = 264, H = 264; /* stage + 2px border each side */

(async () => {
  const i = process.argv.indexOf("--preview");
  const only = i > -1 ? Number(process.argv[i + 1]) : null;

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--force-device-scale-factor=1", "--hide-scrollbars", "--font-render-hinting=none"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(HERE, PAGE).replace(/\\/g, "/"), { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 15000 });


  const el = await page.$("#panel");

  if (only !== null) {
    await page.evaluate((t) => window.seek(t), only);
    await el.screenshot({ path: path.join(HERE, `preview-${only}.png`) });
    console.log("preview t=" + only);
    await browser.close();
    return;
  }

  const frames = await page.evaluate(() => window.framePlan());
  const meta = [];
  for (let n = 0; n < frames.length; n++) {
    const { t, d } = frames[n];
    await page.evaluate((ms) => window.seek(ms), t);
    await el.screenshot({ path: path.join(OUT, String(n).padStart(3, "0") + ".png") });
    meta.push({ i: n, t, d });
  }
  fs.writeFileSync(path.join(HERE, "frames.json"), JSON.stringify(meta, null, 1));
  console.log(`captured ${frames.length} frames, ${frames.reduce((s, f) => s + f.d, 0)}ms total`);
  await browser.close();
})();
