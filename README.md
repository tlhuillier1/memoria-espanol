# ¡Memoria!

Jeu de memory pour la classe d'espagnol (LV2, collège). Chaque paire associe **un mot espagnol** et **son image** : l'élève retourne deux cartes, retrouve les paires et révise son vocabulaire en jouant.

Les thèmes sont rangés par classe (**5e, 4e, 3e**). La professeure peut créer ses propres thèmes avec ses photos, directement depuis le site.

- Pour un élève seul, sur ordinateur ou tablette (fonctionne aussi sur téléphone, dès 360 px de large).
- Interface en espagnol.
- Site 100 % statique : aucun serveur, aucun compte, aucune donnée envoyée sur Internet.

---

## Sommaire

1. [Fonctionnement du site](#fonctionnement-du-site)
2. [Stack technique](#stack-technique)
3. [Démarrage rapide](#démarrage-rapide)
4. [Commandes](#commandes)
5. [Organisation du code](#organisation-du-code)
6. [Données et stockage](#données-et-stockage)
7. [Ajouter un thème intégré](#ajouter-un-thème-intégré)
8. [Déploiement](#déploiement)
9. [Accessibilité](#accessibilité)
10. [Compatibilité navigateurs](#compatibilité-navigateurs)
11. [Limites connues et pistes](#limites-connues-et-pistes)
12. [Conception](#conception)
13. [Licence](#licence)

---

## Fonctionnement du site

Le site tient en trois écrans et une pop-up :

```
Accueil (classe + thèmes)
 ├─ « Jugar » ──► Pop-up « nombre de mots » ──► Partie ──► Écran de fin
 │                                                 ▲            │
 │                                                 └─ Jugar otra vez
 └─ « Crear un tema » / « Modificar » ──► Formulaire ──► Accueil
```

### Accueil

- **Choix de la classe** : 5e, 4e ou 3e, avec le nombre de thèmes de chacune. Le choix est mémorisé sur l'appareil (5e par défaut).
- **Cartes de thème** : aperçu de trois images, nom en espagnol, traduction française pour les thèmes intégrés, nombre de mots.
- Les thèmes créés portent le badge **« Mi tema »** et peuvent être **modifiés** ou **supprimés**. La suppression se confirme dans la carte (« ¿Eliminar este tema? Sí / No »).
- La carte **« Crear un tema »** ouvre le formulaire, avec la classe affichée déjà sélectionnée.

### Pop-up « ¿Con cuántas palabras quieres jugar? »

Avant chaque partie, on choisit le nombre de mots, de 2 jusqu'au nombre de mots du thème (6 par défaut). Si le thème contient plus de mots que demandé, ils sont **tirés au hasard** à chaque partie. On peut ainsi créer un grand thème et jouer des parties courtes et toujours différentes.

### Partie

- Les cartes sont mélangées : pour chaque mot, une **carte image** et une **carte mot** (avec l'article au-dessus du nom : *la* / *manzana*).
- On retourne deux cartes :
  - si c'est le mot et son image, la paire reste visible (contour vert et coche) ;
  - sinon, les deux cartes tremblent (contour rouge) puis se retournent au bout d'1,1 s.
- En haut de l'écran : **Parejas** (paires trouvées), **Intentos** (essais) et **Tiempo** (le chrono démarre au premier clic).
- Le bouton ↻ relance une partie avec un nouveau tirage. « ← Temas » abandonne la partie.

### Écran de fin

Il affiche « ¡Enhorabuena! », le nombre d'essais et le temps, puis la liste **« Repasa las palabras »** (chaque image avec son mot complet). Deux boutons : **« Jugar otra vez »** (nouveau tirage, même thème, même nombre de mots) et **« Cambiar de tema »**.

### Création et modification d'un thème

- **Nom** du thème et **classe**.
- **Autant de lignes que voulu**, chacune avec une **photo** (choisie sur l'appareil, ou prise avec l'appareil photo sur tablette) et un **mot avec son article** (*el perro*, *las uvas*…).
- Les photos sont réduites automatiquement (360 px maximum, JPEG) pour rester légères.
- Il faut au moins 2 mots complets, et chaque mot doit avoir son image. Les lignes laissées vides sont ignorées.

---

## Stack technique

| Domaine | Choix |
|---|---|
| Framework | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build / serveur de dev | [Vite 8](https://vite.dev) |
| Styles | CSS simple avec variables (`src/styles/tokens.css`), sans framework UI |
| Polices | Google Fonts : *Baloo 2* (titres) et *Nunito* (texte) |
| Stockage des thèmes créés | IndexedDB du navigateur via [idb-keyval](https://github.com/jakearchibald/idb-keyval) |
| Tests | [Vitest](https://vitest.dev) |
| Lint | [oxlint](https://oxc.rs) |
| Hébergement | [Vercel](https://vercel.com) (tout hébergeur de fichiers statiques convient) |

Il n'y a ni routeur, ni gestionnaire d'état, ni bibliothèque de composants. L'application reste petite et ses dépendances sont réduites au minimum.

---

## Démarrage rapide

**Prérequis** : [Node.js](https://nodejs.org) **22.12 ou plus récent** (requis par Vitest ; Vite seul accepte aussi 20.19+) et npm.

```bash
npm install
```

```bash
npm run dev
```

Le site est alors disponible sur http://localhost:5173.

---

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement avec rechargement à chaud |
| `npm run build` | Vérification TypeScript puis build de production dans `dist/` |
| `npm run preview` | Sert le contenu de `dist/` pour le tester avant mise en ligne |
| `npm test` | Lance les tests une fois |
| `npm run test:watch` | Relance les tests à chaque modification |
| `npm run lint` | Analyse le code avec oxlint |

---

## Organisation du code

```
├── design/                  Dossier de conception (référence, ne pas modifier sans raison)
├── public/assets/           Pictos, icônes et dos de carte servis tels quels (copie de design/assets)
├── src/
│   ├── App.tsx              Navigation entre les écrans, classe active, message de statut
│   ├── types.ts             Modèle de données (Grade, Theme, ThemeWord)
│   ├── components/          Petits composants partagés (icônes, sélecteur de classe, pastilles…)
│   ├── home/                Accueil, cartes de thème, pop-up du nombre de mots
│   ├── game/                Moteur de jeu pur, hook des minuteries, écran de partie et de fin
│   ├── editor/              Formulaire de thème : brouillon, validation, import des photos
│   ├── store/               Thèmes intégrés, stockage IndexedDB, classe mémorisée
│   ├── lib/                 Utilitaires (découpe article / nom, chemins d'images)
│   ├── data/themes.json     Thèmes intégrés (copie de design/data/themes.json)
│   └── styles/              Variables de design, styles globaux et composants communs
└── vite.config.ts           Configuration Vite et Vitest
```

**Principes :**

- **La logique est séparée de l'affichage.**
  - `game/engine.ts` (tirage, mélange, paires, victoire) et `editor/draft.ts` (validation du formulaire) sont des fonctions pures, testées sans navigateur.
  - Les composants React ne font qu'afficher l'état et transmettre les clics.
- **Un seul point d'accès aux thèmes créés** : l'interface `ThemeStore` (`list`, `get`, `save`, `remove`). L'implémentation actuelle utilise IndexedDB. Pour passer à un stockage en ligne, il suffira de changer `src/store/index.ts`, sans toucher à l'interface.
- **Images** : toujours passer par `imageUrl()` (`src/lib/assets.ts`), jamais par un chemin absolu `/assets/…`. Le site est construit avec une base relative (`base: './'`) pour fonctionner dans n'importe quel sous-dossier.
- **Langues** : textes de l'interface en espagnol ; code, noms de fichiers et commentaires en anglais ; documentation en français.

---

## Données et stockage

| Donnée | Où | Remarque |
|---|---|---|
| Thèmes intégrés | `src/data/themes.json` + `public/assets/pictos/` | Livrés avec le site, non modifiables dans l'interface |
| Thèmes créés (avec leurs photos) | IndexedDB du navigateur | Restent **sur l'appareil et dans le navigateur** où ils ont été créés |
| Classe choisie | `localStorage` (clé `memoria-grade`) | Préférence de confort |

À savoir :

- **Rien n'est envoyé sur Internet.** Les photos ne quittent pas l'appareil.
- Un thème créé sur l'ordinateur de la professeure **n'apparaît pas** sur la tablette d'un élève (voir [Limites connues](#limites-connues-et-pistes)).
- **Vider les données du site** dans le navigateur, ou naviguer en mode privé, efface les thèmes créés.
- Si le navigateur refuse d'enregistrer, le thème reste utilisable jusqu'à la fermeture de la page, et un message le signale.

---

## Ajouter un thème intégré

Les thèmes intégrés sont livrés avec le site et visibles sur tous les appareils.

1. Dessiner un picto SVG par mot dans le style existant (`viewBox` 64×64, aplats de couleur, contour `#1F2A44` de 2,4 ; palette dans `design/design-system.md`).
2. Les placer dans `design/assets/pictos/<theme>/` **et** dans `public/assets/pictos/<theme>/`.
3. Ajouter le thème dans `design/data/themes.json` **et** dans `src/data/themes.json` :

   ```json
   {
     "id": "ropa",
     "grade": "4e",
     "name": "La ropa",
     "nameFr": "Les vêtements",
     "tint": "#DDE7FA",
     "builtIn": true,
     "words": [
       { "word": "la camisa", "image": "assets/pictos/ropa/camisa.svg" }
     ]
   }
   ```

4. Lancer `npm run dev` et vérifier le thème dans la bonne classe.

> Les fichiers de `src/data/`, `src/styles/tokens.css` et `public/assets/` sont des **copies** de `design/`. Si le design évolue, il faut les recopier.

---

## Déploiement

Le site est en ligne sur **https://memoria-espanol.vercel.app**.

Le projet Vercel `memoria-espanol` est relié à ce dépôt GitHub :

- **chaque merge sur `main`** met automatiquement le site en ligne à jour (en moins d'une minute) ;
- **chaque pull request** reçoit une URL d'aperçu pour tester avant le merge. Ces aperçus ne sont visibles qu'en étant connecté au compte Vercel ; le site principal, lui, est public.

Rien à installer ni à lancer à la main. Le suivi des déploiements se fait sur le tableau de bord Vercel du projet.

### Autre hébergeur

`npm run build` produit un dossier `dist/` entièrement statique. Il n'y a ni routes ni serveur : il suffit de publier ce dossier.

| Hébergeur | Réglages |
|---|---|
| **Vercel** | Framework « Vite », commande `npm run build`, dossier de sortie `dist` |
| **Netlify** | Commande `npm run build`, dossier de publication `dist` |
| **GitHub Pages** | Publier `dist/` (par exemple avec une GitHub Action). La base relative fait fonctionner le site dans un sous-dossier `/<depot>/` sans réglage supplémentaire. |

Le site nécessite une connexion pour charger les polices Google Fonts. Sans elles, il reste utilisable avec des polices de repli.

---

## Accessibilité

- Vrais boutons et champs de formulaire, avec une étiquette pour chaque contrôle. Chaque carte est un bouton, avec un libellé lu par les lecteurs d'écran (« Carta 5, boca abajo », « Palabra: la fresa (pareja encontrada) »).
- Jouable entièrement au clavier. Le focus est toujours visible (contour jaune).
- La pop-up est une vraie fenêtre modale : le focus y reste, Échap ou un clic à l'extérieur la ferme, et le focus revient ensuite sur le bouton « Jugar ».
- Cibles tactiles d'au moins 44 px et contrastes d'au moins 4,5:1.
- Les paires justes ou fausses ne se distinguent pas seulement par la couleur : il y a aussi la coche et la secousse.
- Le réglage système « réduire les animations » (`prefers-reduced-motion`) désactive le retournement animé et la secousse.

---

## Compatibilité navigateurs

Navigateurs récents (environ 2023 et après) : Chrome, Edge, Firefox et Safari, sur ordinateur, tablette (iPad, Android) et téléphone. Le site utilise `<dialog>`, les *container queries* (`cqi`) et IndexedDB.

---

## Limites connues et pistes

Pas encore tranché :

- **Partage des thèmes créés** : faut-il que les élèves retrouvent sur leur tablette les thèmes créés par la professeure ? Cela demanderait un stockage en ligne (par exemple Supabase), branché derrière `ThemeStore`.
- **Droits** : aujourd'hui, toute personne qui utilise le site peut créer, modifier ou supprimer un thème (sur son appareil). Un « mode enseignant » protégé est envisageable.
- **Thèmes intégrés de 4e et 3e** : aucun pour l'instant, en attente de la liste des thématiques.
- **Nom de domaine** : le site utilise l'adresse gratuite `memoria-espanol.vercel.app`. Un domaine personnalisé pourra être ajouté dans Vercel.

Hors périmètre de la v1 : synthèse vocale ou prononciation, niveaux de difficulté, mode à plusieurs joueurs, comptes élèves, scores enregistrés.

---

## Conception

Le dossier [`design/`](design/README.md) contient la conception complète :

- [`specification.md`](design/specification.md) : écrans, règles du jeu, données, validations, textes exacts de l'interface. **Il fait foi pour le fonctionnement.**
- [`design-system.md`](design/design-system.md) : couleurs, typographies, composants, animations. **Il fait foi pour l'apparence.**
- `prototype/` : source du prototype jouable, qui sert de référence de comportement (le code n'est pas réutilisé).

---

## Licence

Code distribué sous licence [MIT](LICENSE).
