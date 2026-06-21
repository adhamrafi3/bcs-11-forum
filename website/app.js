/* ============================
   BCS 11th Batch Forum — App
   ============================ */

document.addEventListener('DOMContentLoaded', () => {
    // State
    let officers = [];
    let filteredOfficers = [];
    let currentPage = 1;
    const perPage = 12;
    let currentCadre = 'all';
    let searchQuery = '';

    // Cadre display info
    const cadreInfo = {
        'Administration': { bn: 'প্রশাসন', icon: '🏛️' },
        'Food': { bn: 'খাদ্য', icon: '🌾' },
        'Foreign Affairs': { bn: 'পররাষ্ট্র', icon: '🌍' },
        'Tax/Revenue': { bn: 'কর', icon: '💰' },
        'Postal': { bn: 'ডাক', icon: '📮' },
        'Customs & Excise': { bn: 'শুল্ক ও আবগারি', icon: '🛃' },
        'Economic': { bn: 'ইকোনমিক', icon: '📊' },
        'Judicial': { bn: 'বিচার', icon: '⚖️' },
        'Railway': { bn: 'রেলওয়ে', icon: '🚂' },
        'Agriculture': { bn: 'কৃষি', icon: '🌿' },
        'Fisheries': { bn: 'মৎস্য', icon: '🐟' },
        'Health': { bn: 'স্বাস্থ্য', icon: '🏥' },
        'Health (Dental)': { bn: 'স্বাস্থ্য (ডেন্টাল)', icon: '🦷' },
        'General Education': { bn: 'সাধারণ শিক্ষা', icon: '📚' },
    };

    // ========================
    // Initialize
    // ========================
    init();

    async function init() {
        createParticles();
        setupEventListeners();
        await loadData();
        setupIntersectionObserver();
        hidePreloader();
    }

    // ========================
    // Load Data
    // ========================
    async function loadData() {
        try {
            const res = await fetch('officers.json');
            officers = await res.json();
            filteredOfficers = [...officers];
            renderStats();
            renderCadreChips();
            renderOfficers();
        } catch (err) {
            console.error('Failed to load officers data:', err);
        }
    }

    // ========================
    // Preloader
    // ========================
    function hidePreloader() {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            preloader.classList.add('hidden');
            animateHeroStats();
        }, 800);
    }

    // ========================
    // Particles
    // ========================
    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            particle.style.width = (Math.random() * 4 + 2) + 'px';
            particle.style.height = particle.style.width;
            
            if (Math.random() > 0.7) {
                particle.style.background = 'var(--accent)';
            }
            
            container.appendChild(particle);
        }
    }

    // ========================
    // Hero Stats Animation
    // ========================
    function animateHeroStats() {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }

    // ========================
    // Stats Section
    // ========================
    function renderStats() {
        const grid = document.getElementById('statsGrid');
        if (!grid) return;

        const cadreCount = {};
        officers.forEach(o => {
            cadreCount[o.cadre_en] = (cadreCount[o.cadre_en] || 0) + 1;
        });

        const sorted = Object.entries(cadreCount).sort((a, b) => b[1] - a[1]);
        
        grid.innerHTML = sorted.map(([cadre, count], idx) => {
            const info = cadreInfo[cadre] || { bn: cadre, icon: '📋' };
            return `
                <div class="stat-card" data-animate="fade-up" data-delay="${idx * 50}" onclick="filterByCadre('${cadre}')">
                    <div class="stat-card-icon">${info.icon}</div>
                    <div class="stat-card-number">${count}</div>
                    <div class="stat-card-label">${info.bn}</div>
                    <div class="stat-card-label-en">${cadre}</div>
                </div>
            `;
        }).join('');

        // Re-observe new elements
        const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
        grid.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    }

    // Make filterByCadre available globally
    window.filterByCadre = function(cadre) {
        currentCadre = cadre;
        currentPage = 1;
        applyFilters();
        
        // Update chips
        document.querySelectorAll('.chip').forEach(c => {
            c.classList.toggle('active', c.dataset.cadre === cadre);
        });

        // Scroll to officers section
        document.getElementById('officers').scrollIntoView({ behavior: 'smooth' });
    };

    // ========================
    // Cadre Filter Chips
    // ========================
    function renderCadreChips() {
        const container = document.getElementById('filterChips');
        if (!container) return;

        const cadreCount = {};
        officers.forEach(o => {
            cadreCount[o.cadre_en] = (cadreCount[o.cadre_en] || 0) + 1;
        });

        const sorted = Object.entries(cadreCount).sort((a, b) => b[1] - a[1]);

        // Update total count
        document.getElementById('totalCount').textContent = officers.length;

        // Add cadre chips
        sorted.forEach(([cadre, count]) => {
            const info = cadreInfo[cadre] || { bn: cadre, icon: '📋' };
            const chip = document.createElement('button');
            chip.className = 'chip';
            chip.dataset.cadre = cadre;
            chip.innerHTML = `
                <span class="chip-icon">${info.icon}</span>
                <span>${info.bn}</span>
                <span class="chip-count">${count}</span>
            `;
            chip.addEventListener('click', () => {
                currentCadre = cadre;
                currentPage = 1;
                applyFilters();
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
            container.appendChild(chip);
        });

        // All cadre chip click handler
        container.querySelector('[data-cadre="all"]').addEventListener('click', () => {
            currentCadre = 'all';
            currentPage = 1;
            applyFilters();
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            container.querySelector('[data-cadre="all"]').classList.add('active');
        });
    }

    // ========================
    // Filter & Search
    // ========================
    function applyFilters() {
        filteredOfficers = officers.filter(o => {
            const matchesCadre = currentCadre === 'all' || o.cadre_en === currentCadre;
            const matchesSearch = !searchQuery || 
                (o.email && o.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (o.phone && o.phone.includes(searchQuery)) ||
                (o.cadre_en && o.cadre_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (o.cadre_bn && o.cadre_bn.includes(searchQuery)) ||
                (o.id && o.id.includes(searchQuery));
            return matchesCadre && matchesSearch;
        });

        renderOfficers();
    }

    // ========================
    // Render Officers
    // ========================
    function renderOfficers() {
        const grid = document.getElementById('officersGrid');
        const noResults = document.getElementById('noResults');
        const pagination = document.getElementById('pagination');

        if (!grid) return;

        if (filteredOfficers.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            pagination.innerHTML = '';
            return;
        }

        noResults.style.display = 'none';

        const totalPages = Math.ceil(filteredOfficers.length / perPage);
        const start = (currentPage - 1) * perPage;
        const pageOfficers = filteredOfficers.slice(start, start + perPage);

        grid.innerHTML = pageOfficers.map((o, idx) => {
            const info = cadreInfo[o.cadre_en] || { bn: o.cadre_en, icon: '📋' };
            const photoHtml = o.photo 
                ? `<img src="${o.photo}" alt="Photo" class="officer-photo" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'officer-photo-placeholder\\'>${info.icon}</div>'">`
                : `<div class="officer-photo-placeholder">${info.icon}</div>`;

            return `
                <div class="officer-card" style="animation-delay: ${idx * 50}ms" data-page="${o.page}">
                    <div class="officer-card-header">
                        ${photoHtml}
                        <div class="officer-info">
                            <h3>সদস্য #${o.sl}</h3>
                            <span class="officer-cadre-badge">
                                <span>${info.icon}</span>
                                ${info.bn}
                            </span>
                        </div>
                    </div>
                    <div class="officer-details">
                        ${o.email ? `
                        <div class="officer-detail">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <a href="mailto:${o.email}">${o.email}</a>
                        </div>` : ''}
                        ${o.phone ? `
                        <div class="officer-detail">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                            </svg>
                            <a href="tel:${o.phone}">${o.phone}</a>
                        </div>` : ''}
                        <div class="officer-detail">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                            </svg>
                            <span>${info.bn} ক্যাডার</span>
                        </div>
                    </div>
                    <div class="officer-card-footer">
                        <button class="view-profile-btn" onclick="openProfile(${o.page})">
                            <span>বিস্তারিত দেখুন</span>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                        <span class="officer-sl">ID: ${o.id}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Render pagination
        renderPagination(totalPages);
    }

    // ========================
    // Pagination
    // ========================
    function renderPagination(totalPages) {
        const container = document.getElementById('pagination');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
            </svg>
        </button>`;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        startPage = Math.max(1, endPage - maxVisible + 1);

        if (startPage > 1) {
            html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="page-btn" style="border:none;cursor:default">...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="page-btn" style="border:none;cursor:default">...</span>`;
            html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
        }

        // Next button
        html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </button>`;

        container.innerHTML = html;
    }

    window.goToPage = function(page) {
        currentPage = page;
        renderOfficers();
        document.getElementById('officers').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ========================
    // Profile Modal
    // ========================
    window.openProfile = function(page) {
        const modal = document.getElementById('profileModal');
        const body = document.getElementById('modalBody');
        
        body.innerHTML = `<img src="images/profiles/page_${page}.png" alt="Officer Profile - Page ${page}" loading="lazy">`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeModal() {
        const modal = document.getElementById('profileModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ========================
    // Gallery
    // ========================
    function renderGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        // Front matter pages and memory/album pages
        const frontPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        const memoryPages = [];
        for (let i = 277; i <= 320; i++) {
            memoryPages.push(i);
        }
        const allPages = [...frontPages, ...memoryPages];

        grid.innerHTML = allPages.map((page, idx) => {
            const label = page <= 14 ? `প্রচ্ছদ — পৃষ্ঠা ${page}` : `স্মৃতির অ্যালবাম — পৃষ্ঠা ${page}`;
            return `
            <div class="gallery-item" onclick="openGalleryImage(${page})" data-animate="fade-up" data-delay="${(idx % 4) * 50}">
                <img src="images/pages/page_${page}.png" alt="${label}" loading="${idx < 8 ? 'eager' : 'lazy'}"
                     onerror="this.parentElement.remove()">
                <div class="gallery-item-overlay">
                    <span>${label}</span>
                </div>
            </div>
            `;
        }).join('');

        // Re-observe gallery items for animation
        const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
        grid.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    }

    window.openGalleryImage = function(page) {
        const modal = document.getElementById('profileModal');
        const body = document.getElementById('modalBody');
        body.innerHTML = `<img src="images/pages/page_${page}.png" alt="Memory Page ${page}" loading="lazy">`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // ========================
    // Event Listeners
    // ========================
    function setupEventListeners() {
        // Navbar scroll
        window.addEventListener('scroll', handleScroll);

        // Mobile nav toggle
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile nav on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            clearBtn.style.display = searchQuery ? 'flex' : 'none';
            currentPage = 1;
            applyFilters();
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearBtn.style.display = 'none';
            currentPage = 1;
            applyFilters();
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('profileModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });

        // Escape key closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Back to top
        const backToTop = document.getElementById('backToTop');
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Render gallery after initial load
        setTimeout(renderGallery, 100);
    }

    // ========================
    // Scroll Handler
    // ========================
    function handleScroll() {
        const navbar = document.getElementById('navbar');
        const backToTop = document.getElementById('backToTop');
        const scrollY = window.scrollY;

        // Navbar
        navbar.classList.toggle('scrolled', scrollY > 50);

        // Back to top
        backToTop.classList.toggle('visible', scrollY > 400);

        // Active nav link
        const sections = document.querySelectorAll('.section, .hero');
        let currentSection = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (scrollY >= top) {
                currentSection = section.id;
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === currentSection);
        });
    }

    // ========================
    // Intersection Observer
    // ========================
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver(handleIntersect, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('[data-animate]').forEach(el => {
            observer.observe(el);
        });
    }

    function handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay || 0);
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
            }
        });
    }
});
