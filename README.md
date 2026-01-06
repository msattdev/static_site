# Static version of Portfolio

This folder contains a static HTML/CSS/JS version of the Flask-based portfolio so you can host it on GitHub Pages or any static hosting.

Quick preview locally:

1. Open a terminal and change into this folder:

   cd static_site

2. Start a local static server (Python 3):

   python -m http.server 8000

3. Open http://127.0.0.1:8000 in your browser.

Deploy to GitHub Pages (two options):

- Option A: Move the contents of `static_site` into a `docs/` folder in the repo root and enable GitHub Pages (branch `main`, folder `docs`).
- Option B: Create a new branch `gh-pages` and push the contents of `static_site` to that branch (GitHub will serve it automatically).

Notes:
- Site uses PT Mono from Google Fonts and 2026 year progress bar.
- Update `index.html` to replace placeholder text (name, email, project URLs) before publishing.
