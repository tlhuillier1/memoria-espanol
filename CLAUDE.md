# ¡Memoria! — jeu de memory pour la classe d'espagnol

Site web pour une professeure d'espagnol (LV2, collège). Les élèves jouent à un memory : chaque paire = **un mot espagnol** + **son image**. Les thèmes sont rangés par classe (**5e, 4e, 3e**) et la professeure peut créer ses propres thèmes avec ses photos.

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

- **Vite + React + TypeScript**, site 100 % statique (aucun serveur nécessaire pour la v1), déployable sur Vercel / Netlify / GitHub Pages.
- CSS simple avec les variables de `design/tokens.css` (pas de framework UI). Polices Google Fonts : Baloo 2 + Nunito.
- Thèmes personnalisés stockés **dans le navigateur via IndexedDB** (ex. `idb-keyval`) — pas localStorage : les photos dépassent vite sa limite de ~5 Mo.
- Accès aux thèmes derrière une interface unique (`ThemeStore` : `list`, `get`, `save`, `remove`) pour pouvoir brancher un stockage en ligne plus tard sans toucher l'UI.
- Tests : Vitest pour la logique de jeu (tirage, paires, fin de partie) et la validation du formulaire.

## Règles de travail

- **Interface en espagnol** (textes exacts dans `specification.md` §7). Code, noms de fichiers et commentaires en anglais ; documentation en français.
- **Pas de synthèse vocale** (retirée volontairement), **pas de niveaux Facile/Normal** : le nombre de mots se choisit dans la pop-up avant chaque partie.
- Pas d'emoji dans l'interface ; icônes = SVG trait de `design/assets/icons/`.
- Pas de `alert()` / `confirm()` du navigateur : confirmations en ligne (voir la suppression d'un thème).
- Accessibilité : vrais `<button>` / `<input>` / `<label>`, cibles ≥ 44 px, contraste ≥ 4,5:1, focus visible, `prefers-reduced-motion` respecté.
- Responsive : doit fonctionner de 360 px (téléphone) à grand écran ; priorité ordinateur et tablette.

## Questions ouvertes (à poser à l'utilisateur au moment opportun, ne pas trancher seul)

1. **Partage des thèmes créés** : en v1 ils restent sur l'appareil où ils ont été créés. Faut-il que les élèves voient sur leur tablette les thèmes créés par la professeure (⇒ stockage en ligne, ex. Supabase) ?
2. **Qui peut créer/modifier/supprimer un thème** : tout le monde (comme le prototype) ou seulement la professeure (mode enseignant protégé) ?
3. **Thèmes intégrés de 4e et 3e** : aucun pour l'instant ; attendre la liste des thématiques de l'utilisateur.
4. **Hébergement / nom de domaine**.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de dev (http://localhost:5173) |
| `npm run build` | Vérif TypeScript + build statique dans `dist/` |
| `npm run preview` | Sert le build |
| `npm test` / `npm run test:watch` | Tests Vitest (`src/**/*.test.ts`) |
| `npm run lint` | oxlint |

## Organisation du code

- `src/types.ts` — modèle de données (spec §4).
- `src/store/` — interface `ThemeStore` + thèmes intégrés ; implémentation IndexedDB (`idbThemeStore.ts`, toutes les fiches sous une clé, écrites avec `update`) ; instance unique dans `index.ts` ; `useCustomThemes` (état React d'abord, puis écriture) ; classe mémorisée en localStorage (`gradePreference.ts`).
- `src/game/` — moteur pur (`engine.ts`), hook des minuteries (`useMemoryGame.ts`), écrans de partie et de fin.
- `src/home/` — accueil, cartes de thème (suppression confirmée en ligne), pop-up du nombre de mots (`<dialog>` natif en `showModal()` : piège de focus et Échap fournis par le navigateur).
- `src/editor/` — formulaire de création / modification : brouillon et validation purs (`draft.ts`), import des photos (`readImage.ts`, 360 px max, JPEG 0,82 sur fond blanc), écran `EditorScreen.tsx`.

## Pièges rencontrés

- **`img.decode()`** peut rester en attente quand la page ne s'affiche pas (onglet en arrière-plan, panneau masqué) : utiliser `onload` / `onerror`.
- **`window.scrollTo()`** renvoie une promesse dans les Chrome récents : ne jamais l'écrire en corps d'expression d'un effet (`useEffect(() => window.scrollTo(…))`), React la prend pour une fonction de nettoyage.
- **Le watcher de Vite sous Windows** rate parfois une écriture de fichier : si le navigateur affiche un comportement ancien, vérifier ce que sert `/src/...` et faire `touch` sur le fichier.
- `src/lib/` — logique pure testable (ex. `splitArticle`), `imageUrl()` pour résoudre les chemins d'images avec la base du site.
- `src/styles/tokens.css` — **copie** de `design/tokens.css` ; `src/data/themes.json` — copie de `design/data/themes.json` ; `public/assets/` — copie de `design/assets/`. Si le design change, recopier ces fichiers.
- `vite.config.ts` utilise `base: './'` : toujours passer par `imageUrl()` pour les images, jamais de chemin absolu `/assets/…`.
