(() => {
  const table = document.querySelector('#property-table');
  const editModal = document.querySelector('#edit-modal');
  const toast = document.querySelector('.toast');
  const propertyForm = document.querySelector('#property-form');

  if (!table || !editModal || !toast || !propertyForm) {
    return;
  }

  const defaultProperties = [
    { id: 1, name: 'Hôtel Particulier Champ-de-Mars', location: 'Paris 7e · Avenue Émile-Deschanel', price: '9,85 M€', status: 'published', tour: true },
    { id: 2, name: 'Villa Belle Époque "Le Roc Fleuri"', location: 'Nice · Boulevard Carnot, Cap de Nice', price: '6,90 M€', status: 'published', tour: true },
    { id: 3, name: 'Château & Vignoble de Saint-Émilion', location: 'Saint-Émilion · Route des Châteaux, Gironde', price: '4,45 M€', status: 'published', tour: true },
  ];

  const storedProperties = localStorage.getItem('laforet-admin-properties');
  let properties = defaultProperties;
  try {
    const parsedProperties = storedProperties ? JSON.parse(storedProperties) : null;
    if (Array.isArray(parsedProperties)) properties = parsedProperties;
  } catch (error) {
    localStorage.removeItem('laforet-admin-properties');
  }

  let editingId = null;
  const sections = [...document.querySelectorAll('.admin-section')];
  const navItems = [...document.querySelectorAll('.nav-item')];
  const sectionNames = { overview: "Vue d'ensemble", properties: 'Biens immobiliers', content: 'Contenu du site', integrations: 'Intégrations', settings: 'Paramètres' };

  async function apiRequest(path, options = {}) {
    const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    return response.json();
  }

  function savePropertiesLocally() {
    localStorage.setItem('laforet-admin-properties', JSON.stringify(properties));
  }

  async function loadProperties() {
    try {
      properties = await apiRequest('/api/properties');
    } catch (error) {
      properties = properties;
    }
    renderProperties();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    window.setTimeout(() => toast.classList.remove('visible'), 2600);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\'\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function renderProperties() {
    const query = document.querySelector('#property-search')?.value.toLowerCase().trim() || '';
    const filter = document.querySelector('#status-filter')?.value || 'all';
    const visibleProperties = properties.filter((property) => {
      const matchesQuery = `${property.name} ${property.location}`.toLowerCase().includes(query);
      return matchesQuery && (filter === 'all' || property.status === filter);
    });

    table.innerHTML = visibleProperties.map((property) => `<tr><td><div class="table-property"><span class="table-thumb thumb-${property.id}"></span><div><strong>${escapeHtml(property.name)}</strong><small>Maison · Visite immersive</small></div></div></td><td>${escapeHtml(property.location)}</td><td><strong>${escapeHtml(property.price)}</strong></td><td><span class="tour-status">${property.tour ? '● Active' : '○ À configurer'}</span></td><td><span class="status-pill ${property.status}">${property.status === 'published' ? 'Publié' : 'Brouillon'}</span></td><td><button class="row-menu" type="button" data-edit-id="${property.id}" aria-label="Modifier ${escapeHtml(property.name)}">•••</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty-state">Aucun bien ne correspond à votre recherche.</td></tr>';

    const metric = document.querySelector('[data-metric="published"]');
    if (metric) metric.textContent = properties.filter((property) => property.status === 'published').length;

    const propertyMetric = document.querySelector('.nav-item[data-section="properties"] b');
    if (propertyMetric) propertyMetric.textContent = properties.length;

    document.querySelectorAll('[data-edit-id]').forEach((button) => button.addEventListener('click', () => openEditor(Number(button.dataset.editId))));
  }

  function openEditor(id) {
    editingId = id === 'new' ? null : id;
    const property = properties.find((item) => String(item.id) === String(id));
    document.querySelector('#edit-title').textContent = editingId ? 'Modifier le bien' : 'Ajouter un bien';
    document.querySelector('#edit-name').value = property?.name || '';
    document.querySelector('#edit-location').value = property?.location || '';
    document.querySelector('#edit-price').value = property?.price || '';
    document.querySelector('#edit-status').value = property?.status || 'published';
    editModal.classList.add('open');
    editModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.querySelector('#edit-name').focus();
  }

  function closeEditor() {
    editModal.classList.remove('open');
    editModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  navItems.forEach((item) => item.addEventListener('click', () => {
    const target = item.dataset.section;
    navItems.forEach((navItem) => navItem.classList.toggle('active', navItem === item));
    sections.forEach((section) => section.classList.toggle('active', section.id === target));
    const currentSection = document.querySelector('#current-section');
    if (currentSection) currentSection.textContent = sectionNames[target];
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }));

  document.querySelectorAll('[data-open-edit]').forEach((button) => button.addEventListener('click', () => openEditor(button.dataset.openEdit)));
  const propertySearch = document.querySelector('#property-search');
  const statusFilter = document.querySelector('#status-filter');
  if (propertySearch) propertySearch.addEventListener('input', renderProperties);
  if (statusFilter) statusFilter.addEventListener('change', renderProperties);

  propertyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nextProperty = {
      name: document.querySelector('#edit-name').value.trim(),
      location: document.querySelector('#edit-location').value.trim(),
      price: document.querySelector('#edit-price').value.trim(),
      status: document.querySelector('#edit-status').value,
      tour: true,
    };

    try {
      const savedProperty = editingId
        ? await apiRequest(`/api/properties/${editingId}`, { method: 'PATCH', body: JSON.stringify(nextProperty) })
        : await apiRequest('/api/properties', { method: 'POST', body: JSON.stringify(nextProperty) });
      if (editingId) {
        const index = properties.findIndex((item) => String(item.id) === String(editingId));
        if (index !== -1) properties[index] = savedProperty;
      } else properties.push(savedProperty);
    } catch (error) {
      if (editingId) {
        const property = properties.find((item) => item.id === editingId);
        if (property) Object.assign(property, nextProperty);
      } else properties.push({ ...nextProperty, id: Date.now() });
      savePropertiesLocally();
    }
    renderProperties();
    closeEditor();
    showToast(editingId ? 'Le bien a été mis à jour.' : 'Le bien a été ajouté au catalogue.');
  });

  document.querySelector('.edit-close').addEventListener('click', closeEditor);
  document.querySelector('.edit-cancel').addEventListener('click', closeEditor);
  document.querySelector('.edit-backdrop').addEventListener('click', closeEditor);
  document.querySelector('.sidebar-toggle').addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('open'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && editModal.classList.contains('open')) closeEditor();
  });

  document.querySelector('#save-content')?.addEventListener('click', async () => {
    const content = { title: document.querySelector('#hero-title').value, intro: document.querySelector('#hero-intro').value };
    try { await apiRequest('/api/content/homepage', { method: 'PUT', body: JSON.stringify(content) }); } catch (error) { localStorage.setItem('laforet-admin-content', JSON.stringify(content)); }
    const contentSaved = document.querySelector('#content-saved');
    if (contentSaved) contentSaved.textContent = 'Enregistré maintenant';
    showToast('Le contenu de la page d’accueil a été enregistré.');
  });

  document.querySelector('#save-settings')?.addEventListener('click', () => showToast('Vos paramètres ont été enregistrés.'));
  document.querySelector('#refresh-integrations')?.addEventListener('click', () => showToast('Les intégrations sont à jour.'));
  document.querySelector('.text-button')?.addEventListener('click', () => {
    document.querySelector('[data-section="properties"]')?.click();
    showToast('Voici les biens actuellement gérés.');
  });
  document.querySelector('.filter-button')?.addEventListener('click', () => {
    document.querySelector('#status-filter')?.focus();
    showToast('Choisissez un statut pour filtrer les biens.');
  });
  document.querySelector('.icon-button')?.addEventListener('click', () => showToast('Aucune nouvelle notification.'));
  document.querySelector('.admin-user')?.addEventListener('click', () => showToast('Session administratrice active.'));

  document.querySelectorAll('.integration-toggle').forEach((button) => button.addEventListener('click', () => {
    const card = button.closest('.integration-card');
    const state = card?.querySelector('.integration-state');
    if (!state) return;

    const connected = button.classList.toggle('connected');
    state.classList.toggle('connected', connected);
    state.textContent = connected ? '● Connecté' : '○ Non connecté';
    button.textContent = connected ? 'Gérer' : 'Connecter';
    showToast(connected ? 'Intégration connectée.' : 'Intégration déconnectée.');
  }));

  async function loadContent() {
    try {
      const content = await apiRequest('/api/content/homepage');
      const heroTitle = document.querySelector('#hero-title');
      const heroIntro = document.querySelector('#hero-intro');
      if (heroTitle) heroTitle.value = content.title || '';
      if (heroIntro) heroIntro.value = content.intro || '';
    } catch (error) {
      const storedContent = localStorage.getItem('laforet-admin-content');
      if (!storedContent) return;
      try {
        const content = JSON.parse(storedContent);
        document.querySelector('#hero-title').value = content.title || '';
        document.querySelector('#hero-intro').value = content.intro || '';
      } catch (storageError) { localStorage.removeItem('laforet-admin-content'); }
    }
  }

  loadProperties();
  loadContent();
})();
