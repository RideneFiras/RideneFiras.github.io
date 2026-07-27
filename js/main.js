/* firasridene.tech · v3 "graphite". No frameworks, just fetch + DOM.
   Content lives in data/*.json; HTML-string builders live in js/render.js
   (shared with scripts/prerender.js); this file only wires them to the DOM. */

const $ = (sel) => document.querySelector(sel);
const { marqueeHTML, workGridHTML, filtersHTML, expListHTML, skillsHTML, aboutTextHTML, certsHTML, railStatusHTML, railLinksHTML } = Render;

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

/* ---------------- rail + theme ---------------- */

function renderChrome(site) {
  const time = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timezone }).format(new Date());

  $("#railStatus").innerHTML = railStatusHTML(site, time());
  setInterval(() => document.querySelectorAll(".clock").forEach((c) => { c.textContent = time(); }), 30_000);

  $("#railLinks").innerHTML = railLinksHTML(site);
}

function initTheme() {
  const btns = [...document.querySelectorAll(".theme-btn")];
  const meta = document.querySelector('meta[name="theme-color"]');
  const apply = (t) => {
    document.documentElement.dataset.theme = t;
    if (meta) meta.content = t === "dark" ? "#0f1014" : "#f5f4ef";
    btns.forEach((b) => b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode"));
  };
  /* light by default; only an explicit choice switches to dark */
  apply(localStorage.getItem("theme") === "dark" ? "dark" : "light");
  btns.forEach((b) =>
    b.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
      apply(next);
    })
  );
}

/* ---------------- hero ---------------- */

function renderHero(profile, site) {
  $("#heroEyebrow").textContent = profile.hero.eyebrow;
  $("#heroSub").textContent = profile.hero.sub;
  $("#ctaMail").href = `mailto:${site.links.email}`;
  $("#ctaResume").href = site.resume;
}

/* ---------------- marquee of the stack ---------------- */

function renderMarquee() {
  /* track duplicated once so the -50% translate loops seamlessly */
  $("#marquee").innerHTML = marqueeHTML();
}

/* ---------------- work: all projects + filters ---------------- */

function renderWork(projects) {
  $("#workGrid").innerHTML = workGridHTML(projects);

  const bar = $("#filters");
  bar.innerHTML = filtersHTML(projects);

  /* ---- carousel / grid views ---- */
  const grid = $("#workGrid");
  const gap = 18; /* keep in sync with the 1.1rem flex gap */
  const cards = () => [...grid.querySelectorAll(".case:not(.hide)")];
  const step = () => {
    const c = cards()[0];
    return c ? c.getBoundingClientRect().width + gap : 400;
  };
  const updateCount = () => {
    const n = cards().length;
    const i = n ? Math.min(n, Math.round(grid.scrollLeft / step()) + 1) : 0;
    $("#wCount").textContent = `${i} / ${n}`;
    $("#wPrev").disabled = grid.scrollLeft <= 4;
    $("#wNext").disabled = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 4;
  };

  let view = "carousel";
  const setView = (v) => {
    view = v;
    grid.classList.toggle("carousel", v === "carousel");
    $("#viewCar").classList.toggle("on", v === "carousel");
    $("#viewGrid").classList.toggle("on", v === "grid");
    $("#viewCar").setAttribute("aria-pressed", String(v === "carousel"));
    $("#viewGrid").setAttribute("aria-pressed", String(v === "grid"));
    ["#wCount", "#wPrev", "#wNext"].forEach((s) => $(s).classList.toggle("hidden", v !== "carousel"));
    try { localStorage.setItem("workview", v); } catch (e) { /* private mode */ }
    if (v === "carousel") updateCount();
  };

  $("#viewCar").addEventListener("click", () => setView("carousel"));
  $("#viewGrid").addEventListener("click", () => setView("grid"));
  $("#wPrev").addEventListener("click", () => grid.scrollBy({ left: -step(), behavior: REDUCED ? "auto" : "smooth" }));
  $("#wNext").addEventListener("click", () => grid.scrollBy({ left: step(), behavior: REDUCED ? "auto" : "smooth" }));
  grid.addEventListener("scroll", () => { if (view === "carousel") requestAnimationFrame(updateCount); });
  window.addEventListener("resize", () => { if (view === "carousel") updateCount(); });

  bar.addEventListener("click", (e) => {
    const b = e.target.closest(".fchip");
    if (!b) return;
    bar.querySelectorAll(".fchip").forEach((x) => x.classList.toggle("on", x === b));
    const t = b.dataset.tag;
    document.querySelectorAll("#workGrid .case").forEach((c) => {
      c.classList.toggle("hide", t !== "all" && !c.dataset.tags.split(" ").includes(t));
    });
    if (view === "carousel") {
      grid.scrollTo({ left: 0, behavior: "auto" });
      updateCount();
    }
  });

  let stored = "carousel";
  try { stored = localStorage.getItem("workview") || "carousel"; } catch (e) { /* private mode */ }
  setView(stored === "grid" ? "grid" : "carousel");

  /* spotlight follows the cursor inside each card */
  if (!REDUCED) {
    grid.addEventListener("pointermove", (e) => {
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
  $("#expList").innerHTML = expListHTML(xp);
  $("#skills").innerHTML = skillsHTML(skills);
}

/* ---------------- about ---------------- */

function renderAbout(profile, site, education, certs) {
  $("#aboutText").innerHTML = aboutTextHTML(profile, site, education);
  $("#certs").innerHTML = certsHTML(certs);
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
  const links = [...document.querySelectorAll(".rail-nav a, .bar-nav a")];
  const sections = [...new Set(links.map((a) => $(a.getAttribute("href"))).filter(Boolean))];
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
  initTheme();
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

    renderChrome(site);
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
