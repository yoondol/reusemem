const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const videoStates = new Map();
const VISIBLE_SHARE = 0.35;

// Every player with native controls plays muted and inline while it is in view
// and pauses off screen. A viewer's own pause holds until they press play again.
// Players inside a hidden simulation tab never run.
function updatePlayback(video) {
  const state = videoStates.get(video);
  const wanted = state.visible && !video.closest("[hidden]") && !state.manuallyPaused && !motionPreference.matches;
  if (wanted) {
    if (video.paused && !video.ended) video.play().catch(() => {});
  } else if (!video.paused) {
    state.sitePaused = true;
    video.pause();
  }
}

function measureVisibility(video) {
  const box = video.getBoundingClientRect();
  const shown = Math.min(box.bottom, innerHeight) - Math.max(box.top, 0);
  videoStates.get(video).visible = box.height > 0 && shown >= box.height * VISIBLE_SHARE;
  updatePlayback(video);
}

const videoObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    videoStates.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= VISIBLE_SHARE;
    updatePlayback(entry.target);
  }
}, {threshold: [0, VISIBLE_SHARE]}) : null;

for (const video of document.querySelectorAll("video[controls]")) {
  const state = {visible: !videoObserver, manuallyPaused: false, sitePaused: false};
  videoStates.set(video, state);
  video.muted = true;
  video.playsInline = true;
  video.addEventListener("pause", () => {
    if (!state.sitePaused && !video.ended && !video.seeking) state.manuallyPaused = true;
    state.sitePaused = false;
  });
  video.addEventListener("play", () => { state.manuallyPaused = false; });
  if (videoObserver) videoObserver.observe(video);
  else updatePlayback(video);
}
motionPreference.addEventListener("change", () => {
  for (const video of videoStates.keys()) updatePlayback(video);
});

// Request cards. Each player lists its requests in data-requests as
// {at, until, label, text} in media seconds. From `at` to `until` the card shows
// the full instruction over the held first frame of the request; afterwards a
// small tag keeps the goal label (and, on wide players, the request) in the
// corner while the footage plays. The card follows currentTime only, so native
// seeking, looping, pausing and replaying always show the right request, and
// it never intercepts pointer input meant for the native controls.
const AVATAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8.3" r="4.1"/><path d="M4.2 21c.7-4.4 3.9-7 7.8-7s7.1 2.6 7.8 7z"/></svg>';

for (const media of document.querySelectorAll(".clip-media[data-requests]")) {
  const video = media.querySelector("video");
  const cues = JSON.parse(media.dataset.requests).sort((a, b) => a.at - b.at);
  const overlay = document.createElement("div");
  overlay.className = "request";
  overlay.dataset.state = "off";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML =
    `<div class="request-card"><span class="request-avatar">${AVATAR}</span>` +
    `<p class="request-bubble"><b class="request-label"></b><span class="request-text"></span></p></div>` +
    `<div class="request-tag"><span class="request-avatar">${AVATAR}</span>` +
    `<b class="request-label"></b><span class="request-text"></span></div>`;
  media.append(overlay);
  const labels = overlay.querySelectorAll(".request-label");
  const texts = overlay.querySelectorAll(".request-text");
  let current = null;

  function update() {
    const time = video.currentTime;
    let cue = null;
    for (const item of cues) if (time + 0.03 >= item.at) cue = item;
    if (cue !== current) {
      current = cue;
      if (cue) {
        labels.forEach(node => { node.textContent = cue.label; });
        texts.forEach(node => { node.textContent = cue.text; });
      }
    }
    const state = !cue ? "off" : time < cue.until ? "card" : "tag";
    if (overlay.dataset.state !== state) overlay.dataset.state = state;
  }

  for (const type of ["loadedmetadata", "timeupdate", "seeking", "seeked", "play", "pause", "emptied"]) {
    video.addEventListener(type, update);
  }
  if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
    const onFrame = () => { update(); video.requestVideoFrameCallback(onFrame); };
    video.requestVideoFrameCallback(onFrame);
  }
  update();
}

// Simulation task selection: only the selected task's four players are shown.
const taskTabs = [...document.querySelectorAll('#simulation [role="tab"]')];
const taskPanels = taskTabs.map(tab => document.getElementById(tab.getAttribute("aria-controls")));

function selectTask(index, {focus = false, writeHash = false} = {}) {
  taskTabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    taskPanels[i].hidden = !active;
  });
  taskPanels.forEach((panel, i) => {
    for (const video of panel.querySelectorAll("video")) {
      if (!videoStates.has(video)) continue;
      if (i === index) requestAnimationFrame(() => measureVisibility(video));
      else {
        videoStates.get(video).visible = false;
        updatePlayback(video);
      }
    }
  });
  if (focus) taskTabs[index].focus();
  if (writeHash) history.replaceState(null, "", `#${taskPanels[index].id}`);
}

taskTabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTask(i, {writeHash: true}));
  tab.addEventListener("keydown", event => {
    const next = {ArrowLeft: (i + taskTabs.length - 1) % taskTabs.length, ArrowRight: (i + 1) % taskTabs.length,
                  Home: 0, End: taskTabs.length - 1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTask(next, {focus: true, writeHash: true});
  });
});

function selectFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const index = taskPanels.findIndex(panel =>
    panel.id === id || panel.dataset.task === id || `${panel.dataset.task}-sequence` === id);
  if (index < 0) return;
  selectTask(index);
  requestAnimationFrame(() => taskPanels[index].scrollIntoView({block: "start"}));
}
selectFromHash();
window.addEventListener("hashchange", selectFromHash);

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
    const [, mme, , uniform, reuse] = values;
    const difference = (baseline) => {
      const points = reuse[0] - baseline[0];
      return (points >= 0 ? "+" : "−") + Math.abs(points).toFixed(1) + "%p";
    };
    const scope = task.value === "all-tasks" ? "across four tasks" : "on " + task.selectedOptions[0].textContent;

    rows.forEach((row, i) => {
      const [rate, count, total] = values[i];
      row.querySelector(".measure-track span").style.setProperty("--bar", rate + "%");
      row.querySelector(".measure-value strong").textContent = rate.toFixed(1) + "%";
      row.querySelector(".measure-value small").textContent = count + "/" + total;
    });
    document.querySelector("#gain-value").textContent = reuse[0].toFixed(1) + "%";
    document.querySelector("#gain-description").textContent = "ReuseMem " + name;
    document.querySelector("#gain-mme").textContent = difference(mme);
    document.querySelector("#gain-uniform").textContent = difference(uniform);
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

const physicalSource = document.querySelector('#physical-outcome-data');
if (physicalSource) {
  const values = JSON.parse(physicalSource.textContent);
  const buttons = [...document.querySelectorAll('[data-physical-metric]')];
  for (const button of buttons) button.addEventListener('click', () => {
    const metric=button.dataset.physicalMetric;
    for (const b of buttons) b.setAttribute('aria-pressed',String(b===button));
    for (const chart of document.querySelectorAll('[data-physical-chart]')) {
      const data=values[chart.dataset.physicalChart][metric];
      chart.querySelectorAll('.measure').forEach((row,i) => {
        const [rate,count,total]=data[i];
        row.querySelector('.measure-track span').style.setProperty('--bar',rate+'%');
        row.querySelector('.measure-value strong').textContent=rate.toFixed(1)+'%';
        row.querySelector('.measure-value small').textContent=count+'/'+total;
      });
    }
    document.querySelector('#physical-definition').textContent=(metric==='sequence' ? 'All three requests completed in one run.' : 'All three requests completed separately from the same recording.');
    document.querySelector('#physical-update').textContent='Both real-world plots show '+(metric==='sequence'?'Sequence':'All-goal')+' success.';
  });
}

// The case example under the overview shows both requests side by side (two real
// clips with native controls), so it needs no script beyond the shared autoplay
// above. Pointing at or focusing one request card emphasises its outline on the
// shared recording frame; this is CSS only (:has), so nothing breaks without it.
