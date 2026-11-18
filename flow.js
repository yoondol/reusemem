/* Explanatory information flow; native clips show a continuous scripted sequence. */
(() => {
  const root = document.getElementById('memory-flow');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const history = Array.from({length:6}, (_,i) => `assets/flow-button/history-${i}.jpg`);
  const execution = Array.from({length:7}, (_,i) => `assets/flow-button/execution-${i}.jpg`);
  const references = [0,0,1,2,2,3];
  const protoXY = [[569,176],[722,176],[569,264],[722,264]];
  const entries = Array.from(root.querySelectorAll('[data-entry]'));
  const prototypes = Array.from(root.querySelectorAll('[data-prototype]'));
  const chapters = root.querySelectorAll('[data-flow-chapter]');
  const viewport = root.querySelector('.flow-viewport');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const video = $('flow-sequence-video');
  video.muted = video.defaultMuted = true;
  const T = {goal1:12800, act1:17400, update:25400, goal2:29400, act2:34000, update2:41000, complete:43800, end:46600};
  const jumpTimes = {record:0,goal1:T.goal1,update:T.update,goal2:T.goal2,similar:3600};
  const recordCues = ['Cube before button press.','Nearly unchanged view.','Button pressed.','Cube after button press.','Another similar view.','Cube moves again.'];
  const flights = ['flow-frame-flight','flow-entry-flight','flow-evidence-flight','flow-feedback-flight','flow-query-pulse','flow-key-pulse','flow-past-pulse','flow-current-pulse','flow-recent-pulse','flow-action-pulse'].map($);
  let time = reduced.matches ? T.goal2 + 3600 : 0;
  let playing = !reduced.matches, visible = false, previous = 0;
  let previousStory = '', previousPan = '', lastSync = -1000;
  const clamp = n => Math.max(0,Math.min(1,n));
  const smooth = n => { n=clamp(n);return n*n*(3-2*n); };
  function attribute(node,name,value) { if(node.getAttribute(name)!==String(value)) node.setAttribute(name,value); }
  function text(id,value) { const node=$(id);if(node.textContent!==value)node.textContent=value; }
  function image(id,src) { attribute($(id),'href',src); }
  function alpha(id,v) { attribute($(id),'opacity',v); }
  function at(node,x,y,opacity=1) { attribute(node,'transform',`translate(${x.toFixed(2)} ${y.toFixed(2)})`);attribute(node,'opacity',opacity); }
  function travel(id,points,p) {
    p=clamp(p)*(points.length-1);
    const i=Math.min(points.length-2,Math.floor(p));const q=smooth(p-i);
    at($(id),points[i][0]+(points[i+1][0]-points[i][0])*q,points[i][1]+(points[i+1][1]-points[i][1])*q);
  }
  function story(phase,title,copy) {
    // Keep the explanation readable while the visual substeps move quickly.
    if(time<T.goal1){
      phase='Record';title='Record before the goals are known.';
      copy='Similar appearances share visual features. Every observation keeps its own time and retrieval key.';
    }else if(['Goal','Retrieve','Fuse','Act'].includes(phase)){
      if(time<T.goal2){
        title='Goal 1: retrieve the last pre-press location and act.';
        copy='Retrieval keys locate the placement and button event. The policy combines this evidence with current observations.';
      }else{
        title='Goal 2: a new destination, without a scene reset.';
        copy='The same recorded memory supplies the first post-press location. Current and recent observations reflect the first action.';
      }
    }
    const key=phase+title+copy;if(key===previousStory)return;previousStory=key;
    text('flow-phase-label',phase);text('flow-story-title',title);text('flow-story-copy',copy);
  }
  function controls() {
    root.dataset.playing=String(playing&&visible);
    text('flow-play',playing?'Pause':'Play');$('flow-play').setAttribute('aria-pressed',String(playing));
    if(!playing||!visible)video.pause();
  }
  function panTo(stage) {
    if(stage===previousPan)return;previousPan=stage;
    if(viewport.clientWidth>=viewport.scrollWidth||reduced.matches)return;
    const x={observe:0,similar:150,bank:315,query:680,retrieve:500,fuse:470,action:680,update:400,complete:430};
    viewport.scrollTo({left:x[stage]||0,behavior:'smooth'});
  }
  function syncVideo() {
    const shown=time>=T.act1;
    $('flow-outcome').hidden=!shown;
    if(!shown){video.pause();if(video.readyState>=1&&video.currentTime>0.05)video.currentTime=0;return;}
    let target=10.75,rate=10.75/8,moving=false;
    if(time<T.update){target=clamp((time-T.act1)/8000)*10.75;moving=true;}
    else if(time>=T.act2&&time<T.update2){target=10.75+clamp((time-T.act2)/7000)*9.1;rate=9.1/7;moving=true;}
    else if(time>=T.update2)target=19.8;
    if(video.playbackRate!==rate)video.playbackRate=rate;
    if(video.readyState>=1&&(!moving||Math.abs(time-lastSync)>350)){
      const tolerance=moving?0.35:0.035;
      if(Math.abs(video.currentTime-target)>tolerance)video.currentTime=target;
      lastSync=time;
    }
    if(moving&&playing&&visible&&!document.hidden){if(video.paused)video.play().catch(()=>{});}
    else video.pause();
  }
  function render() {
    const recording=time<T.goal1;
    const goal=time<T.goal2?0:1;
    const update1=time>=T.update&&time<T.goal2;
    const update2=time>=T.update2&&time<T.complete;
    const completed=time>=T.complete;
    const elapsed=recording?0:time-(goal===0?T.goal1:T.goal2);
    let phase=recording?'record':completed?'complete':update1||update2?'update':elapsed<1200?'query':elapsed<3400?'retrieve':elapsed<4600?'fuse':'action';
    const chapter=recording?'record':update1?'update':goal===0?'goal1':'goal2';
    for(const b of chapters)attribute(b,'aria-pressed',b.dataset.flowChapter===chapter);
    root.dataset.goal=recording?'none':String(goal+1);
    text('flow-mobile-status',recording?'Future goals unknown. Swipe to follow the flow.':'Goal 1 → new observations → Goal 2. No reset.');
    flights.forEach(n=>attribute(n,'opacity',0));alpha('flow-encoding',0);
    root.querySelector('.writer-module text').setAttribute('opacity','1');
    let appearanceCount=4,entryCount=6,admitting=-1;
    const selectedEntries=goal===0?[1,2]:[2,4];
    const selectedPrototypes=goal===0?[0,1]:[1,2];
    let pan=phase;
    if(recording){
      const frame=Math.min(5,Math.floor(Math.max(0,time-800)/2000));
      const p=time<800?0:((time-800)%2000)/2000;
      const prototype=references[frame],shared=frame===1||frame===4;
      const committed=frame+(p>=0.83?1:0);
      appearanceCount=new Set(references.slice(0,committed)).size;
      entryCount=frame+(p>=0.98?1:0);
      image('flow-observation',history[frame]);image('flow-frame-flight-image',history[frame]);
      text('flow-observation-cue',recordCues[frame]);
      text('flow-admission',p<0.4?'Encode the view':p<0.6?'Compare appearances':shared?'Reuse an appearance':'Store a new appearance');
      if(time>=800&&p<0.28){travel('flow-frame-flight',[[70,205],[260,213]],p/0.28);pan='observe';}
      else if(p<0.4&&time>=800){alpha('flow-encoding',1);root.querySelector('.writer-module text').setAttribute('opacity','0.12');pan='similar';}
      else if(p<0.6&&time>=800){phase='compare';travel('flow-frame-flight',[[305,213],[385,205]],(p-0.4)/0.2);pan='similar';}
      else if(p<0.83&&time>=800){
        phase=shared?'share':'append';admitting=prototype;
        const [x,y]=protoXY[prototype];
        const route=shared?[[388,212],[425,312],[530,312],[x,y]]:[[388,212],[426,135],[x,135],[x,y]];
        travel('flow-frame-flight',route,(p-0.6)/0.23);pan='bank';
      } else if(p>=0.83){
        phase='entry';admitting=prototype;text('flow-entry-time',`t${frame+1}`);
        travel('flow-entry-flight',[[protoXY[prototype][0]+47,protoXY[prototype][1]+30],[568+frame*49,366]],(p-0.83)/0.15);pan='bank';
      } else pan='observe';
      if(time<800)story('Observe','Future goals are not known yet.','The robot records the experience before it receives either request.');
      else if(phase==='compare')story('Compare','Does this view match a stored appearance?','The Writer checks visual similarity before deciding whether another appearance is needed.');
      else if(phase==='share')story('Share','A similar view reuses existing visual features.','The appearance is stored once. This observation still gets its own temporal entry and retrieval key.');
      else if(phase==='entry')story('Index','Keep when it happened, even when it looks similar.','Every observation adds a time-indexed entry with an appearance reference and its own retrieval key.');
      else story('Record','Record useful experience before knowing its use.','New appearances enter the pool; similar views share stored features without removing time information.');
    } else {
      image('flow-observation',history[5]);text('flow-observation-cue','Experience recorded.');text('flow-admission','Shared visual features');
      if(phase==='query'){
        travel('flow-query-pulse',[[1080,126],[1080,184]],elapsed/1200);
        story('Goal',goal===0?'The first goal is revealed.':'Goal 2 begins from the state left by Goal 1.',goal===0?'Return to the last location before the button press. The answer lies in the recorded experience.':'The cube has already moved. Reuse the original experience together with the updated scene and recent observations.');
      }else if(phase==='retrieve'){
        const p=(elapsed-1200)/2200;const which=Math.min(1,Math.floor(p*2));const entry=selectedEntries[which];const source=goal===0?[1,2][which]:[2,4][which];
        const proto=references[entry];image('flow-evidence-flight-image',history[source]);
        travel('flow-key-pulse',[[589+entry*49,391],[942,391],[942,230],[1010,230]],clamp(p*2));
        travel('flow-evidence-flight',[[protoXY[proto][0],protoXY[proto][1]],[1032,214],[978+which*113,321]],(p*2)%1);
        story('Retrieve','Use the goal to read the right moments.','Retrieval keys locate the button event and the relevant placement. The Reader gathers their visual evidence.');
      }else if(phase==='fuse'){
        const p=(elapsed-3400)/1200;
        travel('flow-past-pulse',[[1080,403],[1080,464],[849,464],[849,507]],p);
        travel('flow-current-pulse',[[728,550],[808,550]],p);
        if(goal===1)travel('flow-recent-pulse',[[812,665],[812,620],[849,620],[849,597]],p);
        story('Fuse','Past evidence, current view and recent execution meet.',goal===0?'The remembered placement specifies the destination. The current scene specifies the next motion.':'The destination comes from the original experience. The cube’s new position and recent actions guide the next motion.');
      }else if(phase==='action'){
        travel('flow-action-pulse',[[924,550],[970,550],[1110,550],[1160,550]],((elapsed-4600)%1300)/1300);
        story('Act',goal===0?'Goal 1 moves the cube to the pre-press location.':'Goal 2 moves it again, without a reset.',goal===0?'New camera views arrive as the robot acts. They are recorded into recent execution context.':'The same experience supports a different destination from the updated state. The sequence continues in one scene.');
      }else if(phase==='update'){
        story('Update',update1?'Goal 1 changed the scene. Keep the new observations.':'Keep the observations from the second action.', 'New views enter recent execution context. The original experience memory remains available for later goals.');
      }else if(phase==='complete'){
        story('Sequence','Two goals completed in one continuous scene.','The experience memory supplied both destinations, while current and recent observations tracked the changing scene.');
      }
    }
    root.dataset.phase=phase;panTo(pan);
    prototypes.forEach((node,i)=>{
      attribute(node,'opacity',i<appearanceCount?'1':'0.14');
      node.classList.toggle('is-selected',!recording&&selectedPrototypes.includes(i)&&elapsed>=1200);
      node.classList.toggle('is-admitting',admitting===i);
    });
    entries.forEach((node,i)=>{
      attribute(node,'opacity',i<entryCount?'1':'0.14');
      node.classList.toggle('is-selected',!recording&&selectedEntries.includes(i)&&elapsed>=1200);
    });
    text('flow-appearance-count',`${appearanceCount} ${appearanceCount===1?'appearance':'appearances'}`);
    alpha('flow-bank-retained',recording?0:1);
    alpha('flow-evidence',!recording&&elapsed>=1600?1:0.12);
    const evidence=goal===0?[0,2]:[2,3];
    evidence.forEach((index,i)=>image(`flow-evidence-image-${i}`,history[index]));
    text('flow-evidence-label-0',goal===0?'Before press':'Button event');text('flow-evidence-label-1',goal===0?'Button event':'After press');
    text('flow-experience-label',recording?'RECORD FIRST — GOALS NOT REVEALED':'ONE EXPERIENCE — REUSED THROUGH THE SEQUENCE');
    text('flow-experience-line',recording?'The robot observes before it knows what will be requested.':'The same original memory stays available as the scene changes.');
    text('flow-goal-label',recording?'NO REQUEST YET':goal===0?'GOAL 1':'GOAL 2 — NO RESET');
    text('flow-request-line-1',recording?'Future goals unknown':goal===0?'Return to the last location':'Return to the first location');
    text('flow-request-line-2',recording?'Record without a task instruction.':goal===0?'before the button press.':'after the button press.');
    $('flow-request-bg').setAttribute('fill',recording?'#eef1f7':'#edf2fd');
    text('flow-action-wait',recording?'Waiting for a goal':'Preparing an action');
    // Current snapshots and recent views advance with the native continuous video.
    let native=0;
    if(time>=T.act1&&time<T.update)native=clamp((time-T.act1)/8000)*10.75;
    else if(time>=T.update&&time<T.act2)native=10.75;
    else if(time>=T.act2&&time<T.update2)native=10.75+clamp((time-T.act2)/7000)*9.1;
    else if(time>=T.update2)native=19.85;
    const thresholds=[0,3,6,10.75,14,17,19.8];let current=0;
    thresholds.forEach((t,i)=>{if(native>=t)current=i;});
    image('flow-current-image',execution[current]);
    text('flow-current-label',time<T.act1?'Scene after observation':time<T.update?'Scene during Goal 1':time<T.act2?'Scene after Goal 1':time<T.update2?'Scene during Goal 2':'Scene after Goal 2');
    let recent=[1,2,3];
    if(native>=14)recent=[2,3,4];if(native>=17)recent=[3,4,5];if(native>=19.8)recent=[4,5,6];
    recent.forEach((index,i)=>{
      image(`flow-recent-image-${i}`,execution[index]);
      const node=$(`flow-recent-image-${i}`).parentElement;
      attribute(node,'opacity',native>=thresholds[index]?'1':'0.12');
    });
    if(time>=T.act1){
      let feedback=-1,p=0;
      if(update1){p=((time-T.update)%1250)/1250;feedback=Math.min(3,1+Math.floor((time-T.update)/1250));}
      else if(update2){p=((time-T.update2)%900)/900;feedback=Math.min(6,4+Math.floor((time-T.update2)/900));}
      else if(phase==='action'&&native>=2){
        const actStart=goal===0?T.act1:T.act2;
        p=((time-actStart)%1600)/1600;feedback=current||1;
      }
      if(feedback>=0){
        image('flow-feedback-image',execution[feedback]);
        const destination=566+Math.min(2,Math.max(0,recent.indexOf(feedback)))*101;
        travel('flow-feedback-flight',[[1190,554],[1230,650],[1010,673],[destination,698]],p);
      }
    }
    syncVideo();
  }
  function jump(which){time=jumpTimes[which];playing=true;previous=0;lastSync=-1000;controls();render();}
  for(const b of chapters)b.addEventListener('click',()=>jump(b.dataset.flowChapter));
  $('flow-similar').addEventListener('click',()=>jump('similar'));
  $('flow-similar').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();jump('similar');}});
  $('flow-restart').addEventListener('click',()=>jump('record'));
  $('flow-play').addEventListener('click',()=>{playing=!playing;previous=0;controls();render();});
  reduced.addEventListener('change',e=>{playing=!e.matches;previous=0;controls();render();});
  if('IntersectionObserver' in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;previous=0;controls();},{threshold:0.16}).observe(root);else visible=true;
  function tick(now){
    if(playing&&visible&&!document.hidden){
      if(previous)time+=Math.min(100,now-previous);
      if(time>=T.end){time=0;lastSync=-1000;}
      render();
    }
    previous=now;requestAnimationFrame(tick);
  }
  controls();render();requestAnimationFrame(tick);
})();
