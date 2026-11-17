const stages = {
  setup: {
    image: "assets/photo-07.jpg",
    alt: "The two closed cases have moved to new positions below the trays.",
    label: "Before the requests",
    description: "The current view no longer shows what is inside either case.",
  },
  usb: {
    image: "assets/photo-08.jpg",
    alt: "The closed black case that holds the USB drive is in the left tray.",
    label: "USB case in the left tray",
    description: "The earlier view of the contents identifies which closed case to move.",
  },
  sd: {
    image: "assets/photo-09.jpg",
    alt: "The USB case remains in the left tray and the SD card case is in the right tray.",
    label: "SD case in the right tray",
    description: "The same record identifies the other case by its contents.",
  },
  return: {
    image: "assets/photo-10.jpg",
    alt: "The USB case is back at its original desk position. The SD card case remains on the right tray.",
    label: "USB case back at its origin",
    description: "The robot takes the USB case from the tray and returns it to the position seen before any request.",
  },
};

const stageButtons = document.querySelectorAll("[data-stage]");
const goalFrame = document.querySelector("#goal-frame");
const goalLabel = document.querySelector("#goal-label");
const goalDescription = document.querySelector("#goal-description");

for (const button of stageButtons) {
  button.addEventListener("click", () => {
    const stage = stages[button.dataset.stage];
    goalFrame.src = stage.image;
    goalFrame.alt = stage.alt;
    goalLabel.textContent = stage.label;
    goalDescription.textContent = stage.description;
    for (const choice of stageButtons) {
      choice.setAttribute("aria-pressed", String(choice === button));
    }
  });
}

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
const taskFromHash = () => selectTask(window.location.hash.slice(1));
for (const button of taskButtons) {
  button.addEventListener("click", () => selectTask(button.dataset.task));
}
if (taskButtons.length) {
  selectTask(taskButtons[0].dataset.task);
  taskFromHash();
  window.addEventListener("hashchange", taskFromHash);
}

const autoplayControl = document.querySelector("#autoplay-control");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const galleryVideos = document.querySelectorAll("#demos video, #simulation video, #action-comparison video");

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
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        visible.add(video);
        if (enabled) video.play().catch(() => {});
      } else {
        visible.delete(video);
        if (enabled) video.pause();
      }
    }
  }, { threshold: 0.6 });
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
    all: ["All-goal success", "Both requests must succeed independently from the same starting scene and memory."],
    sequence: ["Sequence success", "Both requests must succeed in one run without resetting the scene."],
    goal: ["Single-goal success", "Each of the two requests is scored separately from the same post-observation scene."],
  };
  function updateOutcomes() {
    const values = data[task.value][metric.value];
    const [name, definition] = metrics[metric.value];
    const [uniform, reuse] = values.slice(-2);
    const delta = reuse[0] - uniform[0];
    const gain = (delta >= 0 ? "+" : "") + delta.toFixed(1) + " pp";
    const scope = task.value === "all-tasks" ? "across four tasks" : "on " + task.value;

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
