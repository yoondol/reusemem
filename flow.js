/* Animated explanation of data movement, not a learned-policy trace. */
(() => {
  const root = document.querySelector('#memory-flow');
  if (!root) return;
  const get = id => document.getElementById(id);
  const frames = Array.from({length: 6}, (_, i) => `assets/flow/frame-${i + 1}.jpg`);
  const slots = Array.from(root.querySelectorAll('[data-slot]'));
  const chapters = root.querySelectorAll('[data-flow-chapter]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [get('flow-blue-outcome'), get('flow-red-outcome')];
  const flight = get('flow-frame-flight');
  const evidenceFlight = get('flow-evidence-flight');
  const observationCues = ['The cubes are visible.', 'Remember their identities.', 'The covers descend.', 'The covers move.', 'Track the hidden cubes.', 'The swap is complete.'];
  const chapterTimes = {record: 0, blue: 8400, red: 20000};
  let time = reduced.matches ? 15000 : 0;
  let playing = !reduced.matches;
  let visible = false;
  let previous = 0;
  let lastVideoSync = 0;
  let lastVideo = -1;
  let lastPhase = '';
  let lastFrame = -1;
  let lastEvidence = -1;
  let lastChapter = '';
  let lastPan = '';
  const viewport = root.querySelector('.flow-viewport');

  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const lerp = (a, b, p) => a + (b - a) * p;
  function position(node, x, y, opacity = 1) {
    node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    node.setAttribute('opacity', opacity.toFixed(3));
  }
  function along(node, points, progress) {
    const p = clamp(progress) * (points.length - 1);
    const i = Math.min(points.length - 2, Math.floor(p));
    const v = ease(p - i);
    position(node, lerp(points[i][0], points[i + 1][0], v), lerp(points[i][1], points[i + 1][1], v));
  }
  function setStory(phase, title, copy) {
    const key = phase + title;
    if (lastPhase === key) return;
    lastPhase = key;
    get('flow-phase-label').textContent = phase;
    get('flow-story-title').textContent = title;
    get('flow-story-copy').textContent = copy;
  }
  function setChapter(chapter) {
    if (lastChapter === chapter) return;
    lastChapter = chapter;
    for (const button of chapters) button.setAttribute('aria-pressed', String(button.dataset.flowChapter === chapter));
  }
  function updateControls() {
    root.dataset.playing = String(playing && visible);
    get('flow-play').textContent = playing ? 'Pause' : 'Play';
    get('flow-play').setAttribute('aria-pressed', String(playing));
    if (!playing || !visible) for (const video of videos) video.pause();
  }
  function syncVideo(index, seconds) {
    const active = index >= 0;
    get('flow-outcome').hidden = !active;
    if (lastVideo !== index) {
      videos.forEach((video, i) => { video.pause(); video.hidden = i !== index; });
      if (active) {
        const video = videos[index];
        video.currentTime = 0;
        video.playbackRate = 1.65;
      }
      lastVideo = index;
      lastVideoSync = 0;
    }
    if (!active) return;
    const video = videos[index];
    const limit = Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.04) : seconds * 1.65;
    const target = Math.min(seconds * 1.65, limit);
    if (Math.abs(time - lastVideoSync) > 450 && video.readyState >= 2) {
      if (Math.abs(video.currentTime - target) > 0.55) video.currentTime = target;
      lastVideoSync = time;
    }
    if (playing && visible && target < limit - 0.05) {
      if (video.paused) video.play().catch(() => {});
    } else video.pause();
  }
  function render() {
    const recording = time < 8400;
    const goal = time < 20000 ? 0 : 1;
    const elapsed = recording ? 0 : time - (goal === 0 ? 8400 : 20000);
    const chapter = recording ? 'record' : goal === 0 ? 'blue' : 'red';
    setChapter(chapter);
    root.dataset.goal = goal === 0 ? 'blue' : 'red';
    const phase = recording ? 'record' : elapsed < 1200 ? 'query' : elapsed < 3200 ? 'retrieve' : elapsed < 4400 ? 'fuse' : 'action';
    root.dataset.phase = phase;
    const pan = recording ? (time < 3500 ? 'observe' : 'bank') : phase;
    if (pan !== lastPan && viewport.clientWidth < viewport.scrollWidth && !reduced.matches) {
      const positions = {observe: 0, bank: 170, query: 470, retrieve: 380, fuse: 300, action: 470};
      viewport.scrollTo({left: positions[pan] || 0, behavior: 'smooth'});
    }
    lastPan = pan;
    [flight, evidenceFlight, get('flow-query-pulse'), get('flow-past-pulse'), get('flow-current-pulse'), get('flow-action-pulse')].forEach(n => n.setAttribute('opacity','0'));
    get('flow-encoding').setAttribute('opacity','0');
    root.querySelector('.writer-module text').setAttribute('opacity','1');
    const selected = goal === 0 ? [0, 3, 5] : [0, 4, 5];
    let filled = 6;
    if (recording) {
      const frame = Math.min(5, Math.floor(time / 1400));
      const p = (time % 1400) / 1400;
      filled = frame + (p > 0.88 ? 1 : 0);
      if (lastFrame !== frame) {
        get('flow-observation').setAttribute('href',frames[frame]);
        flight.querySelector('image').setAttribute('href',frames[frame]);
        get('flow-observation-cue').textContent = observationCues[frame];
        lastFrame = frame;
      }
      const x = 446 + frame % 3 * 100;
      const y = 151 + Math.floor(frame / 3) * 88;
      if (p < 0.36) along(flight, [[80,180],[270,185]], p / 0.36);
      else if (p < 0.53) {
        get('flow-encoding').setAttribute('opacity','1');
        root.querySelector('.writer-module text').setAttribute('opacity','0.1');
      } else if (p < 0.92) along(flight, [[310,185],[x,y]], (p - 0.53) / 0.39);
      setStory('Record', 'Experience arrives before a request.', 'Frames enter the Writer. Their visual features are stored with their place in the timeline.');
    } else {
      if (lastFrame !== 6) {
        get('flow-observation').setAttribute('href',frames[5]);
        get('flow-observation-cue').textContent = 'Observation history recorded.';
        lastFrame = 6;
      }
    }
    get('flow-bank-count').textContent = `${filled} / 6`;
    slots.forEach((slot,i) => {
      slot.setAttribute('opacity', i < filled ? '1' : '0.16');
      slot.classList.toggle('is-selected', !recording && elapsed >= 1200 && selected.includes(i));
    });
    get('flow-bank-retained').setAttribute('opacity',recording ? '0' : '1');
    get('flow-request').setAttribute('opacity',recording ? '0.28' : '1');
    get('flow-goal-overline').textContent = recording ? 'NO REQUEST YET' : goal === 0 ? 'LATER REQUEST 1' : 'LATER REQUEST 2';
    get('flow-request-text').textContent = recording ? 'Future goal unknown' : goal === 0 ? 'Uncover the blue cube.' : 'Uncover the red cube.';
    get('flow-goal-dot').setAttribute('fill',goal === 0 ? '#3867ce' : '#b67454');
    get('flow-evidence').setAttribute('opacity',!recording && elapsed >= 1800 ? '1' : '0.12');
    if (!recording) {
      if (phase === 'query') {
        along(get('flow-query-pulse'), [[930,127],[930,165]], elapsed / 1200);
        setStory('Request',goal === 0 ? 'A goal arrives after recording.' : 'A different goal reuses the same memory.',goal === 0 ? 'The cubes are hidden now. The request asks for the blue cube.' : 'The bank stays intact. Now the request asks for the red cube.');
      } else if (phase === 'retrieve') {
        const p = (elapsed - 1200) / 2000;
        const card = Math.min(2,Math.floor(p * 3));
        const source = selected[card];
        const local = p * 3 - card;
        if (lastEvidence !== source) {
          evidenceFlight.querySelector('image').setAttribute('href',frames[source]);
          selected.forEach((index, i) => get(`flow-evidence-image-${i}`).setAttribute('href',frames[index]));
          lastEvidence = source;
        }
        along(evidenceFlight, [[446 + source % 3 * 100,151 + Math.floor(source / 3) * 88],[885,188],[831 + card * 74,306]],local);
        setStory('Retrieve','The request selects the evidence.','The Reader connects the object’s earlier identity with the cover movements that followed.');
      } else if (phase === 'fuse') {
        const p = (elapsed - 3200) / 1200;
        along(get('flow-past-pulse'), [[930,383],[930,419],[739,419],[739,477]],p);
        along(get('flow-current-pulse'), [[604,510],[706,510]],p);
        setStory('Fuse','Past evidence meets the current scene.','The memory identifies the target. The current view tells the policy how to act now.');
      } else {
        const p = ((elapsed - 4400) % 1300) / 1300;
        along(get('flow-action-pulse'), [[810,510],[861,510],[1007,510],[1052,510]],p);
        setStory('Act',goal === 0 ? 'Use the memory to uncover the blue cube.' : 'The same memory supports the red-cube request.', 'The action policy turns retrieved evidence and the present scene into a new manipulation.');
      }
    }
    syncVideo(!recording && phase === 'action' ? goal : -1, (elapsed - 4400) / 1000);
  }
  function jump(chapter) {
    time = chapterTimes[chapter];
    lastFrame = -1;
    lastEvidence = -1;
    lastVideo = -2;
    playing = true;
    previous = 0;
    updateControls();
    render();
  }
  for (const button of chapters) button.addEventListener('click', () => jump(button.dataset.flowChapter));
  get('flow-restart').addEventListener('click', () => jump('record'));
  get('flow-play').addEventListener('click', () => { playing = !playing; previous = 0; updateControls(); render(); });
  reduced.addEventListener('change', event => { playing = !event.matches; previous = 0; updateControls(); render(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; previous = 0; updateControls(); }, {threshold: 0.18}).observe(root);
  } else visible = true;
  function tick(now) {
    if (playing && visible && !document.hidden) {
      if (previous) time += Math.min(100, now - previous);
      if (time >= 32200) { time = 0; lastFrame = -1; lastEvidence = -1; }
      render();
    }
    previous = now;
    requestAnimationFrame(tick);
  }
  updateControls();
  render();
  requestAnimationFrame(tick);
})();
