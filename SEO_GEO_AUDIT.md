# SEO / GEO / AEO audit: firasridene.tech

Audit date: 2026-10-10 · Repo state: `main` @ `e87aa72` · Auditor: Claude Code (from the repository and the live site)

> Note before publishing: GitHub Pages serves `.md` files in the repo root as raw text (verified: `https://firasridene.tech/README.md` → 200). If this file is committed to `main`, it will be public at `/SEO_GEO_AUDIT.md`, including the section that lists unverified claims. Keep it uncommitted, move it to a non-published branch, or accept that it will be public.

---

## 1. Executive summary

The technical foundation is already strong, and most of it is above average for a personal portfolio:

- The site is static HTML on GitHub Pages. All content is **prerendered into the initial HTML** from `data/*.json` (`scripts/prerender.js`), so crawlers that don't run JavaScript see the same content as users. Local, regenerated and live `index.html` are byte-identical (tested).
- Canonical, robots, sitemap, OG/Twitter cards, a `Person`/`ProfilePage`/`WebSite`/`ItemList` JSON-LD graph, and `llms.txt` are all present and generated from one data source.
- Redirects are clean: `http://`, `www.` and `rideneFiras.github.io` all 301 to `https://firasridene.tech/`.
- Lighthouse 12.8.2 (local run against the live site): **SEO 100, Accessibility 100, Best Practices 100**. Performance is 90 on mobile and 99 on desktop.

The biggest gaps are not technical. They are **content depth and brand consistency**:

1. **The whole portfolio is one URL.** 16 projects live as cards on the homepage, so no project can rank or be cited on its own for queries like "multi-agent customer support agent prompt injection" or "freelancer invoicing Supabase RLS". There are no case-study pages.
2. **The resume and the site disagree** on the employer and dates of the flagship VocaFlow role, and on other experience entries. A recruiter or an AI system that reads both gets conflicting facts.
3. **Several metrics shown on the site can't be traced to public evidence.** Others are well backed and are currently undersold.
4. **Recruiter and client paths are mixed.** The site has no services or "work with me" framing, though the legal page shows a registered freelance business.

## 2. Measurement baseline

| Check | Tool | Result |
|---|---|---|
| Lighthouse, mobile | Lighthouse 12.8.2 CLI, headless Chrome, live URL | Perf **90** · A11y 100 · BP 100 · SEO 100 · FCP 2.1 s · LCP 3.0 s · TBT 40 ms · CLS 0 · SI 4.7 s |
| Lighthouse, desktop | same, `--preset=desktop` | Perf **99** · A11y 100 · BP 100 · SEO 100 · FCP/LCP 0.8 s · TBT 0 ms · CLS 0 |
| Page weight | Lighthouse network-requests | 51 requests, ~235 KiB transferred |
| Field data (CrUX) | PageSpeed Insights API | **Not measured**: the API returned "Quota exceeded" (shared anonymous quota). Re-run at pagespeed.web.dev. |
| HTTP status / redirects | `curl` | see §4.1 |
| Prerender parity | `node scripts/prerender.js` on a clean copy + `cmp` | index.html, llms.txt, sitemap.xml in sync; live == local |
| Outbound links | `curl -L` | 12/12 GitHub repos 200, YouTube video and playlist 200, LinkedIn returns 999 (bot block, not verifiable from here) |

Lab scores come from one machine and one run each. Treat them as a baseline, not field performance.

## 3. Confirmed findings vs. unverified hypotheses

**Confirmed** means I reproduced or tested it in this session. **Hypothesis** means it is plausible but needs Search Console or analytics data, or your input.

### Confirmed

| # | Severity | Finding | Evidence |
|---|---|---|---|
| C1 | **High** | No crawlable per-project pages. Every project is a fragment (`/#vocaflow`) of one URL. Fragments are not separate indexable documents, so projects can't rank or be cited on their own. | `sitemap.xml` lists only `/` and `/legal/`. JSON-LD `ItemList` items use `url: https://firasridene.tech/#<id>`. |
| C2 | **High** | Resume and site conflict on experience. The resume says *End-of-Studies Internship · **Designet** · 2026* (the VocaFlow bullets) and adds *Freelance Software Engineer · Stealth Startup, Paris · Feb – Mai 2026*. The site says *End-of-Studies Intern · **Agile4UX** · Feb – Jul 2026*, *Data Platform Development Intern · Designet · 2024*, and *Freelance · "Mai - Present"*. | `pdftotext assets/Firas-Ridene-Resume.pdf`; `data/experience.json` |
| C3 | Medium | The date range "Mai - Present" (`data/experience.json`, exp1) uses the French "Mai" and has no year. The site is in English. | `data/experience.json` |
| C4 | Medium | The 404 page uses a relative stylesheet path (`css/style.css`). For any missing nested URL (e.g. `/legal/missing`), the browser requests `/legal/css/style.css`, which 404s, so the error page renders unstyled. This will also affect any future `/work/...` URLs. | `curl https://firasridene.tech/legal/css/style.css` → 404; `404.html` line 9 |
| C5 | Medium | `Person.sameAs` includes a YouTube **playlist** URL, which is not a profile. The real channel `https://www.youtube.com/@FirasRidene` exists (YouTube oEmbed for the demo video returns `author_url` = that channel) and is missing. A Kaggle profile (`kaggle.com/firasridene`, linked from your own `KagglexGoogle` repo) is also missing. | JSON-LD in `index.html`; `curl` oEmbed |
| C6 | Medium | The project stack doesn't match the repo. The Store Support Agent card lists "Claude" in its stack, but the repo README says the orchestrator runs on OpenAI `gpt-4.1-mini`. The TT Assistant card lists LangChain, which the README doesn't mention. | `data/projects.json`; READMEs of `MultiAppHackathon` and `ChatbotTT` |
| C7 | Medium | The strongest evidence on the site is undersold. The Store Support Agent repo has a live demo (`loomhaus-agent.vercel.app`, 200), a 2-minute video, and saved test results (10/10 prompt-injection attacks blocked, 21/21 race-condition checks, 8/8 failure-path checks). ChronoWorks has an RLS test script (46 checks, 0 failed). The homepage shows none of this. | `tests/results/02_adversarial_eval.md`, ChronoWorks README |
| C8 | Low | The resume PDF's metadata title is "Firas Ridene — Resume Dashboard". Search engines can use the PDF title as the result title. | `pdfinfo` |
| C9 | Low | `signature-v3/signature.html` is publicly served (200) and has no `noindex`. `preview.html` does. It's low risk because nothing links to it. | `curl`; `grep robots signature-v3/*.html` |
| C10 | Low | Location is presented two ways: "Tunis, Tunisia" across the site, and a business address in **Kelibia** on `/legal/`. Both can be true (you work in Tunis, the business is registered in Kelibia). Just keep it intentional. | `legal/index.html` |
| C11 | Low | Images and performance. `firas.jpg` is a 400×400 progressive JPEG shown at 200 px (Lighthouse estimates ~16 KiB savings with WebP/AVIF). Each stack icon is a separate SVG request. Cache TTL is GitHub Pages' fixed 10 min, which can't be changed on Pages. The mobile LCP element is a nav link, because the hero title animates in from off-screen. That's a design choice; I left it alone. | Lighthouse audits |
| C12 | Low | Changefreq values in the sitemap are ignored by Google. They're harmless. | Google sitemap docs |
| C14 | Medium | **Existing JSON-LD error:** `ProfilePage.hasPart` points to an `ItemList`, but `hasPart` only accepts CreativeWork. validator.schema.org reports 1 severe error on the live HEAD version. | validator.schema.org POST of `index.html` at HEAD |
| C15 | Low | Without JavaScript, every project card, experience entry and skill cell stays at `opacity: 0`. `.rv` is baked into the prerendered markup, and only `main.js` adds `.in`. The text is still in the DOM for crawlers, but people with JS disabled, or a failed data fetch, see blank cards. | `css/style.css` `.rv` rule; `js/render.js` |
| C13 | Info | The ESPRIT education entry still says "2023 – present", and the About text says "engineering student". `data/pfe.json` shows the end-of-studies defense was on **2026-10-07**. If you have now graduated, update both. Only you can confirm. | `data/education.json`, `data/profile.json`, `data/pfe.json` |

### Things that are already correct (no action)

- `robots.txt` allows everything and points to the sitemap. No AI crawler is blocked, and I made no change there.
- Private pages are excluded: `admin.html` and `pfe/` are `noindex, nofollow` and are not in the sitemap or `llms.txt`.
- One `<h1>`, a logical h2/h3 outline, a skip link, alt text on the only content image, labelled form fields, and an `aria-live` form status.
- The `ProfilePage` + `Person` markup matches Google's documented requirements (`mainEntity` Person with `name`, plus recommended `dateModified`, `image`, `sameAs`, `description`). The content shown matches the markup.
- Cloudflare Web Analytics is installed (cookieless).

### Unverified claims on the site (needs your evidence or wording change)

I did **not** edit these. They are your claims, and I can't disprove them. But neither a recruiter nor an AI system can verify them from public sources today:

| Claim | Where | Public evidence found |
|---|---|---|
| "Cut manual prospecting time by ~80%" | hero, prospecting card, Agile4UX entry | None (no public repo) |
| "170+ GitHub issues and 726 automated tests across a ~40,000 line codebase" | 8-Agent Dev Team | Repo `ClaudeCodeTeam` has no README, only a PDF and 1 commit |
| "comparing 300+ models via Azure ML" / "monitored in production" | 5G Throughput | README describes scikit-learn + MLflow + Elasticsearch. It doesn't mention Azure ML or 300 models. `speedsense.me` did not respond (timeout). |
| "Reduced manual inspection time by 70%" | Anomaly Detection | README reports 99% accuracy on MVTec screws, but no time-saving measurement |
| "sub-second latency", "24/7 … without added headcount" | VocaFlow | None public (internship, likely confidential) |
| "Won 3rd place at the AI for CSR Hackathon" | TT Assistant | README links a LinkedIn post about it (LinkedIn blocks unauthenticated checks) |
| "for Tunisie Telecom" | TT Assistant | README: built *during a hackathon* themed around Tunisie Telecom. That's different from a client engagement, so consider "a Tunisie Telecom hackathon challenge". |

Recommendation: for each one, either link the evidence (a README section, a screenshot, a post), or rephrase it as context ("measured internally on the client's workflow") so it reads as honest rather than inflated.

### Hypotheses (need Search Console or analytics)

- H1: The site probably ranks for the brand query "Firas Ridene" and very little else, because there is only one indexable page with substantive content. **Check:** GSC → Performance → Queries.
- H2: The homepage may already be indexed with a `ProfilePage` enhancement. **Check:** GSC → Enhancements → Profile page, and Rich Results Test.
- H3: Bing and ChatGPT Search use Bing's index. Whether the site is in Bing is unknown. **Check:** Bing Webmaster Tools (it can import from GSC).
- H4: Whether `llms.txt` is fetched by anyone is unknown. **Check:** Cloudflare Analytics paths. Google states that AI Overviews/AI Mode need no special AI text files, so `llms.txt` is a low-cost extra and not a ranking lever.

## 4. Detailed technical results

### 4.1 Status codes and redirects (live, `curl`)

| URL | Result |
|---|---|
| `https://firasridene.tech/` | 200 |
| `http://firasridene.tech/` | 301 → https |
| `https://www.firasridene.tech/` | 301 → apex |
| `https://ridenefiras.github.io/` | 301 → apex |
| `/index.html` | 200 (canonical points to `/`, fine) |
| `/legal` | 301 → `/legal/` |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`, resume PDF | 200 |
| `/nope` | 404 (custom page) |
| `/admin.html`, `/pfe/` | 200, `noindex, nofollow` |

### 4.2 Structured data

The current graph has `WebSite`, `ProfilePage`, `Person`, and `ItemList` of `SoftwareSourceCode`/`CreativeWork`. The JSON parses, and `<` is escaped. Issues: C1 (fragment URLs) and C5 (sameAs). `alumniOf` is reasonable: schema.org's definition covers current and former members, but see C13.

Google's own guidance (developers.google.com/search/docs/appearance/ai-features, read 2026-10-10): *"There are no additional requirements to appear in AI Overviews or AI Mode… You don't need to create new machine readable files, AI text files, or markup."* So the GEO strategy here is the same as good SEO: crawlable text, clear entity facts, real evidence, and descriptive internal links.

## 5. Personal-brand and conversion audit

- **Recruiter journey:** hero → Resume (PDF) button → experience → GitHub/LinkedIn. It's good and short. The weak point is C2: the resume contradicts the page.
- **Freelance-client journey:** the visitor has to infer that you take client work (the "Freelance / Self-Employed" entry, plus the legal page with your RNE). There's no services statement, no "what I can build for you", and no deep project pages to send a prospect to.
- **Contact:** the Web3Forms form, mailto, a copy-email button, and GitHub/LinkedIn/YouTube are present. I did not submit the live form, to avoid sending you a test email. Please submit one test yourself (see §8).

## 6. Search opportunities (by relevance and evidence, not invented volumes)

| Topic / intent | Evidence you already have | Page to build |
|---|---|---|
| Secure AI customer-support agents, prompt-injection defence, multi-agent n8n | Loomhaus repo, live demo, tests, video | **Case study: Store Support Agent** (built now) |
| Freelancer invoicing / Supabase RLS / Tunisia–France tax logic | ChronoWorks repo, RLS test | **Case study: ChronoWorks** (built now) |
| AI voice agents (phone, WhatsApp), multi-tenant voice AI | VocaFlow (internship) | Case study once you decide what's shareable (highest-value next page) |
| Multilingual / Tunisian-dialect voice chatbot | TT Assistant repo, hackathon | Case study after confirming team role and the award link |
| MLOps with explainability (SHAP + LLM summaries) | QosMLOPS repo (41 commits) | Case study after reconciling the Azure ML / 300-model claim |
| "AI automation freelancer Tunisia" / "n8n developer" | Freelance entry, legal page, n8n library repo | A short `/services/` page (needs your offer and scope) |

I deliberately did not create keyword landing pages for cities or services. They would be thin doorway pages.

## 7. Prioritized implementation plan

| Priority | Item | Status in this pass |
|---|---|---|
| P1 | Crawlable case-study pages for the two best-evidenced projects, generated from data by the existing prerender script | **Done** |
| P1 | Link cards → case studies. Point JSON-LD and `llms.txt` at the real URLs. Generate the sitemap with every page and an honest per-page `lastmod` | **Done** |
| P1 | Reconcile resume vs. site experience (C2, C3) | **Needs you** |
| P2 | Fix 404 asset paths (C4) | **Done** |
| P2 | `sameAs`: YouTube channel + Kaggle (C5) | **Done** |
| P2 | Separate recruiter and client paths in the contact section | **Done** (one short line, no redesign) |
| P2 | Fix stack mismatches and evidence-link or reword the claims in §3 (C6) | **Needs you** |
| P3 | Resume PDF title metadata (C8); `noindex` on signature page (C9); WebP portrait (C11) | Recommended |
| P3 | VocaFlow / TT Assistant / 5G case studies | Needs your input |

## 8. External checks that need your accounts

1. **Google Search Console:** verify the domain (DNS TXT), submit `sitemap.xml`, and request indexing for the new `/work/…` URLs. Then watch Performance → Queries, and Enhancements → Profile page.
2. **Bing Webmaster Tools:** import from GSC and submit the sitemap. This covers Bing, plus the ChatGPT Search and Copilot surfaces that draw on it.
3. **PageSpeed Insights** (pagespeed.web.dev): get field data. The API quota was exhausted from this machine.
4. **Rich Results Test** and **validator.schema.org** on `/` and on each `/work/…` page after deploy.
5. **Contact form:** submit one real test message on the live site and confirm it arrives (Web3Forms dashboard).
6. **LinkedIn:** make sure the headline, location and current role match the site and resume.

---

## 9. What was implemented (Phase 3)

| File | Change | Why |
|---|---|---|
| `data/case-studies.json` (new) | Content for two case studies: Store Support Agent and ChronoWorks. Every fact comes from the public repo READMEs and committed test results. | C1, C7 |
| `scripts/prerender.js` | Generates `work/<id>/index.html`, with its own title, meta description, canonical, OG/Twitter tags, and `Article` + `BreadcrumbList` JSON-LD. Builds the full `sitemap.xml`, where each page's `lastmod` changes only when that page changed. Points JSON-LD `ItemList` and `llms.txt` at the case-study URLs and adds a "Case studies" section to `llms.txt`. Switches `sameAs` to profile URLs (YouTube channel, Kaggle). Fixes `hasPart`. Deletes stale `work/` pages whose case study was removed from the data. | C1, C5, C14 |
| `js/render.js`, `js/main.js` | Cards with a case study get a "case study →" link, both in the prerendered HTML and after the client-side re-render. `main.js` loads `data/case-studies.json`, and if that fails it carries on without it. | Internal links |
| `css/style.css` | `.cs-*` styles for case pages, based on the legal page's look. `.contact-lead` style. Reveal animation gated on a `.js` class, so content is visible without JS. | C15 |
| `index.html` | `<head>` script adds the `js` class. One-sentence contact lead that splits the two paths: recruiters → resume/LinkedIn, clients → the form. | C15, §5 |
| `404.html` | Absolute stylesheet path. | C4 |
| `data/site.json` | `links.youtubeChannel`, `links.kaggle`. The UI still shows the playlist. | C5 |
| `.github/workflows/prerender.yml` | Also commits `work/`, including new untracked pages. | Keeps CI in sync |
| `llms.txt`, `sitemap.xml`, `index.html` regions | Regenerated by the script. | |

No change to the design, the copy of existing sections, robots.txt, crawler access, private pages, or any of your claims.

## 10. Verification (Phase 4)

| Check | Result |
|---|---|
| `node --check` on all three JS files | Pass |
| `node scripts/prerender.js` run twice | Second run is byte-identical (idempotent, so CI won't commit spam) |
| Local HTTP server: `/`, both `/work/…/`, `sitemap.xml`, `llms.txt`, `data/case-studies.json` | All 200 |
| Every sitemap `<loc>` resolves locally | 4/4 → 200 |
| Canonical on each page | Self-referencing absolute URL, matching the sitemap |
| One `<h1>` per page; title lengths 62 / 76 / 73; descriptions 155 / 155 / 138 chars | Pass |
| validator.schema.org (POSTed HTML) | `/` **0 errors** (was 1 at HEAD); both case studies 0 errors, 0 warnings |
| JSON-LD matches visible content | Headline, description, dates and author match the page text |
| JS-rendered DOM (headless Chrome `--dump-dom`) | Both "case study →" links present after the client re-render; contact lead present |
| Lighthouse mobile, case pages (local) | Perf 99 · A11y 100 · BP 100 · SEO 100 · CLS 0 (both pages) |
| Lighthouse mobile, homepage A/B on the same local server | HEAD 88 / 91 vs. changes 88 / 88: no regression beyond run-to-run noise. Local BP 96 comes from the Cloudflare beacon's CORS failure on `localhost` only. One earlier run scored 25 because the machine load average was ~15, so I discarded it. |
| Mobile layout (Lighthouse final screenshot) and desktop (1280 px) | Checked visually: no overflow, matches the site's type and colours |
| robots.txt | Unchanged: allows everything |

**Not verified:**
- The 404 page at a nested path, because Python's dev server doesn't serve `404.html`. The fix is a one-character path change (`/css/style.css`). Check `https://firasridene.tech/work/nope` after deploy.
- The live contact form submission (not sent, to avoid a test email).
- Google Rich Results Test, which needs the deployed URL.
- Field Core Web Vitals.
- LinkedIn link (bot-blocked).
- Dark mode on case pages was not screenshotted. The pages use the same CSS variables and the same theme bootstrap as `/legal/`.

## 11. Remaining issues and your actions

1. **Reconcile experience (C2/C3):** pick the true employer and dates for the VocaFlow role, add or remove the Stealth Startup entry, and fix "Mai - Present". Update both `data/experience.json` (via admin) and the resume PDF.
2. **Decide on the unverified claims (§3):** link evidence or reword. Fix the stack on Store Support Agent (OpenAI gpt-4.1-mini, not Claude) and on TT Assistant.
3. **Graduation status (C13):** if you graduated on 2026-10-07, update education dates and the About text.
4. Resume PDF title metadata (C8); `noindex` for `signature-v3/signature.html` if it's never meant to be found (C9).
5. GSC, Bing, PSI, Rich Results and contact-form checks (§8).
6. Review the two case studies for tone and accuracy. In particular, check the "My contribution" paragraphs: they're based on commit authorship and the README credit, so correct them if a teammate was involved.

## 12. 30-day roadmap

| Week | Focus | Actions |
|---|---|---|
| 1 | Foundations | Deploy this branch. Verify in GSC and submit the sitemap. Import into Bing. Run Rich Results Test on all 3 URLs. Fix C2/C3/C6 and the resume PDF. Submit a real contact-form test. |
| 2 | Flagship voice AI | Write the **VocaFlow** case study, the highest-value page for "voice AI engineer" intent. Decide what's shareable from the internship. Add an architecture diagram and a short demo video (even a redacted screen capture). Add a matching YouTube video and link both ways. |
| 3 | Breadth with evidence | Case studies for **TT Assistant** (multilingual voice, hackathon award with a link to the post) and **5G MLOps** (after reconciling the Azure ML / 300-model wording). Add READMEs to `ClaudeCodeTeam` and the n8n library so the 8-agent claim has public evidence. |
| 4 | Conversion and measurement | Add a short `/services/` page (what you build, for whom, how an engagement works, using only real offers). Link it from the hero and case-study CTAs. Review GSC queries and impressions per page, and rewrite titles/descriptions for pages with impressions but low CTR. Make LinkedIn's headline and featured links point to the case studies. |

Measure in GSC (Performance → Pages → `/work/…`) and Cloudflare Analytics (visits to `/work/`, resume downloads, form submissions). Don't judge rankings before 4–8 weeks after indexing.
