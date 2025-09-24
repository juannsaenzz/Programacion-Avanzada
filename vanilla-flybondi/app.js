const $ = (sel) => document.querySelector(sel);
const results = $("#results");
const info = $("#info");
const originSelect = $("#origin");
const destinationSelect = $("#destination");
const paxInput = $("#pax");
const dateFromInput = $("#dateFrom");
const dateToInput = $("#dateTo");
const searchBtn = $("#search");

// Elementos del modal
let modal, modalContent, modalClose;

let flights = [];
let allCombos = [];
let displayed = 0;
const PAGE_SIZE = 20;

// Inicializar
init();

async function init() {
  flights = await fetch("./dataset.json").then(r => r.json());
  console.log("Vuelos cargados:", flights.length);

  // Poblar selects de origen y destino
  const origins = [...new Set(flights.map(f => f.origin))].sort();
  const destinations = [...new Set(flights.map(f => f.destination))].sort();

  origins.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    originSelect.appendChild(opt);
  });

  destinations.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    destinationSelect.appendChild(opt);
  });

  results.innerHTML = `
    <div class="message info">
      <p>Seleccione <b>origen</b>, <b>destino</b>, <b>pasajeros</b> y <b>fechas</b> para comenzar la búsqueda.</p>
    </div>
  `;

  // Crear modal dinámicamente
  modal = document.createElement("div");
  modal.id = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <div id="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  modalContent = $("#modal-body");
  modalClose = modal.querySelector(".close");

  modalClose.onclick = () => modal.style.display = "none";
  window.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
}

searchBtn.addEventListener("click", runSearch);

function runSearch() {
  const origin = originSelect.value;
  const destination = destinationSelect.value;
  const pax = Math.max(1, Number(paxInput.value));
  const selFrom = dateFromInput.value; // yyyy-mm-dd
  const selTo = dateToInput.value;     // yyyy-mm-dd

  if (!origin || !destination || !pax || !selFrom || !selTo) {
    info.innerHTML = `<p class="error-msg">Complete todos los campos para realizar la búsqueda.</p>`;
    return;
  }

  // Helper para normalizar fecha del dataset a yyyy-mm-dd
  const toInputDate = (s) => {
    const d = new Date(s);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Filtrar listas exactas
  const idaList = flights.filter(f =>
    f.origin === origin &&
    f.destination === destination &&
    toInputDate(f.date) === selFrom
  );

  const vueltaList = flights.filter(f =>
    f.origin === destination &&
    f.destination === origin &&
    toInputDate(f.date) === selTo
  );

  const combos = [];

  for (const ida of idaList) {
    for (const vuelta of vueltaList) {
      if (new Date(vuelta.date) <= new Date(ida.date)) continue;

      const seats = Math.min(ida.availability, vuelta.availability);
      if (seats < pax) continue;

      const total = (ida.price + vuelta.price) * pax;
      combos.push({
        origin,
        destination,
        ida,
        vuelta,
        pax,
        total
      });
    }
  }

  combos.sort((a, b) => a.total - b.total);

  allCombos = combos;
  displayed = 0;

  renderNext();
}

function renderNext() {
  if (!allCombos.length) {
    info.innerHTML = "";
    results.innerHTML = `<div class="message error">
      <h3>UPS</h3>
      <p>No se encontraron vuelos disponibles para los criterios seleccionados.</p>
    </div>`;
    return;
  }

  if (displayed === 0) {
    info.innerHTML = `<p>Se encontraron <b>${allCombos.length}</b> combinaciones de vuelos</p>`;
    results.innerHTML = "";
  }

  const slice = allCombos.slice(displayed, displayed + PAGE_SIZE);
  results.innerHTML += slice.map((c, i) => `
    <div class="card" data-idx="${displayed + i}">
      <h3>${c.origin} → ${c.destination}</h3>
      <p><b>Ida:</b> ${fmtDate(c.ida.date)} — $${c.ida.price.toFixed(2)}</p>
      <p><b>Vuelta:</b> ${fmtDate(c.vuelta.date)} — $${c.vuelta.price.toFixed(2)}</p>
      <p><b>Pasajeros:</b> ${c.pax}</p>
      <p class="price">Total: $${c.total.toFixed(2)}</p>
    </div>
  `).join("");

  displayed += slice.length;

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const idx = card.dataset.idx;
      const c = allCombos[idx];
      showModal(c);
    });
  });

  if (displayed < allCombos.length) {
    if (!document.querySelector("#loadMore")) {
      results.insertAdjacentHTML("afterend", `
        <div style="text-align:center; margin:20px;">
          <button id="loadMore">Cargar más</button>
        </div>
      `);
      $("#loadMore").onclick = renderNext;
    }
  } else {
    const btn = $("#loadMore");
    if (btn) btn.remove();
  }
}

function showModal(c) {
  modalContent.innerHTML = `
    <h2>${c.origin} → ${c.destination}</h2>
    <p><b>Fecha ida:</b> ${fmtDate(c.ida.date)}</p>
    <p><b>Precio ida:</b> $${c.ida.price.toFixed(2)}</p>
    <p><b>Fecha vuelta:</b> ${fmtDate(c.vuelta.date)}</p>
    <p><b>Precio vuelta:</b> $${c.vuelta.price.toFixed(2)}</p>
    <p><b>Disponibilidad ida:</b> ${c.ida.availability}</p>
    <p><b>Disponibilidad vuelta:</b> ${c.vuelta.availability}</p>
    <p><b>Pasajeros:</b> ${c.pax}</p>
    <h3 class="price">Total: $${c.total.toFixed(2)}</h3>
  `;
  modal.style.display = "block";
}

function fmtDate(s) {
  const d = new Date(s);
  return d.toLocaleDateString("es-AR", { day:"2-digit", month:"2-digit", year:"numeric" });
}
