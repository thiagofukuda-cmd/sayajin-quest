// ☁️ Banco do Sayajin Quest fora do Claude: Firebase (Firestore) + login anônimo de cada aparelho.
// O jogo continua pedindo window.claude.use('db') e use('user'); aqui quem responde é o Firebase.
// Sem internet ou sem Firebase configurado, o jogo funciona do mesmo jeito, salvando só no aparelho.
(function () {
  'use strict';
  if (window.claude && window.claude.use) return;   // aberto dentro do Claude: usa o banco do Claude

  const cfg = window.SQ_FIREBASE_CONFIG || null;
  const MIGRACAO_URL = 'dados/migracao.json';
  let pronto = null, falhouEm = 0;

  // 📦 1ª vez que alguém abre a versão nova: traz contas, ranking e códigos da versão do Claude
  async function migrar(db, uid) {
    const metaRef = db.collection('meta').doc('migracao');
    try { if ((await metaRef.get()).exists) return; } catch (e) { return; }
    let dados = null;
    try {
      const r = await fetch(MIGRACAO_URL, { cache: 'no-store' });
      if (!r.ok) return;
      dados = await r.json();
    } catch (e) { return; }
    const docs = [];
    for (const [col, itens] of Object.entries((dados && dados.colecoes) || {})) {
      for (const [id, d] of Object.entries(itens || {})) docs.push([col, id, d]);
    }
    if (!docs.length || docs.length > 450) return;
    try {
      await db.runTransaction(async (t) => {
        const m = await t.get(metaRef);
        if (m.exists) return;   // outro aparelho já trouxe
        for (const [col, id, d] of docs) t.set(db.collection(col).doc(id), d);
        t.set(metaRef, { at: Date.now(), docs: docs.length, origem: String(dados.origem || ''), por: uid });
      });
    } catch (e) { console.warn('[Sayajin Quest] a migração não terminou:', e && e.message); }
  }

  function iniciar() {
    if (pronto) return pronto;
    if (falhouEm && Date.now() - falhouEm < 30000) return Promise.resolve(null);
    pronto = (async () => {
      try {
        if (!cfg || !cfg.apiKey || !cfg.projectId || !window.firebase) return null;
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        const db = firebase.firestore();
        try { db.settings({ ignoreUndefinedProperties: true, merge: true }); } catch (e) { /* já estava configurado */ }
        const auth = firebase.auth();
        // espera o Firebase lembrar do aparelho; se for a 1ª vez, entra como jogador anônimo
        await new Promise((res) => { const off = auth.onAuthStateChanged(() => { off(); res(); }); });
        if (!auth.currentUser) await auth.signInAnonymously();
        const uid = auth.currentUser && auth.currentUser.uid;
        if (!uid) throw new Error('sem login anônimo');
        await migrar(db, uid);
        return { db, uid };
      } catch (e) {
        console.warn('[Sayajin Quest] banco indisponível, salvando só no aparelho:', e && e.message);
        pronto = null; falhouEm = Date.now();
        return null;
      }
    })();
    return pronto;
  }

  function usuario(uid) {
    const perfil = (id) => ({ id, name: '', avatarUrl: '', color: '#888888', email: null, isMe: id === uid, guest: false });
    return Object.freeze({
      id: async () => uid,
      me: async () => ({ id: uid, name: '', avatarUrl: '', color: '#888888', email: null, isOwner: false, canEdit: false }),
      isOwner: async () => false,
      canEdit: async () => false,
      can: async () => null,
      profiles: async (ids) => Object.fromEntries([].concat(ids || []).map((id) => [id, perfil(id)]))
    });
  }

  // no máximo 10 s esperando o banco (como no Claude); depois disso joga salvando no aparelho
  const comPrazo = (p, ms) => Promise.race([p, new Promise((res) => setTimeout(() => res(null), ms))]);

  window.claude = Object.freeze({
    use: async (name) => {
      const r = await comPrazo(iniciar(), 10000);
      if (!r) return null;
      if (name === 'db') return r.db;
      if (name === 'user') return usuario(r.uid);
      return null;
    }
  });
})();
