#!/usr/bin/env node
/* Regenerates everything derived from data/*.json, so none of it can drift out of sync:
   - the static HTML inside index.html's PRERENDER markers, so the page has real content
     even for crawlers that don't execute JavaScript (js/main.js re-renders the same markup
     client-side on load, via js/render.js which both share)
   - the JSON-LD structured data in index.html's <head>
   - llms.txt, the plain-text summary read by AI assistants and answer engines
   - the homepage <lastmod> in sitemap.xml, bumped only when the content above changed */

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
      hasPart: { "@id": `${SITE_URL}/#work` },
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
      sameAs: [site.links.github, site.links.linkedin, site.links.youtube].filter(Boolean),
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/#work`,
      name: `Projects by ${site.name}`,
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": p.github ? "SoftwareSourceCode" : "CreativeWork",
          name: p.title,
          url: `${SITE_URL}/#${p.id}`,
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
  if (links.youtube) L.push(`- YouTube (project demos): ${links.youtube}`);
  L.push(`- Resume (PDF): ${abs(site.resume)}`, "");

  L.push("## Experience", "");
  for (const e of experience) {
    L.push(`### ${e.title} · ${e.org.trim()} (${e.dateRange})`, "");
    L.push(...e.bullets.map((b) => `- ${b}`));
    if (e.stack) L.push(`- Stack: ${splitList(e.stack).join(", ")}`);
    L.push("");
  }

  L.push("## Projects", "");
  for (const p of projects) {
    L.push(`### ${p.title}`, "");
    L.push(`${p.oneliner} (${p.domain})`, "");
    L.push(...p.bullets.map((b) => `- ${b}`));
    L.push(`- Stack: ${splitList(p.stack).join(", ")}`);
    L.push(`- Details: ${SITE_URL}/#${p.id}`);
    if (p.github) L.push(`- Source: ${p.github}`);
    if (p.demo) L.push(`- Demo: ${p.demo}`);
    L.push("");
  }

  L.push("## Skills", "");
  L.push(...skills.map((s) => `- ${s.category}: ${splitList(s.items).join(", ")}`), "");

  L.push("## Certifications", "");
  L.push(...certs.list.map((c) => `- ${c.name} (${c.issuer})`), "");

  L.push("## Optional", "");
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
  workGrid: Render.workGridHTML(projects),
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

const HOME_LASTMOD = /(<loc>https:\/\/firasridene\.tech\/<\/loc>\s*<lastmod>)([\d-]+)(<\/lastmod>)/;
const oldIndex = readText("index.html");
const oldLlms = fs.existsSync(path.join(ROOT, "llms.txt")) ? readText("llms.txt") : "";
const oldSitemap = readText("sitemap.xml");
if (!HOME_LASTMOD.test(oldSitemap)) throw new Error("No homepage <lastmod> found in sitemap.xml");
const prevLastmod = oldSitemap.match(HOME_LASTMOD)[2];

/* render with the previous date first: if nothing changed, keep it, so the
   sitemap only claims a modification when the content really moved */
let lastmod = prevLastmod;
let index = buildIndex(oldIndex, lastmod);
let llms = llmsTxt(lastmod);
if (index !== oldIndex || llms !== oldLlms) {
  lastmod = new Date().toISOString().slice(0, 10);
  index = buildIndex(oldIndex, lastmod);
  llms = llmsTxt(lastmod);
}

fs.writeFileSync(path.join(ROOT, "index.html"), index);
fs.writeFileSync(path.join(ROOT, "llms.txt"), llms);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), oldSitemap.replace(HOME_LASTMOD, `$1${lastmod}$3`));
console.log(`Prerendered index.html, llms.txt and sitemap.xml from data/*.json (lastmod ${lastmod})`);
