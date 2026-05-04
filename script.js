// --- PHYSICS ENGINE ---
const canvas = document.getElementById('kineticCanvas');
const ctx = canvas.getContext('2d');
let width, height, particles = [];
let mouse = { x: -1000, y: -1000, down: false };

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<150; i++) particles.push(new Particle());
}

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 2 + 1;
        this.color = Math.random() > 0.1 ? '#ffffff' : '#00f2ff';
    }
    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < 300) {
            let force = (300 - dist) / 300;
            if (mouse.down) {
                this.vx += dx * 0.05 * force;
                this.vy += dy * 0.05 * force;
                this.color = '#ff007b';
            } else {
                this.vx += dx * 0.002 * force;
                this.vy += dy * 0.002 * force;
                this.color = dist < 100 ? '#00f2ff' : '#ffffff';
            }
        }
        this.vx *= 0.95; this.vy *= 0.95;
        this.x += this.vx; this.y += this.vy;
        if(this.x < 0 || this.x > width) this.vx *= -1;
        if(this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0,0,width,height);
    particles.forEach(p => { p.update(); p.draw(); });
    for(let i=0; i<particles.length; i++) {
        for(let j=i+1; j<particles.length; j++) {
            let d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
            if(d < 120) {
                ctx.strokeStyle = mouse.down ? 'rgba(255,0,123,0.1)' : 'rgba(0,242,255,0.08)';
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// --- SYSTEM LOGIC ---
let tabs = [{ id: 1, name: "HOME", url: "" }];
let activeTab = 1;

const sys = {
    shift: (id) => {
        activeTab = id;
        sys.render();
    },
    render: () => {
        const grid = document.getElementById('tabGrid');
        grid.innerHTML = '';
        tabs.forEach(t => {
            const el = document.createElement('div');
            el.className = `channel ${t.id === activeTab ? 'active' : ''}`;
            el.textContent = t.name.toUpperCase();
            el.onclick = () => sys.shift(t.id);
            grid.appendChild(el);
        });

        const portal = document.getElementById('portal-mask');
        const target = tabs.find(t => t.id === activeTab);
        
        if(target && target.url) {
            portal.classList.add('active');
            document.getElementById('web-render').innerHTML = `<iframe src="${target.url}"></iframe>`;
        } else {
            portal.classList.remove('active');
            document.getElementById('web-render').innerHTML = '';
        }
    }
};

function closePortal() {
    const tab = tabs.find(t => t.id === activeTab);
    if(tab) tab.url = "";
    sys.render();
}

// --- SENSORS & CLOCK ---
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    document.getElementById('reticle-wrap').style.left = `${e.clientX}px`;
    document.getElementById('reticle-wrap').style.top = `${e.clientY}px`;
});

window.addEventListener('mousedown', () => {
    mouse.down = true;
    document.getElementById('ring-1').style.width = '100px';
    document.getElementById('ring-1').style.height = '100px';
    document.getElementById('ring-1').style.borderColor = 'var(--plasma-pink)';
});

window.addEventListener('mouseup', () => {
    mouse.down = false;
    document.getElementById('ring-1').style.width = '20px';
    document.getElementById('ring-1').style.height = '20px';
    document.getElementById('ring-1').style.borderColor = 'var(--plasma-cyan)';
    particles.forEach(p => {
        p.vx += (Math.random() - 0.5) * 50;
        p.vy += (Math.random() - 0.5) * 50;
    });
});

document.getElementById('cmd').onkeypress = (e) => {
    if(e.key === 'Enter') {
        const val = e.target.value.trim();
        const url = `https://www.google.com/search?q=${encodeURIComponent(val)}&igu=1`;
        tabs[0].url = url;
        sys.render();
        e.target.value = '';
    }
};

function updateClock() {
    const now = new Date();
    const options = { 
        timeZone: 'America/New_York', 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    };
    let nycTime = new Intl.DateTimeFormat('en-US', options).format(now);
    document.getElementById('clock').textContent = nycTime;
}

// STARTUP SEQUENCE
init(); 
animate();
setInterval(updateClock, 1000);
updateClock();
sys.render();
