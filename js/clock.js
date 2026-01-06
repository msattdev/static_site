// Simple 24-hour clock (military time)
(function(){
  const el = document.getElementById('clock');
  if(!el) return;

  function pad(n){ 
    return n.toString().padStart(2, '0'); }
  function update(){
    const now = new Date();
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    el.textContent = `${hh}:${mm}:${ss}`;
  }

  update();
  setInterval(update, 1000);
})();
