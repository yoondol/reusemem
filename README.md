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

## Real-world demonstrations

Each scenario is a continuous recording at twice the original speed. At each
request boundary the video holds for 1.8 s while the page shows the instruction.
The stage buttons seek to the corresponding hold. The fixed panel below shows
the current request throughout execution. The earlier-observation card uses
a frame from the same recording with the task-relevant object or location
marked. These frames illustrate the cues described in the paper.

The two sources and presentation timestamps are defined in
`assets/real-world/clips.json`. The H.264 files `case-guided.mp4` and
`toy-guided.mp4` keep full 1080p framing. Optional VTT captions match the
edited timelines. Both players retain muted, viewport-aware autoplay.

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

Frames come from the RoboMME sequence. Feature admission, key glyphs and
retrieval selections illustrate the architecture. Quantitative results are unchanged. The PDF button
serves the latest v52 manuscript as `assets/ReuseMem.pdf`; Paper links to arXiv.

The full timeline supports dragging and resumes from the selected point. The
adjacent Play/Pause button, Replay, chapter selection and Similar gate remain
available. Off-screen playback pauses and reduced-motion settings are respected.
Mobile uses an internal viewport. The v52 architecture is expandable below.

## Model comparisons

The public page uses quantitative plots for comparisons. It does not include
baseline comparison footage in either simulation or the physical scenarios.
The archived `unmask-choice-preview.mp4` was a comparison preview. The public
page uses the simulation gallery and the quantitative results.

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

## Physical recording edits

Both guided clips use the final continuous masters, with the existing
three-second tail trim. Case chapters start at 0, 4, 21.8 and 40.6 s in
the guided player. Toy chapters start at 0, 5.5, 22.8 and 39.6 s.
Time compression and editorial holds do not change the sequence of actions.

## Research overview

The Overview in `assets/reusemem-project-film.mp4` introduces how one recording
supports both target identity and a remembered destination. Animated examples show appearance
sharing, action-guided retrieval, and within-call memory projections.
Dedicated result scenes show the evidence intervention, retained bank size,
response to a new request and the continuing-goal cache control. The site
links the three headline metrics under the video to the detailed results.

## Link sharing preview

Open Graph and Twitter large-image cards use `assets/reusemem-social-v2.png`,
a 1200 × 630 title card with the complete author line and affiliation. The
image, dimensions and alt text appear in the static HTML head.
