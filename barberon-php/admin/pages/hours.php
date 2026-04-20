<?php // admin/pages/hours.php ?>
<h1 class="admin-title">Horários de funcionamento</h1>

<?php if ($ctx['role'] === 'SUPERADMIN'): ?>
<div class="form-group" style="max-width:320px">
  <label class="form-label">Barbearia</label>
  <select class="form-select" id="hoursShopSelect" onchange="loadHours()">
    <option value="">— selecione —</option>
  </select>
</div>
<?php else: ?>
<input type="hidden" id="hoursShopSelect" value="<?= htmlspecialchars($ctx['barbershopId'] ?? '') ?>">
<?php endif; ?>

<div id="hoursForm" class="hidden">
  <div id="daysGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-bottom:1.5rem"></div>
  <button class="btn btn-primary" onclick="saveHours()">Salvar horários</button>
</div>

<script>
const DAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
let _hours = {};
let _selectedShopId = null;

<?php if ($ctx['role'] === 'SUPERADMIN'): ?>
(async () => {
  const shops = await api('/api/admin/barbershops.php').catch(() => []);
  const sel = document.getElementById('hoursShopSelect');
  shops.forEach(s => { const o = document.createElement('option'); o.value = s.id; o.textContent = s.name; sel.appendChild(o); });
})();
<?php else: ?>
document.addEventListener('DOMContentLoaded', loadHours);
<?php endif; ?>

async function loadHours() {
  const sel = document.getElementById('hoursShopSelect');
  _selectedShopId = sel.value || sel.value;
  if (!_selectedShopId) return;

  try {
    const rows = await api('/api/admin/hours.php?barbershopId=' + _selectedShopId);
    _hours = {};
    rows.forEach(r => { _hours[r.dayOfWeek] = r; });
    renderDays();
    document.getElementById('hoursForm').classList.remove('hidden');
  } catch (e) { toast(e.message, 'error'); }
}

function renderDays() {
  const grid = document.getElementById('daysGrid');
  grid.innerHTML = DAYS.map((name, i) => {
    const h = _hours[i];
    return `
    <div class="card" style="padding:1rem">
      <div class="flex items-center justify-between mb-2">
        <strong>${name}</strong>
        <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem">
          <input type="checkbox" id="enabled_${i}" ${h ? 'checked' : ''} onchange="toggleDay(${i})"> Aberto
        </label>
      </div>
      <div id="dayFields_${i}" ${!h ? 'style="display:none"' : ''}>
        <div class="flex gap-2">
          <div class="form-group" style="flex:1;margin:0">
            <label class="form-label" style="font-size:0.75rem">Abertura</label>
            <input class="form-input" type="time" id="open_${i}" value="${h?.openTime || '09:00'}">
          </div>
          <div class="form-group" style="flex:1;margin:0">
            <label class="form-label" style="font-size:0.75rem">Fechamento</label>
            <input class="form-input" type="time" id="close_${i}" value="${h?.closeTime || '18:00'}">
          </div>
        </div>
        <div class="form-group mt-2" style="margin-bottom:0">
          <label class="form-label" style="font-size:0.75rem">Slot (minutos)</label>
          <select class="form-select" id="slot_${i}">
            ${[15,20,30,45,60].map(m => `<option value="${m}" ${(h?.slotMinutes||30)==m?'selected':''}>${m} min</option>`).join('')}
          </select>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleDay(i) {
  const checked = document.getElementById('enabled_' + i).checked;
  document.getElementById('dayFields_' + i).style.display = checked ? '' : 'none';
}

async function saveHours() {
  if (!_selectedShopId) { toast('Selecione uma barbearia', 'error'); return; }
  const hours = DAYS.map((_, i) => ({
    dayOfWeek:   i,
    enabled:     document.getElementById('enabled_' + i)?.checked || false,
    openTime:    document.getElementById('open_'    + i)?.value || '09:00',
    closeTime:   document.getElementById('close_'   + i)?.value || '18:00',
    slotMinutes: parseInt(document.getElementById('slot_' + i)?.value || '30'),
  }));
  try {
    await api('/api/admin/hours.php', {
      method: 'PUT',
      body: JSON.stringify({ barbershopId: _selectedShopId, hours }),
    });
    toast('Horários salvos!', 'success');
  } catch (e) { toast(e.message, 'error'); }
}
</script>
