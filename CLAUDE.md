# ¡Memoria! — jeu de memory pour la classe d'espagnol

Site web pour une professeure d'espagnol (LV2, collège). Les élèves jouent à un memory : chaque paire = **un mot espagnol** + **son image**. Les thèmes sont rangés par classe (**5e, 4e, 3e**) et la professeure peut créer ses propres thèmes avec ses photos : ils sont stockés en ligne et visibles par tous, mais **seule la professeure** (mode protégé par mot de passe) peut les créer, modifier ou supprimer.

Usage cible : un élève seul, sur ordinateur ou tablette.

## Où est la conception

Tout est dans `design/` — **lis `design/README.md` avant de coder.**

| Fichier | Contenu |
|---|---|
| `design/specification.md` | Écrans, parcours, règles du jeu, modèle de données, validations, textes de l'interface. **Référence fonctionnelle.** |
| `design/design-system.md` | Couleurs, typographies, composants, animations, accessibilité. **Référence visuelle.** |
| `design/tokens.css` | Variables CSS prêtes à importer. |
| `design/data/themes.json` | Les 4 thèmes intégrés (5e) avec leurs mots et images. |
| `design/assets/` | Pictos SVG des thèmes intégrés, icônes, motif du dos des cartes. |
| `design/prototype/` | Source du prototype jouable (référence de comportement, pas du code à réutiliser). |

En cas de doute, la spécification et le design system font foi ; le prototype sert à lever les ambiguïtés de comportement.

## Stack (confirmée)

- **Vite + React + TypeScript** pour le site (statique), plus des **fonctions Vercel** dans `api/` (runtime Node, signature Web `GET(request: Request): Response`). Le site dépend donc de **Vercel** (plus de Netlify / GitHub Pages).
- CSS simple avec les variables de `design/tokens.css` (pas de framework UI). Polices Google Fonts : Baloo 2 + Nunito.
- Thèmes créés dans **Neon Postgres (plan gratuit)**, projet `memoria-espanol` (`noisy-poetry-04655432`, Francfort), driver HTTP `@neondatabase/serverless`. Photos dans la base (`bytea`, adressées par SHA-256, en cache un an). Branche Neon `main` = production, branche `dev` = local + aperçus Vercel. Schéma : `db/schema.sql` (idempotent, à appliquer sur chaque branche).
- Fonctions Vercel en région `fra1` (`vercel.json`), à côté de la base.
- **Mode professeure** : un mot de passe unique (`TEACHER_PASSWORD`), puis cookie HttpOnly signé (`SESSION_SECRET`, 30 jours glissants). Toute écriture est vérifiée côté serveur ; 10 échecs / 15 min / IP ⇒ 429.
- Accès aux thèmes derrière une interface unique (`ThemeStore` : `list`, `get`, `save`, `remove`) ; implémentation `apiThemeStore.ts`.
- Tests : Vitest pour la logique de jeu (tirage, paires, fin de partie) et la validation du formulaire.

## Règles de travail

- **Interface en espagnol** (textes exacts dans `specification.md` §7). Code, noms de fichiers et commentaires en anglais ; documentation en français.
- **Pas de synthèse vocale** (retirée volontairement), **pas de niveaux Facile/Normal** : le nombre de mots se choisit dans la pop-up avant chaque partie.
- Pas d'emoji dans l'interface ; icônes = SVG trait de `design/assets/icons/`.
- Pas de `alert()` / `confirm()` du navigateur : confirmations en ligne (voir la suppression d'un thème).
- Accessibilité : vrais `<button>` / `<input>` / `<label>`, cibles ≥ 44 px, contraste ≥ 4,5:1, focus visible, `prefers-reduced-motion` respecté.
- Responsive : doit fonctionner de 360 px (téléphone) à grand écran ; priorité ordinateur et tablette.

## Questions ouvertes (à poser à l'utilisateur au moment opportun, ne pas trancher seul)

1. **Thèmes intégrés de 4e et 3e** : aucun pour l'instant ; attendre la liste des thématiques de l'utilisateur.
2. **Nom de domaine** : le site est sur `memoria-espanol.vercel.app` ; pas de domaine personnalisé pour l'instant.

Tranché (31/10/2026) : thèmes créés partagés en ligne (Neon) ; seule la professeure les gère, avec un mot de passe unique ; photos dans la base ; anciens thèmes IndexedDB abandonnés.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de dev (http://localhost:5173) ; sert aussi `api/` via un plugin de `vite.config.ts` (pas besoin de la CLI Vercel), avec les secrets de `.env.local` |
| `npm run build` | Vérif TypeScript + build statique dans `dist/` |
| `npm run preview` | Sert le build |
| `npm test` / `npm run test:watch` | Tests Vitest (`src/**/*.test.ts`) |
| `npm run lint` | oxlint |

CI GitHub Actions (`.github/workflows/ci.yml`) : sur chaque pull request et chaque push sur `main`, `npm ci` puis lint, tests et build (Node 24).

Variables d'environnement (serveur uniquement, jamais préfixées `VITE_`) : `DATABASE_URL`, `TEACHER_PASSWORD`, `SESSION_SECRET` — dans `.env.local` en local (git-ignoré, branche Neon `dev`), et dans Vercel (Production → branche Neon `main`, Preview → branche `dev`). Modèle : `.env.example`.

Déploiement : projet Vercel `memoria-espanol` (compte `tlhuillier1`), relié au dépôt GitHub. Chaque push sur `main` (donc chaque merge de PR) met en ligne https://memoria-espanol.vercel.app ; chaque PR reçoit une URL d'aperçu, accessible seulement connecté à Vercel. Réglages du projet : framework Vite, `npm ci`, `npm run build`, sortie `dist`, Node 24. `vercel.json` ne fixe que la région des fonctions (`fra1`).

`main` est protégée par la règle GitHub « Protect main » (Settings → Rules) : **aucun push direct, même pour l'admin**. Tout changement passe par une branche + une pull request, mergeable seulement quand le check « Lint, test, build » est vert. Suppression et force-push de `main` interdits. Si le nom du job CI change, mettre à jour le check requis dans la règle.

## Organisation du code

- `src/types.ts` — modèle de données (spec §4).
- `api/` — fonctions Vercel (une route par fichier, `[id].ts` pour `/<id>`) ; `server/` — code partagé côté serveur (session, validation, accès Neon), imports relatifs **avec `.js`** (ESM Node), vérifié par `tsconfig.api.json`, testé par Vitest (`server/**/*.test.ts`).
- `src/store/` — interface `ThemeStore` + thèmes intégrés ; `apiThemeStore.ts` (envoie d'abord les nouvelles photos à `api/images`, puis le thème) ; `api.ts` (`apiFetch`, `ApiError` avec le statut HTTP) ; `teacherSession.ts` (connexion) ; `useCustomThemes` (écriture serveur d'abord, puis état React) ; classe mémorisée en localStorage (`gradePreference.ts`).
- `src/game/` — moteur pur (`engine.ts`), hook des minuteries (`useMemoryGame.ts`), écrans de partie et de fin.
- `src/home/` — accueil, cartes de thème (suppression confirmée en ligne), pop-ups du nombre de mots et de connexion professeure (`<dialog>` natif en `showModal()` : piège de focus et Échap fournis par le navigateur ; classes CSS communes `.dialog*`).
- `src/editor/` — formulaire de création / modification : brouillon et validation purs (`draft.ts`), import des photos (`readImage.ts`, 360 px max, JPEG 0,82 sur fond blanc), écran `EditorScreen.tsx`.

## Pièges rencontrés

- **`img.decode()`** peut rester en attente quand la page ne s'affiche pas (onglet en arrière-plan, panneau masqué) : utiliser `onload` / `onerror`.
- **`window.scrollTo()`** renvoie une promesse dans les Chrome récents : ne jamais l'écrire en corps d'expression d'un effet (`useEffect(() => window.scrollTo(…))`), React la prend pour une fonction de nettoyage.
- **Le watcher de Vite sous Windows** rate parfois une écriture de fichier : si le navigateur affiche un comportement ancien, vérifier ce que sert `/src/...` et faire `touch` sur le fichier.
- `src/lib/` — logique pure testable (ex. `splitArticle`), `imageUrl()` pour résoudre les chemins d'images avec la base du site.
- `src/styles/tokens.css` — **copie** de `design/tokens.css` ; `src/data/themes.json` — copie de `design/data/themes.json` ; `public/assets/` — copie de `design/assets/`. Si le design change, recopier ces fichiers.
- `vite.config.ts` utilise `base: './'` : toujours passer par `imageUrl()` pour les images, jamais de chemin absolu `/assets/…`.
