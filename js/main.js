/* firasridene.tech · no frameworks, just fetch + DOM.
   Content lives in data/*.json; this file only renders it. */

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* external links always open in a new tab */
const EXT = 'target="_blank" rel="noopener"';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

/* ---------------- tech icons (Simple Icons, self-hosted, monochrome via CSS mask) ---------------- */

const ICONS = {
  "python": "python", "fastapi": "fastapi", "react": "react", "next.js": "nextdotjs",
  "typescript": "typescript", "postgresql": "postgresql", "pgvector": "postgresql",
  "supabase": "supabase", "twilio": "twilio", "stripe": "stripe", "redis": "redis",
  "docker": "docker", "langchain": "langchain", "anthropic claude": "anthropic",
  "claude code": "claude", "gemini": "googlegemini", "n8n": "n8n", "notion": "notion",
  "notion mcp": "notion", "github": "github", "git/github": "github", "github cli": "github",
  "github actions": "githubactions", "github models (gpt-4o-mini)": "github",
  "elasticsearch": "elasticsearch", "kibana": "kibana", "tensorflow": "tensorflow",
  "pytorch": "pytorch", "scikit-learn": "scikitlearn", "mlflow": "mlflow",
  "opencv": "opencv", "tailwindcss": "tailwindcss", "telegram": "telegram",
  "railway": "railway", "vercel": "vercel", "gradio": "gradio", "odoo": "odoo",
  "java (spring boot)": "spring", "js (node.js)": "nodedotjs", "pandas": "pandas",
  "make": "make", "google maps api": "googlemaps", "render": "render",
};

function chips(stack) {
  const items = stack.split(",").map((s) => s.trim()).filter(Boolean);
  return `<div class="stack-chips">${items
    .map((name) => {
      const slug = ICONS[name.toLowerCase()];
      const icon = slug ? `<i class="tico" style="--i:url('/assets/icons/${slug}.svg')" aria-hidden="true"></i>` : "";
      return `<span class="chip">${icon}${esc(name)}</span>`;
    })
    .join("")}</div>`;
}

/* ---------------- rail / header ---------------- */

function renderRail(site) {
  const time = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timezone }).format(new Date());

  $("#railStatus").innerHTML = `
    <div><span class="live" aria-hidden="true"></span>${esc(site.status.availability)}</div>
    <div>${esc(site.location)} · <span id="clock">${time()}</span></div>`;
  setInterval(() => { const c = $("#clock"); if (c) c.textContent = time(); }, 30_000);

  $("#railLinks").innerHTML = `
    <a href="${esc(site.links.github)}" ${EXT}>github</a>
    <a href="${esc(site.links.linkedin)}" ${EXT}>linkedin</a>
    <a href="${esc(site.links.youtube)}" ${EXT}>youtube</a>
    <a href="mailto:${esc(site.links.email)}">email</a>
    <a href="${esc(site.resume)}" ${EXT}>resume</a>`;
}

/* ---------------- hero ---------------- */

function renderHero(profile, site) {
  $("#heroEyebrow").textContent = profile.hero.eyebrow;
  $("#heroHeadline").innerHTML = esc(profile.hero.headline).replace("agent systems", "<em>agent systems</em>");
  $("#heroSub").textContent = profile.hero.sub;
  $("#ctaMail").href = `mailto:${site.links.email}`;
  const r = $("#ctaResume");
  r.href = site.resume;
}

/* The door. A horseshoe arch of studs drawn on canvas, alive:
   studs breathe, brass messages travel the arch like agents talking,
   and the ones near your cursor wake up. Sidi Bou Said, at work. */
function initDoor() {
  const canvas = $("#doorCanvas");
  if (!canvas || canvas.clientWidth === 0) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const BRASS = [232, 180, 92];
  const CHALK = [245, 244, 239];

  let W, H, studs, arch, sparks = [], raf = null, visible = true;
  const mouse = { x: -1e4, y: -1e4 };

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    studs = [];
    arch = [];
    const cx = W / 2, cy = H * 0.5;
    const R = Math.min(W * 0.42, H * 0.42, 480);

    /* two concentric stud rows tracing a horseshoe arch */
    const rows = [
      { r: R, size: 3.1, tone: BRASS, main: true },
      { r: R + 30, size: 2.2, tone: CHALK, main: false },
    ];
    const a0 = Math.PI * 0.94, a1 = Math.PI * 2.06;
    for (const row of rows) {
      const n = Math.max(16, Math.floor(((a1 - a0) * row.r) / 27));
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        const s = {
          x: cx + row.r * Math.cos(a),
          y: cy + row.r * Math.sin(a),
          r: row.size,
          tone: row.tone,
          glow: 0,
          phase: Math.random() * Math.PI * 2,
        };
        studs.push(s);
        if (row.main) arch.push(s);
      }
      /* columns dropping from the arch's widest points to the floor */
      for (const sx of [cx - row.r, cx + row.r]) {
        for (let y = cy + row.r * 0.28; y < H - 18; y += 27) {
          studs.push({ x: sx, y, r: row.size * 0.85, tone: row.tone, glow: 0, phase: Math.random() * Math.PI * 2 });
        }
      }
    }
  }

  function spawnSpark() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const start = Math.floor(Math.random() * arch.length);
    sparks.push({ p: start, dir, left: 6 + Math.floor(Math.random() * 8), speed: 0.12 + Math.random() * 0.08 });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    for (const s of studs) {
      const d = Math.hypot(s.x - mouse.x, s.y - mouse.y);
      const wake = Math.max(0, 1 - d / 150);
      const breathe = reduced ? 0 : Math.sin(t / 1500 + s.phase) * 0.5 + 0.5;
      const [r, g, b] = s.tone;
      const alpha = Math.min(1, 0.34 + breathe * 0.18 + wake * 0.55 + s.glow * 0.6);
      const radius = s.r * (1 + wake * 0.8 + s.glow * 0.5);
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius, 0, 7);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
      s.glow *= 0.93;
    }

    if (!reduced) {
      for (const k of sparks) {
        k.p += k.dir * k.speed;
        k.left -= k.speed;
        const i = Math.floor(k.p);
        const a = arch[(i % arch.length + arch.length) % arch.length];
        const b = arch[((i + 1) % arch.length + arch.length) % arch.length];
        if (!a || !b) continue;
        const f = k.p - i;
        const x = a.x + (b.x - a.x) * f;
        const y = a.y + (b.y - a.y) * f;
        a.glow = 1;
        ctx.beginPath();
        ctx.arc(x, y, 3.6, 0, 7);
        ctx.fillStyle = "rgba(255,232,178,0.95)";
        ctx.shadowColor = "rgba(232,180,92,0.9)";
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      sparks = sparks.filter((k) => k.left > 0);
      if (Math.random() < 0.012 && sparks.length < 4) spawnSpark();
    }
  }

  function loop(t) {
    draw(t);
    raf = visible && !reduced ? requestAnimationFrame(loop) : null;
  }

  build();
  if (reduced) {
    draw(0);
  } else {
    raf = requestAnimationFrame(loop);
  }

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting && !document.hidden;
    if (visible && raf === null && !reduced) raf = requestAnimationFrame(loop);
  }).observe(canvas);
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    if (visible && raf === null && !reduced) raf = requestAnimationFrame(loop);
  });

  canvas.parentElement.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener("mouseleave", () => {
    mouse.x = -1e4;
    mouse.y = -1e4;
  });

  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { build(); if (reduced) draw(0); }, 150);
  });
}

/* ---------------- work: all projects + filters ---------------- */

const TAG_ORDER = ["agents", "voice", "automation", "ml", "product"];
const TAG_LABELS = { agents: "agents", voice: "voice & chat", automation: "automation", ml: "ml & data", product: "product" };

function renderWork(projects) {
  $("#workGrid").innerHTML = projects
    .map(
      (p) => `
    <article class="case" data-tags="${esc(p.tags.join(" "))}">
      <span class="eyebrow">${esc(p.domain)}</span>
      <h3>${esc(p.title)}</h3>
      <p class="desc">${esc(p.oneliner)}</p>
      <ul class="points">${p.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      ${chips(p.stack)}
      ${
        p.github || p.demo
          ? `<div class="links">
              ${p.github ? `<a href="${esc(p.github)}" ${EXT}>source ↗</a>` : ""}
              ${p.demo ? `<a href="${esc(p.demo)}" ${EXT}>demo ↗</a>` : ""}
            </div>`
          : ""
      }
    </article>`
    )
    .join("");

  const present = new Set(projects.flatMap((p) => p.tags));
  const tags = TAG_ORDER.filter((t) => present.has(t));
  const bar = $("#filters");
  bar.innerHTML = ["all", ...tags]
    .map((t) => `<button class="fchip${t === "all" ? " on" : ""}" data-tag="${esc(t)}">${esc(TAG_LABELS[t] || t)}</button>`)
    .join("");

  bar.addEventListener("click", (e) => {
    const b = e.target.closest(".fchip");
    if (!b) return;
    bar.querySelectorAll(".fchip").forEach((x) => x.classList.toggle("on", x === b));
    const t = b.dataset.tag;
    document.querySelectorAll("#workGrid .case").forEach((c) => {
      c.classList.toggle("hide", t !== "all" && !c.dataset.tags.split(" ").includes(t));
    });
  });
}

/* ---------------- experience / skills ---------------- */

function renderExperience(xp, skills) {
  $("#expList").innerHTML = xp
    .map(
      (e) => `
    <div class="xp">
      <div class="when">${esc(e.dateRange)}</div>
      <div>
        <h3>${esc(e.title)}</h3>
        <p class="org">${esc(e.org)}</p>
        <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
        ${chips(e.stack)}
      </div>
    </div>`
    )
    .join("");

  $("#skills").innerHTML = skills
    .map((s) => `<div class="skill-cell"><b>${esc(s.category)}</b><span>${esc(s.items)}</span></div>`)
    .join("");
}

/* ---------------- about ---------------- */

function renderAbout(profile, site, education, certs) {
  const edu = education
    .map((e) => `${e.degree}, ${e.institution} (${e.dateRange})`)
    .join(" · ");

  $("#aboutText").innerHTML =
    profile.about.map((p) => `<p>${esc(p)}</p>`).join("") +
    `<div class="about-facts">
      <div><span class="k">education</span> · ${esc(edu)}</div>
      <div><span class="k">languages</span> · ${site.languages.map(esc).join(" · ")}</div>
      <div><span class="k">community</span> · Scout Leader, Tunisian Scouts · Member, JCI Kelibia</div>
    </div>`;

  $("#certs").innerHTML = `
    <summary>${certs.total} certifications · show all</summary>
    <ul>${certs.list.map((c) => `<li><b>${esc(c.name)}</b> · ${esc(c.issuer)}</li>`).join("")}</ul>`;
}

/* ---------------- nav highlight ---------------- */

function observe() {
  const links = [...document.querySelectorAll(".rail-nav a")];
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  const navIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting)
          links.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#${en.target.id}`));
      }),
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => navIO.observe(s));
}

/* ---------------- boot ---------------- */

(async function init() {
  try {
    const [site, profile, projects, experience, skills, education, certs] = await Promise.all([
      loadJSON("data/site.json"),
      loadJSON("data/profile.json"),
      loadJSON("data/projects.json"),
      loadJSON("data/experience.json"),
      loadJSON("data/skills.json"),
      loadJSON("data/education.json"),
      loadJSON("data/certifications.json"),
    ]);

    renderRail(site);
    renderHero(profile, site);
    initDoor();
    renderWork(projects);
    renderExperience(experience, skills);
    renderAbout(profile, site, education, certs);
    observe();

    $("#year").textContent = new Date().getFullYear();

    console.log(
      "%cYou read source. Respect.",
      "font-family:monospace;font-size:14px;color:#2553c4;font-weight:bold"
    );
    console.log("This site is hand-built: HTML + CSS + vanilla JS, content fed from JSON.\n→ https://github.com/RideneFiras/RideneFiras.github.io\n→ firas.ridene@outlook.com");
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<p style="padding:2rem;font-family:monospace">Couldn't load site data. If you opened this file directly, serve it over HTTP instead (fetch can't read file://).</p>`
    );
  }
})();
