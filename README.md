# ReuseMem project page

Buildless static site for the [ReuseMem paper](https://arxiv.org/abs/2611.21115).
Open `index.html` directly, or serve the directory with `python3 -m http.server 8000`.
For GitHub Pages, use this directory's contents at the root of a dedicated site
repository. Links to local assets are relative and work at a repository subpath.

## Adding media

- Copy approved web images and videos into `assets/`. The current case and toy
  photographs come from the same originals used for Figure 9. Architecture and
  simulation figures come from the public manuscript.
- Add video entries to `media` in `page.js`. Each entry is
  `{ src: "assets/example.mp4", poster: "assets/example.jpg", caption: "…" }`.
  The slots named `case`, `toy`, and `simulation` accept one or more entries.
  Empty slots leave the photo-first page intact.
- For the two physical scenarios, prioritize full runs with the actual time of
  each request identifiable. Caption any playback speed or excerpt, and use the
  photo timeline to explain task stages. For a held-out simulation clip, include
  the task name and whether it shows the observation recording or policy rollout.
- Match the current scene and request before adding a same-request,
  different-history side-by-side comparison. This is optional.
