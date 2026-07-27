/* Pure HTML-string builders shared by js/main.js (browser) and scripts/prerender.js (Node).
   No DOM access here — every function takes data in, returns an HTML string out. */

(function (root) {
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const EXT = 'target="_blank" rel="noopener"';

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

  const MARQUEE = [
    ["Python", "python"], ["FastAPI", "fastapi"], ["LangChain", "langchain"],
    ["Claude Code", "claude"], ["CrewAI", null], ["OpenAI", null],
    ["React", "react"], ["Next.js", "nextdotjs"], ["TypeScript", "typescript"],
    ["PostgreSQL", "postgresql"], ["Supabase", "supabase"], ["Docker", "docker"],
    ["n8n", "n8n"], ["Redis", "redis"], ["PyTorch", "pytorch"],
    ["TensorFlow", "tensorflow"], ["MLflow", "mlflow"], ["Elasticsearch", "elasticsearch"],
  ];

  function marqueeHTML() {
    const items = MARQUEE.map(
      ([name, slug]) => `<span class="mq-item">${slug ? icon(slug) : ""}${esc(name)}</span>`
    ).join("");
    return items + items;
  }

  const TAG_ORDER = ["agents", "voice", "automation", "ml", "product"];
  const TAG_LABELS = { agents: "agents", voice: "voice & chat", automation: "automation", ml: "ml & data", product: "product" };

  function workGridHTML(projects) {
    return projects
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
  }

  function filtersHTML(projects) {
    const present = new Set(projects.flatMap((p) => p.tags));
    const tags = TAG_ORDER.filter((t) => present.has(t));
    return ["all", ...tags]
      .map((t) => `<button class="fchip${t === "all" ? " on" : ""}" data-tag="${esc(t)}">${esc(TAG_LABELS[t] || t)}</button>`)
      .join("");
  }

  function expListHTML(xp) {
    return xp
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
  }

  function skillsHTML(skills) {
    return skills
      .map((s) => `<div class="skill-cell rv"><b>${esc(s.category)}</b><span>${esc(s.items)}</span></div>`)
      .join("");
  }

  function aboutTextHTML(profile, site, education) {
    const edu = education.map((e) => `${e.degree}, ${e.institution} (${e.dateRange})`).join(" · ");
    return (
      profile.about.map((p) => `<p>${esc(p)}</p>`).join("") +
      `<div class="about-facts">
      <div><span class="k">education</span> · ${esc(edu)}</div>
      <div><span class="k">languages</span> · ${site.languages.map(esc).join(" · ")}</div>
      <div><span class="k">community</span> · Scout Leader, Tunisian Scouts · Member, JCI Kelibia</div>
    </div>`
    );
  }

  function certsHTML(certs) {
    return `<summary>${certs.total} certifications · show all</summary>
    <ul>${certs.list.map((c) => `<li><b>${esc(c.name)}</b> · ${esc(c.issuer)}</li>`).join("")}</ul>`;
  }

  function railStatusHTML(site, time) {
    return `
    <div><span class="live" aria-hidden="true"></span>${esc(site.status.availability)}</div>
    <div>${esc(site.location)} · <span class="clock">${time}</span></div>`;
  }

  function railLinksHTML(site) {
    return `
    <a href="${esc(site.links.github)}" ${EXT}>github</a>
    <a href="${esc(site.links.linkedin)}" ${EXT}>linkedin</a>
    <a href="${esc(site.links.youtube)}" ${EXT}>youtube</a>
    <a href="mailto:${esc(site.links.email)}">email</a>
    <a href="${esc(site.resume)}" ${EXT}>resume</a>`;
  }

  const Render = {
    esc, EXT, ICONS, icon, chips, marqueeHTML,
    workGridHTML, filtersHTML, expListHTML, skillsHTML,
    aboutTextHTML, certsHTML, railStatusHTML, railLinksHTML,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Render;
  } else {
    root.Render = Render;
  }
})(typeof window !== "undefined" ? window : globalThis);
