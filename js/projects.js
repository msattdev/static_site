// Projects data copied from app.py and renderer
const PROJECTS = [
  {
    title: "Minimalist Portfolio",
    description: "You're looking at it! The goal was to create a clean, responsive portfolio site using only HTML, CSS, and JavaScript. No frameworks, just pure web technologies. Feel free to explore the source code on GitHub.",
    url: "#",
    tags: ["HTML/CSS", "JavaScript"],
  },
  {
    title: "100 Days of Python",
    description: "This repository tracks small projects built while following Angela Yu's 100 Days of Code: The Complete Python Pro Bootcamp. Each day focuses on a simple, fun project to practice fundamentals and build confidence.",
    url: "https://github.com/msattdev/100_days_of_python",
    tags: ["Python"],
  },
  {
    title: "Automate the Boring Stuff Projects",
    description: "This repository contains various projects created while working through 'Automate the Boring Stuff with Python' by Al Sweigart. The projects focus on automating everyday tasks using Python scripts.",
    url: "https://github.com/msattdev/100_days_of_python",
    tags: ["Python"],
  }
];

function renderProjects(){
  const container = document.getElementById('projects-grid');
  if(!container) return;
  container.innerHTML = ''; // clear
  PROJECTS.forEach(p => {
    const art = document.createElement('article');
    art.className = 'card';
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
