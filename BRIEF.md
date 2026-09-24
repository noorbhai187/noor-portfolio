# Portfolio hero — scroll-driven video

Owner: **Shaik Noor Aien** — Software Developer | Aspiring Data Engineer

Build a personal portfolio site whose hero is a hand-drawn caricature video of Shaik that
**plays forward and backward as the visitor scrolls**, with text and a live data-pipeline
diagram layered on top. The video is finished; your job is the site.

---

## Assets in this folder

| File | What it is |
|---|---|
| `frames-1920/f_0001.webp … f_0314.webp` | The hero as 314 frames, **1920×1080**, 12 fps, ~24 MB. **Primary source on desktop** — draw to a `<canvas>` by scroll position (Apple-style). Smoothest in both directions. |
| `frames-1280/f_0001.webp … f_0314.webp` | Same 314 frames at 1280×720, ~14 MB. Use on phones and small screens. Pick the set once on load from `innerWidth * devicePixelRatio` (≥ 1600 → 1920 set). |
| `hero-1920.mp4` | Same video, 1080p H.264, every frame a keyframe (all-intra), no audio, 26.17 s, 32 MB. Fallback only: scrub via `video.currentTime`. |
| `hero-1280.mp4` | 720p version of the fallback MP4, 19 MB. |
| `poster.jpg` | First frame, 1080p. Show instantly while frames load. |
| `final.jpg` | Last frame, 1080p (Shaik standing, arms crossed, on blank paper). |

The video was upscaled to 1080p by Google Flow. All frames are 16:9. There is a small "Veo" mark bottom-right on most frames (from Google's video model). Leave it; don't crop or cover it to hide it.

## Dark mode

`dark/` contains a matching dark-mode version of the whole hero, with the **same file names, frame count and timing**: `dark/frames-1920/`, `dark/frames-1280/`, `dark/hero-1920.mp4`, `dark/hero-1280.mp4`, `dark/poster.jpg`, `dark/final.jpg`.

It is the same video processed frame by frame: the paper background is charcoal, the floating code doodles are light chalk-style lines, and Shaik, his clothes, the speech bubble and the night scene are unchanged. The night section is identical in both versions.

- **Theme source:** follow `prefers-color-scheme` by default, plus a visible light/dark toggle in the header that overrides it and is remembered (localStorage, wrapped in try/catch).
- **Load only the active theme's frames.** On a theme switch, swap to the other set. Because frame indices match 1:1, keep the current scroll position and just draw the same frame index from the new set; while the new set's frames load, keep drawing the old set's frame so nothing goes blank, then cross-fade canvas content over ~200 ms.
- **Colours:** dark page/hero background **#141517** (sampled from the dark frames, so frame edges disappear). Light-mode background stays #FBFBF6. Overlay text: dark ink in light mode, off-white #E9E6DD in dark mode. During the night section (p 0.61–0.92) text is light in **both** themes.
- **Pipeline diagram (drawn in code):** black ink strokes in light mode; #E9E6DD strokes in dark mode, to match the chalk doodles.
- `prefers-reduced-motion`: show `final.jpg` or `dark/final.jpg` for the active theme.

## Story timeline

`p` = scroll progress 0→1 across the hero. Frame index = `round(p * 313)`.

| p | seconds | What's on screen |
|---|---|---|
| 0.00–0.07 | 0–1.8 | Standing, holding laptop, character on the right. Empty space on left. |
| 0.07–0.28 | 1.8–7.3 | Walks to desk, sits, starts typing. Code doodles pop in. |
| 0.28–0.42 | 7.3–11 | Coding at desk with floating code / database / Python / SQL doodles. |
| 0.42–0.54 | 11–14.2 | Diet Coke moment: sipping a can, lightning-and-heart speech bubble. |
| 0.54–0.61 | 14.2–16 | Sets can down. |
| 0.61–0.67 | 16–17.5 | Paper background turns to navy night; stars and moon draw in. |
| 0.67–0.92 | 17.5–24.2 | Late night: face lit by laptop glow, tired, "zzz". |
| 0.92–0.97 | 24.2–25.3 | Page-peel: night peels away to blank paper. |
| 0.97–1.00 | 25.3–26.2 | Standing, arms crossed, centred (x ≈ 0.39–0.62 of frame width). |

## Overlay copy

Fade each line in and out within its range. Keep text off the character (it sits right-of-centre for most of the video, centred at the end).

- **0.00–0.08:** Name `Shaik Noor Aien`, subline `Software Developer | Aspiring Data Engineer`. Also show a small "scroll" hint that disappears once scrolling starts.
- **0.28–0.42:** `Pipelines, queries, and the long quiet stretch where it finally runs clean.`
- **0.42–0.56:** `Building systems, breaking bugs, and occasionally working for a Diet Coke.`
- **0.67–0.90:** `The screen is the only light left on.` (the background is dark navy here, so switch text to light)
- **0.97–1.00 and a held section after:** name returns, plus the pipeline diagram below.

## The pipeline diagram, drawn in code (important)

The video deliberately **ends before** any diagram appears, because the AI-generated diagram had spelling errors. Draw it yourself:

- After the last frame, **pin the final frame** for roughly one extra screen of scroll.
- In that pinned section, draw an SVG to the right of the character (x ≈ 0.66–0.95 of the frame): four hand-drawn-looking boxes, **Data → Processing → Database → Analytics**, joined by arrows, with a small bar-chart doodle at the end.
- Animate it with scroll: stroke-dashoffset line drawing, box by box, then arrows, then small pulses travelling along the arrows.
- Match the video's look: black imperfect ink outlines (slightly wobbly paths or an SVG turbulence filter), hand-lettered style font, no gradients.
- On narrow screens, place the diagram under the character instead of beside it.

## Visual direction

- Paper background: **#FBFBF6** (sampled from the video). Page background outside the hero should match so the frame edges disappear.
- Night section: sample the navy from a frame around f_0220 and use it for any UI that sits over the dark section.
- Accent colour: the teal of his t-shirt (sample from `final.jpg`). One accent only.
- Type: a hand-lettered display face for the name (e.g. from Google Fonts) paired with a clean, readable sans for body text. Avoid generic defaults.
- Tone: clean, minimal, slightly funny. The hero is the only illustrated part; the rest of the site stays quiet so it doesn't compete.

## Technical requirements

- **Canvas frame sequence first:** preload `poster.jpg`, then load frames progressively (first ~20 immediately, the rest in the background). Draw the nearest loaded frame if the exact one isn't ready.
- Scroll container: roughly 500–600 vh for the video, plus ~100 vh pinned for the diagram. Use `position: sticky` for the canvas.
- Smooth the scroll-to-frame mapping slightly (lerp) so it glides; respect `prefers-reduced-motion` by showing `final.jpg` plus static text instead.
- Size the canvas with `object-fit: cover` logic and devicePixelRatio. On portrait phones, crop to keep the character in view (focus point ≈ x 0.72 for most of the video, 0.5 at the end) rather than letterboxing.
- Must look right on mobile and desktop. Test both.
- No build step required unless the project already has one; a plain `index.html` + CSS + JS is fine. If the folder already contains a site or framework, integrate into it instead.
- Keep hero weight reasonable: load only one frame set per device (never both), and never load the MP4s unless the frame approach fails.

## Below the hero (placeholder sections)

About, Projects, Skills, Contact. Keep them simple placeholders with clear TODOs so Shaik can fill in his real projects and links.
