/* Cal.com booking, shared by the homepage contact section and /book/.
   Cal.com's embed script (~90 KB) only loads once a call type is picked
   (or on /book/, where picking one is the whole point of the page).
   The cards are plain links to cal.com, so without JS (or with a modifier
   click) they just open the booking page in a new tab. */

function initBooking({ open = null } = {}) {
  const opts = [...document.querySelectorAll(".book-opt")];
  const panel = document.querySelector("#bookEmbed");
  if (!opts.length || !panel) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rendered = new Set();
  const theme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

  /* Cal.com's official loader: queues calls until embed.js arrives */
  const loadCal = () => {
    (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  };

  /* the embed's theme is fixed once rendered, so each theme gets its own namespace */
  const show = (opt, scroll = true) => {
    const ns = `${opt.dataset.ns}-${theme()}`;
    opts.forEach((o) => o.setAttribute("aria-current", String(o === opt)));
    panel.hidden = false;
    panel.querySelectorAll(".book-frame").forEach((f) => { f.hidden = f.id !== `bookFrame-${ns}`; });

    if (!rendered.has(ns)) {
      rendered.add(ns);
      const frame = document.createElement("div");
      frame.className = "book-frame";
      frame.id = `bookFrame-${ns}`;
      panel.append(frame);
      loadCal();
      Cal("init", ns, { origin: "https://app.cal.com" });
      Cal.ns[ns]("inline", { elementOrSelector: `#${frame.id}`, calLink: opt.dataset.cal, config: { layout: "month_view", theme: theme() } });
      Cal.ns[ns]("ui", {
        theme: theme(),
        layout: "month_view",
        hideEventTypeDetails: false,
        cssVarsPerTheme: { light: { "cal-brand": "#2553c4" }, dark: { "cal-brand": "#93aaf3" } },
      });
    }
    if (scroll) panel.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
  };

  opts.forEach((o) =>
    o.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      show(o);
    })
  );

  /* keep an open calendar in step with the site theme (runs after the theme toggle's own handler) */
  document.querySelectorAll(".theme-btn").forEach((b) =>
    b.addEventListener("click", () => {
      const cur = opts.find((o) => o.getAttribute("aria-current") === "true");
      if (cur) show(cur, false);
    })
  );

  const first = open && opts.find((o) => o.dataset.ns === open);
  if (first) show(first, false);
}
