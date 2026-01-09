// Lightweight UX enhancements: reveal-on-scroll, theme toggle, and canvas background
(function(){
  'use strict';

  function onReady(){
    // Fade-in
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');

    // Reveal-on-scroll
    try{
      const reveals = document.querySelectorAll('.reveal');
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reveals.length){
        if(reduced){
          // Respect reduced motion: reveal immediately without transitions
          reveals.forEach(el=>el.classList.add('is-visible'));
        }else{
          const io = new IntersectionObserver((entries)=>{
            entries.forEach(entry=>{
              if(entry.isIntersecting){
                const el = entry.target;
                // set custom delay from attribute (ms)
                const delay = el.dataset.revealDelay || 0;
                el.style.setProperty('--reveal-delay', delay + 'ms');
                el.classList.add('is-visible');
                io.unobserve(el);
              }
            });
          },{threshold:0.12});
          reveals.forEach(el=>io.observe(el));
        }
      }
    }catch(e){console.warn('Reveal observer failed', e)}

    // Theme toggle (persists to localStorage)
    try{
      const toggle = document.getElementById('theme-toggle');
      const root = document.documentElement;
      if(toggle){
        const stored = localStorage.getItem('theme');
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        let theme = stored || (prefersLight ? 'light' : 'dark');
        const applyTheme = (t)=>{
          if(t === 'light'){
            root.setAttribute('data-theme','light');
            toggle.setAttribute('aria-pressed','true');
            toggle.textContent = '🌞';
          }else{
            root.removeAttribute('data-theme');
            toggle.setAttribute('aria-pressed','false');
            toggle.textContent = '🌗';
          }
        };
        applyTheme(theme);
        toggle.addEventListener('click', ()=>{
          theme = (root.getAttribute('data-theme') === 'light') ? 'dark' : 'light';
          localStorage.setItem('theme', theme);
          applyTheme(theme);
        });
      }
    }catch(e){console.warn('Theme toggle failed', e)}

    // Canvas background: subtle starfield / nebula
    try{
      if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const canvas = document.getElementById('bg-canvas');
      if(!canvas || !canvas.getContext) return;
      // Avoid heavy work on narrow screens
      if(window.innerWidth < 640) return;

      const ctx = canvas.getContext('2d');
      let w = canvas.width = innerWidth;
      let h = canvas.height = innerHeight;
      const stars = [];
      const STAR_COUNT = Math.min(140, Math.floor((w*h)/6500));
      for(let i=0;i<STAR_COUNT;i++){
        stars.push({x:Math.random()*w, y:Math.random()*h, r:Math.random()*1.4+0.2, vx:(Math.random()*0.6-0.3)*0.2, vy:(Math.random()*0.2+0.02)});
      }
      function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
      addEventListener('resize', resize);
      let t = 0;
      let raf = null;
      let running = true;
      function draw(){
        if(!running) return;
        ctx.clearRect(0,0,w,h);
        // subtle nebula gradient
        const g = ctx.createLinearGradient(0,0,w,h);
        g.addColorStop(0,'rgba(10,8,20,0.3)');
        g.addColorStop(0.6,'rgba(16,10,40,0.25)');
        g.addColorStop(1,'rgba(4,6,12,0.2)');
        ctx.fillStyle = g;
        ctx.fillRect(0,0,w,h);

        for(const s of stars){
          s.x += s.vx;
          s.y += s.vy;
          if(s.x < -10) s.x = w+10;
          if(s.x > w+10) s.x = -10;
          if(s.y > h+10) s.y = -10;
          ctx.beginPath();
          const tw = (Math.sin((t + s.x*0.01)*0.5)+1)/2*0.7 + 0.3;
          ctx.fillStyle = `rgba(255,255,255,${tw})`;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
          ctx.fill();
        }
        t += 0.016;
        raf = requestAnimationFrame(draw);
      }
      // Pause when document hidden
      function onVisibility(){
        if(document.hidden){ running = false; if(raf) cancelAnimationFrame(raf); }
        else{ if(!running){ running = true; draw(); }}
      }
      document.addEventListener('visibilitychange', onVisibility);
      draw();
    }catch(e){console.warn('Canvas animation failed', e)}
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(onReady, 50);
  }else{
    document.addEventListener('DOMContentLoaded', onReady);
  }
})();