const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const videoStates = new Map();

// Start muted when a player enters view. A viewer's manual pause stays in effect.
function updatePlayback(video) {
  const state = videoStates.get(video);
  if (state.visible && !state.manuallyPaused && !motionPreference.matches) {
    if (!video.ended) video.play().catch(() => {});
  } else if (!video.paused && !video.seeking) {
    state.sitePaused = true;
    video.pause();
  }
}

const videoObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  for (const entry of entries) {
    videoStates.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    updatePlayback(entry.target);
  }
}, {threshold: 0.25}) : null;

for (const video of document.querySelectorAll("video[controls]")) {
  const state = {visible: !videoObserver, manuallyPaused: false, sitePaused: false};
  videoStates.set(video, state);
  video.muted = true;
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

const demoData = JSON.parse(document.querySelector("#demo-data").textContent);
for (const panel of document.querySelectorAll("[data-demo]")) {
  const stages = demoData[panel.dataset.demo];
  const video = panel.querySelector("video");
  const context = panel.querySelector("[data-demo-context]");
  const image = context.querySelector("[data-demo-image]");
  const marker = context.querySelector("[data-demo-marker]");
  const phase = panel.querySelector("[data-demo-phase]");
  let currentStage;
  function showStage() {
    const stage = stages.findLast(item => item.start <= video.currentTime);
    if (stage === currentStage) return;
    currentStage = stage;
    const isObservation = stage.start === 0;
    phase.textContent = stage.label;
    phase.classList.toggle("is-request", !isObservation);
    context.dataset.observing = String(isObservation);
    context.querySelector("[data-demo-cue-label]").textContent = isObservation ? "Recording" : "Earlier clue";
    context.querySelector("[data-demo-cue]").textContent = stage.idea;
    context.querySelector("[data-demo-request-label]").textContent = isObservation ? "Observation" : "Current request";
    context.querySelector("[data-demo-request]").textContent = stage.request;
    image.src = stage.image;
    marker.hidden = !stage.point;
    if (stage.point) {
      const [x, y] = stage.point;
      marker.style.setProperty("--marker-x", `${x}%`);
      marker.style.setProperty("--marker-y", `${y}%`);
    }
  }
  for (const eventName of ["loadedmetadata", "timeupdate", "seeking", "seeked"]) {
    video.addEventListener(eventName, showStage);
  }
  showStage();
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

const recall = document.querySelector("[data-recall-demo]");
if (recall) {
  const choices = [...recall.querySelectorAll("[data-recall-choice]")];
  const action = recall.querySelector("[data-recall-action]");
  const present = recall.querySelector("[data-recall-present]");
  const past = recall.querySelector("[data-recall-past]");
  const sequence = recall.querySelector(".recall-sequence");
  const examples = {
    select: {
      cue: "Which case?",
      pastImage: "case-evidence-1.jpg?v=overview-14",
      pastAlt: "The USB drive is visible in the black case.",
      presentTitle: "Closed on the desk",
      presentAlt: "The closed black case sits on the desk.",
      actionTitle: "Place it in the left tray",
      takeaway: "The earlier view identifies the case. The current view tells the robot where to pick it up."
    },
    return: {
      cue: "Where did it start?",
      pastImage: "case-evidence-3.jpg",
      pastAlt: "The earlier view marks the USB case’s original spot on the desk.",
      presentTitle: "Now in the left tray",
      presentAlt: "The black case now sits in the left tray.",
      actionTitle: "Put it back on the desk",
      takeaway: "The current view tells the robot where to grasp. The earlier view tells it where to put the case back."
    }
  };
  for (const choice of choices) {
    choice.addEventListener("click", () => {
      if (choice.getAttribute("aria-pressed") === "true") return;
      const key = choice.dataset.recallChoice;
      const example = examples[key];
      for (const button of choices) button.setAttribute("aria-pressed", String(button === choice));
      recall.querySelector("[data-recall-cue]").textContent = example.cue;
      recall.querySelector("[data-recall-present-title]").textContent = example.presentTitle;
      recall.querySelector("[data-recall-action-title]").textContent = example.actionTitle;
      recall.querySelector("[data-recall-takeaway]").textContent = example.takeaway;
      past.src = `assets/real-world/${example.pastImage}`;
      past.alt = example.pastAlt;
      present.src = `assets/method/case-${key}-present.jpg`;
      present.alt = example.presentAlt;
      action.poster = `assets/method/case-${key}-action.jpg`;
      action.src = `assets/method/case-${key}-action.mp4`;
      action.setAttribute("aria-label", example.actionTitle);
      sequence.dataset.choice = key;
      action.play().catch(() => {});
    });
  }
}
