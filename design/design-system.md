# Design system — ¡Memoria!

Direction : **« cahier & azulejo »** — ludique, franc et lisible pour des collégiens. Fond papier crème à trame de points, contours bleu nuit épais, ombres « jouet » décalées vers le bas, dos de cartes bleu cobalt avec un motif de carreau espagnol. Pas de dégradés, pas d'emoji.

Toutes les valeurs ci-dessous existent en variables dans `tokens.css`.

## Couleurs

| Rôle | Variable | Valeur | Usage |
|---|---|---|---|
| Encre | `--ink` | `#1F2A44` | Texte principal, contours, ombres |
| Encre douce | `--ink-soft` | `#3A4560` | Sous-titres, consignes |
| Texte discret | `--muted` | `#4A5470` | Sur-titres, libellés (contraste ≥ 7:1 sur blanc) |
| Fond page | `--paper` | `#FBF6EC` | Fond général |
| Trame | `--paper-dot` | `#E3D8C2` | Points du fond, bordures légères |
| Surface | `--surface` | `#FFFFFF` | Cartes, panneaux, champs |
| Surface chaude | `--surface-warm` | `#FFFDF8` | Lignes du formulaire, carte « Crear » |
| Primaire | `--primary` | `#2346A8` | Boutons principaux, sélection, dos des cartes |
| Accent | `--accent` | `#F2B632` | Anneau de focus, pétales du motif |
| Rouge titre | `--accent-red` | `#D9472F` | « ¡ ! » du titre, contour d'erreur de paire |
| Succès | `--success` | `#2E7D4F` | Contour/coche de paire trouvée, compteur valide |
| Danger | `--danger` | `#B3321F` | « Eliminar », corbeille, bouton « Sí » |
| Fond carte mot | `--word-card` | `#FFF4D6` | Face des cartes mot, bandeau de statut |
| Fond erreur | `--danger-soft` | `#FDE4DF` | Bandeau d'erreur, confirmation de suppression |
| Badge perso | `--custom-soft` / `--custom-ink` | `#ECE6F7` / `#3E2A78` | Badge « De la profe », fond d'aperçu des thèmes créés |

Teintes d'aperçu des thèmes intégrés : frutas `#FDE4DF`, animales `#FFEFCF`, colegio `#DDE7FA`, tiempo `#DDF0E3` (aussi dans `themes.json`).

Le dos des cartes doit rester personnalisable (`--card-back`) ; variantes validées : `#2346A8`, `#D9472F`, `#2E7D4F`, `#1F2A44`.

**Fond de page** : `background-color: var(--paper); background-image: radial-gradient(var(--paper-dot) 1.3px, transparent 1.5px); background-size: 24px 24px;`

## Typographie

Google Fonts : `Baloo 2` (600, 700, 800) et `Nunito` (400, 600, 700, 800).

| Style | Police | Graisse | Taille / interligne |
|---|---|---|---|
| Titre d'accueil | Baloo 2 | 800 | 76 px / 0.95, espacement −0.01em |
| Titre d'écran | Baloo 2 | 800 | 40 px / 1 |
| Titre de fin | Baloo 2 | 800 | 52 px / 1 |
| Titre de pop-up | Baloo 2 | 800 | 32 px / 1.1 |
| Nom de thème | Baloo 2 | 800 | 26 px / 1.1 |
| Boutons principaux | Baloo 2 | 800 | 20–21 px |
| Valeurs de pastilles | Baloo 2 | 800 | 24 px (partie), 30 px (fin) |
| Sous-titre accueil | Nunito | 600 | 20 px |
| Corps / consignes | Nunito | 600–700 | 15–17 px |
| Sur-titres / libellés | Nunito | 800 | 12–15 px, MAJUSCULES, espacement 0.06–0.08em |

Repli : `'Trebuchet MS', sans-serif` pour Baloo 2 ; `'Segoe UI', system-ui, sans-serif` pour Nunito. Titre d'accueil à réduire (~52 px) sous 480 px de large.

## Forme et profondeur

- Contour standard : `2px solid var(--ink)`.
- Rayons : 10 px (vignettes), 12 px (champs), 14 px (boutons, pastilles), 16 px (cartes de jeu, emplacements), 20 px (cartes de thème), 22–24 px (panneaux, pop-up), 999 px (bouton retour, badges).
- **Ombre « jouet »** (dure, sans flou) : `0 3px 0` (bouton retour), `0 4px 0` (boutons, sélecteur), `0 6px 0` (cartes de thème, panneau), `0 8px 0` (pop-up, écran de fin), couleur `--ink`.
- **Appui** : boutons `.push` → `transform: translateY(3px)` en `:active`, transition 80 ms.
- Espacements courants : 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36 px. Grille de thèmes : gap 24 px. Plateau : gap 14 px (10 px sur mobile).

## Composants

**Bouton principal** — fond `--primary`, texte blanc, contour encre, rayon 14, ombre 0 4px 0, hauteur ≥ 50 px, Baloo 2 800 20 px.
**Bouton secondaire** — mêmes mesures, fond blanc, texte encre.
**Bouton retour** — pilule blanche, icône `arrow-left` + « Temas », hauteur 48, ombre 0 3px 0.
**Bouton icône** — 52×52 (60×60 dans la pop-up), fond blanc, contour encre, rayon 14–16, icône 24–28 px.
**Lien d'action** — texte souligné 800, bleu (Modificar) ou rouge (Eliminar), hauteur ≥ 44.
**Sélecteur de classe** — boutons ≥ 108×66, libellé Baloo 32 px + compteur 13 px ; actif = fond `--primary` texte blanc, inactif = fond blanc ; `aria-pressed`.
**Pastille de statistique** — fond blanc (partie) ou crème (fin), contour encre, rayon 14, libellé MAJUSCULE 12 px `--muted` au-dessus, valeur Baloo dessous, largeur ≥ 88.
**Carte de thème** — fond blanc, contour, rayon 20, ombre 0 6px 0, padding 16, gap 14 : aperçu (3 vignettes carrées blanches sur fond teinté, rayon 14, padding 12) → nom + sous-ligne (+ badge) → bouton Jugar → actions.
**Carte « Crear un tema »** — contour 2,5 px pointillé, fond `--surface-warm`, hauteur ≥ 280, pastille ronde 60 px bleue avec `plus` blanc.
**Carte de jeu** — `<button>` au ratio 4:3, deux faces superposées (voir Animations). Contour encre 2 px, rayon 16. Dos : `--card-back` + `card-back.svg` (56 % × 70 %) + filet intérieur `inset 0 0 0 7px rgba(255,255,255,.14)`. Paire trouvée : `outline: 4px solid var(--success); outline-offset: -3px` + pastille ronde 28 px verte avec coche en haut à droite. Erreur : même outline en `--accent-red`.
**Champ texte** — hauteur 48–52, contour encre, rayon 12, texte 18–20 px 700.
**Emplacement photo** — 120×90, contour 2 px pointillé `#6B7488`, rayon 12, icône `image` + « Añadir foto » en bleu ; photo en `cover` une fois choisie.
**Bandeaux** — statut : fond `--word-card`, contour encre, rayon 14 ; erreur : fond `--danger-soft`, texte `#9E2B17`, rayon 12.
**Pop-up** — voile `rgba(31,42,68,.6)`, boîte blanche 480 px max, contour, rayon 24, ombre 0 8px 0, padding 28 ; nombre en Baloo 72 px bleu ; curseur `accent-color: var(--primary)`.

## Icônes

`assets/icons/*.svg` : viewBox 24, trait `currentColor` 2,2, extrémités arrondies — `arrow-left`, `plus`, `minus`, `trash`, `refresh`, `image`, `check`. Toujours `aria-hidden="true"` ; le libellé est sur le bouton.

## Illustrations des thèmes

`assets/pictos/<thème>/<mot>.svg` : viewBox 64×64, aplats de couleur, contour `#1F2A44` 2,4 arrondi. Pour un nouveau thème intégré, garder ce style (formes simples, 3 à 6 couleurs de la palette des pictos : rouge `#E0533D`, jaune `#F2B632`, orange `#F08A2E`, vert `#3FA34D`, violet `#7A4FB5`, bleu `#3B7DD8`, brun `#8A5A3B`, gris `#B8BFCC`, rose `#F4A7B9`).

## Animations

- **Retournement** : conteneur `perspective: 900px` ; face interne `transition: transform .45s cubic-bezier(.2,.7,.3,1); transform-style: preserve-3d` ; état visible = `rotateY(180deg)` ; faces en `backface-visibility: hidden`, face avant pré-tournée de 180°.
- **Survol** d'une carte face cachée : `translateY(-4px)`.
- **Erreur** : secousse horizontale de 0,45 s sur le bouton (±6 px puis ±4 px) — sur le bouton, pas sur la face, pour ne pas casser la rotation.
- `prefers-reduced-motion: reduce` : pas de transition de retournement ni de secousse.

## Accessibilité

- Focus visible partout : `outline: 3px solid var(--accent); outline-offset: 3px` (y compris `:focus-within` sur l'emplacement photo).
- Cibles tactiles ≥ 44 px (la plupart font 48–52).
- Contrastes vérifiés : texte blanc sur `--primary` ≈ 8:1 ; `--muted` sur blanc ≈ 7:1 ; le rouge `--accent-red` n'est utilisé que pour du très grand texte ou des contours, jamais pour du texte courant.
- Paire juste / fausse distinguées aussi par la coche et la secousse, pas seulement par la couleur.
