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

## Animated memory and continuous execution

`flow.js` and `flow.css` explain the method using VideoPlaceButton. Six native
history snapshots in `assets/flow-button/` illustrate four stored appearances
and six temporal entries. A similarity gate shows reuse of an appearance while
time and retrieval keys remain specific to each observation. Admission choices,
key glyphs and selected evidence are explanatory illustrations, not logged
encoder or Reader outputs.

The first request returns the cube to the last location before the button
press. The second returns it to the first location after the press. The action
player uses one existing `video-place-button-sequence.mp4`: Goal 1 ends and
Goal 2 begins at 10.75 seconds, with no reset. Current-scene snapshots change as
the sequence progresses. New execution views are encoded into recent execution
context, which feeds fusion separately from the retained common experience
bank. The recorded bank is not overwritten or appended during these actions,
as specified in the paper’s execution algorithm.

Native video snapshots at 0, 3, 6, 10.75, 14, 17 and 19.8 seconds illustrate
current and recent observations. SVG viewports enlarge the useful tabletop
region without changing source images. The full paper architecture remains
expandable below. Pause, Replay, chapter buttons and a clickable Similar gate
control the explanation; mobile panning follows the active stage. Off-screen
playback pauses, and reduced-motion preferences are respected.

## Comparison layout preview

`assets/simulation/unmask-choice-preview.mp4` is a synchronized, scripted
illustration of correct-object and wrong-object choices for the same blue-cube
request. The model headings preview a comparison layout; these are **not**
ReuseMem or Uniform-Memory evaluation rollouts. A visible disclosure immediately
above the player states this distinction. The MP4 itself contains no explanatory
text or production labels. Quantitative results elsewhere are independent of
this illustrative video.
