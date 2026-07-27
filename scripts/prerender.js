#!/usr/bin/env node
/* Regenerates the static HTML inside index.html's PRERENDER markers from data/*.json,
   so the page has real content even for crawlers that don't execute JavaScript.
   The same markup is re-rendered client-side by js/main.js on load (see js/render.js,
   shared between both) — this script just seeds the initial HTML. */

const fs = require("fs");
const path = require("path");
const Render = require("../js/render.js");

const ROOT = path.join(__dirname, "..");
const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const site = readJSON("data/site.json");
const profile = readJSON("data/profile.json");
const projects = readJSON("data/projects.json");
const experience = readJSON("data/experience.json");
const skills = readJSON("data/skills.json");
const education = readJSON("data/education.json");
const certs = readJSON("data/certifications.json");

const time = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: site.timezone,
}).format(new Date());

const regions = {
  railStatus: Render.railStatusHTML(site, time),
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

const indexPath = path.join(ROOT, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

for (const [name, content] of Object.entries(regions)) {
  const marker = new RegExp(
    `(<!--PRERENDER:${name}-->)[\\s\\S]*?(<!--/PRERENDER:${name}-->)`
  );
  if (!marker.test(html)) {
    throw new Error(`No PRERENDER markers found for "${name}" in index.html`);
  }
  html = html.replace(marker, `$1${content}$2`);
}

fs.writeFileSync(indexPath, html);
console.log("Prerendered index.html from data/*.json");
