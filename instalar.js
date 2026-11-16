// 📲 Instalar o jogo (vira app com ícone) e 📤 convidar amigos (QR code + link)
(function () {
  'use strict';
  const URL_JOGO = 'https://thiagofukuda-cmd.github.io/sayajin-quest/';
  const instalado = () => {
    try {
      if (window.navigator.standalone === true) return true;   // iPhone / iPad
      return ['standalone', 'fullscreen', 'minimal-ui'].some((m) => window.matchMedia('(display-mode: ' + m + ')').matches);
    } catch (e) { return false; }
  };
  const ua = navigator.userAgent || '';
  const ehIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);   // iPad novo se diz Mac
  const ehAndroid = /Android/i.test(ua);
  let pedido = null;   // o "instalar" do Chrome / Edge / Android, guardado para o botão

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); pedido = e; mostrarBotao(); });
  window.addEventListener('appinstalled', () => { pedido = null; esconderBotao(); });

  const css = document.createElement('style');
  css.textContent =
    '.sq-caixa{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.6);font-family:-apple-system,"Segoe UI",sans-serif}' +
    '.sq-caixa-in{background:#1A1030;color:#fff;border:3px solid #FFD933;border-radius:18px;padding:18px 20px;max-width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;box-sizing:border-box;text-align:center}' +
    '.sq-caixa-in h2{margin:0 0 10px;font-size:22px;color:#FFD933}' +
    '.sq-caixa-in ol{text-align:left;margin:8px 0 12px;padding-left:22px;font-size:17px;line-height:1.5}' +
    '.sq-caixa-in li{margin:6px 0}' +
    '.sq-ic{display:inline-block;background:#fff;color:#000;border-radius:8px;padding:0 6px;margin-left:4px}' +
    '.sq-obs{font-size:13px;opacity:0.9;margin:8px 0}' +
    '.sq-qr{width:220px;height:220px;background:#fff;border-radius:10px;padding:6px;image-rendering:pixelated}' +
    '.sq-link{font-family:ui-monospace,Menlo,monospace;font-size:13px;word-break:break-all;background:rgba(255,255,255,0.1);border-radius:8px;padding:6px 8px;user-select:all}' +
    '.sq-botoes{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:8px 0}' +
    '.sq-caixa .menu-btn{min-width:auto;padding:10px 18px;font-size:15px}';
  document.head.appendChild(css);

  function caixa(html) {
    const fundo = document.createElement('div');
    fundo.className = 'sq-caixa';
    fundo.innerHTML = '<div class="sq-caixa-in" role="dialog">' + html + '<div class="sq-botoes"><button type="button" class="menu-btn sq-fechar">Fechar</button></div></div>';
    fundo.addEventListener('click', (ev) => { if (ev.target === fundo || ev.target.classList.contains('sq-fechar')) fundo.remove(); });
    document.body.appendChild(fundo);
    return fundo;
  }

  async function instalar() {
    if (pedido) {   // Chrome / Edge / Android: abre a janelinha de instalar
      const p = pedido; pedido = null;
      try { p.prompt(); const r = await p.userChoice; if (r && r.outcome === 'accepted') esconderBotao(); } catch (e) { /* ok */ }
      return;
    }
    if (ehIOS) {
      caixa('<h2>📲 Instalar no iPhone / iPad</h2><ol>' +
        '<li>Toque no botão <b>Compartilhar</b> <span class="sq-ic">⬆️</span><br><small>(no iPhone fica embaixo; no iPad, lá em cima)</small></li>' +
        '<li>Toque em <b>Adicionar à Tela de Início</b> <span class="sq-ic">➕</span></li>' +
        '<li>Toque em <b>Adicionar</b>. Pronto!</li></ol>' +
        '<p class="sq-obs">O ícone do Sayajin Quest vai aparecer na tela, junto dos outros apps.</p>');
      return;
    }
    if (ehAndroid) {
      caixa('<h2>📲 Instalar no celular</h2><ol>' +
        '<li>Toque nos <b>três pontinhos</b> <span class="sq-ic">⋮</span> lá em cima</li>' +
        '<li>Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b></li>' +
        '<li>Toque em <b>Instalar</b>. Pronto!</li></ol>');
      return;
    }
    caixa('<h2>📲 Instalar no computador</h2><ol>' +
      '<li>No <b>Chrome</b> ou <b>Edge</b>: clique no ícone de instalar <span class="sq-ic">🖥️⬇</span> na ponta direita da barra de endereço</li>' +
      '<li>Se não aparecer: menu <span class="sq-ic">⋮</span> → <b>Transmitir, salvar e compartilhar</b> → <b>Instalar página como app</b></li>' +
      '<li>Clique em <b>Instalar</b>. Pronto!</li></ol>' +
      '<p class="sq-obs">No Safari do Mac: menu <b>Arquivo</b> → <b>Adicionar ao Dock</b>.</p>');
  }

  function convidar() {
    const c = caixa('<h2>📤 Convidar amigos</h2>' +
      '<img class="sq-qr" src="icons/qr-jogo.png" alt="QR code do Sayajin Quest">' +
      '<p>Aponte a câmera do celular para o código, ou mande o link:</p>' +
      '<p class="sq-link">' + URL_JOGO + '</p>' +
      '<div class="sq-botoes"><button type="button" class="menu-btn sq-copiar">📋 Copiar link</button>' +
      (navigator.share ? '<button type="button" class="menu-btn sq-mandar">📤 Mandar</button>' : '') + '</div>' +
      '<p class="sq-obs">Quando abrir o jogo, é só tocar em <b>📲 Instalar o jogo</b>.</p>');
    c.querySelector('.sq-copiar').addEventListener('click', async (ev) => {
      try { await navigator.clipboard.writeText(URL_JOGO); ev.target.textContent = '✅ Link copiado!'; }
      catch (e) { ev.target.textContent = 'Segure o link acima para copiar'; }
    });
    const m = c.querySelector('.sq-mandar');
    if (m) m.addEventListener('click', () => { navigator.share({ title: 'Sayajin Quest', text: '🎮 Vem jogar Sayajin Quest!', url: URL_JOGO }).catch(() => {}); });
  }

  function mostrarBotao() { const b = document.getElementById('btn-install'); if (b && !instalado()) b.hidden = false; }
  function esconderBotao() { const b = document.getElementById('btn-install'); if (b) b.hidden = true; }

  function iniciar() {
    const b = document.getElementById('btn-install');
    if (b) { b.addEventListener('click', instalar); if (!instalado()) b.hidden = false; }   // já instalado: some
    const c = document.getElementById('btn-invite');
    if (c) c.addEventListener('click', convidar);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { /* ok */ });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
