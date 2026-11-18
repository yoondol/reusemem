// Set an entry to a published relative MP4 path to activate that player.
const videoSources = {
  case: "",
  toy: "",
};

for (const poster of document.querySelectorAll("[data-media]")) {
  const src = videoSources[poster.dataset.media];
  if (!src) continue;
  const image = poster.querySelector("img");
  const kind = poster.dataset.kind;
  const video = document.createElement("video");
  const title = poster.closest("article").querySelector("h3").textContent;
  video.controls = true;
  video.playsInline = true;
  video.preload = "none";
  video.poster = image.src;
  video.setAttribute("aria-label", title + " demonstration");
  video.addEventListener("error", () => {
    video.replaceWith(image);
    if (kind) poster.dataset.kind = kind;
  });
  video.src = src;
  image.replaceWith(video);
  delete poster.dataset.kind;
}

const taskButtons = document.querySelectorAll("[data-task]");
function selectTask(id) {
  const active = Array.from(taskButtons).find(button => button.dataset.task === id);
  if (!active) return;
  for (const button of taskButtons) {
    const selected = button === active;
    const section = document.getElementById(button.dataset.task);
    button.setAttribute("aria-pressed", String(selected));
    section.hidden = !selected;
    if (!selected) {
      for (const video of section.querySelectorAll("video")) video.pause();
    }
  }
}
const taskFromHash = () => selectTask(window.location.hash.slice(1).replace(/-sequence$/, ""));
for (const button of taskButtons) {
  button.addEventListener("click", () => selectTask(button.dataset.task));
}
if (taskButtons.length) {
  selectTask(taskButtons[0].dataset.task);
  taskFromHash();
  window.addEventListener("hashchange", taskFromHash);
}

// Keep timed context below the image, without covering the action.
const cueSource = document.querySelector("#video-cue-data");
if (cueSource) {
  const cueData = JSON.parse(cueSource.textContent);
  for (const video of document.querySelectorAll("video[data-caption-id]")) {
    const cues = cueData[video.dataset.captionId];
    const panel = document.querySelector(`[data-caption="${video.dataset.captionId}"]`);
    for (const track of video.textTracks) track.mode = "hidden";
    video.addEventListener("loadedmetadata", () => {
      for (const track of video.textTracks) track.mode = "hidden";
    }, { once: true });
    function updateContext() {
      const cue = cues.find(c => video.currentTime >= c.start && video.currentTime < c.end) || cues[cues.length - 1];
      panel.querySelector(".caption-phase").textContent = cue.phase;
      panel.querySelector(".caption-text").textContent = cue.text;
      const progress = Math.max(0, Math.min(1, (video.currentTime - cue.start) / (cue.end - cue.start)));
      panel.querySelector(".caption-progress span").style.width = (progress * 100) + "%";
    }
    video.addEventListener("timeupdate", updateContext);
    video.addEventListener("seeked", updateContext);
    updateContext();
  }
}

const autoplayControl = document.querySelector("#autoplay-control");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const galleryVideos = document.querySelectorAll("#demos video, #simulation video, #comparison video");

if (autoplayControl && "IntersectionObserver" in window) {
  let enabled = !motionPreference.matches;
  const visible = new Set();
  function updatePlayback() {
    autoplayControl.setAttribute("aria-pressed", String(enabled));
    autoplayControl.textContent = enabled ? "Autoplay on" : "Autoplay off";
    for (const video of visible) {
      if (enabled) video.play().catch(() => {});
      else video.pause();
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
        visible.add(video);
        if (enabled) video.play().catch(() => {});
      } else {
        visible.delete(video);
        if (enabled) video.pause();
      }
    }
  }, { threshold: 0.25 });
  for (const video of galleryVideos) {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    observer.observe(video);
  }
  autoplayControl.addEventListener("click", () => {
    enabled = !enabled;
    updatePlayback();
  });
  motionPreference.addEventListener("change", event => {
    enabled = !event.matches;
    updatePlayback();
  });
  updatePlayback();
} else if (autoplayControl) {
  autoplayControl.hidden = true;
}

const outcomes = document.querySelector("#outcome-data");
if (outcomes) {
  const data = JSON.parse(outcomes.textContent);
  const task = document.querySelector("#results-task");
  const metric = document.querySelector("#results-metric");
  const rows = document.querySelectorAll("#outcome-bars .measure");
  const metrics = {
    all: ["All-goal success", "Both requests succeed using the same observation history."],
    sequence: ["Sequence success", "Both requests succeed in one continuous run."],
    goal: ["Single-goal success", "Each request is evaluated separately."],
  };
  function updateOutcomes() {
    const values = data[task.value][metric.value];
    const [name, definition] = metrics[metric.value];
    const [uniform, reuse] = values.slice(-2);
    const delta = reuse[0] - uniform[0];
    const gain = (delta >= 0 ? "+" : "") + delta.toFixed(1) + " pp";
    const scope = task.value === "all-tasks" ? "across four tasks" : "on " + task.selectedOptions[0].textContent;

    rows.forEach((row, i) => {
      const [rate, count, total] = values[i];
      row.querySelector(".measure-track span").style.setProperty("--bar", rate + "%");
      row.querySelector(".measure-value strong").textContent = rate.toFixed(1) + "%";
      row.querySelector(".measure-value small").textContent = count + "/" + total;
    });
    document.querySelector("#gain-value").textContent = gain;
    document.querySelector("#gain-description").textContent = name + " over Uniform-Memory " + scope;
    document.querySelector("#metric-context").textContent = definition;
    document.querySelector("#chart-update").textContent = name + " " + scope + ". ReuseMem " + reuse[0].toFixed(1) + " percent.";
  }
  task.addEventListener("change", updateOutcomes);
  metric.addEventListener("change", updateOutcomes);
}

const efficiencySource = document.querySelector("#efficiency-data");
if (efficiencySource) {
  const efficiency = JSON.parse(efficiencySource.textContent);
  const costButtons = document.querySelectorAll("[data-cost-metric]");
  const metricNames = { all: "All-goal success", sequence: "Sequence success", goal: "Goal success" };

  function updateEfficiency(metric) {
    for (const button of costButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.costMetric === metric));
    }
    for (const chart of document.querySelectorAll("[data-cost-axis]")) {
      const axis = chart.dataset.costAxis;
      const unit = axis === "response" ? "ms" : "MiB";
      chart.querySelector(".cost-metric-name").textContent = metricNames[metric];
      for (const point of chart.querySelectorAll("[data-model]")) {
        const model = efficiency[point.dataset.model];
        const rate = model.rates[metric];
        const value = model[axis].toLocaleString("en-US", {
          minimumFractionDigits: axis === "storage" ? 2 : 0,
          maximumFractionDigits: axis === "storage" ? 2 : 0,
        });
        point.style.bottom = rate + "%";
        point.querySelector("small").textContent = value + " " + unit + ", " + rate.toFixed(1) + "%";
        point.querySelector("button").setAttribute("aria-label", point.dataset.model + ", " + value + " " + unit + ", " + rate.toFixed(1) + "% " + metricNames[metric]);
      }
    }
    document.querySelector("#cost-update").textContent = "Both efficiency plots show " + metricNames[metric] + ". ReuseMem " + efficiency.ReuseMem.rates[metric].toFixed(1) + " percent.";
  }
  for (const button of costButtons) {
    button.addEventListener("click", () => updateEfficiency(button.dataset.costMetric));
  }
}

if ("IntersectionObserver" in window && !motionPreference.matches) {
  const chartObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("chart-entered");
      chartObserver.unobserve(entry.target);
    }
  }, { threshold: 0.2 });
  for (const chart of document.querySelectorAll(".outcome-chart, .resource-chart, .evidence-chart")) {
    chartObserver.observe(chart);
  }
}

const copy = document.querySelector("#copy-citation");
if (navigator.clipboard) {
  copy.hidden = false;
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.querySelector("#bibtex").textContent);
      copy.textContent = "Copied";
      document.querySelector("#copy-status").textContent = "BibTeX copied.";
    } catch {
      copy.textContent = "Select BibTeX to copy";
    }
  });
}

const comparison = document.querySelector("#comparison-video");
if (comparison) {
  const lines = document.querySelectorAll(".comparison-outcomes p");
  function updateComparison() {
    const revealed = comparison.currentTime >= 5.3;
    lines[0].textContent = revealed ? "The blue cube is revealed." : "Lift the cover hiding the blue cube.";
    lines[1].textContent = revealed ? "The red cube is revealed." : "Lift the cover hiding the red cube.";
  }
  comparison.addEventListener("timeupdate", updateComparison);
  comparison.addEventListener("seeked", updateComparison);
  updateComparison();
}

// A quiet section indicator in the persistent research-page navigation.
if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('nav[aria-label="Sections"] a')];
  const navObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links) {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  for (const link of links) {
    const section = document.querySelector(link.hash);
    if (section) navObserver.observe(section);
  }
  const cover = document.querySelector('.hero');
  if (cover) navObserver.observe(cover);
}
