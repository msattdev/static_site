// Projects data copied from app.py and renderer
const PROJECTS = [
  {
    title: "Minimalist Portfolio",
    description: "You're looking at it! The goal was to create a clean, responsive portfolio site using only HTML, CSS, and JavaScript. No frameworks, just pure web technologies. Feel free to explore the source code on GitHub.",
    url: "https://msattdev.github.io/static_site/",
    tags: ["HTML/CSS", "JavaScript"],
  },
  {
    title: "URL Checker",
    description: "A simple Python script to check if a given URL is reachable. It uses the 'requests' library to send a GET request and reports the status code. This project is great for learning basic Python programming and working with external libraries.",
    url: "https://github.com/msattdev/check-url",
    tags: ["Python"],
  },
  {
    title: "Automate the Boring Stuff Projects",
    description: "This repository contains various projects created while working through 'Automate the Boring Stuff with Python' by Al Sweigart. The projects focus on automating everyday tasks using Python scripts.",
    url: "https://github.com/msattdev/automate_boring_stuff",
    tags: ["Python"],
  },
  {
    title: "Scan Me Maybe",
    description: "A simple Python application that generates QR codes for URLs, text, or other data. Built using the 'qrcode' library, this project demonstrates basic Python programming and file handling.",
    url: "https://github.com/msattdev/Scan-Me-Maybe",
    tags: ["Python"],
  }
];

function renderProjects(){
  const container = document.getElementById('projects-grid');
  if(!container) return;
  container.innerHTML = ''; // clear
  PROJECTS.forEach((p, i) => {
    const art = document.createElement('article');
    art.className = 'card reveal';
    art.dataset.revealDelay = (120 * i).toString();
    art.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <p class="tags">${(p.tags||[]).map(t => `<span class="tag">${t}</span>`).join(' ')}</p>
      <p class="muted"><a href="${p.url}">View project</a></p>
    `;
    container.appendChild(art);
  });
}

document.addEventListener('DOMContentLoaded', renderProjects);
