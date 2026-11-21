/* One causal archive before and during execution; Recent is a separate input.
   RoboMME frames illustrate the method. */
(() => {
  const root=document.getElementById('memory-flow'); if(!root)return;
  const $=id=>document.getElementById(id);
  const history=Array.from({length:6},(_,i)=>`assets/flow-button/history-${i}.jpg`);
  const execution=Array.from({length:7},(_,i)=>`assets/flow-button/execution-${i}.jpg`);
  const archived=Array.from({length:4},(_,i)=>`assets/flow-button/archive-${i}.jpg`);
  const recentSources=Array.from({length:7},(_,i)=>i?`assets/flow-button/recent-${i}.jpg`:null);
  const references=[0,0,1,2,2,3,4,4,5,5];
  const protoXY=[[517,176],[641,176],[765,176],[517,264],[641,264],[765,264]];
  const entryXY=i=>[517+60*(i<6?i:i-6),i<6?366:417];
  const entries=Array.from(root.querySelectorAll('[data-entry]'));
  const prototypes=Array.from(root.querySelectorAll('[data-prototype]'));
  const chapters=root.querySelectorAll('[data-flow-chapter]');
  const viewport=root.querySelector('.flow-viewport'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const timeline=$('flow-timeline'),video=$('flow-sequence-video');video.muted=video.defaultMuted=true;
  const T={goal1:12800,act1:17800,stop1:25800,goal2:28600,act2:33600,stop2:40600,complete:43400,end:45900};
  const rate1=10.75/8,rate2=(19.8-10.75)/7;
  const starts=[T.act1+10.15/rate1*1000,0,T.act2+(19.35-10.75)/rate2*1000,0];
  starts[1]=Math.max(T.act1+10.55/rate1*1000,starts[0]+1500);
  starts[3]=Math.max(T.act2+(19.7-10.75)/rate2*1000,starts[2]+1500);
  const writes=starts.map((start,i)=>({start,end:start+1400,entry:6+i,prototype:4+Math.floor(i/2),shared:i%2===1,src:archived[i]}));
  const jumps={record:0,goal1:T.goal1,goal2:T.goal2,similar:3600};
  const cues=['Before press','Similar view','Button press','After press','Similar view','Later'];
  const flights=['flow-frame-flight','flow-entry-flight','flow-evidence-flight','flow-feedback-flight','flow-query-pulse','flow-key-pulse','flow-past-pulse','flow-current-pulse','flow-recent-pulse','flow-action-pulse'].map($);
  let time=reduced.matches?T.goal2+3900:0,playing=!reduced.matches,visible=false,previous=0;
  let previousStory='',previousPan='',lastSync=-1000,inspecting=false,forceVideoSync=false,scrubbing=false;
  timeline.max=String(T.end);
  root.style.setProperty('--goal-one',`${T.goal1/T.end*100}%`);
  root.style.setProperty('--goal-two',`${T.goal2/T.end*100}%`);
  root.style.setProperty('--timeline-columns',`${T.goal1}fr ${T.goal2-T.goal1}fr ${T.end-T.goal2}fr`);
  const formatTime=ms=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  function attr(n,k,v){if(n.getAttribute(k)!==String(v))n.setAttribute(k,v);}
  function text(id,v){const n=$(id);if(n.textContent!==v)n.textContent=v;}
  const image=(id,src)=>attr($(id),'href',src);
  const alpha=(id,v)=>attr($(id),'opacity',v);
  function travel(id,points,p){
    p=clamp(p)*(points.length-1);const i=Math.min(points.length-2,Math.floor(p)),q=smooth(p-i);
    attr($(id),'transform',`translate(${(points[i][0]+(points[i+1][0]-points[i][0])*q).toFixed(2)} ${(points[i][1]+(points[i+1][1]-points[i][1])*q).toFixed(2)})`);alpha(id,1);
  }
  function story(phase,goal,recording,complete,writing){
    let title,copy,label;
    if(recording){label='Observe';title='Observe before goals are known.';copy='Similar views share features. Time and keys remain distinct.';}
    else if(complete){label='Done';title='Sequence complete.';copy='New experience joins the same memory. No reset.';}
    else{label={query:'Goal',retrieve:'Read',fuse:'Fuse',action:writing?'Write':'Act'}[phase];
      title=goal===0?'Goal 1 — last location before the press.':'Goal 2 — first location after the press.';
      copy=writing?'New observations pass through the same Writer and join memory.':goal===0?'Past evidence, current scene and recent frames guide action.':'Read the initial experience and the result of Goal 1.';
    }
    const key=label+title+copy;if(key===previousStory)return;previousStory=key;
    text('flow-phase-label',label);text('flow-story-title',title);text('flow-story-copy',copy);
  }
  function controls(){root.dataset.playing=String(playing&&visible);attr($('flow-play'),'aria-label',playing?'Pause':'Play');attr($('flow-play'),'title',playing?'Pause':'Play');attr($('flow-play'),'aria-pressed',playing);if(!playing||!visible)video.pause();}
  function panTo(stage){
    if(stage===previousPan)return;previousPan=stage;
    if(viewport.clientWidth>=viewport.scrollWidth||reduced.matches)return;
    const x={observe:0,similar:150,bank:315,query:680,retrieve:500,fuse:620,action:680,complete:430};
    viewport.scrollTo({left:x[stage]||0,behavior:playing?'smooth':'auto'});
  }
  function sampleVideo(){
    if(time<T.act1)return{shown:false,target:0,moving:false,rate:rate1};
    if(time<T.stop1)return{shown:true,target:clamp((time-T.act1)/8000)*10.75,moving:true,rate:rate1};
    if(time<T.act2)return{shown:true,target:10.75,moving:false,rate:rate2};
    if(time<T.stop2)return{shown:true,target:10.75+clamp((time-T.act2)/7000)*9.05,moving:true,rate:rate2};
    return{shown:true,target:19.8,moving:false,rate:rate2};
  }
  function syncVideo(state){
    $('flow-outcome').hidden=!state.shown;
    if(!state.shown){video.pause();if(video.readyState>=1&&video.currentTime>0.05)video.currentTime=0;return;}
    if(video.playbackRate!==state.rate)video.playbackRate=state.rate;
    if(video.readyState>=1&&(forceVideoSync||!state.moving||Math.abs(time-lastSync)>350)){
      if(Math.abs(video.currentTime-state.target)>(forceVideoSync?0.001:state.moving?0.35:0.035))video.currentTime=state.target;
      lastSync=time;forceVideoSync=false;
    }
    if(state.moving&&playing&&visible&&!document.hidden){if(video.paused)video.play().catch(()=>{});}else video.pause();
  }
  // One write path for both observation periods. Every occurrence gets its own entry.
  function writeFlight(src,entry,prototype,shared,p,feedback){
    const [x,y]=protoXY[prototype],[ex,ey]=entryXY(entry);
    image('flow-frame-flight-image',src);
    if(feedback&&p<0.25){
      root.dataset.writePhase='capture';image('flow-feedback-image',src);
      travel('flow-feedback-flight',[[1115,680],[1090,748],[185,748],[80,205]],p/0.25);return 'capture';
    }
    const q=feedback?clamp((p-0.25)/0.75):p;
    let phase;
    if(q<0.28){phase='observe';travel('flow-frame-flight',[[70,205],[260,213]],q/0.28);}
    else if(q<0.4){phase='encode';alpha('flow-encoding',1);attr(root.querySelector('.writer-module text'),'opacity',0.12);}
    else if(q<0.6){phase='compare';travel('flow-frame-flight',[[305,213],[385,205]],(q-0.4)/0.2);}
    else if(q<0.83){phase=shared?'share':'append';travel('flow-frame-flight',shared?[[388,212],[425,337],[492,337],[x,y]]:[[388,212],[426,153],[x,153],[x,y]],(q-0.6)/0.23);}
    else{phase='entry';text('flow-entry-time',`t${entry+1}`);travel('flow-entry-flight',[[x+47,y+30],[ex,ey]],(q-0.83)/0.15);}
    if(feedback)root.dataset.writePhase=phase;
    return phase;
  }
  function render(){
    const recording=time<T.goal1,goal=time<T.goal2?0:1,complete=time>=T.complete;
    const elapsed=recording?0:time-(goal===0?T.goal1:T.goal2);
    let phase=recording?'record':complete?'complete':elapsed<1600?'query':elapsed<3800?'retrieve':elapsed<5000?'fuse':'action';
    const chapter=recording?'record':goal===0?'goal1':'goal2';
    root.dataset.goal=recording?'none':String(goal+1);root.dataset.stage=chapter;root.dataset.writePhase='none';
    if(Number(timeline.value)!==time)timeline.value=String(time);
    root.style.setProperty('--timeline-progress',`${time/T.end*100}%`);
    text('flow-timeline-clock',`${formatTime(time)} / ${formatTime(T.end)}`);
    attr(timeline,'aria-valuetext',`${recording?'Observe':complete?'Complete':`Goal ${goal+1}`}, ${formatTime(time)} of ${formatTime(T.end)}`);
    for(const b of chapters)attr(b,'aria-pressed',b.dataset.flowChapter===chapter);
    text('flow-mobile-status',recording?'Future goals unknown.':'Goal 1 → Goal 2. No reset.');
    flights.forEach(n=>attr(n,'opacity',0));alpha('flow-encoding',0);attr(root.querySelector('.writer-module text'),'opacity',1);
    const completed=writes.filter(w=>time>=w.end).length,active=writes.find(w=>time>=w.start&&time<w.end);
    let appearanceCount=4+Math.ceil(completed/2),entryCount=6+completed,admitting=-1,pan=phase;
    const selectedEntries=goal===0?[1,2]:[3,7],selectedPrototypes=goal===0?[0,1]:[2,4];
    if(recording){
      const frame=Math.min(5,Math.floor(Math.max(0,time-800)/2000)),p=time<800?0:((time-800)%2000)/2000;
      const prototype=references[frame],shared=frame===1||frame===4;
      appearanceCount=new Set(references.slice(0,frame+(p>=0.83?1:0))).size;entryCount=frame+(p>=0.98?1:0);
      image('flow-observation',history[frame]);text('flow-observation-cue',cues[frame]);
      if(time>=800){const wp=writeFlight(history[frame],frame,prototype,shared,p,false);phase=wp==='observe'||wp==='encode'?'record':wp;pan=p<0.28?'observe':p<0.6?'similar':'bank';if(p>=0.6)admitting=prototype;}else pan='observe';
    }else{
      image('flow-observation',completed?archived[completed-1]:history[5]);text('flow-observation-cue',completed?'During execution':'');
      if(phase==='query')travel('flow-query-pulse',[[1080,126],[1080,184]],elapsed/1600);
      if(phase==='retrieve'){
        const p=(elapsed-1600)/2200,which=Math.min(1,Math.floor(p*2)),entry=selectedEntries[which],proto=references[entry],[ex,ey]=entryXY(entry);
        image('flow-evidence-flight-image',goal===0?[history[0],history[2]][which]:[history[3],archived[0]][which]);
        travel('flow-key-pulse',[[ex+27,ey+25],[943,ey+25],[943,230],[1010,230]],clamp(p*2));
        travel('flow-evidence-flight',[[protoXY[proto][0],protoXY[proto][1]],[1032,214],[978+which*113,321]],(p*2)%1);
      }
      if(phase==='fuse'){
        const p=(elapsed-3800)/1200;
        travel('flow-past-pulse',[[1080,403],[1080,445],[1024,445],[1024,480]],p);
        travel('flow-current-pulse',[[420,560],[500,560],[500,590],[925,590],[925,540],[955,540]],p);
        if(goal===1)travel('flow-recent-pulse',[[380,670],[380,642],[925,642],[925,552],[955,552]],p);
      }
      if(phase==='action'){
        const p=((elapsed-5000)%1200)/1200;
        travel('flow-action-pulse',p<0.5?[[1094,515],[1115,515]]:[[1185,573],[1185,600]],p<0.5?p*2:(p-0.5)*2);
      }
      if(active){
        const p=(time-active.start)/1400,wp=writeFlight(active.src,active.entry,active.prototype,active.shared,p,true);
        if(wp!=='capture'){image('flow-observation',active.src);text('flow-observation-cue','During execution');}
        if(p>=0.25+0.75*0.6)admitting=active.prototype;
        if(p>=0.25+0.75*0.83)appearanceCount=Math.max(appearanceCount,active.prototype+1);
      }
    }
    root.dataset.phase=phase;panTo(pan);story(phase,goal,recording,complete,!!active);
    prototypes.forEach((n,i)=>{const stored=i<appearanceCount;attr(n,'opacity',1);attr(n.querySelector('svg'),'opacity',stored?1:0);attr(n.querySelector('text'),'opacity',stored?1:0);attr(n.querySelector('rect'),'opacity',stored?1:0.2);n.classList.toggle('is-selected',!recording&&selectedPrototypes.includes(i)&&elapsed>=1600);n.classList.toggle('is-admitting',admitting===i);});
    entries.forEach((n,i)=>{attr(n,'opacity',i<entryCount?1:0);n.classList.toggle('is-selected',!recording&&selectedEntries.includes(i)&&elapsed>=1600);n.classList.toggle('is-new',i>=6&&i<entryCount&&time<writes[i-6].end+1400);});
    text('flow-appearance-count',`${appearanceCount} ${appearanceCount===1?'appearance':'appearances'}`);
    text('flow-bank-count',`${entryCount} observations`);text('flow-read-count',recording?'':`Reads ${goal===0?6:8} observations`);
    attr($('flow-read-prefix'),'d',goal===0?'M511 360H871V412H511Z':'M511 360H871V412H631V462H511Z');alpha('flow-read-prefix',recording?0:0.8);
    alpha('flow-evidence',!recording&&elapsed>=1800?1:0.12);
    const evidence=goal===0?[history[0],history[2]]:[history[3],archived[0]];evidence.forEach((src,i)=>image(`flow-evidence-image-${i}`,src));
    text('flow-evidence-label-0',goal===0?'Before press':'After press');text('flow-evidence-label-1',goal===0?'Button event':'Goal 1 result');
    text('flow-goal-label',recording?'OBSERVE':goal===0?'GOAL 1':'GOAL 2 — NO RESET');
    text('flow-request-line-1',recording?'Future goals unknown':goal===0?'Return the cube to its last':'Return the cube to its first');
    text('flow-request-line-2',recording?'':goal===0?'location before the press.':'location after the press.');
    attr($('flow-request-bg'),'fill',recording?'#eef1f7':'#edf2fd');text('flow-action-wait',recording?'':'Preparing action');
    const state=sampleVideo(),native=state.target,thresholds=[0,3,6,10.75,14,17,19.8];
    const snapshots=[[0,execution[0]],[3,execution[1]],[6,execution[2]],[10.15,'assets/flow-button/current-10-15.jpg'],[10.75,execution[3]],[14,execution[4]],[17,execution[5]],[19.35,'assets/flow-button/current-19-35.jpg'],[19.8,execution[6]]];
    let currentSrc=execution[0];for(const [t,src]of snapshots)if(native>=t)currentSrc=src;image('flow-current-image',currentSrc);
    text('flow-current-label',time>=T.goal2&&time<T.act2?'After Goal 1':complete?'After Goal 2':'');
    let recent=[1,2,3];if(native>=14)recent=[2,3,4];if(native>=17)recent=[3,4,5];if(native>=19.8)recent=[4,5,6];
    recent.forEach((index,i)=>{image(`flow-recent-image-${i}`,recentSources[index]);attr($(`flow-recent-image-${i}`).closest('.recent-card'),'opacity',native>=thresholds[index]?1:0);});
    const transitionVisible=!inspecting&&!reduced.matches&&(recording?time<1050:complete?time-T.complete<1700:elapsed<1450);
    const card=$('flow-transition');card.classList.toggle('is-visible',transitionVisible);attr(card,'aria-hidden',!transitionVisible);
    text('flow-transition-title',recording?'Observe':complete?'Sequence complete':`Goal ${goal+1}`);
    text('flow-transition-copy',recording?'Future goals unknown':complete?'Goal 1 → Goal 2. No reset.':goal===0?'Last location before the press':'First location after the press');
    syncVideo(state);
  }
  function jump(which){time=jumps[which];playing=true;inspecting=false;forceVideoSync=true;previous=0;lastSync=-1000;controls();render();}
  function seek(){time=Math.max(0,Math.min(T.end,Number(timeline.value)));playing=!scrubbing;inspecting=true;forceVideoSync=true;previous=0;lastSync=-1000;controls();render();}
  timeline.addEventListener('input',seek);
  timeline.addEventListener('pointerdown',()=>{scrubbing=true;playing=false;inspecting=true;previous=0;controls();render();});
  function finishSeek(){if(!scrubbing)return;scrubbing=false;playing=true;previous=0;forceVideoSync=true;controls();render();}
  timeline.addEventListener('change',finishSeek);
  window.addEventListener('pointerup',finishSeek);
  window.addEventListener('pointercancel',finishSeek);
  video.addEventListener('loadedmetadata',()=>{forceVideoSync=true;render();});
  for(const b of chapters)b.addEventListener('click',()=>jump(b.dataset.flowChapter));
  $('flow-similar').addEventListener('click',()=>jump('similar'));
  $('flow-similar').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();jump('similar');}});
  $('flow-restart').addEventListener('click',()=>jump('record'));
  $('flow-play').addEventListener('click',()=>{playing=!playing;if(playing){inspecting=false;if(time>=T.end)time=0;}previous=0;forceVideoSync=true;controls();render();});
  reduced.addEventListener('change',e=>{playing=!e.matches;previous=0;controls();render();});
  if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;previous=0;controls();},{threshold:0.16}).observe(root);else visible=true;
  function tick(now){if(playing&&visible&&!document.hidden){if(previous)time+=Math.min(100,now-previous);if(time>=T.end){time=0;lastSync=-1000;}render();}previous=now;requestAnimationFrame(tick);}
  controls();render();requestAnimationFrame(tick);
})();
