document.addEventListener('DOMContentLoaded', () => {
  const VEHICLES = [
    { id: 1, brand: 'Toyota', model: 'Corolla', year: 2021, type: 'Sedán', pricePerDay: 45, available: true, transmission: 'Automática', fuelConsumption: '6.5 L/100km', capacity: 5, isPromo: true, discountPercent: 15, recommended: true, query: 'toyota corolla' },
    { id: 2, brand: 'Honda', model: 'Civic', year: 2022, type: 'Sedán', pricePerDay: 50, available: true, transmission: 'Manual', fuelConsumption: '6.0 L/100km', capacity: 5, isPromo: false, discountPercent: 0, recommended: true, query: 'honda civic' },
    { id: 3, brand: 'Ford', model: 'Explorer', year: 2021, type: 'SUV', pricePerDay: 80, available: false, transmission: 'Automática', fuelConsumption: '9.0 L/100km', capacity: 7, isPromo: false, discountPercent: 0, recommended: false, query: 'ford explorer suv' },
    { id: 4, brand: 'Tesla', model: 'Model 3', year: 2023, type: 'Eléctrico', pricePerDay: 120, available: true, transmission: 'Automática', fuelConsumption: '15 kWh/100km', capacity: 5, isPromo: true, discountPercent: 10, recommended: true, query: 'tesla model 3' },
    { id: 5, brand: 'BMW', model: 'Serie 3', year: 2020, type: 'Sedán', pricePerDay: 90, available: true, transmission: 'Automática', fuelConsumption: '7.0 L/100km', capacity: 5, isPromo: false, discountPercent: 0, recommended: true, query: 'bmw 3 series sedan' },
    { id: 6, brand: 'Audi', model: 'Q5', year: 2021, type: 'SUV', pricePerDay: 95, available: true, transmission: 'Automática', fuelConsumption: '8.0 L/100km', capacity: 5, isPromo: false, discountPercent: 0, recommended: false, query: 'audi q5 suv' },
    { id: 7, brand: 'Mercedes-Benz', model: 'Clase C', year: 2019, type: 'Sedán', pricePerDay: 85, available: false, transmission: 'Automática', fuelConsumption: '7.2 L/100km', capacity: 5, isPromo: true, discountPercent: 20, recommended: false, query: 'mercedes c class' },
    { id: 8, brand: 'Chevrolet', model: 'Silverado', year: 2020, type: 'Pick-up', pricePerDay: 100, available: true, transmission: 'Automática', fuelConsumption: '12 L/100km', capacity: 5, isPromo: false, discountPercent: 0, recommended: false, query: 'chevrolet silverado pickup' },
    { id: 9, brand: 'Jeep', model: 'Wrangler', year: 2022, type: 'SUV', pricePerDay: 110, available: true, transmission: 'Manual', fuelConsumption: '11 L/100km', capacity: 5, isPromo: false, discountPercent: 0, recommended: true, query: 'jeep wrangler suv' },
    { id: 10, brand: 'Porsche', model: '911', year: 2019, type: 'Deportivo', pricePerDay: 180, available: true, transmission: 'Automática', fuelConsumption: '10 L/100km', capacity: 4, isPromo: false, discountPercent: 0, recommended: false, query: 'porsche 911 sports car' },
    { id: 11, brand: 'Volkswagen', model: 'Golf', year: 2021, type: 'Hatchback', pricePerDay: 55, available: true, transmission: 'Manual', fuelConsumption: '6.5 L/100km', capacity: 5, isPromo: false, discountPercent: 0, recommended: false, query: 'volkswagen golf hatchback' },
    { id: 12, brand: 'Kia', model: 'Sportage', year: 2022, type: 'SUV', pricePerDay: 70, available: true, transmission: 'Automática', fuelConsumption: '8 L/100km', capacity: 5, isPromo: false, discountPercent: 0, recommended: true, query: 'kia sportage suv' }
  ];

  const searchInput = document.getElementById('searchInput');
  const filterBrand = document.getElementById('filterBrand');
  const filterType = document.getElementById('filterType');
  const filterTrans = document.getElementById('filterTrans');
  const filterAvail = document.getElementById('filterAvail');
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const btnReset = document.getElementById('btnReset');
  const vehicleList = document.getElementById('vehicleList');
  const recommendedRow = document.getElementById('recommendedRow');
  const loading = document.getElementById('loading');
  const resultCount = document.getElementById('resultCount');
  const vehicleModal = document.getElementById('vehicleModal');
  const vehicleTitle = document.getElementById('vehicleTitle');
  const vehicleSpecs = document.getElementById('vehicleSpecs');
  const vehiclePrice = document.getElementById('vehiclePrice');
  const vehiclePromo = document.getElementById('vehiclePromo');
  const detailCarouselInner = document.getElementById('detailCarouselInner');
  const btnStartReservation = document.getElementById('btnStartReservation');
  const reservationSection = document.getElementById('reservationSection');
  const docNumber = document.getElementById('docNumber');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const totalPrice = document.getElementById('totalPrice');
  const docError = document.getElementById('docError');
  const dateError = document.getElementById('dateError');
  const btnConfirmReservation = document.getElementById('btnConfirmReservation');
  const reservationSummary = document.getElementById('reservationSummary');

  let currentVehicle = null;
  let state = { search: '', brand: 'Todas', type: 'Todos', trans: 'Todas', avail: 'Todos', min: 0, max: 1000 };
  let eligibility = new Map();
  let csvLoaded = false;

  function distinct(list, key) {
    return Array.from(new Set(list.map(i => i[key])));
  }

  function formatPrice(value) {
    return `$${value.toFixed(0)}/día`;
  }

  function effectivePrice(v) {
    return v.isPromo ? Math.round(v.pricePerDay * (1 - v.discountPercent / 100)) : v.pricePerDay;
  }

  function populateFilters() {
    const brands = ['Todas', ...distinct(VEHICLES, 'brand')];
    const types = ['Todos', ...distinct(VEHICLES, 'type')];
    const trans = ['Todas', ...distinct(VEHICLES, 'transmission')];
    const avail = ['Todos', 'Disponible', 'No disponible'];
    filterBrand.innerHTML = brands.map(b => `<option value="${b}">${b}</option>`).join('');
    filterType.innerHTML = types.map(t => `<option value="${t}">${t}</option>`).join('');
    filterTrans.innerHTML = trans.map(t => `<option value="${t}">${t}</option>`).join('');
    filterAvail.innerHTML = avail.map(a => `<option value="${a}">${a}</option>`).join('');
    const prices = VEHICLES.map(v => effectivePrice(v));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    priceMin.value = min;
    priceMax.value = max;
    state.min = min;
    state.max = max;
  }

  function renderRecommended() {
    const items = VEHICLES.filter(v => v.recommended);
    recommendedRow.innerHTML = items.map(v => {
      const price = effectivePrice(v);
      const promo = v.isPromo ? `<span class="badge text-bg-danger ms-2">-${v.discountPercent}%</span>` : '';
      const cands = imageCandidates(v.query).join('|');
      return `<div class="recommended-item card">
        <img src="${imageCandidates(v.query)[0]}" data-cand="${cands}" data-cand-idx="0" class="card-img-top" alt="${v.brand} ${v.model}">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between">
            <div class="fw-semibold">${v.brand} ${v.model}</div>
            ${promo}
          </div>
          <div class="text-muted small">${v.type} • ${v.year}</div>
          <div class="mt-2">${formatPrice(price)}</div>
          <div class="d-flex gap-2 mt-2">
            <button class="btn btn-sm btn-outline-primary" data-action="details" data-id="${v.id}">Ver detalles</button>
            <button class="btn btn-sm btn-primary" data-action="reserve" data-id="${v.id}">Reservar</button>
          </div>
        </div>
      </div>`;
    }).join('');
    initImageFallbacks(recommendedRow);
  }

  function cardTemplate(v) {
    const price = effectivePrice(v);
    const promoBadge = v.isPromo ? `<span class="badge text-bg-danger position-absolute top-0 start-0 m-2">Promo</span>` : '';
    const availBadge = v.available ? '<span class="badge text-bg-success">Disponible</span>' : '<span class="badge text-bg-secondary">No disponible</span>';
    const originalPrice = v.isPromo ? `<span class="text-decoration-line-through text-muted me-2">${formatPrice(v.pricePerDay)}</span>` : '';
    const cands = imageCandidates(v.query).join('|');
    return `<div class="col-12 col-sm-6 col-lg-4">
      <div class="card vehicle-card h-100 position-relative">
        ${promoBadge}
        <img src="${imageCandidates(v.query)[0]}" data-cand="${cands}" data-cand-idx="0" class="card-img-top" alt="${v.brand} ${v.model}">
        <div class="card-body">
          <h5 class="card-title">${v.brand} ${v.model}</h5>
          <div class="text-muted">${v.type} • ${v.year} • ${v.transmission} • ${v.capacity} pasajeros</div>
          <div class="d-flex align-items-center mt-2">
            ${originalPrice}
            <span class="fw-bold">${formatPrice(price)}</span>
          </div>
          <div class="mt-2">${availBadge}</div>
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary" data-action="details" data-id="${v.id}">Ver detalles</button>
            <button class="btn btn-primary" data-action="reserve" data-id="${v.id}" ${v.available ? '' : 'disabled'}>Reservar</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function applyFilters() {
    const q = state.search.trim().toLowerCase();
    const list = VEHICLES.filter(v => {
      const matchQ = !q || `${v.brand} ${v.model} ${v.type}`.toLowerCase().includes(q);
      const matchBrand = state.brand === 'Todas' || v.brand === state.brand;
      const matchType = state.type === 'Todos' || v.type === state.type;
      const matchTrans = state.trans === 'Todas' || v.transmission === state.trans;
      const matchAvail = state.avail === 'Todos' || (state.avail === 'Disponible' ? v.available : !v.available);
      const price = effectivePrice(v);
      const matchPrice = price >= state.min && price <= state.max;
      return matchQ && matchBrand && matchType && matchTrans && matchAvail && matchPrice;
    });
    resultCount.textContent = `${list.length} resultados`;
    vehicleList.innerHTML = list.map(cardTemplate).join('');
    initImageFallbacks(vehicleList);
  }

  function openModal(v, openReservation) {
    currentVehicle = v;
    vehicleTitle.textContent = `${v.brand} ${v.model} (${v.year})`;
    vehicleSpecs.innerHTML = [
      `<li class="list-group-item">Tipo: ${v.type}</li>`,
      `<li class="list-group-item">Transmisión: ${v.transmission}</li>`,
      `<li class="list-group-item">Consumo: ${v.fuelConsumption}</li>`,
      `<li class="list-group-item">Capacidad: ${v.capacity} pasajeros</li>`,
      `<li class="list-group-item">Disponibilidad: ${v.available ? 'Disponible' : 'No disponible'}</li>`
    ].join('');
    const price = effectivePrice(v);
    vehiclePrice.textContent = formatPrice(price);
    vehiclePromo.classList.toggle('d-none', !v.isPromo);
    const cand1 = imageCandidates(`${v.query} exterior`, 1000, 700);
    const cand2 = imageCandidates(`${v.query} interior`, 1000, 700);
    const cand3 = imageCandidates(`${v.query} dashboard`, 1000, 700);
    detailCarouselInner.innerHTML = [cand1, cand2, cand3].map((list, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <img src="${list[0]}" data-cand="${list.join('|')}" data-cand-idx="0" class="d-block w-100" alt="${v.brand} ${v.model} detalle ${i+1}">
      </div>
    `).join('');
    reservationSection.classList.add('d-none');
    startDate.value = '';
    endDate.value = '';
    totalPrice.textContent = '$0';
    dateError.classList.add('d-none');
    reservationSummary.classList.add('d-none');
    const modal = new bootstrap.Modal(vehicleModal);
    modal.show();
    initImageFallbacks(vehicleModal);
    if (openReservation) toggleReservation(true);
  }

  function toggleReservation(show) {
    reservationSection.classList.toggle('d-none', !show);
  }

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(',').map(s => s.trim());
    const idx = {
      documento: header.indexOf('documento'),
      status: header.indexOf('status'),
      surchargePercent: header.indexOf('surchargePercent'),
      note: header.indexOf('note')
    };
    const map = new Map();
    lines.forEach(l => {
      const cols = l.split(',');
      const doc = (cols[idx.documento] || '').trim();
      const status = (cols[idx.status] || '').trim().toLowerCase();
      const pct = Number((cols[idx.surchargePercent] || '0').trim()) || 0;
      const note = (cols[idx.note] || '').trim();
      if (doc) map.set(doc, { status, pct, note });
    });
    return map;
  }

  async function loadEligibility() {
    const fallback = `documento,status,surchargePercent,note\n12345678,permitido,0,\n87654321,bloqueado,0,Deuda pendiente\n11223344,siniestro,30,Historial de siniestro\n99887766,permitido,0,\n44556677,siniestro,20,Incidente menor\n22334455,permitido,0,\n77889900,bloqueado,0,Fraude\n33445566,siniestro,25,\n55667788,permitido,0,\n66778899,permitido,0,`;
    try {
      const res = await fetch('eligibility.csv');
      if (!res.ok) throw new Error('fetch failed');
      const txt = await res.text();
      eligibility = parseCSV(txt);
      csvLoaded = true;
    } catch (e) {
      eligibility = parseCSV(fallback);
      csvLoaded = false;
    }
  }

  function docStatus(doc) {
    const clean = (doc || '').trim();
    if (!clean) return { status: 'desconocido', pct: 0, note: '' };
    const rec = eligibility.get(clean);
    return rec || { status: 'permitido', pct: 0, note: '' };
  }

  function computeDays() {
    if (!startDate.value || !endDate.value) return 0;
    const s = new Date(startDate.value);
    const e = new Date(endDate.value);
    const diff = (e - s) / (1000 * 60 * 60 * 24);
    const days = Math.ceil(diff);
    return days > 0 ? days : 0;
  }

  function updateTotal() {
    const days = computeDays();
    if (days <= 0) {
      totalPrice.textContent = '$0';
      dateError.classList.remove('d-none');
      startDate.classList.add('is-invalid');
      endDate.classList.add('is-invalid');
      btnConfirmReservation.disabled = true;
      return;
    }
    dateError.classList.add('d-none');
    startDate.classList.remove('is-invalid');
    endDate.classList.remove('is-invalid');
    const base = days * effectivePrice(currentVehicle);
    const st = docStatus(docNumber.value);
    if (st.status === 'bloqueado') {
      docError.textContent = 'Documento no habilitado para alquilar.' + (st.note ? ` (${st.note})` : '');
      docError.classList.remove('d-none');
      btnConfirmReservation.disabled = true;
      totalPrice.textContent = '$0';
      return;
    }
    docError.classList.add('d-none');
    const total = Math.round(base * (1 + (st.status === 'siniestro' ? st.pct : 0) / 100));
    totalPrice.textContent = `$${total.toFixed(0)}`;
    btnConfirmReservation.disabled = !docNumber.value.trim();
  }

  searchInput.addEventListener('input', e => { state.search = e.target.value; applyFilters(); });
  filterBrand.addEventListener('change', e => { state.brand = e.target.value; applyFilters(); });
  filterType.addEventListener('change', e => { state.type = e.target.value; applyFilters(); });
  filterTrans.addEventListener('change', e => { state.trans = e.target.value; applyFilters(); });
  filterAvail.addEventListener('change', e => { state.avail = e.target.value; applyFilters(); });
  priceMin.addEventListener('input', e => { state.min = Number(e.target.value) || 0; applyFilters(); });
  priceMax.addEventListener('input', e => { state.max = Number(e.target.value) || 1000; applyFilters(); });
  btnReset.addEventListener('click', () => {
    searchInput.value = '';
    state.search = '';
    filterBrand.value = 'Todas';
    state.brand = 'Todas';
    filterType.value = 'Todos';
    state.type = 'Todos';
    filterTrans.value = 'Todas';
    state.trans = 'Todas';
    filterAvail.value = 'Todos';
    state.avail = 'Todos';
    const prices = VEHICLES.map(v => effectivePrice(v));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    priceMin.value = min;
    priceMax.value = max;
    state.min = min;
    state.max = max;
    applyFilters();
  });

  vehicleList.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = Number(btn.getAttribute('data-id'));
    const v = VEHICLES.find(i => i.id === id);
    if (!v) return;
    if (action === 'details') openModal(v, false);
    if (action === 'reserve') openModal(v, true);
  });

  recommendedRow.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const id = Number(btn.getAttribute('data-id'));
    const v = VEHICLES.find(i => i.id === id);
    if (!v) return;
    if (action === 'details') openModal(v, false);
    if (action === 'reserve') openModal(v, true);
  });

  btnStartReservation.addEventListener('click', () => toggleReservation(true));
  docNumber.addEventListener('input', updateTotal);
  startDate.addEventListener('change', updateTotal);
  endDate.addEventListener('change', updateTotal);
  btnConfirmReservation.addEventListener('click', () => {
    const days = computeDays();
    if (days <= 0) return;
    const st = docStatus(docNumber.value);
    if (st.status === 'bloqueado') return;
    const base = days * effectivePrice(currentVehicle);
    const total = Math.round(base * (1 + (st.status === 'siniestro' ? st.pct : 0) / 100));
    reservationSummary.classList.remove('d-none');
    const extra = st.status === 'siniestro' ? ` (ajuste por siniestro +${st.pct}%)` : '';
    reservationSummary.innerHTML = `Reserva confirmada: ${currentVehicle.brand} ${currentVehicle.model}. Documento: ${docNumber.value}. Días: ${days}. Total: $${total.toFixed(0)}${extra}.`;
  });

  populateFilters();
  renderRecommended();
  applyFilters();
  loadEligibility();
  setTimeout(() => loading.classList.add('d-none'), 400);
});
  function imageCandidates(query, w = 800, h = 600) {
    const q = encodeURIComponent(query);
    const tag = encodeURIComponent(query.replace(/\s+/g, ','));
    return [
      `https://source.unsplash.com/featured/${w}x${h}/?${q}`,
      `https://loremflickr.com/${w}/${h}/${tag}`,
      `https://loremflickr.com/${w}/${h}/car`,
      `https://picsum.photos/seed/${q}/${w}/${h}`,
      `https://placehold.co/${w}x${h}?text=${q}`
    ];
  }

  function initImageFallbacks(root) {
    const imgs = root.querySelectorAll('img[data-cand]');
    imgs.forEach(img => {
      const list = img.getAttribute('data-cand').split('|');
      let idx = Number(img.getAttribute('data-cand-idx')) || 0;
      function onError() {
        idx += 1;
        if (idx < list.length) {
          img.setAttribute('data-cand-idx', String(idx));
          img.src = list[idx];
        } else {
          img.removeEventListener('error', onError);
        }
      }
      img.addEventListener('error', onError);
    });
  }