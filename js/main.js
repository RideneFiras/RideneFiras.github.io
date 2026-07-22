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

/* The hero graph: an agent pipeline inside a horseshoe arch of studs,
   like the door patterns of Sidi Bou Said. */
function buildAgentGraph() {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 560 560");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Diagram: an orchestrator agent passing messages to research, qualify, analyze, and outreach agents, framed by an arch of door studs");

  const el = (name, attrs, parent = svg) => {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    parent.appendChild(n);
    return n;
  };

  const cx = 280, archR = 200, top = 250, bottom = 540, step = 27;
  for (let y = bottom; y > top; y -= step) {
    el("circle", { class: "g-stud", cx: cx - archR, cy: y, r: 2.6 });
    el("circle", { class: "g-stud", cx: cx + archR, cy: y, r: 2.6 });
  }
  for (let a = 180; a <= 360; a += 180 / 14) {
    const rad = (a * Math.PI) / 180;
    el("circle", { class: "g-stud", cx: cx + archR * Math.cos(rad), cy: top + archR * Math.sin(rad), r: 2.6 });
  }

  const hub = { x: 280, y: 330, label: "orchestrator" };
  const agents = [
    { x: 158, y: 208, label: "research" },
    { x: 402, y: 208, label: "qualify" },
    { x: 158, y: 452, label: "analyze" },
    { x: 402, y: 452, label: "outreach" },
  ];

  const paths = agents.map((a, i) => {
    const mx = (hub.x + a.x) / 2 + (a.x < hub.x ? -24 : 24);
    const my = (hub.y + a.y) / 2 + (a.y < hub.y ? 10 : -10);
    const d = `M ${hub.x} ${hub.y} Q ${mx} ${my} ${a.x} ${a.y}`;
    const p = el("path", { class: "g-edge", d });
    p.style.animationDelay = `${0.55 + i * 0.12}s`;
    return d;
  });

  const node = (n, i, extra = "") => {
    const g = el("g", { class: `g-node ${extra}` });
    g.style.transformOrigin = `${n.x}px ${n.y}px`;
    g.style.animationDelay = `${0.1 + i * 0.11}s`;
    el("circle", { cx: n.x, cy: n.y, r: extra ? 36 : 27 }, g);
    const t = el("text", { x: n.x, y: n.y + (extra ? 60 : 49) }, g);
    t.textContent = n.label;
    const title = document.createElementNS(NS, "title");
    title.textContent = n.label;
    g.appendChild(title);
    return g;
  };
  agents.forEach((a, i) => node(a, i + 1));
  const hubG = node(hub, 0, "hub");

  [[0, 0], [-11, -11], [11, -11], [-11, 11], [11, 11]].forEach(([dx, dy]) =>
    el("circle", { class: "stud", cx: hub.x + dx, cy: hub.y + dy, r: 3.2 }, hubG)
  );

  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    paths.forEach((d, i) => {
      const dot = el("circle", { class: "g-pulse", r: 5 });
      el("animateMotion", {
        dur: "3.2s",
        begin: `${1.6 + i * 0.8}s`,
        repeatCount: "indefinite",
        keyPoints: "0;1;0",
        keyTimes: "0;0.5;1",
        calcMode: "linear",
        path: d,
      }, dot);
    });
  }

  $("#agentGraph").appendChild(svg);
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
    buildAgentGraph();
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
