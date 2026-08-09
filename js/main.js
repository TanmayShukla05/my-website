/* ============================================================
   Small helpers
   ============================================================ */
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function fetchText(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.text();
}

function linksRow(links) {
  if (!links || !links.length) return null;
  return el(
    "div",
    { class: "entry-links" },
    links.map((l) => el("a", { href: l.url, target: "_blank", rel: "noopener" }, l.label))
  );
}

function tagsEyebrow(parts, tags) {
  const children = parts.map((p) => el("span", {}, p));
  (tags || []).forEach((t) => children.push(el("span", { class: "tag" }, t)));
  return el("div", { class: "entry-eyebrow" }, children);
}

function showState(container, msg) {
  container.innerHTML = "";
  container.appendChild(el("div", { class: "state-msg" }, msg));
}

/* ============================================================
   Section renderers
   ============================================================ */
async function renderWork(container, limit) {
  try {
    let items = await fetchJSON("data/work.json");
    if (limit) items = items.slice(0, limit);
    if (!items.length) return showState(container, "No entries yet — add one to data/work.json");
    container.innerHTML = "";
    items.forEach((it) => {
      const entry = el("div", { class: "entry" }, [
        tagsEyebrow([`${it.start} — ${it.end}`, it.location].filter(Boolean), it.tags),
        el("div", { class: "entry-title" }, it.role),
        el("div", { class: "entry-sub" }, it.org),
        el("div", { class: "entry-body" }, el("p", {}, it.summary)),
        linksRow(it.links),
      ]);
      container.appendChild(entry);
    });
  } catch (e) {
    showState(container, "Couldn't load work experience.");
    console.error(e);
  }
}

async function renderProjects(container, limit) {
  try {
    let items = await fetchJSON("data/projects.json");
    if (limit) items = items.slice(0, limit);
    if (!items.length) return showState(container, "No entries yet — add one to data/projects.json");
    container.innerHTML = "";
    items.forEach((it) => {
      const entry = el("div", { class: "entry" }, [
        tagsEyebrow([it.date], it.tags),
        el("div", { class: "entry-title" }, it.title),
        el("div", { class: "entry-body" }, el("p", {}, it.summary)),
        linksRow(it.links),
      ]);
      container.appendChild(entry);
    });
  } catch (e) {
    showState(container, "Couldn't load projects.");
    console.error(e);
  }
}

async function renderResearch(container, limit) {
  try {
    let items = await fetchJSON("data/research.json");
    if (limit) items = items.slice(0, limit);
    if (!items.length) return showState(container, "No entries yet — add one to data/research.json");
    container.innerHTML = "";
    items.forEach((it) => {
      const entry = el("div", { class: "entry" }, [
        tagsEyebrow([it.venue], it.tags),
        el("div", { class: "entry-title" }, it.title),
        el("div", { class: "entry-sub" }, it.authors),
        el("div", { class: "entry-body" }, el("p", {}, it.summary)),
        linksRow(it.links),
      ]);
      container.appendChild(entry);
    });
  } catch (e) {
    showState(container, "Couldn't load research.");
    console.error(e);
  }
}

async function renderDatasets(container) {
  try {
    const items = await fetchJSON("data/datasets.json");
    if (!items.length) return showState(container, "No datasets yet — add one to data/datasets.json");
    container.innerHTML = "";
    items.forEach((it) => {
      const fileRows = (it.files || []).map((f) =>
        el("div", { class: "dataset-file" }, [
          el("a", { class: "dataset-name", href: f.path, download: "" }, f.name),
          el("span", { class: "dataset-meta" }, f.size || ""),
        ])
      );
      const entry = el("div", { class: "entry" }, [
        tagsEyebrow([it.date]),
        el("div", { class: "entry-title" }, it.title),
        el("div", { class: "entry-body" }, el("p", {}, it.summary)),
        fileRows.length ? el("div", {}, fileRows) : null,
        linksRow(it.links),
      ]);
      container.appendChild(entry);
    });
  } catch (e) {
    showState(container, "Couldn't load datasets.");
    console.error(e);
  }
}

async function renderPosts(container, limit) {
  try {
    let items = await fetchJSON("data/posts.json");
    items = items.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    if (limit) items = items.slice(0, limit);
    if (!items.length) return showState(container, "No posts yet — add one to data/posts.json");
    container.innerHTML = "";
    items.forEach((it) => {
      const entry = el("div", { class: "entry" }, [
        tagsEyebrow([it.date], it.tags),
        el("div", { class: "entry-title" }, el("a", { href: `blog-post.html?slug=${encodeURIComponent(it.slug)}` }, it.title)),
        el("div", { class: "entry-body" }, el("p", {}, it.summary)),
      ]);
      container.appendChild(entry);
    });
  } catch (e) {
    showState(container, "Couldn't load posts.");
    console.error(e);
  }
}

async function renderSinglePost(container) {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  if (!slug) return showState(container, "No post specified.");
  try {
    const posts = await fetchJSON("data/posts.json");
    const post = posts.find((p) => p.slug === slug);
    if (!post) return showState(container, "Post not found.");
    document.title = `${post.title} — ${document.title}`;
    const md = await fetchText(post.file);
    const html = window.marked ? window.marked.parse(md) : md;
    container.innerHTML = "";
    container.appendChild(el("h1", {}, post.title));
    container.appendChild(el("div", { class: "post-meta" }, [post.date, ...(post.tags || [])].join("  ·  ")));
    container.appendChild(el("div", { class: "post-body", html }));
  } catch (e) {
    showState(container, "Couldn't load this post.");
    console.error(e);
  }
}

async function renderAchievements(container) {
  try {
    const data = await fetchJSON("data/achievements.json");
    container.innerHTML = "";
    const groups = [
      { key: "scholastic", label: "Scholastic" },
      { key: "extracurricular", label: "Extracurricular & Competitions" },
    ];
    groups.forEach((g) => {
      const items = data[g.key] || [];
      if (!items.length) return;
      container.appendChild(el("h3", { class: "achv-group-title" }, g.label));
      container.appendChild(
        el(
          "ul",
          { class: "simple-list" },
          items.map((text) => el("li", {}, text))
        )
      );
    });
    if (!container.children.length) showState(container, "No achievements yet — add some to data/achievements.json");
  } catch (e) {
    showState(container, "Couldn't load achievements.");
    console.error(e);
  }
}

async function renderSkills(container) {
  try {
    const profile = await fetchJSON("data/profile.json");
    const skills = profile.skills || [];
    if (!skills.length) return;
    container.innerHTML = "";
    container.appendChild(
      el(
        "div",
        { class: "skills-list" },
        skills.map((s) => el("span", { class: "tag" }, s))
      )
    );
  } catch (e) {
    console.error(e);
  }
}

/* ============================================================
   Nav active-state
   ============================================================ */
function markActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.site-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
}
document.addEventListener("DOMContentLoaded", markActiveNav);
