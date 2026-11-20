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

Each physical scenario now has its own full-width row, with Observation and a
continuous three-goal execution side by side. Native photographs remain until
actual videos are supplied. Source paths are explicit in
`assets/real-world/clips.json`; null entries never request nonexistent videos.

The final four files are `case-observation.mp4`, `case-sequence.mp4`,
`toy-observation.mp4`, and `toy-sequence.mp4`, all under `assets/real-world/`.
Put each published relative path in the matching `src`. For each sequence, set
`chapters` to actual `{ "goal": 1, "start": <seconds> }` entries for goals 1–3.
Starts are measured in the final sequence clip, not the original full master.
The goal buttons activate only when their real start times are supplied. Captions
and active-goal emphasis follow playback, without covering the camera image.
Videos join the same muted autoplay and off-screen pause system as simulation.

Record one uninterrupted master per scenario, including the observation period,
then split it only into observation and execution for the page. Do not reset or
re-stage between requests. Case goals are USB to left tray, SD to right tray,
and USB to its original position. Toy goals are the originally left toy to the
right tray, brushing its original spot and parking the brush, and toy restoration.

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

## Model comparisons

The public page uses quantitative plots for comparisons. It does not include
baseline comparison footage in either simulation or the physical scenarios.
The archived `unmask-choice-preview.mp4` is a scripted illustration and is no
longer embedded or loaded. Keep it separate from model evaluation rollouts.

## Editorial design

The page uses a locally hosted DM Sans type family, an off-white, navy and cobalt-blue
palette, and a restrained hierarchy. The visit progresses from the everyday
example to the interactive method, simulator examples, physical scenarios, and
quantitative evaluation. Each task keeps Observation, Goal 1 and Goal 2 together;
a larger continuous sequence follows. Native videos keep their aspect ratio,
autoplay muted when visible, and pause off screen. The same video sources, cue
times, evaluation data, and v52 memory-flow logic are retained.

There is no persistent top navigation. Large Overview, Method, Simulation,
Real World and Results headings divide the page. Desktop,
tablet and mobile layouts adapt without shrinking all media into one fixed grid.
Evidence, performance, latency and storage plots share the same accent for
ReuseMem; comparison methods use a consistent neutral color. Original numeric
values are embedded in the existing data blocks and are not altered by styling.

The cover uses a larger, heavier title and a strong blue gradient. No graphical
logo or extra tagline appears. Simulation task selection uses four large
buttons, arranged in two columns on phones. Goal instructions and ReuseMem's
result marks use stronger type and contrast without changing the data.

## Physical result plots

The two real-world comparison plots use the v52 manuscript's physical-results
table, with 20 test recordings per scenario. They switch between Sequence
(default, matching the demonstrations) and independent All-goal success. Success
counts are exact percentage conversions for n=20. The plots add no new trials
and do not alter the simulation or resource measurements.

## Core narrative

Overview introduces why the same experience should support later requests,
using the physical case example. A three-part contribution strip follows the
paper's contributions: reusable memory, action-guided retrieval learning, and
efficient reuse. It replaces the repeated full abstract. Short Method,
Simulation, Real World and Results chapters lead into the existing interactive
architecture, demonstrations and quantitative plots. Functional line icons
identify ideas and chapters; there is no project logo or extra cover tagline.
Exact requests, metric definitions and media provenance remain where needed.

## Supplied physical toy demonstration

The toy scenario uses one supplied 100-second camera recording. The first
12 seconds show the original positions and relocation into the left tray.
The remaining 88 seconds preserve the continuous three-request execution at
normal speed, without internal cuts or resets. Goal starts are 0, 26 and
56 seconds in the published sequence (12, 38 and 68 seconds in the master).
Both files are 1920 × 1080 H.264 with fast-start metadata, with audio omitted.
The image is not cropped, geometrically altered or overlaid with text.
Synchronized instructions sit below the footage; English WebVTT captions
are also available through the video controls. Case videos remain pending.

## Camera-view comparison

Below the existing toy demonstration, two complete supplied recordings appear
side by side as View 1 (earlier) and View 2 (new). Both retain the entire
recording, native 16:9 framing and original speed, without captions or overlays.
The earlier 1080p HEVC source is converted to H.264 for browser support; the new
720p H.264 video is remuxed without re-encoding. Audio is omitted for both.
They use the same viewport-aware muted autoplay as the other demonstrations.
These are separate recordings rather than synchronized views of one execution.

Three further supplied recordings appear below View 1 and View 2 as Views 3–5.
They are complete 1080p recordings at original speed, with no internal cuts,
image crops or overlays. HEVC is converted to browser-compatible H.264 and
audio is omitted. The additional row has three columns on desktop and stacks
on smaller screens. Existing demonstrations and all result values are unchanged.
