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

## Memory loop and goal transitions

`flow.js` and `flow.css` explain VideoPlaceButton with three chapters: Observe,
Goal 1 and Goal 2. New observations are written during action; they are not a
separate stage. Large temporary goal cards and the active chapter button make
instruction changes explicit. The source video pauses at the verified 10.75 s
boundary while Goal 2 is revealed, then resumes from that exact scene.

One outer Memory bank display contains two regions: Recorded and Recent.
Recorded holds the original shared experience, its appearance references,
temporal entries and retrieval keys. Recent receives action-time observations
through the visible return loop. This is a visual grouping of the paper’s
retained bank and execution context, not a change to the model: new execution
frames do not overwrite the original recorded bank, and recent context feeds
fusion directly. The duplicate Record node has been removed.

Six native history snapshots in `assets/flow-button/` illustrate four stored
appearances and six temporal entries. Similarity decisions, key glyphs and
evidence selections are explanatory illustrations rather than logged Reader
outputs. Seven native sequence snapshots supply the current and recent views.
The action endpoint uses the existing continuous scripted sequence MP4. The
full paper architecture remains expandable below the animation.

Pause, Replay, chapter selection and the Similar gate control the explanation.
Off-screen playback pauses; reduced-motion settings are respected. Mobile uses
an internal viewport that follows the active part of the diagram.

## Comparison layout preview

`assets/simulation/unmask-choice-preview.mp4` is a synchronized, scripted
illustration of correct-object and wrong-object choices for the same blue-cube
request. The model headings preview a comparison layout; these are **not**
ReuseMem or Uniform-Memory evaluation rollouts. A visible disclosure immediately
above the player states this distinction. The MP4 itself contains no explanatory
text or production labels. Quantitative results elsewhere are independent of
this illustrative video.
