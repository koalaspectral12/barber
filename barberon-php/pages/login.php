<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';

$user = current_user();
if ($user) {
    header('Location: /');
    exit;
}

$callbackUrl = $_GET['callbackUrl'] ?? '/';
layout_start('Entrar');
?>
<div class="auth-wrapper">
  <div class="auth-card">
    <div class="auth-logo">
      <img src="/public/img/logo.png" alt="Barberon" width="32" height="32">
      <span>Barberon</span>
    </div>
    <p class="text-center text-muted text-sm mb-4">Agende nos melhores barbeiros da sua cidade</p>

    <div class="auth-tabs">
      <button class="auth-tab active" onclick="switchTab('login', this)">Entrar</button>
      <button class="auth-tab" onclick="switchTab('register', this)">Criar conta</button>
    </div>

    <!-- Login tab -->
    <div id="tab-login" class="tab-panel active">
      <div id="loginError" class="alert alert-danger hidden"></div>
      <div class="form-group">
        <label class="form-label" for="loginEmail">Email</label>
        <input class="form-input" type="email" id="loginEmail" placeholder="seu@email.com" autocomplete="email">
      </div>
      <div class="form-group">
        <label class="form-label" for="loginPassword">Senha</label>
        <input class="form-input" type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password">
      </div>
      <button class="btn btn-primary btn-block mt-2" id="loginBtn" onclick="doLogin()">Entrar</button>
    </div>

    <!-- Register tab -->
    <div id="tab-register" class="tab-panel">
      <div id="registerError" class="alert alert-danger hidden"></div>
      <div id="registerSuccess" class="alert alert-success hidden"></div>
      <div class="form-group">
        <label class="form-label" for="regName">Nome</label>
        <input class="form-input" type="text" id="regName" placeholder="Seu nome">
      </div>
      <div class="form-group">
        <label class="form-label" for="regEmail">Email</label>
        <input class="form-input" type="email" id="regEmail" placeholder="seu@email.com">
      </div>
      <div class="form-group">
        <label class="form-label" for="regPassword">Senha</label>
        <input class="form-input" type="password" id="regPassword" placeholder="Mínimo 6 caracteres">
      </div>
      <button class="btn btn-primary btn-block mt-2" id="registerBtn" onclick="doRegister()">Criar conta</button>
    </div>
  </div>
</div>

<script>
const CALLBACK = <?= json_encode($callbackUrl) ?>;

function switchTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
}

async function doLogin() {
  const errEl = document.getElementById('loginError');
  errEl.classList.add('hidden');
  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    await api('/api/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({
        email:    document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
      }),
    });
    window.location.href = CALLBACK;
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false; btn.textContent = 'Entrar';
  }
}

async function doRegister() {
  const errEl = document.getElementById('registerError');
  const sucEl = document.getElementById('registerSuccess');
  errEl.classList.add('hidden'); sucEl.classList.add('hidden');
  const btn = document.getElementById('registerBtn');
  btn.disabled = true; btn.textContent = 'Criando conta…';
  try {
    await api('/api/auth/register.php', {
      method: 'POST',
      body: JSON.stringify({
        name:     document.getElementById('regName').value,
        email:    document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
      }),
    });
    sucEl.textContent = 'Conta criada! Redirecionando…';
    sucEl.classList.remove('hidden');
    setTimeout(() => window.location.href = CALLBACK, 1000);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false; btn.textContent = 'Criar conta';
  }
}

// Enter key support
['loginEmail','loginPassword'].forEach(id => {
  document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});
['regName','regEmail','regPassword'].forEach(id => {
  document.getElementById(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
});
</script>
<?php layout_end(); ?>
