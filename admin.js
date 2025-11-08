// Simple client-side admin (demo only; not secure for production)
(function admin() {
	const STORAGE_KEY = 'nuviaProducts';
	const CATEGORIES_KEY = 'nuviaCategories';
	const HERO_KEY = 'nuviaHero';
	const ADMIN_KEY = 'nuviaAdmin';
	const PASS = 'nuvia'; // demo password

	function getProducts() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		} catch {
			return [];
		}
	}
	function saveProducts(list) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
	}
	function uid() {
		return Math.random().toString(36).slice(2, 9);
	}
	// Categories store
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
	ensureCategoryDefaults();

	// Auth
	const loginSection = document.getElementById('adminLogin');
	const panelSection = document.getElementById('adminPanel');
	const loginBtn = document.getElementById('loginBtn');
	const passwordInput = document.getElementById('passwordInput');
	const loginError = document.getElementById('loginError');

	function updateAuthUI() {
		const ok = localStorage.getItem(ADMIN_KEY) === '1';
		loginSection.hidden = !!ok;
		panelSection.hidden = !ok;
	}
	updateAuthUI();

	loginBtn.addEventListener('click', () => {
		if (passwordInput.value.trim() === PASS) {
			localStorage.setItem(ADMIN_KEY, '1');
			updateAuthUI();
		} else {
			loginError.hidden = false;
			setTimeout(() => (loginError.hidden = true), 1500);
		}
	});

	// Form + table
	const form = document.getElementById('productForm');
	const title = document.getElementById('title');
	const category = document.getElementById('category');
	const image = document.getElementById('image');
	const description = document.getElementById('description');
	const editId = document.getElementById('editId');
	const resetBtn = document.getElementById('resetBtn');
	const tableBody = document.querySelector('#productsTable tbody');
	const emptyState = document.getElementById('emptyState');

	// Populate category select from store
	function populateCategorySelect() {
		const cats = getCategories();
		category.innerHTML = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
	}
	populateCategorySelect();

	function renderTable() {
		const items = getProducts();
		tableBody.innerHTML = '';
		if (!items.length) {
			emptyState.hidden = false;
			return;
		}
		emptyState.hidden = true;
		for (const p of items) {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${p.title}</td>
				<td>${p.category || '-'}</td>
				<td>${p.image ? `<img src="${p.image}" alt="">` : '-'}</td>
				<td>
					<div class="row-actions">
						<button class="btn small" data-edit="${p.id}">Düzenle</button>
						<button class="btn small outline" data-del="${p.id}">Sil</button>
					</div>
				</td>
			`;
			tableBody.appendChild(tr);
		}
	}

	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const data = {
			id: editId.value || uid(),
			title: title.value.trim(),
			category: category.value,
			image: image.value.trim(),
			description: description.value.trim()
		};
		let items = getProducts();
		const idx = items.findIndex(x => x.id === data.id);
		if (idx >= 0) {
			items[idx] = data;
		} else {
			items = [data, ...items];
		}
		saveProducts(items);
		renderTable();
		form.reset();
		editId.value = '';
	});
	resetBtn.addEventListener('click', () => {
		form.reset();
		editId.value = '';
	});

	tableBody.addEventListener('click', (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const edit = btn.getAttribute('data-edit');
		const del = btn.getAttribute('data-del');
		let items = getProducts();
		if (edit) {
			const p = items.find(x => x.id === edit);
			if (p) {
				title.value = p.title;
				// set category with fallback if removed option
				const wanted = p.category || 'Koltuk';
				const hasOption = Array.from(category.options).some(o => o.value === wanted);
				category.value = hasOption ? wanted : 'Koltuk';
				image.value = p.image || '';
				description.value = p.description || '';
				editId.value = p.id;
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} else if (del) {
			if (confirm('Bu ürünü silmek istiyor musunuz?')) {
				items = items.filter(x => x.id !== del);
				saveProducts(items);
				renderTable();
			}
		}
	});

	// Categories management
	const catForm = document.getElementById('catForm');
	const catName = document.getElementById('catName');
	theCatImage = document.getElementById('catImage');
	const catId = document.getElementById('catId');
	const catReset = document.getElementById('catReset');
	const catsTableBody = document.querySelector('#catsTable tbody');

	function renderCats() {
		const cats = getCategories();
		catsTableBody.innerHTML = '';
		for (const c of cats) {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${c.name}</td>
				<td>${c.image ? `<img src="${c.image}" alt="">` : '-'}</td>
				<td>
					<div class="row-actions">
						<button class="btn small" data-cat-edit="${c.id}">Düzenle</button>
						<button class="btn small outline" data-cat-del="${c.id}">Sil</button>
					</div>
				</td>
			`;
			catsTableBody.appendChild(tr);
		}
		populateCategorySelect();
	}

	catForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const data = {
			id: catId.value || uid(),
			name: catName.value.trim(),
			image: theCatImage.value.trim()
		};
		let cats = getCategories();
		const idx = cats.findIndex(x => x.id === data.id);
		if (idx >= 0) cats[idx] = data;
		else cats = [data, ...cats];
		saveCategories(cats);
		renderCats();
		catForm.reset();
		catId.value = '';
	});
	catReset.addEventListener('click', () => {
		catForm.reset();
		catId.value = '';
	});
	catsTableBody.addEventListener('click', (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const edit = btn.getAttribute('data-cat-edit');
		const del = btn.getAttribute('data-cat-del');
		let cats = getCategories();
		if (edit) {
			const c = cats.find(x => x.id === edit);
			if (c) {
				catName.value = c.name;
				theCatImage.value = c.image || '';
				catId.value = c.id;
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} else if (del) {
			if (confirm('Bu kategoriyi silmek istiyor musunuz?')) {
				cats = cats.filter(x => x.id !== del);
				saveCategories(cats);
				renderCats();
			}
		}
	});
	renderCats();

	// Hero settings
	const heroImage = document.getElementById('heroImage');
	const heroSave = document.getElementById('heroSave');
	function getHero() {
		try { return JSON.parse(localStorage.getItem(HERO_KEY) || '{}'); } catch { return {}; }
	}
	function saveHero(hero) {
		localStorage.setItem(HERO_KEY, JSON.stringify(hero));
	}
	function loadHero() {
		const { image } = getHero();
		heroImage.value = image || '';
	}
	loadHero();
	heroSave.addEventListener('click', (e) => {
		e.preventDefault();
		saveHero({ image: heroImage.value.trim() });
		alert('Hero görseli güncellendi.');
	});

	// Export / Import
	const exportBtn = document.getElementById('exportBtn');
	const importInput = document.getElementById('importInput');

	exportBtn.addEventListener('click', () => {
		const data = getProducts();
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'nuvia-products.json';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	});
	importInput.addEventListener('change', async () => {
		const file = importInput.files && importInput.files[0];
		if (!file) return;
		const text = await file.text();
		try {
			const json = JSON.parse(text);
			if (Array.isArray(json)) {
				saveProducts(json);
				renderTable();
			} else {
				alert('Geçersiz JSON.');
			}
		} catch {
			alert('JSON okunamadı.');
		}
		importInput.value = '';
	});

	renderTable();
})();


