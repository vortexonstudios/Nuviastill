// Footer year
(function setYear() {
	const el = document.getElementById('yil');
	if (el) el.textContent = new Date().getFullYear();
})();

// Navbar scroll state + progress
(function headerAndProgress() {
	const header = document.querySelector('.site-header');
	const bar = document.querySelector('.scroll-progress');
	const onScroll = () => {
		const y = window.scrollY || document.documentElement.scrollTop;
		if (header) header.classList.toggle('scrolled', y > 8);
		if (bar) {
			const dh = document.documentElement;
			const max = Math.max(1, dh.scrollHeight - dh.clientHeight);
			const ratio = Math.min(1, Math.max(0, y / max));
			bar.style.transform = `scaleX(${ratio})`;
		}
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
})();

// Categories + Hero settings (localStorage)
(function categoriesAndHero() {
	const CATEGORIES_KEY = 'nuviaCategories';
	const HERO_KEY = 'nuviaHero';
	async function fetchJson(url) {
		try {
			const res = await fetch(url, { cache: 'no-store' });
			if (!res.ok) return null;
			return await res.json();
		} catch { return null; }
	}
	function getCategories() {
		try { return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]'); } catch { return []; }
	}
	function saveCategories(list) {
		localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
	}
	function ensureCategoryDefaults() {
		const cur = getCategories();
		if (cur && cur.length) return;
		const defaults = [
			{ id: 'c1', name: 'Koltuk', image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1200&auto=format&fit=crop' },
			{ id: 'c2', name: 'Sehpa', image: 'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=1200&auto=format&fit=crop' },
			{ id: 'c3', name: 'Yemek Masası', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=1200&auto=format&fit=crop' }
		];
		saveCategories(defaults);
	}
	function getHero() {
		try { return JSON.parse(localStorage.getItem(HERO_KEY) || '{}'); } catch { return {}; }
	}
	async function setHeroBg() {
		const hero = document.getElementById('hero');
		if (!hero) return;
		const remote = await fetchJson('data/hero.json');
		const { image } = remote && typeof remote === 'object' ? remote : getHero();
		const fallback = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1920&auto=format&fit=crop';
		const url = image && image.trim() ? image.trim() : fallback;
		hero.style.backgroundImage = `linear-gradient(180deg, rgba(15,17,21,0.0) 0%, rgba(15,17,21,0.55) 70%, rgba(15,17,21,0.85) 100%), url('${url}')`;
		hero.style.backgroundSize = 'cover';
		hero.style.backgroundPosition = 'center';
	}
	async function renderCategories() {
		const grid = document.getElementById('categoriesGrid');
		if (!grid) return;
		const remote = await fetchJson('data/categories.json');
		let cats = Array.isArray(remote) ? remote : null;
		if (!cats) {
			ensureCategoryDefaults();
			cats = getCategories();
		}
		grid.innerHTML = cats.map(c => `
			<a class="category-card reveal" data-tilt data-filter="${c.name}" href="#urunler" aria-label="${c.name} kategorisini görüntüle">
				<img class="reveal-img" loading="lazy" src="${c.image || ''}" alt="">
				<h3>${c.name}${c.name.endsWith('lar') || c.name.endsWith('ler') ? '' : ''}</h3>
			</a>
		`).join('');
		if (window.nuviaEnhance) window.nuviaEnhance(grid);
	}
	async function renderFilters() {
		const wrap = document.getElementById('productFilters');
		if (!wrap) return;
		const remote = await fetchJson('data/categories.json');
		let cats = Array.isArray(remote) ? remote : null;
		if (!cats) {
			cats = getCategories();
		}
		const buttons = [
			`<button class="pf-btn active" data-cat="Hepsi" role="tab" aria-selected="true">Hepsi</button>`,
			...cats.map(c => `<button class="pf-btn" data-cat="${c.name}" role="tab">${c.name}</button>`)
		];
		wrap.innerHTML = buttons.join('');
	}
	async function renderAll() {
		await Promise.all([renderCategories(), renderFilters(), setHeroBg()]);
	}
	if (document.readyState === 'complete') renderAll();
	else window.addEventListener('load', renderAll, { once: true });
	window.addEventListener('storage', (e) => {
		if (e.key === CATEGORIES_KEY || e.key === HERO_KEY) {
			renderAll();
		}
	});
})();

// Products: storage + rendering (localStorage)
(function products() {
	const STORAGE_KEY = 'nuviaProducts';
	let currentCategory = 'Hepsi';
	async function fetchJson(url) {
		try {
			const res = await fetch(url, { cache: 'no-store' });
			if (!res.ok) return null;
			return await res.json();
		} catch { return null; }
	}
	function getProducts() {
		try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
	}
	function saveProducts(items) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	}
	function ensureDefaults() {
		const current = getProducts();
		if (current && current.length) return;
		const defaults = [
			{ id: 'd1', title: 'Aria Koltuk', category: 'Koltuk', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop' },
			{ id: 'd2', title: 'Nero Sehpa', category: 'Sehpa', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200&auto=format&fit=crop' },
			{ id: 'd3', title: 'Alto Koltuk', category: 'Koltuk', image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop' },
			{ id: 'd4', title: 'Vera Sehpa', category: 'Sehpa', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop' },
			{ id: 'd5', title: 'Linea Köşe', category: 'Koltuk', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop' },
			{ id: 'd7', title: 'Massa Yemek Masası', category: 'Yemek Masası', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop' }
		];
		saveProducts(defaults);
	}
	async function render() {
		const grid = document.getElementById('productsGrid');
		if (!grid) return;
		let items = await fetchJson('data/products.json');
		if (!Array.isArray(items)) {
			ensureDefaults();
			items = getProducts();
		}
		items = items
			.filter(p => p.category !== 'Aksesuar')
			.filter(p => currentCategory === 'Hepsi' ? true : (p.category === currentCategory));
		grid.innerHTML = items.map((p) => {
			const encodedName = encodeURIComponent(p.title || '');
			const wa = `https://wa.me/905465330816?text=Merhaba%2C%20${encodedName}%20hakk%C4%B1nda%20bilgi%20almak%20isterim.`;
			return `
				<article class="product-card reveal" data-tilt>
					<img class="reveal-img" loading="lazy" src="${p.image || ''}" alt="${p.title || ''}">
					<h3>${p.title || ''}</h3>
					<div class="cta-row"><a class="btn outline" href="${wa}" target="_blank" rel="noopener" aria-label="${p.title || 'Ürün'} için WhatsApp'tan yaz">WhatsApp</a></div>
				</article>
			`;
		}).join('');
		if (window.nuviaEnhance) window.nuviaEnhance(grid);
	}
	function setFilter(cat) {
		currentCategory = cat;
		const buttons = document.querySelectorAll('.pf-btn');
		buttons.forEach(btn => {
			const active = btn.getAttribute('data-cat') === currentCategory || (currentCategory === 'Hepsi' && btn.getAttribute('data-cat') === 'Hepsi');
			btn.classList.toggle('active', active);
			btn.setAttribute('aria-selected', String(active));
		});
		render();
	}
	// Hook filter buttons
	document.addEventListener('click', (e) => {
		const btn = e.target.closest('.pf-btn');
		if (!btn) return;
		const cat = btn.getAttribute('data-cat');
		if (!cat) return;
		e.preventDefault();
		setFilter(cat);
	});
	// Hook category cards
	document.addEventListener('click', (e) => {
		const card = e.target.closest('.category-card[data-filter]');
		if (!card) return;
		const cat = card.getAttribute('data-filter');
		if (!cat) return;
		// let anchor navigate to #urunler; filter after navigation
		setTimeout(() => setFilter(cat), 0);
	});
	if (document.readyState === 'complete') render();
	else window.addEventListener('load', render, { once: true });
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY) render();
	});
})();

// Mobile nav and smooth scroll
(function navigation() {
	const toggle = document.querySelector('.nav-toggle');
	const menu = document.querySelector('.nav-links');
	if (!toggle || !menu) return;
	function setExpanded(expanded) {
		toggle.setAttribute('aria-expanded', String(expanded));
		menu.setAttribute('aria-expanded', String(expanded));
	}
	toggle.addEventListener('click', () => {
		const expanded = toggle.getAttribute('aria-expanded') === 'true';
		setExpanded(!expanded);
	});
	menu.addEventListener('click', (e) => {
		const target = e.target;
		if (target && target.matches('a[href^="#"]')) {
			setExpanded(false);
		}
	});
	// smooth scroll for internal links
	document.addEventListener('click', (e) => {
		const anchor = e.target.closest('a[href^="#"]');
		if (!anchor) return;
		const id = anchor.getAttribute('href').slice(1);
		const el = document.getElementById(id);
		if (!el) return;
		e.preventDefault();
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
})();

// Hero split-letter intro
(function heroIntro() {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return;
	function splitIntoChars(el) {
		if (!el) return;
		const text = el.textContent || '';
		el.classList.add('split');
		el.textContent = '';
		const frag = document.createDocumentFragment();
		let delay = 0;
		for (const ch of text) {
			const span = document.createElement('span');
			span.className = 'char';
			span.textContent = ch;
			span.style.animationDelay = `${delay}ms`;
			delay += ch === ' ' ? 0 : 28;
			frag.appendChild(span);
		}
		el.appendChild(frag);
		requestAnimationFrame(() => {
			// Start animation on next frame
			el.classList.add('intro-animate');
		});
	}
	splitIntoChars(document.querySelector('.headline'));
})();

// Scroll-triggered reveal + lightweight parallax
(function scrollAnimations() {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Reveal on enter viewport
	const revealEls = document.querySelectorAll('.reveal');
	if (revealEls.length) {
		const io = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('in-view');
					// optional: unobserve after first reveal to keep it simple
					io.unobserve(entry.target);
				}
			}
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

		revealEls.forEach((el, idx) => {
			// Stagger via inline style delay
			el.style.transitionDelay = `${Math.min(idx * 60, 360)}ms`;
			io.observe(el);
		});
		// expose observer for dynamically added elements
		window._nuviaRevealObserver = io;
	}

	// Parallax for images with data-parallax
	if (!reduceMotion) {
		const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
		if (parallaxEls.length) {
			let ticking = false;
			const onScroll = () => {
				if (!ticking) {
					ticking = true;
					requestAnimationFrame(() => {
						const viewportH = window.innerHeight;
						for (const el of parallaxEls) {
							const rect = el.getBoundingClientRect();
							const speed = parseFloat(el.getAttribute('data-speed') || '0.2');
							// progress: element center vs viewport center
							const elCenter = rect.top + rect.height / 2;
							const viewportCenter = viewportH / 2;
							const offset = (elCenter - viewportCenter) / viewportH; // -1..1
							const translateY = offset * speed * 120; // px
							el.style.transform = `translate3d(0, ${translateY}px, 0)`;
						}
						ticking = false;
					});
				}
			};
			window.addEventListener('scroll', onScroll, { passive: true });
			window.addEventListener('resize', onScroll);
			// initial
			onScroll();
		}
	}
})();

// Basic "add to cart" feedback
// (removed) Sepet davranışı kaldırıldı; site sadece inceleme ve iletişim içindir.

// Tilt hover for cards
(function tiltHover() {
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const finePointer = window.matchMedia('(pointer: fine)').matches;
	if (prefersReduced || !finePointer) return;
	const maxRotate = 6; // deg
	const elements = document.querySelectorAll('[data-tilt]');
	elements.forEach((el) => {
		let rafId = 0;
		function onMove(e) {
			const rect = el.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;  // 0..1
			const y = (e.clientY - rect.top) / rect.height;  // 0..1
			const rotY = (x - 0.5) * maxRotate * 2; // -max..max
			const rotX = (0.5 - y) * maxRotate * 2;
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
				el.classList.add('tilting');
			});
		}
		function onLeave() {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				el.style.transform = '';
				el.classList.remove('tilting');
			});
		}
		el.addEventListener('mousemove', onMove);
		el.addEventListener('mouseleave', onLeave);
	});
})();

// Button ripple micro-interaction
(function buttonRipple() {
	const buttons = document.querySelectorAll('.btn');
	buttons.forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const rect = btn.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			btn.style.setProperty('--rx', `${x}px`);
			btn.style.setProperty('--ry', `${y}px`);
			btn.classList.remove('ripple');
			// Force reflow to restart animation
			// eslint-disable-next-line no-unused-expressions
			btn.offsetHeight;
			btn.classList.add('ripple');
			setTimeout(() => btn.classList.remove('ripple'), 500);
		});
	});
})();

// Dynamic enhancement initializer (reveal + tilt) for injected content
window.nuviaEnhance = function(root) {
	try {
		const container = root || document;
		const io = window._nuviaRevealObserver;
		if (io) {
			const newReveals = container.querySelectorAll('.reveal:not(.in-view)');
			newReveals.forEach((el) => io.observe(el));
		}
		const finePointer = window.matchMedia('(pointer: fine)').matches;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (finePointer && !prefersReduced) {
			const els = container.querySelectorAll('[data-tilt]');
			els.forEach((el) => {
				if (el.dataset.tiltBound) return;
				el.dataset.tiltBound = '1';
				let rafId = 0;
				function onMove(e) {
					const rect = el.getBoundingClientRect();
					const x = (e.clientX - rect.left) / rect.width;
					const y = (e.clientY - rect.top) / rect.height;
					const rotY = (x - 0.5) * 12;
					const rotX = (0.5 - y) * 12;
					cancelAnimationFrame(rafId);
					rafId = requestAnimationFrame(() => {
						el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
						el.classList.add('tilting');
					});
				}
				function onLeave() {
					cancelAnimationFrame(rafId);
					rafId = requestAnimationFrame(() => {
						el.style.transform = '';
						el.classList.remove('tilting');
					});
				}
				el.addEventListener('mousemove', onMove);
				el.addEventListener('mouseleave', onLeave);
			});
		}
	} catch {}
};

