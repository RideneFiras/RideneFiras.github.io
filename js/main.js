/* firasridene.tech — no frameworks, just fetch + DOM.
   Content lives in data/*.json; this file only renders it. */

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

/* ---------------- rail / header ---------------- */

function renderRail(site) {
  const time = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timezone }).format(new Date());

  const status = $("#railStatus");
  status.innerHTML = `
    <div><span class="live" aria-hidden="true"></span>${esc(site.status.availability)}</div>
    <div>${esc(site.status.current)}</div>
    <div>${esc(site.location)} · <span id="clock">${time()}</span></div>`;
  setInterval(() => { const c = $("#clock"); if (c) c.textContent = time(); }, 30_000);

  $("#railLinks").innerHTML = `
    <a href="${esc(site.links.github)}" rel="me">github</a>
    <a href="${esc(site.links.linkedin)}" rel="me">linkedin</a>
    <a href="mailto:${esc(site.links.email)}">email</a>`;
}

/* ---------------- hero ---------------- */

function renderHero(profile, site) {
  $("#heroEyebrow").textContent = profile.hero.eyebrow;
  const h = esc(profile.hero.headline).replace("agent systems", "<em>agent systems</em>");
  $("#heroHeadline").innerHTML = h;
  $("#heroSub").textContent = profile.hero.sub;
  $("#ctaMail").href = `mailto:${site.links.email}`;
}

/* The signature: an agent graph drawn inside a horseshoe arch of studs —
   the door patterns of Sidi Bou Said, holding a prospecting run. */
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

  /* arch of studs: two columns + a semicircle, like a Sidi Bou door frame */
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

  /* edges hub -> agents (gentle curves) */
  const paths = agents.map((a, i) => {
    const mx = (hub.x + a.x) / 2 + (a.x < hub.x ? -24 : 24);
    const my = (hub.y + a.y) / 2 + (a.y < hub.y ? 10 : -10);
    const d = `M ${hub.x} ${hub.y} Q ${mx} ${my} ${a.x} ${a.y}`;
    const p = el("path", { class: "g-edge", d });
    p.style.animationDelay = `${0.55 + i * 0.12}s`;
    return d;
  });

  /* agent nodes */
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

  /* brass studs inside the hub, arranged like a door motif */
  [[0, 0], [-11, -11], [11, -11], [-11, 11], [11, 11]].forEach(([dx, dy]) =>
    el("circle", { class: "stud", cx: hub.x + dx, cy: hub.y + dy, r: 3.2 }, hubG)
  );

  /* message pulses (skipped entirely under reduced motion) */
  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    paths.forEach((d, i) => {
      const dot = el("circle", { class: "g-pulse", r: 5 });
      const anim = el("animateMotion", {
        dur: "3.2s",
        begin: `${1.6 + i * 0.8}s`,
        repeatCount: "indefinite",
        keyPoints: "0;1;0",
        keyTimes: "0;0.5;1",
        calcMode: "linear",
        path: d,
      }, dot);
      void anim;
    });
  }

  $("#agentGraph").appendChild(svg);
}

/* ---------------- work ---------------- */

function pipeline(steps) {
  return `<div class="pipe" aria-hidden="true">${steps
    .map((s) => `<span class="node"><i></i>${esc(s)}</span>`)
    .join('<span class="link"></span>')}</div>`;
}

function renderWork(projects) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  $("#featured").innerHTML = featured
    .map(
      (p) => `
    <article class="case">
      <span class="eyebrow">${esc(p.domain)}</span>
      <h3>${esc(p.title)}</h3>
      <p class="sub">${esc(p.subtitle)}</p>
      <p class="desc">${esc(p.description)}</p>
      <div class="metrics">${p.metrics.map((m) => `<span>${esc(m)}</span>`).join("")}</div>
      ${pipeline(p.pipeline)}
      <p class="stack"><b>stack</b> — ${esc(p.stack)}</p>
      ${
        p.github || p.demo
          ? `<div class="links">
              ${p.github ? `<a href="${esc(p.github)}">source ↗</a>` : ""}
              ${p.demo ? `<a href="${esc(p.demo)}">demo ↗</a>` : ""}
            </div>`
          : ""
      }
    </article>`
    )
    .join("");

  $("#projectIndex").innerHTML = rest
    .map(
      (p) => `
    <div class="row">
      <h4>${esc(p.title)}</h4>
      <p class="meta"><span class="domain">${esc(p.domain)}</span>${esc(p.oneliner)}
        <span class="stack">· ${esc(p.stack)}</span></p>
      <span class="links">${p.github ? `<a href="${esc(p.github)}">source ↗</a>` : ""}</span>
    </div>`
    )
    .join("");
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
        <p class="stack"><b>stack</b> — ${esc(e.stack)}</p>
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
  $("#aboutText").innerHTML =
    profile.about.map((p) => `<p>${esc(p)}</p>`).join("") +
    `<div class="about-facts">
      <div><span class="k">education</span> — ${esc(education[0].degree)}, ${esc(education[0].institution)} (${esc(education[0].dateRange)})</div>
      <div><span class="k">languages</span> — ${site.languages.map(esc).join(" · ")}</div>
    </div>`;

  $("#certs").innerHTML = `
    <summary>${certs.total} certifications — show highlights</summary>
    <ul>${certs.highlights.map((c) => `<li><b>${esc(c.name)}</b> · ${esc(c.issuer)}</li>`).join("")}</ul>`;
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
    console.log("This site is hand-built: HTML + CSS + vanilla JS, content fed from JSON.\n→ https://github.com/RideneFiras/RideneFiras.github.io\n→ firasuv@gmail.com");
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<p style="padding:2rem;font-family:monospace">Couldn't load site data — if you opened this file directly, serve it over HTTP instead (fetch can't read file://).</p>`
    );
  }
})();
