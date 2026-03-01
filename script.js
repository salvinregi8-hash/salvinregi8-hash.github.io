// ──── VIBRANT ANIMATED CANVAS BACKGROUND ────
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Nodes for network mesh
const nodes = [];
const NODE_COUNT = 80;

class Node {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.r = Math.random() * 2 + 1;
        this.hue = Math.random() < 0.6 ? 185 : (Math.random() < 0.5 ? 300 : 160);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
}

for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());

// Floating hex symbols
const hexSymbols = [];
const SYMBOLS = ['🔐','🛡️','01','10','⚡','AI','ML'];
class HexSymbol {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vy = -0.3 - Math.random() * 0.3;
        this.opacity = Math.random() * 0.15 + 0.05;
        this.text = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        this.size = Math.random() * 12 + 10;
    }
    update() {
        this.y += this.vy;
        if (this.y < -20) {
            this.y = canvas.height + 20;
            this.x = Math.random() * canvas.width;
        }
    }
}
for (let i = 0; i < 15; i++) hexSymbols.push(new HexSymbol());

let frame = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark gradient base
    const grad = ctx.createRadialGradient(canvas.width*0.5, canvas.height*0.3, 0, canvas.width*0.5, canvas.height*0.5, canvas.width*0.8);
    grad.addColorStop(0, 'rgba(0,20,40,0.98)');
    grad.addColorStop(0.5, 'rgba(5,10,18,0.99)');
    grad.addColorStop(1, 'rgba(0,5,15,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing orbs
    const orbs = [
        { x: canvas.width * 0.15, y: canvas.height * 0.2, r: 200, h: 185 },
        { x: canvas.width * 0.85, y: canvas.height * 0.7, r: 180, h: 300 },
        { x: canvas.width * 0.5, y: canvas.height * 0.85, r: 150, h: 160 },
    ];
    orbs.forEach(orb => {
        const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r + Math.sin(frame * 0.02) * 20);
        g.addColorStop(0, `hsla(${orb.h},100%,50%,0.08)`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Network lines
    ctx.lineWidth = 0.5;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 130) {
                const alpha = (1 - dist / 130) * 0.3;
                ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }
    }

    // Nodes
    nodes.forEach(n => {
        n.update();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue},100%,65%,0.7)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${n.hue},100%,65%,0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // Hex symbols
    hexSymbols.forEach(s => {
        s.update();
        ctx.font = `${s.size}px Rajdhani`;
        ctx.fillStyle = `rgba(0,245,255,${s.opacity})`;
        ctx.fillText(s.text, s.x, s.y);
    });

    // Scan line effect
    const scanY = (frame * 1.2) % canvas.height;
    const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    scanGrad.addColorStop(0, 'transparent');
    scanGrad.addColorStop(0.5, 'rgba(0,245,255,0.025)');
    scanGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 40, canvas.width, 80);

    frame++;
    requestAnimationFrame(draw);
}
draw();

// ──── SCROLL REVEAL ────
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, (entry.target.dataset.delay || 0));
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

// Stagger delays for siblings
document.querySelectorAll('.projects-grid, .skills-grid, .about-grid, .contact-grid').forEach(container => {
    Array.from(container.children).forEach((child, i) => {
        const rev = child.classList.contains('reveal') ? child : child.querySelector('.reveal');
        if (child.classList.contains('reveal')) child.dataset.delay = i * 120;
    });
});

revealEls.forEach(el => observer.observe(el));

// ──── SKILL BARS ────
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
                setTimeout(() => bar.classList.add('animated'), i * 150 + 200);
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(cat => skillObserver.observe(cat));

// ──── TYPING EFFECT ────
const phrases = ["Hi, I'm Salvin Regi", "Cybersecurity Enthusiast", "AI Developer", "Problem Solver"];
let pIdx = 0, cIdx = 0, isDeleting = false;
const targetEl = document.querySelector('.glitch');

function type() {
    const current = phrases[pIdx];
    if (isDeleting) {
        cIdx--;
    } else {
        cIdx++;
    }
    if (targetEl) {
        targetEl.textContent = current.substring(0, cIdx);
        targetEl.dataset.text = current.substring(0, cIdx);
    }
    let delay = isDeleting ? 60 : 100;
    if (!isDeleting && cIdx === current.length) {
        delay = 2000;
        isDeleting = true;
    } else if (isDeleting && cIdx === 0) {
        isDeleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        delay = 400;
    }
    setTimeout(type, delay);
}
type();

// ──── NAV HAMBURGER ────
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
});

// ──── NAV ACTIVE STATE ────
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a');
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    links.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + current ? 'var(--cyan)' : '';
    });
});

// ──── FORM HANDLER ────
function handleForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.textContent = 'Message Sent! ✓';
    btn.style.background = 'linear-gradient(135deg,#00ff88,#00cc66)';
    setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        e.target.reset();
    }, 3000);
}
