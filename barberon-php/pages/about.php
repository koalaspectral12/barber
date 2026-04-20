<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
layout_start('Sobre nós');
?>
<div class="container section" style="max-width:720px">
  <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem">Sobre o Barberon</h1>
  <p class="text-muted">O <strong style="color:var(--text)">Barberon</strong> é uma plataforma para agendamento online em barbearias.</p>
  <p class="text-muted mt-4">Encontre a barbearia ideal, conheça os serviços disponíveis e agende um horário de forma rápida e fácil, sem precisar ligar ou enviar mensagem.</p>
  <p class="text-muted mt-4">Para proprietários de barbearias, o Barberon oferece um painel de administração completo para gerenciar serviços, horários de funcionamento e agendamentos.</p>
  <a href="/" class="btn btn-outline mt-6">← Voltar para o início</a>
</div>
<?php layout_end(); ?>
