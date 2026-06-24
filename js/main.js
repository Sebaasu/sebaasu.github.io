/**
 * Portfolio Main Logic & Circuit Canvas Animation
 * Gabriel Sebastian Herrera Tola - 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize current year in footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 1. Interactive PCB/Circuit Canvas Background
    initCircuitBackground();

    // 2. Load Portfolio Data
    if (typeof PORTFOLIO_DATA !== 'undefined') {
        populatePortfolio(PORTFOLIO_DATA);
    } else {
        console.error("PORTFOLIO_DATA not found. Make sure js/data.js is loaded first.");
    }

    // 3. Setup Navigation & Menu toggles
    setupNavigation();

    // 4. Setup Project Details Modal
    setupModal();

    // 5. Setup Contact Form
    setupContactForm();
});

/* ==========================================================================
   CIRCUIT / PCB GRID CANVAS ANIMATION
   ========================================================================== */
function initCircuitBackground() {
    const canvas = document.getElementById('circuit-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let nodes = [];
    let connections = [];
    const gridSize = 60; // Spacing for grid nodes
    const mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        generateCircuitGrid();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Node {
        constructor(x, y, isStatic = true) {
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.isStatic = isStatic;
            this.radius = Math.random() * 2 + 1.5;
            this.brightness = Math.random() * 0.3 + 0.2;
            this.pulseTime = Math.random() * 100;
        }

        update() {
            this.pulseTime += 0.02;
            
            // Mouse interaction (slight displacement representing induction)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    // Move slightly away from mouse
                    this.x -= (dx / dist) * force * 15;
                    this.y -= (dy / dist) * force * 15;
                } else {
                    // Return to base position
                    this.x += (this.baseX - this.x) * 0.05;
                    this.y += (this.baseY - this.y) * 0.05;
                }
            } else {
                this.x += (this.baseX - this.x) * 0.05;
                this.y += (this.baseY - this.y) * 0.05;
            }
        }

        draw() {
            const glow = Math.sin(this.pulseTime) * 0.2 + 0.8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${this.brightness * glow})`;
            ctx.fill();

            // Solder pad ring effect
            if (this.radius > 2.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 240, 255, ${this.brightness * 0.3})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    class CircuitPulse {
        constructor(startNode, endNode, speed = 1.5) {
            this.start = startNode;
            this.end = endNode;
            this.speed = speed;
            this.progress = Math.random(); // Start at random point to distribute pulses
            this.color = Math.random() > 0.4 ? 'var(--primary)' : 'var(--secondary)';
        }

        update() {
            this.progress += 0.005 * this.speed;
            if (this.progress >= 1) {
                this.progress = 0;
            }
        }

        draw() {
            // Linear interpolation
            const currX = this.start.x + (this.end.x - this.start.x) * this.progress;
            const currY = this.start.y + (this.end.y - this.start.y) * this.progress;

            ctx.beginPath();
            ctx.arc(currX, currY, 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow
        }
    }

    function generateCircuitGrid() {
        nodes = [];
        connections = [];
        const pulses = [];

        const cols = Math.ceil(width / gridSize) + 1;
        const rows = Math.ceil(height / gridSize) + 1;

        // 1. Create nodes on a grid with slight random displacements (making it look hand-routed)
        const grid = [];
        for (let c = 0; c < cols; c++) {
            grid[c] = [];
            for (let r = 0; r < rows; r++) {
                const offsetX = (Math.random() - 0.5) * (gridSize * 0.4);
                const offsetY = (Math.random() - 0.5) * (gridSize * 0.4);
                const x = c * gridSize + offsetX;
                const y = r * gridSize + offsetY;
                const node = new Node(x, y);
                nodes.push(node);
                grid[c][r] = node;
            }
        }

        // 2. Connect grid points (orthogonal connections for PCB layout style)
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                // Connect to right neighbor
                if (c < cols - 1 && Math.random() > 0.55) {
                    connections.push({ from: grid[c][r], to: grid[c + 1][r] });
                }
                // Connect to bottom neighbor
                if (r < rows - 1 && Math.random() > 0.55) {
                    connections.push({ from: grid[c][r], to: grid[c][r + 1] });
                }
                // Diagonal connection (typical 45-degree angle in PCB traces)
                if (c < cols - 1 && r < rows - 1 && Math.random() > 0.8) {
                    connections.push({ from: grid[c][r], to: grid[c + 1][r + 1] });
                }
            }
        }

        // 3. Create a pool of pulses running along existing connections
        const activeConnections = connections.slice(0, Math.floor(connections.length * 0.15));
        window.activePulses = activeConnections.map(conn => new CircuitPulse(conn.from, conn.to, Math.random() * 1.5 + 0.8));
    }

    generateCircuitGrid();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw grid traces (thin circuit wires)
        ctx.beginPath();
        for (let i = 0; i < connections.length; i++) {
            const conn = connections[i];
            ctx.moveTo(conn.from.x, conn.from.y);
            ctx.lineTo(conn.to.x, conn.to.y);
        }
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Highlight traces close to the mouse
        if (mouse.x !== null && mouse.y !== null) {
            ctx.beginPath();
            for (let i = 0; i < connections.length; i++) {
                const conn = connections[i];
                const d1 = Math.sqrt((mouse.x - conn.from.x)**2 + (mouse.y - conn.from.y)**2);
                const d2 = Math.sqrt((mouse.x - conn.to.x)**2 + (mouse.y - conn.to.y)**2);
                if (d1 < mouse.radius && d2 < mouse.radius) {
                    ctx.moveTo(conn.from.x, conn.from.y);
                    ctx.lineTo(conn.to.x, conn.to.y);
                }
            }
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Update and draw nodes
        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        // Update and draw pulses
        if (window.activePulses) {
            window.activePulses.forEach(pulse => {
                pulse.update();
                pulse.draw();
            });
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   POPULATE PORTFOLIO CONTENT FROM DATA.JS
   ========================================================================= */
function populatePortfolio(data) {
    // --- POPULATE ABOUT / INTERESTS ---
    const interestsList = document.getElementById('interests-list');
    if (interestsList && data.intereses && data.intereses.intereses) {
        const areas = data.intereses.intereses.areas_de_interes || [];
        const devMult = data.intereses.intereses.desarrollo_multidisciplinario || [];
        const allInterests = [...areas, ...devMult, "Física Teórica", "Sistemas Embebidos"];
        
        interestsList.innerHTML = '';
        [...new Set(allInterests)].forEach(item => {
            const badge = document.createElement('span');
            badge.className = 'tag-badge';
            badge.textContent = item;
            interestsList.appendChild(badge);
        });
    }

    // --- POPULATE SKILLS ---
    if (data.habilidades) {
        // Categorized Skills mappings
        const categories = {
            'lenguajes': {
                list: data.habilidades.lenguajes_y_hdl || [],
                elementId: 'skills-lenguajes-list',
                icon: 'fa-solid fa-code',
                proficiency: {
                    'C++': 90, 'Java': 75, 'Python': 85, 'VHDL': 90, 'Verilog': 90,
                    'Arduino': 95, 'LaTeX': 85, 'AHPL': 80, 'CUPL': 80, 'Assembler': 95,
                    'Ladder/STL': 85, 'Structured Text (ST)': 85
                }
            },
            'hardware': {
                list: data.habilidades.plataformas_hardware || [],
                elementId: 'skills-hardware-list',
                icon: 'fa-solid fa-microchip',
                proficiency: {
                    'Arduino': 95, 'ESP32': 85, 'PIC': 80,
                    'FPGA (Quartus/ISE/Gowin)': 90, 'PLC Siemens S7-200': 85
                }
            },
            'software': {
                list: data.habilidades.herramientas_software || [],
                elementId: 'skills-software-list',
                icon: 'fa-solid fa-screwdriver-wrench',
                proficiency: {
                    'LTSpice': 85, 'Proteus': 90, 'Scilab': 80, 'Octave': 80,
                    'MATLAB': 85, 'Logisim': 90, 'Quartus': 85, 'Zinjai': 80,
                    'Gowin IDE': 85, 'Step 7-Micro/WIN (Siemens)': 85,
                    'OpenPLC Runtime': 80
                }
            },
            'control': {
                list: data.habilidades.simulacion_y_diseno || [],
                elementId: 'skills-control-list',
                icon: 'fa-solid fa-chart-line',
                proficiency: {
                    'Sistemas digitales': 90, 'Sistemas de control': 90,
                    'Circuitos analógicos': 80, 'Telecomunicaciones básicas': 75,
                    'Sistemas SCADA y HMI': 85, 'Automatización de Procesos Neumáticos': 85,
                    'Redes de Comunicación Industrial (Modbus TCP, RS-485)': 85,
                    'Gemelos Digitales (Digital Twins)': 80, 'Redes de Petri': 85
                }
            }
        };

        // Render each category
        Object.keys(categories).forEach(catName => {
            const cat = categories[catName];
            const listEl = document.getElementById(cat.elementId);
            if (!listEl) return;

            listEl.innerHTML = '';
            cat.list.forEach(skillName => {
                const percent = cat.proficiency[skillName] || 75;
                const card = document.createElement('div');
                card.className = 'skill-card';
                card.innerHTML = `
                    <div class="skill-icon-wrapper">
                        <i class="${cat.icon}"></i>
                    </div>
                    <span class="skill-name">${skillName}</span>
                    <div class="skill-level-container">
                        <div class="skill-level-lbl">
                            <span>Habilidad</span>
                            <span>${percent}%</span>
                        </div>
                        <div class="skill-level-bar">
                            <div class="skill-level-progress" style="width: ${percent}%"></div>
                        </div>
                    </div>
                `;
                listEl.appendChild(card);
            });
        });
    }

    // --- POPULATE PROJECTS ---
    if (data.proyectos && data.proyectos.proyectos) {
        const projectsList = document.getElementById('projects-list');
        if (projectsList) {
            projectsList.innerHTML = '';
            
            data.proyectos.proyectos.forEach(proj => {
                const card = document.createElement('article');
                
                // Determine categorization filter class
                let filterClass = 'hardware-software';
                if (['vsrg_piano_8086', 'simulador_2do_orden_8086', 'simple_paint_8086'].includes(proj.id)) {
                    filterClass = 'bajo-nivel';
                } else if (['xk335b_digital_twin', 'xk335b_scada'].includes(proj.id)) {
                    filterClass = 'automatizacion';
                }

                card.className = `project-card filter-item ${filterClass}`;
                card.setAttribute('data-id', proj.id);

                const toolsHTML = proj.herramientas.map(t => `<span class="tool-badge">${t}</span>`).join('');
                
                card.innerHTML = `
                    <div class="project-card-header">
                        <span class="project-type-badge">${proj.tipo}</span>
                        <div class="project-meta-icons">
                            <i class="fa-solid fa-laptop-code"></i>
                        </div>
                    </div>
                    <div class="project-card-body">
                        <h3 class="project-title">${proj.nombre}</h3>
                        <p class="project-desc">${proj.descripcion}</p>
                        <div class="project-tools">
                            ${toolsHTML}
                        </div>
                        <button class="btn-card-action view-project-details-btn" data-id="${proj.id}">
                            <i class="fa-solid fa-circle-info"></i> Detalles del Proyecto
                        </button>
                    </div>
                `;
                projectsList.appendChild(card);
            });

            // Set up Project Filtering Animation
            setupProjectFilters();
        }
    }

    // --- POPULATE ONLINE GITHUB REPOS ---
    if (data.contacto && data.contacto.proyectos_online) {
        const reposList = document.getElementById('github-repos-list');
        if (reposList) {
            reposList.innerHTML = '';
            data.contacto.proyectos_online.forEach(repo => {
                const card = document.createElement('div');
                card.className = 'repo-card';
                
                // Map languages based on repo characteristics
                let lang = 'Assembly';
                let langColor = '#f34b7d';
                if (repo.nombre.toLowerCase().includes('web') || repo.nombre.toLowerCase().includes('bitstream')) {
                    lang = 'JavaScript';
                    langColor = '#f1e05a';
                } else if (repo.nombre.toLowerCase().includes('asm') || repo.nombre.toLowerCase().includes('8086')) {
                    lang = 'Assembly';
                    langColor = '#6e4c13';
                } else if (repo.nombre.toLowerCase().includes('bitstream')) {
                    lang = 'JavaScript';
                    langColor = '#f1e05a';
                }

                card.innerHTML = `
                    <div class="repo-icon-header">
                        <i class="fa-regular fa-folder-open"></i>
                        <a href="${repo.url}" target="_blank" rel="noopener" class="repo-github-link" aria-label="Ver código en GitHub">
                            <i class="fa-brands fa-github"></i>
                        </a>
                    </div>
                    <h4 class="repo-name">${repo.nombre}</h4>
                    <p class="repo-desc">${repo.descripcion}</p>
                    <div class="repo-footer">
                        <span class="repo-lang">
                            <span class="repo-lang-dot" style="background-color: ${langColor}"></span>
                            ${lang}
                        </span>
                        <a href="${repo.url}" target="_blank" rel="noopener" class="timeline-file-link">
                            Repo <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                `;
                reposList.appendChild(card);
            });
        }
    }

    // --- POPULATE TIMELINE (EDUCATION & EXPERIENCE) ---
    // Education
    const eduTimeline = document.getElementById('education-timeline');
    if (eduTimeline && data.educacion && data.educacion.universitaria) {
        eduTimeline.innerHTML = '';
        data.educacion.universitaria.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'timeline-item';
            
            const recognitionsHTML = item.reconocimientos ? 
                item.reconocimientos.map(r => `<li><i class="fa-solid fa-trophy text-secondary"></i> <strong>${r}</strong></li>`).join('') : '';
            
            const activitiesHTML = item.actividades_institucionales ?
                item.actividades_institucionales.map(a => `
                    <li><strong>${a.rol}:</strong> ${a.descripcion}</li>
                `).join('') : '';

            itemEl.innerHTML = `
                <div class="timeline-date">${item.periodo}</div>
                <h4 class="timeline-title">${item.titulo}</h4>
                <div class="timeline-subtitle">${item.institucion} • ${item.facultad}</div>
                <p class="timeline-desc">Mención: <strong>${item.mencion}</strong></p>
                ${recognitionsHTML || activitiesHTML ? `
                    <ul class="timeline-list">
                        ${recognitionsHTML}
                        ${activitiesHTML}
                    </ul>
                ` : ''}
            `;
            eduTimeline.appendChild(itemEl);
        });
    }

    // Certificates
    const certList = document.getElementById('certificates-list');
    if (certList && data.certificaciones && data.certificaciones.certificados) {
        certList.innerHTML = '';
        data.certificaciones.certificados.forEach(cert => {
            const item = document.createElement('div');
            item.className = 'cert-item';
            
            const statusHTML = cert.estado ? `<span class="cert-status">${cert.estado}</span>` : '';
            
            item.innerHTML = `
                <div class="cert-info">
                    <span class="cert-title">${cert.titulo}</span>
                    <span class="cert-inst">${cert.institucion} ${cert.periodo !== '...' ? `• ${cert.periodo}` : ''}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${statusHTML}
                </div>
            `;
            certList.appendChild(item);
        });
    }

    // Experience
    const expTimeline = document.getElementById('experience-timeline');
    if (expTimeline && data.experiencia && data.experiencia.trabajos) {
        expTimeline.innerHTML = '';
        data.experiencia.trabajos.forEach(job => {
            const itemEl = document.createElement('div');
            itemEl.className = 'timeline-item';
            
            const achievementsHTML = job.logros ?
                job.logros.map(l => `<li>${l}</li>`).join('') : '';

            itemEl.innerHTML = `
                <div class="timeline-date">${job.periodo}</div>
                <h4 class="timeline-title">${job.cargo}</h4>
                <div class="timeline-subtitle">${job.tipo}</div>
                <p class="timeline-desc">${job.descripcion}</p>
                ${achievementsHTML ? `
                    <ul class="timeline-list">
                        ${achievementsHTML}
                    </ul>
                ` : ''}
            `;
            expTimeline.appendChild(itemEl);
        });
    }

    // --- POPULATE CONTACT DETAILS ---
    if (data.contacto && data.contacto.datos_personales) {
        const dp = data.contacto.datos_personales;
        
        const mailEl = document.getElementById('contact-email');
        if (mailEl) {
            mailEl.textContent = dp.correo;
            mailEl.href = `mailto:${dp.correo}`;
        }
        
        const phoneEl = document.getElementById('contact-phone');
        if (phoneEl) {
            phoneEl.textContent = dp.telefono;
            phoneEl.href = `tel:${dp.telefono.replace(/\s+/g, '')}`;
        }

        const addrEl = document.getElementById('contact-address');
        if (addrEl) {
            // Mostrar solo ciudad y país por privacidad
            const parts = dp.direccion.split(',');
            addrEl.textContent = parts.length >= 2 ? parts.slice(-2).join(',').trim() : dp.direccion;
        }
    }
}

/* ==========================================================================
   NAVIGATION & ACTIVE LINKS CONTROLLER
   ========================================================================== */
function setupNavigation() {
    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar shrink on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile navigation toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isActive = navMenu.classList.toggle('active');
            navToggle.classList.toggle('hamburger-active');
            navToggle.setAttribute('aria-expanded', isActive);
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('hamburger-active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Skills Category Tabs Controller
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const activePanel = document.getElementById(`panel-${targetTab}`);
            if (activePanel) activePanel.classList.add('active');
        });
    });

    // IntersectionObserver to highlight current section link
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        threshold: 0.25,
        rootMargin: "-80px 0px 0px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   PROJECT FILTERING CONTROLLER
   ========================================================================== */
function setupProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterItems = document.querySelectorAll('.filter-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            // Toggle active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter items with visual transitions
            filterItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'flex';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                } else {
                    if (item.classList.contains(filterValue)) {
                        item.style.display = 'flex';
                        setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.9)';
                        setTimeout(() => { item.style.display = 'none'; }, 200);
                    }
                }
            });
        });
    });
}

/* ==========================================================================
   PROJECT MODAL POPUP CONTROLLER
   ========================================================================== */
function setupModal() {
    const modal = document.getElementById('project-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const closeBtn = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body');

    // Delegated click handling for project details buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-project-details-btn');
        if (!btn) return;

        const projectId = btn.getAttribute('data-id');
        openProjectModal(projectId);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Escape key closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function openProjectModal(id) {
        if (!PORTFOLIO_DATA || !PORTFOLIO_DATA.proyectos || !PORTFOLIO_DATA.proyectos.proyectos) return;
        
        const project = PORTFOLIO_DATA.proyectos.proyectos.find(p => p.id === id);
        if (!project) return;

        // Render project details into modal body
        const toolsHTML = project.herramientas.map(t => `<span class="tool-badge">${t}</span>`).join('');
        
        modalBody.innerHTML = `
            <div class="modal-project-header">
                <span class="project-type-badge">${project.tipo}</span>
                <h3 class="modal-project-title">${project.nombre}</h3>
                <div class="modal-project-meta">
                    <span class="modal-meta-item"><i class="fa-solid fa-tag"></i> ID: ${project.id}</span>
                </div>
            </div>
            
            <h4 class="modal-section-title"><i class="fa-solid fa-circle-info"></i> Descripción del Proyecto</h4>
            <p class="modal-desc-p">${project.descripcion}</p>
            
            <h4 class="modal-section-title"><i class="fa-solid fa-screwdriver-wrench"></i> Herramientas Clave</h4>
            <div class="modal-tools-list">${toolsHTML}</div>
            
            <div class="modal-result-box">
                <div class="modal-result-lbl">
                    <i class="fa-solid fa-square-check"></i> Resultado y Logro
                </div>
                <div class="modal-result-txt">${project.resultado}</div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Stop background scrolling
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
}

/* ==========================================================================
   CONTACT FORM MICRO-INTERACTIONS
   ========================================================================== */
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status');
    const submitBtn = document.getElementById('form-submit-btn');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Visual feedback during "sending"
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Transmitiendo datos...`;

        // Simulate network delay (1.5 seconds)
        setTimeout(() => {
            statusMsg.style.display = 'block';
            statusMsg.className = 'form-status-msg success';
            statusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> ¡Mensaje transmitido con éxito! (Simulado: El canal funciona correctamente)`;

            // Reset form
            form.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                statusMsg.style.display = 'none';
            }, 6000);
        }, 1500);
    });
}
