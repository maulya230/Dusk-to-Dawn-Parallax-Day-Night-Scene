(function(){
  const sky = document.getElementById('sky');
  const stars = document.getElementById('stars');
  const sun = document.getElementById('sun');
  const moon = document.getElementById('moon');
  const cloudsBack = document.getElementById('cloudsBack');
  const cloudsFront = document.getElementById('cloudsFront');
  const cityFar = document.getElementById('cityFar');
  const cityNear = document.getElementById('cityNear');
  const captionText = document.getElementById('captionText');
  const progressBar = document.getElementById('progressBar');
  const scrollHint = document.getElementById('scrollHint');
  const spacer = document.getElementById('spacer');

  // ---- Sky color keyframes across the scroll journey ----
  const KEYFRAMES = [
    { t: 0.00, top: [255,167,120], bottom: [255,214,140], label: 'Sunrise.' },
    { t: 0.18, top: [120,177,255], bottom: [255,214,170], label: 'Morning light.' },
    { t: 0.38, top: [86,163,255],  bottom: [190,224,255], label: 'High noon.' },
    { t: 0.58, top: [255,140,90],  bottom: [255,196,120], label: 'Golden hour.' },
    { t: 0.75, top: [70,55,110],   bottom: [255,140,120], label: 'Dusk falls.' },
    { t: 0.90, top: [18,20,46],    bottom: [60,44,80],    label: 'Stars come out.' },
    { t: 1.00, top: [6,8,20],      bottom: [16,15,34],    label: 'Goodnight, city.' }
  ];

  function lerp(a,b,t){ return a + (b-a) * t; }
  function lerpColor(c1,c2,t){
    return [lerp(c1[0],c2[0],t), lerp(c1[1],c2[1],t), lerp(c1[2],c2[2],t)];
  }
  function toRgb(c){ return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function smoothstep(edge0, edge1, x){
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function skySample(progress){
    for(let i = 0; i < KEYFRAMES.length - 1; i++){
      const a = KEYFRAMES[i], b = KEYFRAMES[i+1];
      if(progress >= a.t && progress <= b.t){
        const localT = (progress - a.t) / (b.t - a.t);
        return {
          top: toRgb(lerpColor(a.top, b.top, localT)),
          bottom: toRgb(lerpColor(a.bottom, b.bottom, localT)),
          label: a.label,
          segIndex: i
        };
      }
    }
    const last = KEYFRAMES[KEYFRAMES.length - 1];
    return { top: toRgb(last.top), bottom: toRgb(last.bottom), label: last.label, segIndex: KEYFRAMES.length - 1 };
  }

  // ---- Generate stars ----
  const STAR_COUNT = 130;
  for(let i = 0; i < STAR_COUNT; i++){
    const s = document.createElement('span');
    const size = Math.random() * 1.8 + 0.6;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.top = (Math.random() * 68) + '%';
    s.style.left = (Math.random() * 100) + '%';
    s.style.animationDelay = (Math.random() * 3.5) + 's';
    stars.appendChild(s);
  }

  // ---- Generate clouds ----
  function makeCloudPuff(container, xPct, yPx, scale){
    const blob = document.createElement('span');
    blob.style.width = (70 * scale) + 'px';
    blob.style.height = (40 * scale) + 'px';
    blob.style.left = xPct + '%';
    blob.style.top = yPx + 'px';
    container.appendChild(blob);
  }
  function makeCloudCluster(container, xPct, yPx){
    makeCloudPuff(container, xPct, yPx, 1);
    makeCloudPuff(container, xPct + 3, yPx - 10, 0.75);
    makeCloudPuff(container, xPct + 7, yPx + 4, 0.85);
    makeCloudPuff(container, xPct - 4, yPx + 6, 0.6);
  }
  [4, 22, 40, 60, 78, 95].forEach((x, i)=> makeCloudCluster(cloudsBack, x, 10 + (i%3)*8));
  [10, 33, 55, 74, 90].forEach((x, i)=> makeCloudCluster(cloudsFront, x, 0 + (i%2)*14));

  // ---- Generate city skylines ----
  function buildCity(container, count, opts){
    const frag = document.createDocumentFragment();
    for(let i = 0; i < count; i++){
      const w = opts.minW + Math.random() * (opts.maxW - opts.minW);
      const h = opts.minH + Math.random() * (opts.maxH - opts.minH);
      const b = document.createElement('div');
      b.className = 'building';
      b.style.width = w + 'px';
      b.style.height = h + 'px';
      b.style.background = opts.color;

      if(opts.windows){
        const cols = Math.max(1, Math.floor(w / 14));
        const rows = Math.max(1, Math.floor(h / 22));
        for(let c = 0; c < cols; c++){
          for(let r = 0; r < rows; r++){
            if(Math.random() < 0.72){
              const win = document.createElement('div');
              win.className = 'window';
              win.style.width = '6px';
              win.style.height = '9px';
              win.style.left = (c * 14 + 4) + 'px';
              win.style.top = (r * 22 + 8) + 'px';
              win.style.transitionDelay = (Math.random() * 1.8).toFixed(2) + 's';
              win.dataset.flicker = (0.7 + Math.random() * 0.3).toFixed(2);
              b.appendChild(win);
            }
          }
        }
      }
      frag.appendChild(b);
    }
    container.appendChild(frag);
  }

  buildCity(cityFar, 16, { minW:30, maxW:65, minH:70, maxH:190, color:'#141A2C', windows:false });
  buildCity(cityNear, 11, { minW:50, maxW:100, minH:150, maxH:320, color:'#0A0C12', windows:true });

  const nearWindows = cityNear.querySelectorAll('.window');

  // ---- Main scroll-driven render loop ----
  function getProgress(){
    const max = spacer.offsetHeight - window.innerHeight;
    if(max <= 0) return 0;
    return clamp(window.scrollY / max, 0, 1);
  }

  function render(){
    const progress = getProgress();

    // sky
    const s = skySample(progress);
    sky.style.background = 'linear-gradient(180deg, ' + s.top + ' 0%, ' + s.bottom + ' 100%)';

    // caption
    if(captionText.textContent !== s.label){
      captionText.classList.remove('visible');
      setTimeout(()=>{ captionText.textContent = s.label; captionText.classList.add('visible'); }, 260);
    } else {
      captionText.classList.add('visible');
    }

    // progress bar
    progressBar.style.width = (progress * 100) + '%';

    // scroll hint
    scrollHint.style.opacity = progress < 0.02 ? '1' : '0';

    // sun arc: visible roughly across the first 78% of the journey
    const sunT = clamp(progress / 0.72, 0, 1);
    const sunOpacity = smoothstep(0, 0.04, progress) * (1 - smoothstep(0.62, 0.74, progress));
    const sunX = lerp(12, 88, sunT);
    const sunY = 68 - Math.sin(sunT * Math.PI) * 46;
    sun.style.left = sunX + '%';
    sun.style.top = sunY + '%';
    sun.style.opacity = sunOpacity;

    // moon arc: rises as sun sets
    const moonWinStart = 0.56, moonWinEnd = 1.02;
    const moonT = clamp((progress - moonWinStart) / (moonWinEnd - moonWinStart), 0, 1);
    const moonOpacity = smoothstep(0.56, 0.68, progress);
    const moonX = lerp(12, 88, moonT);
    const moonY = 68 - Math.sin(moonT * Math.PI) * 46;
    moon.style.left = moonX + '%';
    moon.style.top = moonY + '%';
    moon.style.opacity = moonOpacity;

    // stars
    stars.style.opacity = smoothstep(0.66, 0.92, progress);

    // clouds dim at night
    const cloudBrightness = lerp(1, 0.18, smoothstep(0.6, 0.9, progress));
    cloudsBack.style.opacity = 0.7 * cloudBrightness;
    cloudsFront.style.opacity = 0.9 * cloudBrightness;

    // parallax drift for city layers
    cityFar.style.transform = 'translateY(' + (-progress * 18) + 'px)';
    cityNear.style.transform = 'translateY(' + (-progress * 4) + 'px)';

    // city lights
    const lights = smoothstep(0.55, 0.86, progress);
    nearWindows.forEach(w=>{
      const flicker = parseFloat(w.dataset.flicker);
      w.style.opacity = lights * flicker;
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
