# Personal site

A plain HTML/CSS/JS site — no build step, no framework. Content lives in
small data files that you edit directly and push to GitHub.

**Profile photo:** every page's header expects a photo at the repo root
named `my pic.png` (see `<img src="my pic.png">` in each `.html` file).
Drop your photo in with that exact filename before deploying, or rename
the `src` in each page's `<header>` block if you'd rather use a different
file/path.

## 1. Put it on GitHub

1. Create a new repo on GitHub, e.g. `yourusername.github.io` (this gives you
   a site at `https://yourusername.github.io`) — or any other repo name,
   which gives you `https://yourusername.github.io/repo-name`.
2. Push this folder's contents to that repo (see "Local setup" below).
3. In the repo: **Settings → Pages → Source → Deploy from a branch**, pick
   `main` and `/ (root)`, save. Your site will be live in a minute or two.

## 2. Local setup (only needed once)

You need `git` installed, and a way to preview locally (see below).

```bash
cd site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

## 3. Preview changes locally before pushing

The pages load content via `fetch()`, which browsers block on `file://`
pages — so you can't just double-click `index.html`. Instead, run a tiny
local server from the `site` folder:

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser. (Any static server
works — `npx serve` is another option if you have Node installed.)

## 4. How to update each section

Nothing here needs a rebuild — just edit the file and push.

**Profile / about (`data/profile.json`)**
Your name, tagline, links, one-line bio. Edit the fields directly.

**Work experience (`data/work.json`)**
A JSON array — one object per role. Copy an existing entry, edit the
fields, add it to the array (newest first).

**Projects (`data/projects.json`)**
Same pattern: one object per project, with a title, short summary, and
links (code, demo, etc).

**Research (`data/research.json`)**
One object per paper/preprint. Link out to the actual PDF or arXiv page —
don't host the paper file itself here.

**Achievements (`data/achievements.json`)**
Two plain arrays of strings — `scholastic` and `extracurricular`. Add or
remove lines as needed; each renders as one bullet.

**Datasets (`data/datasets.json` + `files/datasets/`)**
1. Drop the actual file (csv, json, zip, ...) into `files/datasets/`.
2. Add an entry to `data/datasets.json` describing it, pointing `path` at
   the file you just added.
   - GitHub blocks files over 100&nbsp;MB, and the web upload UI caps at
     25&nbsp;MB. For anything bigger, either use
     [Git LFS](https://git-lfs.com/) or upload the data to Zenodo / Kaggle /
     Google Drive and just link to it from the entry instead.

**Blog posts / reports (`content/posts/*.md` + `data/posts.json`)**
1. Write the post as a Markdown file in `content/posts/`, e.g.
   `content/posts/my-post.md`.
2. Add an entry to `data/posts.json` with a `slug` (used in the URL), the
   `title`, `date`, and the `file` path you just created.
3. For a PDF report instead of a Markdown post, drop the PDF in
   `files/reports/` and either link to it directly from a post, or add a
   link to it from `data/profile.json` / a project entry.

## Structure

```
index.html          home page
work.html            experience listing
projects.html        projects listing
research.html        research listing
achievements.html    achievements listing
datasets.html        datasets listing
blog.html             writing listing
blog-post.html        renders a single post from ?slug=
css/style.css        all styling
js/main.js            fetches data + renders all pages
data/*.json           editable content (the thing you'll touch most)
content/posts/*.md    blog/report post bodies
files/datasets/       raw dataset files
files/reports/        PDFs etc.
```

## Notes

- Colors, fonts, spacing are all in `css/style.css` under `:root` at the
  top if you want to tweak them.
- The nav bar is duplicated at the top of each `.html` file — if you
  rename a page or add a new one, update the nav block in every file.
- `blog-post.html` uses [marked.js](https://marked.js.org/) from a CDN to
  turn Markdown into HTML in the browser — no local Markdown processing
  needed.
