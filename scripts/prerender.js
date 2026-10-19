#!/usr/bin/env node
/* Regenerates everything derived from data/*.json, so none of it can drift out of sync:
   - the static HTML inside index.html's PRERENDER markers, so the page has real content
     even for crawlers that don't execute JavaScript (js/main.js re-renders the same markup
     client-side on load, via js/render.js which both share)
   - the JSON-LD structured data in index.html's <head>
   - llms.txt, the plain-text summary read by AI assistants and answer engines
   - one static case-study page per entry in data/case-studies.json, at work/<id>/index.html
   - sitemap.xml, where each page's <lastmod> is bumped only when that page's content changed */

const fs = require("fs");
const path = require("path");
const Render = require("../js/render.js");

const ROOT = path.join(__dirname, "..");
const SITE_URL = "https://firasridene.tech";
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const site = readJSON("data/site.json");
const profile = readJSON("data/profile.json");
const projects = readJSON("data/projects.json");
const experience = readJSON("data/experience.json");
const skills = readJSON("data/skills.json");
const education = readJSON("data/education.json");
const certs = readJSON("data/certifications.json");
const caseStudies = readJSON("data/case-studies.json");

const caseIds = caseStudies.map((c) => c.id);
for (const id of caseIds) {
  if (!projects.some((p) => p.id === id)) throw new Error(`data/case-studies.json: no project with id "${id}"`);
}
const caseUrl = (id) => `${SITE_URL}/work/${id}/`;
const projectUrl = (p) => (caseIds.includes(p.id) ? caseUrl(p.id) : `${SITE_URL}/#${p.id}`);

const splitList = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
const abs = (p) => (/^https?:/.test(p) ? p : `${SITE_URL}/${p.replace(/^\//, "")}`);
const LANG_CODES = { arabic: "ar", english: "en", french: "fr" };
const summary =
  `${site.role} based in ${site.location}, specialized in ${site.focus}. ` +
  `Builds multi-agent systems, real-time voice agents, and AI automation pipelines that ship to production`;

/* ---------- JSON-LD ---------- */

function jsonLd(lastmod) {
  const PERSON = `${SITE_URL}/#person`;
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: site.name,
      inLanguage: "en",
      publisher: { "@id": PERSON },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      name: `${site.name} · ${site.role}`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      mainEntity: { "@id": PERSON },
      about: { "@id": PERSON },
      dateModified: lastmod,
    },
    {
      "@type": "Person",
      "@id": PERSON,
      name: site.name,
      givenName: site.name.split(" ")[0],
      familyName: site.name.split(" ").slice(1).join(" "),
      url: `${SITE_URL}/`,
      image: { "@type": "ImageObject", url: `${SITE_URL}/assets/firas.jpg`, caption: site.name },
      jobTitle: site.role,
      description: `${summary}.`,
      email: `mailto:${site.links.email}`,
      address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
      homeLocation: { "@type": "City", name: site.location },
      hasOccupation: {
        "@type": "Occupation",
        name: site.role,
        occupationLocation: { "@type": "City", name: site.location },
        skills: skills.map((s) => s.items).join(", "),
      },
      alumniOf: education.map((e) => ({
        "@type": "EducationalOrganization",
        name: e.institution,
        url: "https://esprit.tn",
        address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
      })).filter((o, i, all) => all.findIndex((x) => x.url === o.url) === i),
      knowsLanguage: site.languages
        .map((l) => LANG_CODES[l.split(" ")[0].toLowerCase()])
        .filter(Boolean),
      knowsAbout: [
        "Generative AI",
        "Multi-agent systems",
        "Voice AI agents",
        "AI automation",
        ...skills.flatMap((s) => splitList(s.items)),
      ].filter((v, i, all) => all.indexOf(v) === i),
      hasCredential: certs.list.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c.name,
        credentialCategory: "certificate",
        recognizedBy: { "@type": "Organization", name: c.issuer },
      })),
      /* profiles only: the YouTube playlist linked in the UI is not a profile, the channel is */
      sameAs: [site.links.github, site.links.linkedin, site.links.youtubeChannel, site.links.kaggle].filter(Boolean),
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#work`,
      name: `Projects by ${site.name}`,
      /* hasPart on the ProfilePage would need a CreativeWork; an ItemList links back this way */
      mainEntityOfPage: { "@id": `${SITE_URL}/#profilepage` },
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": p.github ? "SoftwareSourceCode" : "CreativeWork",
          name: p.title,
          url: projectUrl(p),
          description: p.oneliner,
          genre: p.domain,
          keywords: splitList(p.stack).join(", "),
          creator: { "@id": PERSON },
          ...(p.github ? { codeRepository: p.github } : {}),
          ...(p.demo ? { subjectOf: { "@type": "VideoObject", url: p.demo, name: `${p.title} demo` } } : {}),
        },
      })),
    },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph })
    .replace(/</g, "\\u003c"); /* never let data close the <script> early */
  return `\n  <script type="application/ld+json">\n${json}\n  </script>\n  `;
}

/* ---------- llms.txt ---------- */

function llmsTxt(lastmod) {
  const L = [];
  const links = site.links;
  L.push(`# ${site.name}`, "");
  L.push(
    `> ${site.name}: ${summary}.`,
    ""
  );
  L.push(...profile.about.map((p) => `${p}\n`));
  L.push(`${profile.hero.headline} ${profile.hero.sub}`, "");

  L.push("## Key facts", "");
  L.push(`- Name: ${site.name}`);
  L.push(`- Role: ${site.role} (${site.focus})`);
  L.push(`- Location: ${site.location}`);
  L.push(`- Availability: ${site.status.availability}`);
  L.push(`- Languages: ${site.languages.join(", ")}`);
  L.push(`- Education: ${education.map((e) => `${e.degree}, ${e.institution} (${e.dateRange})`).join("; ")}`);
  L.push(`- Shipped projects: ${projects.length} · Certifications: ${certs.total}`);
  L.push(`- Last updated: ${lastmod}`, "");

  L.push("## Contact", "");
  L.push(`- Website: ${SITE_URL}/`);
  L.push(`- Email: ${links.email}`);
  L.push(`- GitHub: ${links.github}`);
  L.push(`- LinkedIn: ${links.linkedin}`);
  if (links.youtubeChannel) L.push(`- YouTube channel: ${links.youtubeChannel}`);
  if (links.youtube) L.push(`- YouTube (project demos playlist): ${links.youtube}`);
  if (links.kaggle) L.push(`- Kaggle: ${links.kaggle}`);
  L.push(`- Resume (PDF): ${abs(site.resume)}`, "");

  L.push("## Experience", "");
  for (const e of experience) {
    L.push(`### ${e.title} · ${e.org.trim()} (${e.dateRange})`, "");
    L.push(...e.bullets.map((b) => `- ${b}`));
    if (e.stack) L.push(`- Stack: ${splitList(e.stack).join(", ")}`);
    L.push("");
  }

  L.push("## Case studies", "");
  for (const c of caseStudies) {
    L.push(`### [${c.title}: ${c.headline}](${caseUrl(c.id)})`, "");
    L.push(`${c.summary}`, "");
    L.push(`- Status: ${c.status}`);
    L.push(...c.links.map((l) => `- ${l.label}: ${l.url}`));
    L.push("");
  }

  L.push("## Projects", "");
  for (const p of projects) {
    L.push(`### ${p.title}`, "");
    L.push(`${p.oneliner} (${p.domain})`, "");
    L.push(...p.bullets.map((b) => `- ${b}`));
    L.push(`- Stack: ${splitList(p.stack).join(", ")}`);
    L.push(`- ${caseIds.includes(p.id) ? "Case study" : "Details"}: ${projectUrl(p)}`);
    if (p.github) L.push(`- Source: ${p.github}`);
    if (p.demo) L.push(`- Demo: ${p.demo}`);
    L.push("");
  }

  L.push("## Skills", "");
  L.push(...skills.map((s) => `- ${s.category}: ${splitList(s.items).join(", ")}`), "");

  L.push("## Certifications", "");
  L.push(...certs.list.map((c) => `- ${c.name} (${c.issuer})`), "");

  L.push("## Optional", "");
  L.push(`- [Book a call (15-min introduction or 30-min AI & automation discussion)](${SITE_URL}/book/)`);
  L.push(`- [Legal notice, terms of service & privacy policy (French)](${SITE_URL}/legal/)`);
  L.push(`- [Website source code](https://github.com/RideneFiras/RideneFiras.github.io)`);
  return L.join("\n") + "\n";
}

/* ---------- build ---------- */

/* static placeholder: js/main.js replaces this with the live clock on load,
   so baking in the real time here would just make every build diff by a
   few minutes and spam the auto-commit workflow with no real change */
const staticRegions = {
  railStatus: Render.railStatusHTML(site, "--:--"),
  railLinks: Render.railLinksHTML(site),
  heroEyebrow: Render.esc(profile.hero.eyebrow),
  heroSub: Render.esc(profile.hero.sub),
  marquee: Render.marqueeHTML(),
  aboutText: Render.aboutTextHTML(profile, site, education),
  certs: Render.certsHTML(certs),
  filters: Render.filtersHTML(projects),
  workGrid: Render.workGridHTML(projects, caseIds),
  expList: Render.expListHTML(experience),
  skills: Render.skillsHTML(skills),
};

function buildIndex(html, lastmod) {
  const regions = { ...staticRegions, jsonld: jsonLd(lastmod) };
  for (const [name, content] of Object.entries(regions)) {
    const marker = new RegExp(`(<!--PRERENDER:${name}-->)[\\s\\S]*?(<!--/PRERENDER:${name}-->)`);
    if (!marker.test(html)) {
      throw new Error(`No PRERENDER markers found for "${name}" in index.html`);
    }
    html = html.replace(marker, (_, open, close) => open + content + close);
  }
  return html;
}

/* ---------- case-study pages ---------- */

const FAVICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%232553C4'/%3E%3Ccircle cx='46' cy='20' r='5' fill='%23B7802F'/%3E%3Cpath d='M18 46V18h14' stroke='%23F5F4EF' stroke-width='6' fill='none'/%3E%3Cpath d='M18 32h11' stroke='%23F5F4EF' stroke-width='6'/%3E%3C/svg%3E`;

function caseLd(c, lastmod) {
  const url = caseUrl(c.id);
  const project = projects.find((p) => p.id === c.id);
  const graph = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: `${c.title}: ${c.headline}`,
      description: c.description,
      url,
      mainEntityOfPage: url,
      image: `${SITE_URL}/assets/og.png`,
      inLanguage: "en",
      datePublished: c.published,
      dateModified: lastmod,
      author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: site.name, url: `${SITE_URL}/` },
      publisher: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: site.name, url: `${SITE_URL}/` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: {
        "@type": project.github ? "SoftwareSourceCode" : "CreativeWork",
        name: c.title,
        description: project.oneliner,
        ...(project.github ? { codeRepository: project.github } : {}),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: site.name, item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/#work` },
        { "@type": "ListItem", position: 3, name: c.title, item: url },
      ],
    },
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function casePage(c, lastmod) {
  const e = Render.esc;
  const url = caseUrl(c.id);
  const title = `${c.titleTag || `${c.title} case study`} · ${site.name}`;
  const ogDesc = `${c.headline}. A case study by ${site.name}, ${site.role} (${site.focus}).`;
  const section = (s) =>
    `\n        <h2>${e(s.heading)}</h2>` +
    (s.paragraphs || []).map((p) => `\n        <p>${e(p)}</p>`).join("") +
    (s.bullets ? `\n        <ul>${s.bullets.map((b) => `\n          <li>${e(b)}</li>`).join("")}\n        </ul>` : "");
  return `<!DOCTYPE html>
<!-- generated by scripts/prerender.js from data/case-studies.json: edit the data, not this file -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="description" content="${e(c.description)}">
  <meta name="author" content="${e(site.name)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="${url}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${e(site.name)}">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${e(`${c.title}: ${c.headline}`)}">
  <meta property="og:description" content="${e(ogDesc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE_URL}/assets/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${e(`${site.name}, AI engineer: I build agent systems that do real work.`)}">
  <meta property="article:author" content="${SITE_URL}/">
  <meta property="article:published_time" content="${c.published}">
  <meta property="article:modified_time" content="${lastmod}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(`${c.title}: ${c.headline}`)}">
  <meta name="twitter:description" content="${e(ogDesc)}">
  <meta name="twitter:image" content="${SITE_URL}/assets/og.png">
  <meta name="theme-color" content="#f5f4ef">

  <script type="application/ld+json">
${caseLd(c, lastmod)}
  </script>

  <link rel="icon" href="${FAVICON}">
  <script>try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}</script>
  <link rel="preload" href="/assets/fonts/archivo-vf.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/instrument-sans-vf.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/plex-mono-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="spot" aria-hidden="true"></div>

  <main class="cs-main">
    <article class="cs-article">
      <nav aria-label="Breadcrumb"><a class="cs-back" href="/#work">&larr; all work</a></nav>

      <h1 class="cs-title"><span class="sec-label">case study</span>${e(c.title)}</h1>
      <p class="cs-headline">${e(c.headline)}.</p>
      <p class="cs-status">${e(c.status)} · by <a href="/">${e(site.name)}</a></p>

      <div class="cs-body">
        <p class="cs-summary">${e(c.summary)}</p>
        <dl class="cs-facts">${c.facts.map(([k, v]) => `\n          <dt>${e(k)}</dt><dd>${e(v)}</dd>`).join("")}
        </dl>
${c.sections.map(section).join("\n")}

        <h2>Source and demo</h2>
        <ul class="cs-links">${c.links.map((l) => `\n          <li><a href="${e(l.url)}" ${Render.EXT}>${e(l.label)} ↗</a></li>`).join("")}
        </ul>

        <div class="cs-cta">
          <p>Want something like this for your business, or hiring for an AI engineering role? I'm ${e(site.name)}, ${e(site.role)} in ${e(site.location)}, focused on ${e(site.focus)}.</p>
          <div class="hero-cta">
            <a class="btn" href="/#contact">Get in touch</a>
            <a class="btn ghost" href="/${e(site.resume)}" ${Render.EXT}>Resume (PDF)</a>
            <a class="btn ghost" href="/#work">More projects</a>
          </div>
        </div>
      </div>
    </article>
  </main>

  <footer class="cs-footer">
    <span>© <span id="year"></span> ${e(site.name)}</span>
    <span><a href="/">portfolio</a></span>
    <span><a href="/legal/">legal</a></span>
  </footer>

  <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
</body>
</html>
`;
}

/* ---------- sitemap ---------- */

function sitemapXml(pages) {
  const url = (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>${p.image ? `
    <image:image>
      <image:loc>${p.image}</image:loc>
    </image:image>` : ""}
  </url>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(url).join("\n")}
</urlset>
`;
}

/* ---------- build ---------- */

const today = new Date().toISOString().slice(0, 10);
const readIfExists = (p) => (fs.existsSync(path.join(ROOT, p)) ? readText(p) : "");
const writeFile = (p, content) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), content);
};

const oldSitemap = readText("sitemap.xml");
const prevLastmod = {};
for (const m of oldSitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([\d-]+)<\/lastmod>/g)) prevLastmod[m[1]] = m[2];
if (!prevLastmod[`${SITE_URL}/`]) throw new Error("No homepage <lastmod> found in sitemap.xml");

/* render with the previous date first: if nothing changed, keep it, so the
   sitemap only claims a modification when the content really moved */
function stableBuild(loc, render, files) {
  const olds = files.map(readIfExists);
  let lastmod = prevLastmod[loc] || today;
  let out = render(lastmod);
  if (out.some((o, i) => o !== olds[i])) {
    lastmod = today;
    out = render(lastmod);
  }
  files.forEach((f, i) => writeFile(f, out[i]));
  return lastmod;
}

const oldIndex = readText("index.html");
const homeLastmod = stableBuild(`${SITE_URL}/`, (d) => [buildIndex(oldIndex, d), llmsTxt(d)], ["index.html", "llms.txt"]);

const pages = [
  { loc: `${SITE_URL}/`, lastmod: homeLastmod, image: `${SITE_URL}/assets/firas.jpg` },
  ...caseStudies.map((c) => ({
    loc: caseUrl(c.id),
    lastmod: stableBuild(caseUrl(c.id), (d) => [casePage(c, d)], [`work/${c.id}/index.html`]),
  })),
  /* hand-written page: keep its date, edit it here or in sitemap.xml when legal/ changes */
  { loc: `${SITE_URL}/legal/`, lastmod: prevLastmod[`${SITE_URL}/legal/`] || today },
  { loc: `${SITE_URL}/book/`, lastmod: prevLastmod[`${SITE_URL}/book/`] || today },
];

/* drop pages of case studies that were removed from the data */
const workDir = path.join(ROOT, "work");
if (fs.existsSync(workDir)) {
  for (const d of fs.readdirSync(workDir)) {
    if (!caseIds.includes(d)) fs.rmSync(path.join(workDir, d), { recursive: true });
  }
}

writeFile("sitemap.xml", sitemapXml(pages));
console.log(`Prerendered index.html, llms.txt, ${caseStudies.length} case studies and sitemap.xml (home lastmod ${homeLastmod})`);
