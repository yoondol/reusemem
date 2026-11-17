# ReuseMem project page

Static site for the [ReuseMem paper](https://arxiv.org/abs/2611.21115), deployed
at [yoondol.github.io/reusemem](https://yoondol.github.io/reusemem/) from the
root of the main branch. Open `index.html` directly or run
`python3 -m http.server 8000` from this directory.

## Adding the demonstration videos

Place the finished MP4 files under `assets/` and set the six relative paths
in `videoSources` in `page.js`. Until a path is set, that slot shows the
corresponding photo or paper-figure preview. The interactive photo sequence
alongside the title remains available.

| Slot | Suggested file | What to include |
| --- | --- | --- |
| `case` | `real-case.mp4` | One continuous trial. Show the open USB and SD cases and their starting positions, then the closed and relocated cases. Show USB to left tray, SD to right tray, USB returned to its original position. |
| `toy` | `real-toy.mp4` | One continuous trial. Show the toys' original positions, then relocation, brushing of the vacated position and brush parking, and the toy's return. |
| `button` | `sim-video-place-button.mp4` | One history with the button event, then two goals showing the last destination before and the first destination after the press. |
| `order` | `sim-video-place-order.mp4` | One history with ordered placements, then the first and second distinct destinations as separate goals. |
| `swap` | `sim-video-unmask-swap.mp4` | One history with both cubes visible before occlusion and the covers swapping, then the requests to uncover blue and red. Show the cover being placed in the removal area. |
| `highlight` | `sim-pick-highlight.mp4` | One history with both highlighting events and their disappearance, then the two requested transfers. |

For simulation, show the common history once and label the two independent
branches as reset to the same post-recording scene and memory. Use actual
ReuseMem rollouts for goal branches. For real videos label the request
transitions and any playback speed, keeping the no-reset sequence legible.
The pages use existing Figure 9 photos and two goal panels cropped from Figure 6.
