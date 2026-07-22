/* firasridene.tech · v3 "graphite". No frameworks, just fetch + DOM.
   Content lives in data/*.json; this file only renders it. */

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* external links always open in a new tab */
const EXT = 'target="_blank" rel="noopener"';

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const icon = (slug) =>
  `<i class="tico" style="--i:url('/assets/icons/${slug}.svg')" aria-hidden="true"></i>`;

function chips(stack) {
  const items = stack.split(",").map((s) => s.trim()).filter(Boolean);
  return `<div class="stack-chips">${items
    .map((name) => {
      const slug = ICONS[name.toLowerCase()];
      return `<span class="chip">${slug ? icon(slug) : ""}${esc(name)}</span>`;
    })
    .join("")}</div>`;
}

/* ---------------- top bar ---------------- */

function renderBar(site) {
  const time = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timezone }).format(new Date());

  $("#barStatus").innerHTML = `
    <span class="live" aria-hidden="true"></span>
    <span>${esc(site.status.availability)}</span>
    <span>·</span>
    <span>Tunis <span id="clock">${time()}</span></span>`;
  setInterval(() => { const c = $("#clock"); if (c) c.textContent = time(); }, 30_000);
}

/* ---------------- hero ---------------- */

function renderHero(profile, site) {
  $("#heroEyebrow").textContent = profile.hero.eyebrow;
  $("#heroSub").textContent = profile.hero.sub;
  $("#ctaMail").href = `mailto:${site.links.email}`;
  $("#ctaResume").href = site.resume;
}

/* ---------------- marquee of the stack ---------------- */

const MARQUEE = [
  ["Python", "python"], ["FastAPI", "fastapi"], ["LangChain", "langchain"],
  ["Claude Code", "claude"], ["CrewAI", null], ["OpenAI", null],
  ["React", "react"], ["Next.js", "nextdotjs"], ["TypeScript", "typescript"],
  ["PostgreSQL", "postgresql"], ["Supabase", "supabase"], ["Docker", "docker"],
  ["n8n", "n8n"], ["Redis", "redis"], ["PyTorch", "pytorch"],
  ["TensorFlow", "tensorflow"], ["MLflow", "mlflow"], ["Elasticsearch", "elasticsearch"],
];

function renderMarquee() {
  const items = MARQUEE.map(
    ([name, slug]) => `<span class="mq-item">${slug ? icon(slug) : ""}${esc(name)}</span>`
  ).join("");
  /* track duplicated once so the -50% translate loops seamlessly */
  $("#marquee").innerHTML = items + items;
}

/* ---------------- work: all projects + filters ---------------- */

const TAG_ORDER = ["agents", "voice", "automation", "ml", "product"];
const TAG_LABELS = { agents: "agents", voice: "voice & chat", automation: "automation", ml: "ml & data", product: "product" };

function renderWork(projects) {
  $("#workGrid").innerHTML = projects
    .map(
      (p, i) => `
    <article class="case rv${i < 2 ? " wide" : ""}" data-tags="${esc(p.tags.join(" "))}">
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

  /* spotlight follows the cursor inside each card */
  if (!REDUCED) {
    $("#workGrid").addEventListener("pointermove", (e) => {
      const card = e.target.closest(".case");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--cx", `${e.clientX - r.left}px`);
      card.style.setProperty("--cy", `${e.clientY - r.top}px`);
    });
  }
}

/* ---------------- experience / skills ---------------- */

function renderExperience(xp, skills) {
  $("#expList").innerHTML = xp
    .map(
      (e) => `
    <div class="xp rv">
      <div class="when">${esc(e.dateRange)}</div>
      <h3>${esc(e.title)}</h3>
      <p class="org">${esc(e.org)}</p>
      <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      ${chips(e.stack)}
    </div>`
    )
    .join("");

  $("#skills").innerHTML = skills
    .map((s) => `<div class="skill-cell rv"><b>${esc(s.category)}</b><span>${esc(s.items)}</span></div>`)
    .join("");
}

/* ---------------- about ---------------- */

function renderAbout(profile, site, education, certs) {
  const edu = education.map((e) => `${e.degree}, ${e.institution} (${e.dateRange})`).join(" · ");

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

/* ---------------- spotlight, reveals, nav ---------------- */

function initSpotlight() {
  if (REDUCED) return;
  let raf = null;
  window.addEventListener("pointermove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
      raf = null;
    });
  });
}

function initReveals() {
  const els = document.querySelectorAll(".rv");
  if (REDUCED || !("IntersectionObserver" in window)) {
    els.forEach((n) => n.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }),
    { threshold: 0.1 }
  );
  els.forEach((n) => {
    const r = n.getBoundingClientRect();
    if (r.top < window.innerHeight) n.classList.add("in");
    else io.observe(n);
  });
}

function initNav() {
  const links = [...document.querySelectorAll(".bar-nav a")];
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

    renderBar(site);
    renderHero(profile, site);
    renderMarquee();
    renderWork(projects);
    renderExperience(experience, skills);
    renderAbout(profile, site, education, certs);
    initSpotlight();
    initReveals();
    initNav();

    $("#year").textContent = new Date().getFullYear();

    console.log("%cYou read source. Respect.", "font-family:monospace;font-size:14px;color:#2553c4;font-weight:bold");
    console.log("Hand-built: HTML + CSS + vanilla JS, content fed from JSON.\n→ https://github.com/RideneFiras/RideneFiras.github.io\n→ firas.ridene@outlook.com");
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<p style="padding:2rem;font-family:monospace">Couldn't load site data. If you opened this file directly, serve it over HTTP instead (fetch can't read file://).</p>`
    );
  }
})();
