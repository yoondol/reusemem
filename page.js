// Newly supplied real videos join the same viewport-aware playback system.
let registerGalleryVideo = video => { video.muted = video.defaultMuted = true; video.loop = true; };

async function loadRealWorldMedia() {
  try {
    const response = await fetch('assets/real-world/clips.json', {cache:'no-store'});
    if (!response.ok) return;
    const clips = await response.json();
    for (const media of document.querySelectorAll('[data-real-slot]')) {
      const clip = clips[media.dataset.realSlot];
      if (!clip || typeof clip.src !== 'string' || !clip.src) continue;
      const poster = media.querySelector('img');
      const scenario = media.closest('[data-real-scenario]');
      const panel = scenario.querySelector('[data-real-context]');
      const evidence = scenario.querySelector('.real-evidence');
      const request = scenario.querySelector('.real-request-overlay');
      let displayedGoal = null;
      const buttons = [...scenario.querySelectorAll('[data-real-stage]')];
      const chapters = (Array.isArray(clip.chapters) ? clip.chapters : [])
        .filter(c => [0,1,2,3].includes(c.goal) && Number.isFinite(c.start) && c.start >= 0)
        .sort((a,b) => a.start-b.start);
      const video = document.createElement('video');
      video.controls = true; video.playsInline = true; video.preload = 'metadata';
      video.poster = clip.poster || poster.src;
      video.setAttribute('aria-label', scenario.querySelector('h3').textContent + ', observation and continuous three-goal demonstration');
      if (clip.captions) {
        const track = document.createElement('track');
        track.kind = 'captions'; track.srclang = 'en'; track.label = 'English';
        track.src = clip.captions; video.append(track);
      }
      const update = () => {
        const active = chapters.filter(c => c.start <= video.currentTime).pop();
        if (!active) return;
        if (active.goal !== displayedGoal) {
          displayedGoal = active.goal;
          for (const button of buttons) {
            const current = Number(button.dataset.realStage) === active.goal;
            button.classList.toggle('is-current', current);
            if (current) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
          }
          panel.querySelector('span').textContent = active.label;
          panel.querySelector('p').textContent = active.text;
          request.querySelector('span').textContent = active.label + ' instruction';
          request.querySelector('strong').textContent = active.text;
          evidence.querySelector('img').src = active.evidence;
          evidence.querySelector('img').alt = active.evidenceTitle;
          evidence.querySelector('h4').textContent = active.evidenceTitle;
          evidence.querySelector('p').textContent = active.evidenceText;
        }
        request.hidden = active.goal === 0 || video.currentTime >= active.start + active.hold;
        const next = chapters.find(c => c.start > active.start);
        const end = next ? next.start : video.duration;
        const progress = Number.isFinite(end) && end > active.start ? (video.currentTime-active.start)/(end-active.start) : 0;
        panel.querySelector('i').style.width = `${Math.max(0,Math.min(1,progress))*100}%`;
      };
      for (const button of buttons) {
        const chapter = chapters.find(c => c.goal === Number(button.dataset.realStage));
        if (!chapter) continue;
        button.disabled = false;
        button.setAttribute('aria-label', `Play ${chapter.label}: ${chapter.text}`);
        button.addEventListener('click', () => {
          video.currentTime = chapter.start;
          video.play().catch(()=>{});
          update();
        });
      }
      video.addEventListener('loadedmetadata', update);
      video.addEventListener('timeupdate', update);
      video.addEventListener('seeked', update);
      video.addEventListener('error', () => {
        video.replaceWith(poster);
        request.hidden = true;
        for (const b of buttons) {b.disabled=true;b.classList.remove('is-current');b.removeAttribute('aria-current');}
      }, {once:true});
      video.src = clip.src;
      poster.replaceWith(video); registerGalleryVideo(video); update();
    }
  } catch { /* Keep the supplied camera still if a video cannot be loaded. */ }
}
loadRealWorldMedia();

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
const galleryVideos = document.querySelectorAll("#real-world video, #simulation video");

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
  registerGalleryVideo = video => {
    video.muted = video.defaultMuted = true;
    video.loop = true;
    observer.observe(video);
  };
  for (const video of galleryVideos) registerGalleryVideo(video);
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
    const gain = (delta >= 0 ? "+" : "") + delta.toFixed(1) + "%p";
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
    document.querySelector('#physical-definition').textContent=(metric==='sequence' ? 'All three requests succeed in one continuous execution.' : 'All three independent requests succeed from the same recording.')+' 20 test recordings per scenario.';
    document.querySelector('#physical-update').textContent='Both real-world plots show '+(metric==='sequence'?'Sequence':'All-goal')+' success.';
  });
}
