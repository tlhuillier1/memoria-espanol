# Dossier de conception — ¡Memoria!

Ce dossier contient tout ce qu'il faut pour construire le site sans repasser par la phase de design.

```
design/
├── README.md               ← ce fichier
├── specification.md        ← fonctionnel : écrans, règles, données, textes
├── design-system.md        ← visuel : couleurs, typos, composants, animations
├── tokens.css              ← variables CSS à importer telles quelles
├── data/
│   └── themes.json         ← thèmes intégrés (classe, nom, mots, images)
├── assets/
│   ├── card-back.svg       ← motif « azulejo » du dos des cartes
│   ├── icons/              ← icônes trait 24 px (currentColor)
│   └── pictos/<thème>/     ← une illustration SVG par mot (64×64, contour #1F2A44)
└── prototype/
    ├── README.md
    └── Main.dc.html        ← source du prototype jouable
```

## Ordre de lecture conseillé

1. `specification.md` §1–3 pour comprendre les écrans et le parcours.
2. `design-system.md` pour l'apparence.
3. `specification.md` §4–7 au moment d'implémenter la logique, les données et les textes.

## Prototype en ligne

Le prototype jouable est sur le canevas de design Claude de l'utilisateur :
https://claude.ai/code/artifact/d73230a6-c80a-4603-a13e-6452210f1bf9 (privé, accessible au propriétaire).
La copie de sa source est dans `prototype/` — voir `prototype/README.md`.

## Ce qui a été décidé avec l'utilisateur

- Memory classique : cartes face cachée, on en retourne deux ; une paire = carte mot + carte image.
- Joueur seul, sur ordinateur ou tablette.
- Thèmes par classe : 5e, 4e, 3e (menu dédié sur l'accueil).
- Création de thèmes avec **import de photos** depuis l'appareil, **autant de mots qu'on veut**.
- Au clic sur « Jugar », une **pop-up** demande le nombre de mots ; les paires sont **tirées au hasard** parmi les mots du thème.
- Pas de niveaux Facile/Normal, pas de voix.
- Les thèmes créés sont **en ligne** (base Neon, plan gratuit) et visibles par tous ; **seule la professeure** (un mot de passe unique, lien « Profesora » en pied de page) peut les créer, modifier ou supprimer. Photos stockées dans la base. Les anciens thèmes restés dans les navigateurs (IndexedDB) ne sont pas repris.
- Style propre au jeu (pas de design system d'entreprise).
