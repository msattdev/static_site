(function(){
  const root = document.getElementById('year-progress');
  if(!root) return;

  function update(){
    const now = new Date();
    const start = new Date(2026, 0, 1, 0, 0, 0);
    const end = new Date(2026, 11, 31, 23, 59, 59, 999);
    const total = end - start;
    const elapsedMs = now - start;
    let percent = Math.min(100, Math.max(0, (elapsedMs / total) * 100));

    const fill = root.querySelector('.year-progress-fill');
    const elapsedLabel = root.querySelector('.elapsed');
    const remainingLabel = root.querySelector('.remaining');

    if(fill) fill.style.width = percent.toFixed(2) + '%';
    root.setAttribute('aria-valuenow', Math.round(percent));
    if(elapsedLabel) elapsedLabel.textContent = Math.round(percent) + '%';

    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.max(0, Math.ceil((end - now) / msPerDay));
    if(remainingLabel){
      if(percent >= 100) remainingLabel.textContent = '0 days left';
      else if(daysLeft === 1) remainingLabel.textContent = '1 day left';
      else remainingLabel.textContent = daysLeft + ' days left';
    }
  }

  update();
  setInterval(update, 60 * 1000);
})();
