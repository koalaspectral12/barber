<!-- Booking Modal — include on any page that has services -->
<div class="modal-backdrop" id="bookingModal">
  <div class="modal">
    <button class="modal-close" onclick="closeBookingModal()">✕</button>
    <h2 class="modal-title">Agendar serviço</h2>
    <p class="text-sm text-muted mb-2" id="modalServiceName"></p>

    <div class="form-group">
      <label class="form-label">Selecione a data</label>
      <div id="bookingCalendar"></div>
    </div>

    <div class="form-group">
      <label class="form-label">Horários disponíveis</label>
      <div id="bookingSlots">
        <p class="text-sm text-muted">Selecione uma data primeiro</p>
      </div>
    </div>

    <button id="bookingConfirmBtn" class="btn btn-primary btn-block mt-4" disabled onclick="confirmBooking()">
      Confirmar agendamento
    </button>
  </div>
</div>
