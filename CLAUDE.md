# Sayajin Quest — notas para quem for mexer no jogo

- O site (GitHub Pages) sai do branch `main`. Sempre envie as mudanças para `main`
  (o branch padrão se chama `main-/-(root)` por engano; mantenha os dois iguais).
- O jogo é o `index.html`. O banco é o Firebase: `config.js` (configuração pública) e `nuvem.js`
  (faz o papel do `window.claude.use('db' | 'user')` que o jogo usava dentro do Claude).
- `dados/migracao.json` trouxe contas, ranking e códigos do Claude uma única vez
  (o documento `meta/migracao` no Firestore marca que já foi feito).
- A versão antiga no Claude (artifact) ficou parada: as novidades do jogo vêm para cá.
