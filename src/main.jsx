import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Layers3,
  Lock,
  MessageSquare,
} from "lucide-react";
import "./styles.css";

const modes = {
  build: {
    label: "State",
    title: "Project state stays live",
    action: "Follow memory",
    tone: "#215cff",
  },
  ask: {
    label: "Impact",
    title: "See blast radius first",
    action: "Map change",
    tone: "#111216",
  },
  handoff: {
    label: "Hand off",
    title: "Carry work across people",
    action: "Continue work",
    tone: "#111216",
  },
  verify: {
    label: "Proof",
    title: "Claims wait for evidence",
    action: "Open ledger",
    tone: "#0d1117",
  },
};

const continuitySteps = [
  {
    label: "Intent",
    cold: "goal has to be explained again",
    live: "Goal, branch, owner, and risk stay attached to the work.",
    signal: "billing limits -> tenant safety",
  },
  {
    label: "Map",
    cold: "files are pasted back by hand",
    live: "Affected modules, tests, owners, and decisions are carried forward.",
    signal: "models -> webhooks -> replay tests",
  },
  {
    label: "Handoff",
    cold: "people inherit a transcript",
    live: "The next engineer receives current state, failed attempts, and next action.",
    signal: "Alice -> Aegyx -> Bob",
  },
  {
    label: "Repair",
    cold: "the same failure returns later",
    live: "Crashes, holds, and regressions become remembered constraints.",
    signal: "stack trace -> repair route",
  },
  {
    label: "Proof",
    cold: "claims blur with guesses",
    live: "Public claims wait for evidence, checks, and scorer-ready traces.",
    signal: "candidate -> checks -> claim boundary",
  },
];

const useCases = [
  {
    label: "Co-op coding",
    title: "Keep the room in sync",
    body: "People and agents work from the same branch state, risks, files, and decisions.",
    prompt: "Add organization billing limits without breaking tenant isolation.",
    result: "Plan, patch route, tests, and review boundary.",
    artifacts: [
      ["Goal", "billing limits with tenant safety"],
      ["Repo context", "plans, models, tests, owners"],
      ["Patch route", "smallest safe edit surface"],
      ["Review state", "what must pass before merge"],
    ],
  },
  {
    label: "Project briefing",
    title: "Explain decisions, not just files",
    body: "Aegyx returns the modules, tests, owners, and reasoning behind the shape of the system.",
    prompt: "What breaks if we change invoice finalization?",
    result: "Affected modules, tests, owners, and reasons.",
    artifacts: [
      ["Question", "invoice finalization impact"],
      ["Linked modules", "billing, webhooks, retries"],
      ["Tests & owners", "coverage and review path"],
      ["Decision trail", "why the flow is shaped this way"],
    ],
  },
  {
    label: "Impact preview",
    title: "Know blast radius before code",
    body: "Trace dependencies, runtime paths, tests, and project rules before changing code.",
    prompt: "If we move checkout retries into a background queue, what changes?",
    result: "Risk areas, affected files, and safe sequencing.",
    artifacts: [
      ["Change", "checkout retries to queue"],
      ["Blast radius", "runtime paths and callsites"],
      ["Migration", "safe order of edits"],
      ["Proof path", "tests and rollback handle"],
    ],
  },
  {
    label: "Onboarding",
    title: "Brief from lived project state",
    body: "Give new engineers the modules, invariants, danger zones, and safe first tasks.",
    prompt: "Brief a backend dev joining the payments team.",
    result: "Module map, project rules, and safe entry points.",
    artifacts: [
      ["Role", "backend developer"],
      ["Map to read", "payments, invoices, webhooks"],
      ["Safe tasks", "first changes with low blast radius"],
      ["Rules", "boundaries not to break"],
    ],
  },
  {
    label: "Handoffs",
    title: "Resume from the last clean state",
    body: "Carry intent, touched files, failed attempts, open risks, and verification state forward.",
    prompt: "Continue Alice's failed retry-loop repair from the last clean hold.",
    result: "Current state, next action, and rollback handle.",
    artifacts: [
      ["Last state", "clean checkpoint before failure"],
      ["Open hold", "why the attempt stopped"],
      ["Next action", "bounded retry path"],
      ["Rollback", "safe return point"],
    ],
  },
  {
    label: "Repair loop",
    title: "Turn failures into safer attempts",
    body: "Turn crashes, test failures, and security alerts into project-aware repair routes.",
    prompt: "A production stack trace points at webhook replay. Find the repair path.",
    result: "Root module, candidate fix, tests, and proof path.",
    artifacts: [
      ["Signal", "stack trace or failing test"],
      ["Root path", "module and owner"],
      ["Candidate", "minimal repair surface"],
      ["Checks", "proof before claim"],
    ],
  },
];

const proofRows = [
  ["PASS", "Evidence complete", "Applied patch, checks, and scorer input agree."],
  ["HOLD", "Missing proof", "If apply, tests, context, or scorer input is incomplete, the task stops with a reason."],
  ["INTERNAL", "Stress run", "Private long-horizon validation stays separate from public benchmark claims."],
  ["TRACE", "Inspectable path", "Raw output, patch materialization, checks, and scorer input stay separate."],
];

const memoryLayers = [
  ["Working turn", "current task, branch, intent, open risks"],
  ["Structural map", "files, symbols, tests, owners, interfaces"],
  ["Project rules", "architecture invariants, style, security boundaries"],
  ["Decision history", "accepted changes, rejected attempts, why it matters"],
  ["Team context", "handoffs, teammate notes, onboarding briefs"],
];

const queryChips = [
  "Where does auth enforce tenant boundaries?",
  "Which tests prove checkout still works?",
  "What should a new backend dev read first?",
  "Why is this module split across three packages?",
];

const wordmark = "AEGYX".split("");

const productSurfaces = [
  {
    eyebrow: "Intent",
    title: "Product work enters as accountable state",
    proof: "Goal, branch, constraints, owner, risk appetite.",
  },
  {
    eyebrow: "State",
    title: "People and agents share the same project memory",
    proof: "Files, tests, rules, owners, and decisions stay connected.",
  },
  {
    eyebrow: "Route",
    title: "Changes get routed before code is written",
    proof: "Affected modules, safe order, test path, review boundary.",
  },
  {
    eyebrow: "Handoff",
    title: "Work survives the person leaving the room",
    proof: "Intent, failed attempts, open risks, and next actions remain.",
  },
  {
    eyebrow: "Repair",
    title: "Repeated failures become remembered constraints",
    proof: "The system learns what failed, not only what shipped.",
  },
  {
    eyebrow: "Proof",
    title: "Evidence decides what can be claimed",
    proof: "Apply trace, tests, holds, public-safe boundary.",
  },
];

const autonomyModes = [
  ["Ask", "Find modules, tests, owners, and decisions."],
  ["Plan", "Map affected paths before any edit."],
  ["Draft", "Prepare a bounded patch route."],
  ["Repair", "Use failures as state, not noise."],
  ["Claim", "Publish only what evidence supports."],
];

const impactItems = [
  ["Files", "checkout queue, invoice finalization, webhook replay"],
  ["Tests", "billing limits, retry idempotency, tenant isolation"],
  ["Owners", "payments backend, platform security, release captain"],
  ["Risks", "duplicate charge, stale invoice, cross-tenant leak"],
  ["Order", "schema guard, queue route, replay repair, proof run"],
];

const growthRows = [
  ["Day 1", "project map, safe first tasks, onboarding state"],
  ["Week 2", "rules, failures, owners, risky paths"],
  ["Month 3", "decision history, repair memory, team conventions"],
];

const trustRows = [
  ["Code control", "Source stays local or VPC-bound unless you explicitly send it."],
  ["Claim control", "Private stress runs, internal holds, and public claims stay separate."],
  ["Security context", "Alerts become reviewed repair routes with affected callsites and tests."],
];

const packetTabs = [
  ["brief", "Request brief"],
  ["impact", "Repo impact map"],
  ["candidate", "Patch diff candidate"],
  ["proof", "Tests and proof gate"],
];

const packetFiles = [
  { name: "payments-api", depth: 0, state: "" },
  { name: "src", depth: 1, state: "" },
  { name: "routes", depth: 2, state: "" },
  { name: "payments.ts", depth: 3, state: "M", active: true },
  { name: "middleware", depth: 2, state: "" },
  { name: "idempotency.ts", depth: 3, state: "A" },
  { name: "lib", depth: 2, state: "" },
  { name: "idempotency-store.ts", depth: 3, state: "A" },
  { name: "types", depth: 2, state: "" },
  { name: "idempotency.d.ts", depth: 3, state: "A" },
  { name: "tests", depth: 1, state: "" },
  { name: "payments.idempotency.test.ts", depth: 2, state: "A" },
  { name: "package.json", depth: 0, state: "M" },
  { name: "yarn.lock", depth: 0, state: "M" },
];

const workPacketSteps = [
  {
    title: "Request brief",
    body: "State the change in plain language. Aegyx scopes the work and predicts impact.",
  },
  {
    title: "Repo impact map",
    body: "See exactly what will be touched. Files, owners, tests, and risk before any edit.",
  },
  {
    title: "Patch diff candidate",
    body: "Review the proposed changes in context. Minimal, targeted, and reversible.",
  },
  {
    title: "Tests and proof gate",
    body: "Run tests, verify constraints, and attach proof before shipping.",
  },
];

const packetDiffRows = [
  ["@@ -42,6 +42,24 @@ export async function createPayment(req, res) {"],
  ["42", "const { amount, currency, source } = req.body;", ""],
  ["43", "", ""],
  ["41", "+ const key = req.headers['idempotency-key'] as string | undefined;", "add"],
  ["41", "+ if (!key) {", "add"],
  ["42", "+   return res.status(400).json({ error: 'idempotency_key_required' });", "add"],
  ["43", "+ }", "add"],
  ["43", "+ const existing = await store.get(key);", "add"],
  ["43", "+ if (existing) {", "add"],
  ["44", "+   return res.status(200).json(existing);", "add"],
  ["45", "+ }", "add"],
  ["44", "const payment = await charge({ amount, currency, source });", ""],
  ["45", "+ await store.set(key, payment, { ttlSeconds: 60 * 60 * 24 });", "add"],
  ["46", "return res.status(201).json(payment);", ""],
  ["47", "}", ""],
];

const packetTestRows = [
  "payments.create.success",
  "payments.idempotent.replay",
  "payments.idempotent.concurrent",
  "payments.missing_key",
  "payments.store.ttl",
];

const packetProofRows = [
  "Idempotency enforced",
  "No duplicate charges",
  "Replay returns same response",
];

const packetStageData = [
  {
    label: "Brief",
    title: "Add idempotency key support to payment creation endpoint.",
    meta: [
      ["Service", "payments-api"],
      ["Type", "Feature"],
      ["Priority", "P1"],
      ["Owner", "@alice"],
    ],
    activeFile: "payments.ts",
    changed: "8 changed",
    toolbar: ["Diff", "Overview"],
    path: "src/routes/payments.ts",
    rows: packetDiffRows,
    testsTitle: "Scope",
    testsScore: "4 / 4 linked",
    tests: ["payments route", "idempotency store", "replay tests", "tenant boundary"],
    proofTitle: "Ready",
    proofScore: "3 / 3 set",
    proof: ["Owner assigned", "Risk marked low", "Rollback handle"],
    footer: { impact: "8 files", delta: "+142 / -3", risk: "Low", effort: "2h", action: "Map impact" },
  },
  {
    label: "Impact",
    title: "Map every touched module, owner, test, and risk before edit.",
    meta: [
      ["Surface", "payments"],
      ["Risk", "Replay"],
      ["Owners", "3"],
      ["Tests", "12"],
    ],
    activeFile: "idempotency-store.ts",
    changed: "8 touched",
    toolbar: ["Impact", "Risk"],
    path: "route: payments -> store -> replay tests",
    rows: [
      ["01", "src/routes/payments.ts - request boundary", ""],
      ["02", "src/lib/idempotency-store.ts - replay state", "add"],
      ["03", "src/middleware/idempotency.ts - key validation", "add"],
      ["04", "tests/payments.idempotency.test.ts - proof path", "add"],
      ["05", "types/idempotency.d.ts - contract surface", ""],
      ["06", "package.json - test script remains stable", ""],
    ],
    testsTitle: "Impact",
    testsScore: "8 paths",
    tests: ["route boundary", "store ttl", "concurrency replay", "missing key"],
    proofTitle: "Owners",
    proofScore: "3 linked",
    proof: ["Payments backend", "Platform security", "Release captain"],
    footer: { impact: "8 paths", delta: "4 tests", risk: "Low", effort: "2h", action: "Open route" },
  },
  {
    label: "Candidate",
    title: "Patch candidate stays minimal, targeted, and reversible.",
    meta: [
      ["Patch", "Candidate"],
      ["Mode", "Unified"],
      ["Files", "8"],
      ["Lines", "+142/-3"],
    ],
    activeFile: "payments.idempotency.test.ts",
    changed: "8 changed",
    toolbar: ["Diff", "Checks"],
    path: "candidate: idempotency replay patch",
    rows: packetDiffRows,
    testsTitle: "Tests",
    testsScore: "12 queued",
    tests: packetTestRows,
    proofTitle: "Safety",
    proofScore: "3 guards",
    proof: ["No broad rewrite", "No duplicate charges", "Rollback available"],
    footer: { impact: "8 files", delta: "+142 / -3", risk: "Low", effort: "2h", action: "Review patch" },
  },
  {
    label: "Proof",
    title: "Evidence locks the boundary before the change can ship.",
    meta: [
      ["Apply", "Clean"],
      ["Tests", "Pass"],
      ["Proof", "Linked"],
      ["Claim", "Bounded"],
    ],
    activeFile: "package.json",
    changed: "proof set",
    toolbar: ["Proof", "Ledger"],
    path: "proof-ledger/payments-idempotency",
    rows: [
      ["PASS", "patch applies cleanly", "add"],
      ["PASS", "payments.create.success", "add"],
      ["PASS", "payments.idempotent.replay", "add"],
      ["PASS", "payments.idempotent.concurrent", "add"],
      ["PASS", "payments.missing_key", "add"],
      ["PASS", "payments.store.ttl", "add"],
      ["HOLD", "no public claim without this evidence", ""],
    ],
    testsTitle: "Tests",
    testsScore: "12 / 12 passed",
    tests: packetTestRows,
    proofTitle: "Proof",
    proofScore: "3 / 3 checks",
    proof: packetProofRows,
    footer: { impact: "8 files", delta: "+142 / -3", risk: "Low", effort: "2h", action: "Continue to patch" },
  },
];

function CaseField({ active }) {
  const ref = useRef(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let width = 1;
    let height = 1;
    let raf = 0;
    let last = performance.now();
    const pointer = { x: -999, y: -999, target: 0, strength: 0 };
    let cells = [];

    const makeCells = () => {
      const cols = width < 640 ? 9 : 15;
      const rows = height < 420 ? 7 : 10;
      cells = Array.from({ length: cols * rows }, (_, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
          x: (col + 0.5 + (Math.random() - 0.5) * 0.34) / cols,
          y: (row + 0.5 + (Math.random() - 0.5) * 0.34) / rows,
          w: 16 + Math.random() * 42,
          h: 2 + Math.random() * 7,
          phase: Math.random() * Math.PI * 2,
          depth: Math.random(),
          blue: index % 11 === 0,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeCells();
    };

    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        pointer.x = x;
        pointer.y = y;
        pointer.target = 1;
      } else {
        pointer.target = 0;
      }
    };

    const leave = () => {
      pointer.target = 0;
    };

    const draw = (now) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      pointer.strength += (pointer.target - pointer.strength) * Math.min(1, dt * 8);
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const time = now / 1000;
      const mode = activeRef.current || 0;

      const wash = ctx.createLinearGradient(0, 0, width, height);
      wash.addColorStop(0, "rgba(255,255,255,0)");
      wash.addColorStop(0.58, "rgba(33,92,255,0.055)");
      wash.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      for (const cell of cells) {
        const modePush = (mode - 2) * 10;
        let x = cell.x * width + Math.sin(time * 0.42 + cell.phase) * (2 + cell.depth * 5) + modePush;
        let y = cell.y * height + Math.cos(time * 0.34 + cell.phase) * (2 + cell.depth * 8);
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const radius = width < 620 ? 132 : 176;
        const focus = dist < radius ? ((1 - dist / radius) ** 2) * pointer.strength : 0;
        if (focus > 0 && dist > 0.001) {
          x += (dx / dist) * focus * 34;
          y += (dy / dist) * focus * 26;
        }
        const lit = cell.blue || focus > 0.24 || Math.round(cell.depth * 10 + mode) % 9 === 0;
        const alpha = lit ? 0.18 + focus * 0.36 : 0.06 + cell.depth * 0.07;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = lit ? `rgba(33, 92, 255, ${alpha})` : `rgba(17, 18, 22, ${alpha})`;
        ctx.fillRect(-cell.w / 2, -cell.h / 2, cell.w, cell.h);
        if (focus > 0.1) {
          ctx.strokeStyle = `rgba(33, 92, 255, ${0.16 + focus * 0.28})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(-cell.w / 2 - 4, -cell.h / 2 - 5, cell.w + 8, cell.h + 10);
        }
        ctx.restore();
      }

      if (pointer.strength > 0.01) {
        const lens = ctx.createRadialGradient(pointer.x, pointer.y, 10, pointer.x, pointer.y, 168);
        lens.addColorStop(0, `rgba(255,255,255,${0.46 * pointer.strength})`);
        lens.addColorStop(0.55, `rgba(33,92,255,${0.06 * pointer.strength})`);
        lens.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = lens;
        ctx.fillRect(pointer.x - 160, pointer.y - 160, 320, 320);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas className="case-field" ref={ref} aria-hidden="true" />;
}

function BackgroundFlow() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let width = 1;
    let height = 1;
    let raf = 0;
    let last = performance.now();
    let scrollY = window.scrollY;
    let previousScrollY = window.scrollY;
    let scrollVelocity = 0;
    const pointer = { x: -1000, y: -1000, strength: 0, target: 0 };
    let cells = [];

    const makeCells = () => {
      const cols = window.innerWidth < 760 ? 14 : 22;
      const rows = window.innerHeight < 760 ? 10 : 14;
      cells = Array.from({ length: cols * rows }, (_, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return {
          x: (col + 0.5 + (Math.random() - 0.5) * 0.22) / cols,
          y: (row + 0.5 + (Math.random() - 0.5) * 0.22) / rows,
          width: 10 + Math.random() * 36,
          height: Math.random() > 0.82 ? 8 : 2,
          phase: Math.random() * Math.PI * 2,
          depth: Math.random(),
          gate: index % 17 === 0,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeCells();
    };

    const move = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.target = 1;
    };

    const leave = () => {
      pointer.target = 0;
    };

    const draw = (now) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      const rawScroll = window.scrollY;
      scrollVelocity += (rawScroll - previousScrollY - scrollVelocity) * 0.18;
      previousScrollY = rawScroll;
      scrollY += (rawScroll - scrollY) * 0.08;
      scrollVelocity *= 0.94;
      pointer.strength += (pointer.target - pointer.strength) * 0.08;
      ctx.clearRect(0, 0, width, height);

      const time = now / 1000;
      for (const cell of cells) {
        const drift = scrollY * (0.018 + cell.depth * 0.014);
        let x = cell.x * width + Math.sin(time * 0.18 + cell.phase) * (2 + cell.depth * 5);
        let y =
          ((cell.y * height + drift + Math.cos(time * 0.14 + cell.phase) * (2 + cell.depth * 8)) %
            (height + 80)) -
          40;
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const radius = width < 760 ? 128 : 190;
        const focus = dist < radius ? ((1 - dist / radius) ** 2) * pointer.strength : 0;
        if (focus > 0 && dist > 0.001) {
          x += (dx / dist) * focus * 42;
          y += (dy / dist) * focus * 34;
        }
        const scrollLift = Math.min(0.18, Math.abs(scrollVelocity) * 0.0025);
        const lit = cell.gate || focus > 0.2;
        const alpha = lit ? 0.1 + focus * 0.32 + scrollLift : 0.035 + cell.depth * 0.045;
        ctx.fillStyle = lit ? `rgba(33, 92, 255, ${alpha})` : `rgba(17, 18, 22, ${alpha})`;
        ctx.fillRect(x - cell.width / 2, y - cell.height / 2, cell.width, cell.height);
        if (focus > 0.16) {
          ctx.strokeStyle = `rgba(33, 92, 255, ${0.1 + focus * 0.22})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x - cell.width / 2 - 5, y - cell.height / 2 - 5, cell.width + 10, cell.height + 10);
        }
      }

      if (pointer.strength > 0.01) {
        const clear = ctx.createRadialGradient(pointer.x, pointer.y, 10, pointer.x, pointer.y, 210);
        clear.addColorStop(0, `rgba(255, 255, 255, ${0.24 * pointer.strength})`);
        clear.addColorStop(0.55, `rgba(33, 92, 255, ${0.035 * pointer.strength})`);
        clear.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = clear;
        ctx.fillRect(pointer.x - 190, pointer.y - 190, 380, 380);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas className="site-flow-background" ref={ref} aria-hidden="true" />;
}

function WorkPacketVisual({ active = 0, onSelect }) {
  const activeIndex = Math.max(0, Math.min(packetTabs.length - 1, active));
  const activeTab = packetTabs[activeIndex]?.[0] || "brief";
  const packet = packetStageData[activeIndex] || packetStageData[0];
  const visibleFiles = packetFiles.map((file) => ({
    ...file,
    active: file.name === packet.activeFile,
  }));

  return (
    <div className="work-packet" aria-label="Aegyx work packet interface">
      <nav className="work-packet-tabs" aria-label="Work packet stages">
        {packetTabs.map(([key, label], index) => (
          <span
            className={key === activeTab ? "is-active" : ""}
            key={key}
            onClick={() => onSelect?.(index)}
            onMouseEnter={() => onSelect?.(index)}
            onFocus={() => onSelect?.(index)}
            role="button"
            tabIndex={0}
          >
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <em>{label}</em>
          </span>
        ))}
      </nav>

      <section className="work-packet-brief" key={`brief-${activeTab}`}>
        <div className="brief-icon" aria-hidden="true">
          <BookOpen size={17} />
        </div>
        <div>
          <span>{packet.label}</span>
          <strong>{packet.title}</strong>
          <dl>
            {packet.meta.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="work-packet-workspace" key={`workspace-${activeTab}`}>
        <aside className="packet-file-tree">
          <div className="packet-pane-head">
            <span>Files</span>
            <strong>{packet.changed}</strong>
          </div>
          <div className="packet-tree">
            {visibleFiles.map((file, index) => (
              <article
                className={file.active ? "is-active" : ""}
                style={{ "--depth": file.depth, "--i": index }}
                key={`${file.name}-${index}`}
              >
                <i />
                <p>{file.name}</p>
                {file.state ? <em>{file.state}</em> : null}
              </article>
            ))}
          </div>
        </aside>

        <section className="packet-diff-panel">
          <div className="packet-diff-toolbar">
            <div>
              <span className="is-active">{packet.toolbar[0]}</span>
              <span>{packet.toolbar[1]}</span>
            </div>
            <div>
              <button type="button">Unified</button>
              <button type="button">3</button>
              <button className="icon-button" type="button" aria-label="More options">
                ...
              </button>
            </div>
          </div>
          <div className="packet-diff-path">/ {packet.path}</div>
          <div className="packet-diff-code" aria-label="Patch diff preview">
            {packet.rows.map((row, index) =>
              row.length === 1 ? (
                <p className="is-hunk" style={{ "--i": index }} key={`${row[0]}-${index}`}>
                  {row[0]}
                </p>
              ) : (
                <p
                  className={row[2] === "add" ? "is-add" : ""}
                  style={{ "--i": index }}
                  key={`${row[0]}-${row[1]}-${index}`}
                >
                  <span>{row[0]}</span>
                  <code>{row[1]}</code>
                </p>
              ),
            )}
          </div>
        </section>

        <aside className="packet-verifier">
          <section>
            <div className="packet-proof-head">
              <span>{packet.testsTitle}</span>
              <strong>{packet.testsScore}</strong>
            </div>
            <div className="packet-green-line" />
            {packet.tests.map((row, index) => (
              <p style={{ "--i": index }} key={row}>
                <i />
                {row}
              </p>
            ))}
            <a href="#proof">
              View all tests <ArrowUpRight size={14} />
            </a>
          </section>

          <section>
            <div className="packet-proof-head">
              <span>{packet.proofTitle}</span>
              <strong>{packet.proofScore}</strong>
            </div>
            <div className="packet-green-line" />
            {packet.proof.map((row, index) => (
              <p style={{ "--i": index }} key={row}>
                <i />
                {row}
              </p>
            ))}
            <a href="#proof">
              View proof ledger <ArrowUpRight size={14} />
            </a>
          </section>
        </aside>
      </div>

      <footer className="work-packet-footer">
        <span>
          Impact <strong>{packet.footer.impact}</strong>
        </span>
        <span className="is-green">{packet.footer.delta}</span>
        <span>
          Risk <strong className="is-green">{packet.footer.risk}</strong>
        </span>
        <span>
          Est. effort <strong>{packet.footer.effort}</strong>
        </span>
        <button type="button">{packet.footer.action}</button>
      </footer>
    </div>
  );
}

function WorkPacketSection({ active = 0 }) {
  const [previewActive, setPreviewActive] = useState(null);
  const stageRef = useRef(null);
  const displayActive = previewActive ?? active;

  useEffect(() => {
    setPreviewActive(null);
  }, [active]);

  const moveStage = (event) => {
    const node = stageRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--tilt-x", `${(-y * 1.1).toFixed(3)}deg`);
    node.style.setProperty("--tilt-y", `${(x * 1.25).toFixed(3)}deg`);
    node.style.setProperty("--lift", "1");
  };

  const leaveSection = () => {
    setPreviewActive(null);
    const node = stageRef.current;
    if (!node) return;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--lift", "0");
  };

  return (
    <section id="work" className="work-packet-shell" onMouseLeave={leaveSection}>
      <div className="work-packet-section">
        <div className="work-packet-copy">
          <span>How it works</span>
          <h2>
            One work packet.
            <br />
            Four verifiable states.
          </h2>
          <p>Aegyx carries the full engineering object from brief to proof.</p>
          <p>No context drift. No hidden steps.</p>

          <ol className="work-state-list">
            {workPacketSteps.map((item, index) => (
              <li
                className={index === displayActive ? "is-active" : displayActive > index ? "is-past" : ""}
                key={item.title}
                onMouseEnter={() => setPreviewActive(index)}
                onFocus={() => setPreviewActive(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>

        <div className="work-packet-stage" ref={stageRef} onPointerMove={moveStage}>
          <WorkPacketVisual active={displayActive} onSelect={setPreviewActive} />
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <header className="header">
      <a className="logo" href="#top">
        AEGYX
      </a>
      <nav>
        <a href="#work">Workflow</a>
        <a href="#contrast">Why</a>
        <a href="#usecases">Use cases</a>
        <a href="#product">Product</a>
        <a href="#impact">Impact</a>
        <a href="#proof">Proof</a>
        <a href="#access">Access</a>
      </nav>
    </header>
  );
}

function HeroAperture() {
  return (
    <div className="hero-aperture" aria-label="Aegyx project state aperture">
      <div className="aperture-stack" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <i className={`aperture-layer layer-${index}`} style={{ "--layer": index }} key={index} />
        ))}
        <div className="aperture-core">
          <span>live project state</span>
          <strong>memory survives the run</strong>
        </div>
      </div>
      <div className="aperture-tags">
        <span>people</span>
        <span>agents</span>
        <span>branches</span>
        <span>proof</span>
      </div>
    </div>
  );
}

function Hero() {
  const [active, setActive] = useState(null);
  const heroRef = useRef(null);

  const moveCursor = (event) => {
    const node = heroRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--cursor-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--cursor-y", `${event.clientY - rect.top}px`);
    node.style.setProperty("--mx", `${(event.clientX - rect.left) / rect.width - 0.5}`);
    node.style.setProperty("--my", `${(event.clientY - rect.top) / rect.height - 0.5}`);
    node.style.setProperty("--cursor-on", "1");
  };

  const leaveHero = () => {
    const node = heroRef.current;
    if (node) node.style.setProperty("--cursor-on", "0");
    setActive(null);
  };

  return (
    <section
      id="top"
      className={`hero hero-${active || "idle"}`}
      ref={heroRef}
      onPointerMove={moveCursor}
      onPointerLeave={leaveHero}
    >
      <div className="hero-copy">
        <h1 className="wordmark" aria-label="AEGYX">
          {wordmark.map((letter, index) => (
            <span className="wordmark-letter" style={{ "--letter-index": index }} aria-hidden="true" key={letter}>
              {letter}
            </span>
          ))}
        </h1>
        <p>Aegyx keeps project state alive across people, agents, branches, and proof.</p>
      </div>
      <div className="mode-dock" aria-label="Aegyx runtime surfaces">
        {Object.entries(modes).map(([key, item]) => (
          <a
            href={key === "verify" ? "#proof" : key === "ask" ? "#memory" : key === "handoff" ? "#handoffs" : "#usecases"}
            key={key}
            className={`mode-panel ${active === key ? "active" : ""}`}
            onPointerEnter={() => setActive(key)}
            style={{ "--tone": item.tone }}
          >
            <span>{item.label}</span>
            <strong>{item.title}</strong>
            <em>
              {item.action}
              <ArrowUpRight size={15} strokeWidth={1.8} />
            </em>
          </a>
        ))}
      </div>
      <a className="scroll" href="#usecases" aria-label="Scroll to use cases">
        <ChevronDown size={20} />
      </a>
    </section>
  );
}

function BeforeAfter() {
  const [active, setActive] = useState(1);
  const current = continuitySteps[active];

  return (
    <section id="contrast" className="section contrast continuity">
      <div className="section-title tight continuity-title">
        <span>Why it matters</span>
        <h2>Most AI work is a set of sessions. Aegyx behaves like project state.</h2>
      </div>
      <div className="continuity-stage" aria-label="Session tools compared with continuous Aegyx state">
        <aside className="cold-sessions" aria-label="Cold session tools">
          <div className="continuity-kicker">session tools</div>
          <div className="session-stack" aria-hidden="true">
            <article style={{ "--i": 0 }}>
              <span>new run</span>
              <strong>rebuild context</strong>
            </article>
            <article style={{ "--i": 1 }}>
              <span>new run</span>
              <strong>repeat history</strong>
            </article>
            <article style={{ "--i": 2 }}>
              <span>new run</span>
              <strong>guess proof</strong>
            </article>
          </div>
          <p>Every session can look useful while the project state quietly leaks away.</p>
        </aside>

        <div className="continuity-core" aria-label="Aegyx continuous state">
          <div className="state-ledger-head">
            <span>Aegyx</span>
            <strong>continuous engineering state</strong>
          </div>
          <div className="state-transfer">
            <div className="transfer-thread" aria-hidden="true">
              {continuitySteps.map((step, index) => (
                <i className={active >= index ? "is-lit" : ""} key={step.label} />
              ))}
            </div>
            <div className="transfer-copy">
              <span>{current.label}</span>
              <h3>{current.live}</h3>
              <p>{current.signal}</p>
            </div>
          </div>
          <div className="state-pulse-grid" aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => (
              <i className={(index + active) % 5 === 0 ? "is-hot" : ""} key={index} />
            ))}
          </div>
        </div>

        <div className="continuity-steps" aria-label="Continuous state surfaces">
          {continuitySteps.map((step, index) => (
            <button
              className={active === index ? "is-active" : ""}
              key={step.label}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{step.label}</span>
              <strong>{step.live}</strong>
              <em>{step.cold}</em>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases() {
  const [active, setActive] = useState(1);
  const activeCase = useCases[active];

  return (
    <section id="usecases" className="section usecases">
      <div className="section-title compact">
        <span>Use cases</span>
        <h2>The same project state follows planning, coding, review, and handoff.</h2>
      </div>
      <div className={`case-stage case-stage-${active}`}>
        <div className="case-tabs" aria-label="Aegyx use cases">
          {useCases.map(({ label, title }, index) => (
            <button
              className={active === index ? "is-active" : ""}
              key={label}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <span>{label}</span>
              <strong>{title}</strong>
            </button>
          ))}
        </div>
        <div className="case-workspace" aria-label="Active Aegyx use case">
          <div className="case-command">
            <CaseField active={active} />
            <div className="case-command-head">
              <span>live scenario</span>
              <span>{activeCase.label}</span>
            </div>
            <div className="case-query">
              <MessageSquare size={19} strokeWidth={1.8} />
              <p>{activeCase.prompt}</p>
            </div>
            <div className="case-state-plane" aria-hidden="true">
              {activeCase.artifacts.map(([label], index) => (
                <i className={`plane-segment segment-${index}`} key={label} />
              ))}
            </div>
            <div className="case-artifacts">
              {activeCase.artifacts.map(([label, text], index) => (
                <div className={`case-artifact artifact-${index}`} key={label}>
                  <span>{label}</span>
                  <strong>{text}</strong>
                </div>
              ))}
            </div>
            <div className="case-trace">
              {["intent", "state", "route", "candidate", "proof"].map((step, index) => (
                <React.Fragment key={step}>
                  <span>{step}</span>
                  {index < 4 ? <i /> : null}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="case-outcome">
            <div className="case-outcome-head">
              <span>{activeCase.label}</span>
            </div>
            <h3>{activeCase.title}</h3>
            <p>{activeCase.body}</p>
            <div className="case-result">
              <span>{activeCase.result}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Memory() {
  const [active, setActive] = useState(0);

  return (
    <section id="memory" className="section memory">
      <div className="section-title">
        <span>Shared project memory</span>
        <h2>Brief people from project history, not folklore.</h2>
      </div>
      <div className="memory-layout">
        <div className="memory-map" aria-label="Aegyx memory layers">
          <div className="memory-map-head">
            <span>repo memory</span>
            <span>live with the work</span>
          </div>
          {memoryLayers.map(([title, body], index) => (
            <button
              className={active === index ? "is-active" : ""}
              key={title}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <strong>{title}</strong>
              <span>{body}</span>
              <i />
            </button>
          ))}
        </div>
        <div className="repo-ask">
          <div className="repo-ask-head">
            <BookOpen size={20} strokeWidth={1.7} />
            <span>Questions people actually ask</span>
          </div>
          <div className="query-stack">
            {queryChips.map((query, index) => (
              <button className={active === index % memoryLayers.length ? "is-active" : ""} key={query}>
                {query}
              </button>
            ))}
          </div>
          <div className="answer-preview">
            <span>{memoryLayers[active][0]}</span>
            <strong>{memoryLayers[active][1]}</strong>
            <p>
              Aegyx answers with linked modules, tests, decisions, and open risks instead of forcing the team to reconstruct context from chat history.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductSurfaces() {
  const [active, setActive] = useState(2);
  const activeSurface = productSurfaces[active];
  const repoNodes = ["apps/web", "packages/billing", "services/webhooks", "tests/payments", "docs/adr"];
  const proofRail = [
    ["Known", "owner, branch, constraints"],
    ["Routed", "files, tests, risks"],
    ["Held", "missing proof stops the claim"],
    ["Claimable", "evidence survives review"],
  ];

  return (
    <section id="product" className="section product">
      <div className="section-title">
        <span>State layer</span>
        <h2>One continuous engineering state.</h2>
      </div>
      <div className="state-console" aria-label="Aegyx continuous engineering state console">
        <div className="console-repo" aria-label="Project map">
          <div className="console-kicker">project map</div>
          <div className="repo-lanes">
            {repoNodes.map((item, index) => (
              <button
                className={active === index % productSurfaces.length ? "is-active" : ""}
                style={{ "--depth": index % 3 }}
                key={item}
                onPointerEnter={() => setActive(index % productSurfaces.length)}
                onFocus={() => setActive(index % productSurfaces.length)}
              >
                <span>{item}</span>
                <i />
              </button>
            ))}
          </div>
        </div>

        <div className="console-packet">
          <div className="packet-topline">
            <Layers3 size={20} strokeWidth={1.8} />
            <span>live task packet</span>
          </div>
          <h3>Checkout retry migration stays connected from intent to proof.</h3>
          <div className="packet-stepper" aria-label="State surfaces">
            {productSurfaces.map((item, index) => (
              <button
                className={active === index ? "is-active" : ""}
                key={item.eyebrow}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <span>{item.eyebrow}</span>
              </button>
            ))}
          </div>
          <div className="packet-focus">
            <span>{activeSurface.eyebrow}</span>
            <strong>{activeSurface.title}</strong>
            <p>{activeSurface.proof}</p>
          </div>
        </div>

        <div className="console-proof" aria-label="Proof rail">
          <div className="console-kicker">proof rail</div>
          {proofRail.map(([label, body], index) => (
            <article className={index === active % proofRail.length ? "is-active" : ""} key={label}>
              <span>{label}</span>
              <strong>{body}</strong>
            </article>
          ))}
        </div>
      </div>
      <div className="surface-cta">
        <a href="#access">
          Request the full product brief
          <ArrowUpRight size={17} strokeWidth={1.8} />
        </a>
      </div>
    </section>
  );
}

function ImpactMap() {
  const [active, setActive] = useState(0);

  return (
    <section id="impact" className="section impact">
      <div className="section-title">
        <span>Impact before code</span>
        <h2>See the blast radius before anyone edits.</h2>
      </div>
      <div className="impact-layout">
        <div className="impact-request">
          <span>change request</span>
          <h3>Move checkout retries into a background queue.</h3>
          <p>Before a patch exists, Aegyx maps affected files, tests, owners, risks, and sequencing.</p>
        </div>

        <div className="impact-map" aria-label="Impact map">
          {impactItems.map(([label, detail], index) => (
            <button
              className={active === index ? "is-active" : ""}
              key={label}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span>{label}</span>
              <strong>{detail}</strong>
              <i />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Handoffs() {
  const [active, setActive] = useState(1);
  const handoffs = [
    ["Alice", "sets product intent and constraints"],
    ["Aegyx", "keeps state, risks, files, and next action"],
    ["Bob", "continues from engineering state"],
    ["Reviewer", "checks evidence before merge"],
  ];

  return (
    <section id="handoffs" className="section handoffs">
      <div className="section-title">
        <span>Team continuity</span>
        <h2>When people switch context, the project memory does not.</h2>
      </div>
      <div className="handoff-layout">
        <div className="handoff-board">
          {handoffs.map(([name, detail], index) => (
            <button
              className={active === index ? "is-active" : ""}
              key={name}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{name}</strong>
              <p>{detail}</p>
            </button>
          ))}
        </div>
        <div className="handoff-packet">
          <div className="packet-head">
            <Layers3 size={20} strokeWidth={1.7} />
            <span>handoff packet</span>
          </div>
          <div className="packet-lines">
            {[
              ["intent", "what the task is trying to change"],
              ["touched files", "where the current patch is operating"],
              ["open risks", "what can still break"],
              ["verification", "what was checked and what is still held"],
            ].map(([label, value], index) => (
              <div className={active === index ? "is-active" : ""} key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p>
            The next person does not inherit a transcript. They inherit a usable engineering state with what changed, why it matters, and what still needs proof.
          </p>
        </div>
      </div>
    </section>
  );
}

function Autonomy() {
  const [active, setActive] = useState(2);

  return (
    <section id="autonomy" className="section autonomy">
      <div className="section-title">
        <span>Work loop</span>
        <h2>Ask, plan, draft, repair, and claim without losing state.</h2>
      </div>
      <div className="autonomy-strip">
        {autonomyModes.map(([title, body], index) => (
          <button
            className={active === index ? "is-active" : ""}
            key={title}
            onPointerEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{title}</strong>
            <p>{body}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function MemoryGrowth() {
  return (
    <section id="growth" className="section growth">
      <div className="section-title">
        <span>Memory compounds</span>
        <h2>Aegyx gets more useful as the project moves.</h2>
      </div>
      <div className="growth-timeline">
        {growthRows.map(([label, body], index) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{body}</strong>
            <i style={{ "--progress": `${(index + 1) * 33}%` }} />
          </article>
        ))}
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section id="trust" className="section trust">
      <div className="section-title">
        <span>Private by design</span>
        <h2>For teams that need AI to know the project without leaking the project.</h2>
      </div>
      <div className="trust-rows">
        {trustRows.map(([title, body]) => (
          <article key={title}>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section id="proof" className="section proof">
      <div className="section-title">
        <span>Proof boundary</span>
        <h2>Evidence, stress runs, and non-claims stay separated.</h2>
      </div>
      <div className="proof-ledger">
        {proofRows.map(([index, value, label]) => (
          <article className="proof-row" key={index}>
            <span>{index}</span>
            <strong>{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Access() {
  return (
    <section id="access" className="section access">
      <div className="access-card">
        <div>
          <span className="access-note"><Lock size={15} /> Closed prototype</span>
          <h2>Private research access with bounded claims.</h2>
          <p>
            Public material can describe evaluated behavior, known holds, and deployment boundaries without disclosing internal implementation.
          </p>
        </div>
        <a className="big-link" href="mailto:research@aegyx.ai">
          Request bounded brief
          <ArrowUpRight size={21} />
        </a>
      </div>
      <div className="footer-line">
        <span>Aegyx 0.1</span>
        <span>Long-horizon AI systems</span>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WorkPacketSection />
        <BeforeAfter />
        <UseCases />
        <ProductSurfaces />
        <ImpactMap />
        <Memory />
        <Handoffs />
        <Autonomy />
        <MemoryGrowth />
        <Proof />
        <Trust />
        <Access />
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
