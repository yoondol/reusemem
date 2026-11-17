# ReuseMem project page

Static site for the [ReuseMem paper](https://arxiv.org/abs/2611.21115), deployed
at [yoondol.github.io/reusemem](https://yoondol.github.io/reusemem/) from the
root of the main branch. Open `index.html` directly or run
`python3 -m http.server 8000` from this directory.

## Simulation gallery

Each of the four task rows in `index.html` uses four 1080p video and JPEG
poster pairs under `assets/simulation/`. The suffixes are `-observation`,
`-goal-1`, `-goal-2`, and `-sequence`. The goal clips execute separately from the same
post-observation scene. Goal instructions appear in the web captions.

| Task | Filename prefix |
| --- | --- |
| VideoPlaceButton | `video-place-button` |
| VideoPlaceOrder | `video-place-order` |
| VideoUnmaskSwap | `video-unmask-swap` |
| PickHighlight | `pick-highlight` |

The fourth player shows both goals in one execution with no reset between them.
The gallery shows one selected task at a time, with three clips across and a
separate continuous sequence. All requested videos autoplay muted in view and
pause off-screen. Use the Autoplay button to disable it. The initial setting
respects reduced-motion preferences.

Observation and sequence players include English WebVTT captions in `assets/captions/`.
Sequence captions change at each verified Goal 2 boundary. The final observation
frames of VideoUnmaskSwap and PickHighlight are held for two seconds so the
hidden-cube and disappearing-cue states can be read. Goal instructions appear
above the independent goal players.

Quantitative policy outcomes and resource plots use the published paper’s tables
and measurements. The site ships DM Sans locally under its OFL license.

## Adding the real-world demonstrations

Place the MP4 files under `assets/` and set the `case` and `toy` entries in
`videoSources` in `page.js`. The cards show Figure 9 photos until a video is
available. Keep the full no-reset sequences with the actual request
transitions identifiable.

- `real-case.mp4` — Show the open USB and SD cases and their starting
  positions, then the closed and relocated cases. Show USB to left tray,
  SD to right tray, and USB returned to its original position.
- `real-toy.mp4` — Show the toys’ original positions, then relocation,
  brushing of the vacated position and brush parking, and the toy’s return.
