import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const URL = "http://127.0.0.1:5177/";
const OUT_DIR = path.resolve("qa");
const PORT = 9333 + Math.floor(Math.random() * 400);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitJson(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      // keep polling
    }
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });
  return {
    ready: new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    }),
    send(method, params = {}) {
      id += 1;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
    },
    close() {
      ws.close();
    },
  };
}

async function waitForExpression(client, expression, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await client.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.result?.value) return;
    await delay(150);
  }
  throw new Error(`Timed out waiting for expression: ${expression}`);
}

async function screenshot(client, file, { width, height, scrollY = 0, selector = null, hover = null, sweep = false }) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  await client.send("Runtime.evaluate", {
    expression: selector
      ? `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: "start" });`
      : `window.scrollTo(0, ${scrollY});`,
    awaitPromise: false,
  });
  if (hover) {
    await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hover.x, y: hover.y });
  }
  if (sweep) {
    for (const point of [
      [280, 280],
      [460, 360],
      [680, 300],
      [900, 420],
      [1120, 330],
    ]) {
      await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: point[0], y: point[1] });
      await delay(180);
    }
  }
  if (!selector) {
    await client.send("Runtime.evaluate", {
      expression: `window.scrollTo(0, ${scrollY});`,
      awaitPromise: false,
    });
  }
  await delay(1200);
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(path.join(OUT_DIR, file), Buffer.from(result.data, "base64"));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = spawn(EDGE, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=" + path.resolve("qa", `.edge-profile-${PORT}`),
    URL,
  ], { stdio: "ignore" });
  try {
    const tabs = await waitJson(`http://127.0.0.1:${PORT}/json`);
    const tab = tabs.find((item) => item.type === "page") || tabs[0];
    const client = cdp(tab.webSocketDebuggerUrl);
    await client.ready;
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Page.navigate", { url: URL });
    await waitForExpression(client, "document.querySelector('.hero-copy h1')?.textContent === 'AEGYX'");
    await client.send("Runtime.evaluate", {
      expression: `document.documentElement.style.scrollBehavior = "auto";`,
      awaitPromise: false,
    });
    await delay(1600);
    await screenshot(client, "aegyx-cdp-desktop.png", { width: 1440, height: 1000 });
    await screenshot(client, "aegyx-cdp-wordmark-hover.png", { width: 1440, height: 1000, hover: { x: 706, y: 270 } });
    await screenshot(client, "aegyx-cdp-cursor-field.png", { width: 1440, height: 1000, sweep: true });
    await screenshot(client, "aegyx-cdp-hover-memory.png", { width: 1440, height: 1000, hover: { x: 235, y: 792 } });
    await screenshot(client, "aegyx-cdp-hover-graph.png", { width: 1440, height: 1000, hover: { x: 706, y: 792 } });
    await screenshot(client, "aegyx-cdp-hover-verify.png", { width: 1440, height: 1000, hover: { x: 1120, y: 792 } });
    await screenshot(client, "aegyx-cdp-work.png", { width: 1440, height: 1000, selector: "#work" });
    await screenshot(client, "aegyx-cdp-work-candidate.png", { width: 1440, height: 1000, selector: "#work", hover: { x: 940, y: 250 } });
    await screenshot(client, "aegyx-cdp-work-proof.png", { width: 1440, height: 1000, selector: "#work", hover: { x: 1200, y: 250 } });
    await screenshot(client, "aegyx-cdp-contrast.png", { width: 1440, height: 1000, selector: "#contrast" });
    await screenshot(client, "aegyx-cdp-usecases.png", { width: 1440, height: 1000, selector: "#usecases" });
    await screenshot(client, "aegyx-cdp-product.png", { width: 1440, height: 1000, selector: "#product" });
    await screenshot(client, "aegyx-cdp-impact.png", { width: 1440, height: 1000, selector: "#impact" });
    await screenshot(client, "aegyx-cdp-memory.png", { width: 1440, height: 1000, selector: "#memory" });
    await screenshot(client, "aegyx-cdp-handoffs.png", { width: 1440, height: 1000, selector: "#handoffs" });
    await screenshot(client, "aegyx-cdp-autonomy.png", { width: 1440, height: 1000, selector: "#autonomy" });
    await screenshot(client, "aegyx-cdp-growth.png", { width: 1440, height: 1000, selector: "#growth" });
    await screenshot(client, "aegyx-cdp-proof.png", { width: 1440, height: 1000, selector: "#proof" });
    await screenshot(client, "aegyx-cdp-trust.png", { width: 1440, height: 1000, selector: "#trust" });
    await screenshot(client, "aegyx-cdp-access.png", { width: 1440, height: 1000, selector: "#access" });
    await screenshot(client, "aegyx-cdp-mobile.png", { width: 390, height: 900 });
    await screenshot(client, "aegyx-cdp-mobile-work.png", { width: 390, height: 900, selector: "#work" });
    client.close();
  } finally {
    browser.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
