<!-- Booking Modal — included in pages that list services -->
<div class="modal-backdrop" id="bookingModal" onclick="handleModalBackdropClick(event)">
  <div class="modal">
    <div class="modal-header">
      <div>
        <h2 class="modal-title" id="modalServiceName">Agendar serviço</h2>
        <p class="text-xs text-muted" id="modalServiceMeta"></p>
      </div>
      <button class="modal-close" onclick="closeBookingModal()" aria-label="Fechar">✕</button>
    </div>

    <!-- Step 1: Date -->
    <div id="bkStep1">
      <p class="form-label mb-2">1. Escolha a data</p>
      <div id="bookingCalendar"></div>
    </div>

    <!-- Step 2: Time slot -->
    <div id="bkStep2" class="hidden">
      <div class="flex items-center gap-2 mb-3">
        <button class="btn btn-ghost btn-sm" onclick="bkBackToDate()">← Data</button>
        <span class="text-sm text-muted" id="bkSelectedDate"></span>
      </div>
      <p class="form-label mb-2">2. Escolha o horário</p>
      <div id="bookingSlots">
        <div class="spinner" style="width:24px;height:24px;border-width:2px;margin:1rem auto"></div>
      </div>
    </div>

    <!-- Step 3: Confirm -->
    <div id="bkStep3" class="hidden">
      <div class="flex items-center gap-2 mb-3">
        <button class="btn btn-ghost btn-sm" onclick="bkBackToSlots()">← Horário</button>
      </div>
      <div class="bk-summary">
        <div class="bk-summary-row"><span class="text-muted">Serviço</span><strong id="bkSumService"></strong></div>
        <div class="bk-summary-row"><span class="text-muted">Data</span><strong id="bkSumDate"></strong></div>
        <div class="bk-summary-row"><span class="text-muted">Horário</span><strong id="bkSumTime"></strong></div>
        <div class="bk-summary-row"><span class="text-muted">Duração</span><strong id="bkSumDuration"></strong></div>
        <div class="bk-summary-row"><span class="text-muted">Valor</span><strong id="bkSumPrice" class="text-primary"></strong></div>
      </div>
      <div id="bkConfirmError" class="alert alert-danger hidden mt-2"></div>
      <button id="bookingConfirmBtn" class="btn btn-primary btn-block mt-4" onclick="confirmBooking()">
        Confirmar agendamento
      </button>
    </div>
  </div>
</div>
