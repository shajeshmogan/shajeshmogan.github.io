(() => {
  'use strict';
  const doc = document;
  const root = doc.body;
  const $ = (selector) => doc.querySelector(selector);
  const $$ = (selector) => [...doc.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const motion = () => !root.classList.contains('no-motion');

  const sceneLinks = $$('[data-scene]');
  const scenes = sceneLinks.map((link) => doc.getElementById(link.dataset.scene));
  const header = $('.site-header');
  sceneLinks.forEach((link, index) => {
    const section = scenes[index];
    if (!section) return;
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
      section.focus({ preventScroll: true });
      section.scrollIntoView({ block: 'start' });
    });
  });
  let scrollQueued = false;
  const hero = $('.hero');
  const timeline = $('#journey-timeline');
  function updateScrollScene() {
    scrollQueued = false;
    const reference = (header?.offsetHeight ?? 0) + 16;
    let active = 'top';
    for (const scene of scenes) {
      if (scene && scene.getBoundingClientRect().top <= reference) active = scene.id;
    }
    const lastScene = scenes.at(-1);
    if (lastScene && window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= doc.documentElement.scrollHeight - 2) {
      active = lastScene.id;
    }
    for (const link of sceneLinks) {
      const current = link.dataset.scene === active;
      link.classList.toggle('is-current',current);
      if (current) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
    if (hero) hero.classList.toggle('hero-scrolled', window.scrollY > 120);
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const progress = clamp((window.innerHeight * .77 - rect.top) / Math.max(1,rect.height),0,1);
      timeline.style.setProperty('--journey-progress', `${Math.round(progress*100)}%`);
    }

  }
  function queueScroll(){if (!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScrollScene);}}
  window.addEventListener('scroll',queueScroll,{passive:true});
  window.addEventListener('resize',queueScroll,{passive:true});
  window.addEventListener('newworld:motion',queueScroll);
  updateScrollScene();

  const reveals = $$('.about-statement,.about-story,.principle,.section-heading-row,.project-card,.skills-workbench,.journey-intro,.timeline-item,.contact-content');
  reveals.forEach((item) => { item.dataset.cinematic = 'true'; });
  if ('IntersectionObserver' in window && motion() && window.innerWidth > 850) {
    const revealObserver = new IntersectionObserver((entries,observer)=>{
      for (const entry of entries) {
        if(entry.isIntersecting) { entry.target.classList.add('cinematic-visible');observer.unobserve(entry.target); }
      }
    },{threshold:.055,rootMargin:'0px 0px 15px 0px'});
    reveals.forEach(item=>revealObserver.observe(item));
    root.classList.add('motion-ready');
  } else reveals.forEach(item=>item.classList.add('cinematic-visible'));
  // Turning motion off must immediately reveal all content.
  window.addEventListener('newworld:motion',()=>{
    if (!motion()) reveals.forEach(item=>item.classList.add('cinematic-visible'));
  });

  // Accessible interactive constellation. Nodes stay legible while the
  // constellation's depth and connections rotate; keyboard buttons also work.
  const skillMap = $('.skill-map');
  const buttons = skillMap ? $$('.skill-node') : [];
  const svg = skillMap?.querySelector('.skill-connections');
  const paths = svg?.querySelector('path');
  const core = skillMap?.querySelector('.map-core');
  const coordinates = buttons.map((btn,index)=>({button:btn,angle:index*Math.PI/3-Math.PI*2/3}));
  let yaw=0, drag=null;
  function drawConstellation(){
    if(!skillMap||!svg||!paths||!core)return;
    const rect=skillMap.getBoundingClientRect();
    const width=rect.width, height=rect.height;
    if(width<1||height<1)return;
    const cx=width/2,cy=height/2;
    const rx=Math.min(width*.34,250),ry=Math.min(height*.38,175);
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    let line='';
    for(const item of coordinates){
      const a=item.angle+yaw;
      const x=cx+Math.cos(a)*rx;
      const depth=Math.sin(a);
      const y=cy+Math.sin(a)*ry*.9 - depth*14;
      const scale=clamp(.91+depth*.12,.78,1.08);
      item.button.style.left=`${(x/width*100).toFixed(3)}%`;
      item.button.style.top=`${(y/height*100).toFixed(3)}%`;
      item.button.style.right='auto';item.button.style.bottom='auto';
      item.button.style.transform=`translate(-50%,-50%) scale(${scale.toFixed(3)})`;
      item.button.style.zIndex=String(3+Math.round((depth+1)*2));
      item.button.style.opacity=String(clamp(.79+depth*.17,.62,1));
      const qx=(x+cx)/2, qy=(y+cy)/2-21;
      line+=`M ${cx} ${cy} Q ${qx} ${qy} ${x} ${y} `;
    }
    paths.setAttribute('d',line);
    const orbit=skillMap.querySelector('.map-orbit');
    if(orbit)orbit.style.transform=`translate(-50%,-50%) rotate(${(yaw*57.2958).toFixed(1)}deg)`;
  }
  const rotate = (delta)=>{yaw+=delta;drawConstellation();};
  $('#skill-rotate-left')?.addEventListener('click',()=>rotate(-Math.PI/7));
  $('#skill-rotate-right')?.addEventListener('click',()=>rotate(Math.PI/7));
  $('#skill-reset-view')?.addEventListener('click',()=>{yaw=0;drawConstellation();});
  if(skillMap){
    skillMap.addEventListener('pointerdown',event=>{
      if(drag||event.target.closest('button')||event.button!==0)return;
      drag={id:event.pointerId,x:event.clientX,yaw};skillMap.setPointerCapture(event.pointerId);
      skillMap.classList.add('is-dragging');
    });
    skillMap.addEventListener('pointermove',event=>{
      if(drag?.id!==event.pointerId)return;
      yaw=drag.yaw+(event.clientX-drag.x)*.0055;
      drawConstellation();
    });
    function stopDrag(event) {
      if (drag?.id !== event.pointerId) return;
      drag = null;
      skillMap.classList.remove('is-dragging');
    }
    skillMap.addEventListener('pointerup',stopDrag);
    skillMap.addEventListener('pointercancel',stopDrag);
    skillMap.addEventListener('lostpointercapture',stopDrag);
    const ro=typeof ResizeObserver !== 'undefined'?new ResizeObserver(drawConstellation):null;
    ro?.observe(skillMap);if(!ro)window.addEventListener('resize',drawConstellation,{passive:true});
    drawConstellation();
  }
  // The skill network is drawn on load, resize, drag and button clicks only.
  // No perpetual animation loop competes with scroll or the neural canvas.

  // RippleFix: local state machine with illustrative data only. A proposed
  // option is never a real calendar operation or agent action.
  const status=$('#sim-status'),outputLabel=$('#sim-output-label'),outputText=$('#sim-output-text');
  const runBtn=$('#sim-run'),approveBtn=$('#sim-approve'),resetBtn=$('#sim-reset');
  const rooms=$$('.sim-room');
  function setText(node,text){if(node)node.textContent=text;}
  function resetSimulation(){
    setText(status,'STANDBY');setText(outputLabel,'AWAITING INPUT');
    setText(outputText,'Select “Analyse options” to see how a fictional disruption could be resolved.');
    rooms.forEach(room=>{
      room.classList.remove('is-valid','is-rejected','is-approved');
      const strong=room.querySelector('strong');
      setText(strong,room.dataset.room==='B401'?'UNAVAILABLE':'UNCHECKED');
    });
    if(runBtn)runBtn.disabled=false;
    if(approveBtn)approveBtn.disabled=true;
  }
  runBtn?.addEventListener('click',()=>{
    setText(status,'AWAITING APPROVAL');setText(outputLabel,'PROPOSAL PREPARED / NOT APPLIED');
    setText(outputText,'Example: B401 is unavailable. B402 passes the illustrative capacity and conflict checks. B305 is excluded because the example timetable contains a clash. Review before approval.');
    for(const room of rooms){
      const strong=room.querySelector('strong');
      if(room.dataset.room==='B402'){room.classList.add('is-valid');setText(strong,'VALID OPTION');}
      if(room.dataset.room==='B305'){room.classList.add('is-rejected');setText(strong,'TIME CLASH');}
    }
    if (approveBtn) approveBtn.disabled = false;
    if (doc.activeElement === runBtn) approveBtn?.focus();
    if (runBtn) runBtn.disabled = true;
  });
  approveBtn?.addEventListener('click',()=>{
    if(approveBtn.disabled)return;
    setText(status,'SIMULATION COMPLETE');setText(outputLabel,'APPROVED / DEMO ONLY');
    setText(outputText,'The fictional proposal for B402 is approved. This illustrates the approval gate; no real booking, calendar event or external system has been changed.');
    const selected=rooms.find(room=>room.dataset.room==='B402');
    selected?.classList.add('is-approved');setText(selected?.querySelector('strong'),'DEMO APPROVED');
    if (doc.activeElement === approveBtn) resetBtn?.focus();
    approveBtn.disabled=true;
  });
  resetBtn?.addEventListener('click',resetSimulation);
  resetSimulation();

  const modelConfigs={
    cnn:{title:'Convolutional neural network',description:'Convolutional feature extraction helps a model recognise local patterns in handwritten character images. Diagram is conceptual.',sizes:[5,7,5,3],labels:['IMAGE','CONV','FEATURES','CLASS']},
    rnn:{title:'Simple recurrent neural network',description:'A recurrent hidden state carries information from earlier positions in a text sequence. This is a conceptual view, not training output.',sizes:[4,4,4,4,2],labels:['TOKEN','STATE','STATE','STATE','OUTPUT']},
    lstm:{title:'Long short-term memory',description:'LSTM units use gates and a cell state to regulate information retained across a sequence. Diagram abstracts those internal operations.',sizes:[4,5,5,5,2],labels:['TOKEN','GATES','MEMORY','STATE','OUTPUT']},
    gru:{title:'Gated recurrent unit',description:'GRU units use update and reset gates to manage state over time, with a different internal structure from LSTM.',sizes:[4,5,5,4,2],labels:['TOKEN','RESET','UPDATE','STATE','OUTPUT']}
  };
  const archSvg=$('#arch-svg'),archTitle=$('#arch-title'),archDescription=$('#arch-description');
  const ns='http://www.w3.org/2000/svg';
  function svgElement(name,attrs={}){
    const element=doc.createElementNS(ns,name);
    for(const [key,value] of Object.entries(attrs))element.setAttribute(key,String(value));
    return element;
  }
  function showArchitecture(key){
    const data=modelConfigs[key]; if(!data||!archSvg)return;
    $$('.arch-switch').forEach(button=>{
      const active=button.dataset.architecture===key;
      button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));
    });
    setText(archTitle,data.title);setText(archDescription,data.description);
    archSvg.replaceChildren();
    const columns=data.sizes.length, positions=[];
    data.sizes.forEach((count,i)=>{
      const x=42+(i/(columns-1))*496;
      positions.push(Array.from({length:count},(_,j)=>({x,y:45 + (j+.5)*(136/count)})));
      const caption=svgElement('text',{x,y:207,fill:'#95abc8','font-size':9,'letter-spacing':1.5,'text-anchor':'middle'});
      caption.textContent=data.labels[i];archSvg.append(caption);
    });
    positions.slice(0,-1).forEach((column,i)=>{
      for(const p of column) for(const q of positions[i+1]){
        const path=svgElement('path',{d:`M ${p.x} ${p.y} L ${q.x} ${q.y}`,class:'architecture-line'});
        archSvg.append(path);
      }
    });
    positions.forEach((column,i)=>{
      const group=svgElement('g',{class:'architecture-group'});
      group.style.animationDelay=`${i*70}ms`;
      for(const point of column){
        group.append(svgElement('circle',{cx:point.x,cy:point.y,r:5.2,class:'architecture-dot'}));
        group.append(svgElement('circle',{cx:point.x,cy:point.y,r:10.5,fill:'none',stroke:'rgba(110,195,250,.28)','stroke-width':.8}));
      }
      archSvg.append(group);
    });
  }
  $$('.arch-switch').forEach(button=>button.addEventListener('click',()=>showArchitecture(button.dataset.architecture)));
  showArchitecture('cnn');
})();
