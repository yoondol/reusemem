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

Observation and sequence players show synchronized descriptions in fixed panels below the video. English WebVTT captions in `assets/captions/` remain available through the native accessibility controls.
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

## Growing memory and execution context

The animation matches the v52 paper: observations before and during execution
use the same Writer and Similar gate. Similar appearances share features while
each observation appends its own time and key entry. Six initial observations
become eight after Goal 1 and ten after Goal 2; four appearances become six.
These small counts illustrate the mechanism, not the full evaluation bank size.

Goal 1 reads the six observations available when its request arrives. Goal 2
reads the eight then available, including the result of Goal 1. Its illustrated
selection combines the original post-press evidence and a Goal 1 observation.
Selected historical entries remain fixed within a request. Current and strictly
past Recent frames refresh separately; Recent is not part of the archive pool.
The dashed time-entry boundary marks the request's eligible memory prefix.

The visible stages remain Observe, Goal 1 and Goal 2, with no reset between goals.
The 45.9-second explanation includes short action-end holds for showing the
Writer. The native video pauses at 10.75 s for the Goal 2 request and ends at
19.8 s. Current checkpoints include 10.15 and 19.35 s. New archive occurrences
use 10.05, 10.4, 19.25 and 19.6 s. The first and second pair each share one
appearance. Each observation is strictly earlier than the current checkpoint
when its writing begins. Existing Recent sources remain strictly past as well.

Frames come from the existing native scripted simulator sequence. Feature
admission, key glyphs and retrieval selections are explanatory illustrations,
not logged model outputs. Quantitative results are unchanged. The PDF button
serves the latest v52 manuscript as `assets/ReuseMem.pdf`; Paper links to arXiv.

The full timeline supports dragging and resumes from the selected point. The
adjacent Play/Pause button, Replay, chapter selection and Similar gate remain
available. Off-screen playback pauses and reduced-motion settings are respected.
Mobile uses an internal viewport. The v52 architecture is expandable below.

## Comparison layout preview

`assets/simulation/unmask-choice-preview.mp4` is a synchronized, scripted
illustration of correct-object and wrong-object choices for the same blue-cube
request. The model headings preview a comparison layout; these are **not**
ReuseMem or Uniform-Memory evaluation rollouts. A visible disclosure immediately
above the player states this distinction. The MP4 itself contains no explanatory
text or production labels. Quantitative results elsewhere are independent of
this illustrative video.

## Editorial design

The page uses a locally hosted DM Sans type family, an off-white, navy and cobalt-blue
palette, and a restrained hierarchy. The visit progresses from the everyday
example to the interactive method, simulator examples, physical scenarios, and
quantitative evaluation. Each task keeps Observation, Goal 1 and Goal 2 together;
a larger continuous sequence follows. Native videos keep their aspect ratio,
autoplay muted when visible, and pause off screen. The same video sources, cue
times, evaluation data, and v52 memory-flow logic are retained.

The top navigation stays available and indicates the current section. Desktop,
tablet and mobile layouts adapt without shrinking all media into one fixed grid.
Evidence, performance, latency and storage plots share the same accent for
ReuseMem; comparison methods use a consistent neutral color. Original numeric
values are embedded in the existing data blocks and are not altered by styling.
