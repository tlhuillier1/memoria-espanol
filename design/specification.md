# Spécification fonctionnelle — ¡Memoria!

## 1. Vue d'ensemble

Application d'une seule page avec 3 écrans et 1 pop-up :

```
Accueil (choix de la classe + thèmes)
 ├─ « Jugar » ──► Pop-up « nombre de mots » ──► Partie ──► Écran de fin
 │                                                 ▲            │
 │                                                 └─ Jugar otra vez
 └─ « Crear un tema » / « Modificar » ──► Création / modification ──► Accueil
```

Toutes les pages ont le même fond (crème + trame de points) et un conteneur centré de 1080 px max, marges latérales 20 px.

## 2. Écrans

### 2.1 Accueil

- **Titre** « ¡Memoria! » (les « ¡ » et « ! » en rouge), sous-titre « Encuentra las parejas: cada palabra con su imagen. »
- **Sélecteur de classe** (libellé « Clase ») : trois gros boutons **5e / 4e / 3e**, chacun affiche le nombre de thèmes (« 4 temas », « 1 tema », « 0 temas »). Un seul actif (fond bleu). Le choix est **mémorisé** sur l'appareil. 5e par défaut.
- **Titre de section** « Temas de 5e » (selon la classe).
- **État vide** : « Todavía no hay temas para 4e. » (la carte « Crear un tema » reste affichée).
- **Grille de cartes de thème** (colonnes auto, 240 px mini) pour la classe choisie. Chaque carte :
  - aperçu des 3 premières images du thème sur un fond teinté propre au thème ;
  - nom en espagnol ; sous-ligne : traduction française (thèmes intégrés seulement) + « · N palabras » ;
  - badge « Mi tema » pour les thèmes créés ;
  - bouton principal **« Jugar »** → ouvre la pop-up (§2.2) ;
  - thèmes créés uniquement : liens **« Modificar »** (→ §2.5 prérempli) et **« Eliminar »** → confirmation en ligne dans la carte : « ¿Eliminar este tema? » + boutons **Sí** / **No** (pas de boîte de dialogue navigateur).
- **Carte « Crear un tema »** en dernier (bordure en pointillés, icône +) avec la sous-ligne « Para 5e, con tus propias fotos » → §2.5 vide, classe présélectionnée = classe active.
- **Message de statut** après enregistrement (bandeau jaune pâle, `role="status"`) : « Tema «La ropa» guardado en 4e. » ; il disparaît à la prochaine action.

### 2.2 Pop-up « nombre de mots »

S'ouvre au clic sur « Jugar ». Voile sombre sur toute la page, boîte centrée 480 px max.

- Sur-titre : « Las frutas · 5e » ; titre : « ¿Con cuántas palabras quieres jugar? »
- **Compteur** : bouton − / grand nombre / bouton +, et sous lui le libellé « palabras ».
- **Curseur** de 2 à N (N = nombre de mots du thème), avec « 2 » et « N » affichés aux extrémités. Curseur et boutons restent synchronisés.
- Valeur initiale : **min(6, N)**. Bornes : **2 ≤ n ≤ N** ; les boutons −/+ sont désactivés (opacité 35 %) aux bornes.
- Ligne d'info : « 12 cartas · 6 palabras sorteadas entre las 18 del tema » ; si n = N : « 12 cartas · todas las palabras del tema ».
- Boutons : **« Cancelar »** (ferme) et **« ¡A jugar! »** (lance la partie).
- Accessibilité : `role="dialog"`, `aria-modal`, focus placé dans la boîte à l'ouverture, focus piégé, **Échap** et clic sur le voile = Cancelar, focus rendu au bouton « Jugar » à la fermeture.

### 2.3 Partie

- **En-tête** : bouton « ← Temas » (retour accueil, abandonne la partie) ; sur-titre classe (« 5E ») + nom du thème ; trois pastilles **Parejas** « 2/6 », **Intentos** « 7 », **Tiempo** « 0:42 » ; bouton icône **recommencer** (nouveau tirage, même nombre de mots).
- **Consigne** : « Gira dos cartas: una palabra y su imagen. »
- **Plateau** : grille de 2n cartes, format 4:3. Nombre de colonnes selon le nombre de cartes :

  | Cartes | ≤ 12 | ≤ 20 | ≤ 30 | > 30 |
  |---|---|---|---|---|
  | Colonnes | 4 | 5 | 6 | 8 |

  Largeur max du plateau = min(1080, colonnes × 215) px. Sous 560 px de large : 3 colonnes.
- **Faces des cartes** :
  - dos : couleur `--card-back` + motif `assets/card-back.svg` ;
  - carte image : fond blanc, picto centré à 76 % (ou photo en `object-fit: cover` plein cadre) ;
  - carte mot : fond jaune pâle, **article** en petit au-dessus (« la »), **nom** en grand (« manzana »). Taille du nom selon sa longueur (en unités de conteneur `cqi`) : ≤ 6 car. → 17, ≤ 9 → 14, ≤ 12 → 11,5, au-delà → 9,5.

### 2.4 Écran de fin

Remplace le plateau **900 ms** après la dernière paire trouvée (le temps de voir le plateau complet).

- « ¡Enhorabuena! » + « Has encontrado las 6 parejas. »
- Pastilles **Intentos** et **Tiempo**.
- « Repasa las palabras » : liste des paires de la partie (vignette + mot complet avec article).
- Boutons **« Jugar otra vez »** (nouveau tirage, même thème, même nombre) et **« Cambiar de tema »** (accueil).

### 2.5 Création / modification d'un thème

Titre « Crear un tema » ou « Modificar el tema ». Bouton « ← Temas ».

- **Nombre del tema** (champ texte, exemple « Ej.: La ropa »).
- **Clase** : 3 boutons 5e / 4e / 3e.
- **Palabras e imágenes** + compteur « 3 listas · mínimo 2 » (vert dès que ≥ 2).
- Aide : « Escribe cada palabra con su artículo (el, la, los, las). Puedes añadir tantas palabras como quieras: al jugar, se elige cuántas y el juego las sortea. »
- **Liste de lignes** (4 lignes vides pour un nouveau thème). Chaque ligne :
  - emplacement photo 120×90 cliquable (« Añadir foto ») qui ouvre le sélecteur de fichiers (`accept="image/*"`) ; une fois choisie, la photo s'affiche dans l'emplacement et un nouveau clic la remplace ;
  - champ « Palabra N » (exemple « el perro ») ;
  - bouton corbeille pour supprimer la ligne.
- Bouton **« Añadir una palabra »** (pas de maximum).
- Message d'erreur (bandeau rouge pâle, `role="alert"`) — voir §5.
- **« Cancelar »** (retour sans enregistrer) et **« Guardar el tema »**. Après enregistrement : retour à l'accueil **sur la classe du thème**, avec le message de statut.

## 3. Règles du jeu

1. Au lancement : tirer **n mots au hasard** parmi ceux du thème, créer pour chacun une carte image et une carte mot, **mélanger** les 2n cartes (Fisher-Yates).
2. Clic sur une carte face cachée → elle se retourne. Clic sur une carte déjà visible ou trouvée → rien.
3. Le **chrono démarre au premier clic**, format `m:ss`.
4. Quand 2 cartes sont visibles → **Intentos +1** :
   - même mot → **paire trouvée** : les 2 cartes restent visibles, contour vert + pastille coche ; **Parejas +1** ;
   - sinon → contour rouge + petite secousse, puis les 2 cartes se retournent **après 1,1 s** ; les clics sont bloqués pendant ce délai.
5. Dernière paire → chrono arrêté, écran de fin après 900 ms.
6. Recommencer / Jugar otra vez = nouveau tirage et nouveau mélange, compteurs remis à zéro.
7. Quitter la partie (← Temas) arrête le chrono et annule les minuteries en cours.

## 4. Modèle de données

```ts
type Grade = '5e' | '4e' | '3e';

interface Theme {
  id: string;            // 'frutas' pour un thème intégré, 'tema-<timestamp>' ou UUID pour un thème créé
  grade: Grade;
  name: string;          // « Las frutas »
  nameFr?: string;       // « Les fruits » (thèmes intégrés)
  tint?: string;         // fond de l'aperçu ; thèmes créés : #ECE6F7
  builtIn: boolean;
  words: { word: string; image: string }[];  // image = chemin d'asset ou data URL / blob
}
```

- **Thèmes intégrés** : `data/themes.json` (lecture seule, non modifiables ni supprimables dans l'UI).
- **Thèmes créés** : stockés sur l'appareil (IndexedDB conseillé), dans l'ordre de création.
- **Classe choisie** : mémorisée sur l'appareil (localStorage suffit).
- **Découpe article / nom** pour l'affichage des cartes mot : `^(el|la|los|las|un|una|unos|unas)\s+(.+)$` (insensible à la casse). Sans article reconnu, tout le texte est le nom.
- **Photos importées** : redimensionnées à **360 px max** sur le plus grand côté, fond blanc (pour les PNG transparents), JPEG qualité 0,82.

## 5. Validation du formulaire de thème

Dans l'ordre, au clic sur « Guardar el tema » :

| Condition | Message |
|---|---|
| Nom vide | « Escribe un nombre para el tema. » |
| Une ligne a un mot sans photo ou une photo sans mot | « Cada palabra necesita su imagen, y cada imagen su palabra. » |
| Moins de 2 lignes complètes | « Hacen falta al menos 2 palabras con su imagen. » |
| Image illisible à l'import | « No se ha podido leer esta imagen. » |
| Échec d'écriture du stockage | thème gardé pour la session + statut « Tema «X» listo para esta sesión, pero el navegador no ha podido guardarlo. » |

Les lignes entièrement vides sont ignorées. Toute modification du formulaire efface le message d'erreur. Espaces en début/fin des mots et du nom supprimés.

## 6. Accessibilité (éléments propres à ce jeu)

- Chaque carte est un `<button>` avec `aria-label` : face cachée « Carta 5, boca abajo » ; visible « Palabra: la fresa » / « Imagen: la fresa » ; trouvée « … (pareja encontrada) ».
- Boutons icônes : `aria-label` (« Volver a empezar con otras palabras », « Quitar la palabra 3 », « Una palabra menos »…).
- Sélecteurs de classe : `aria-pressed`.
- Emplacement photo : `<label>` contenant un `<input type="file">` visuellement masqué mais focusable, avec un texte pour lecteurs d'écran « Añadir una foto para la palabra 2 ».
- Le nombre de la pop-up est en `aria-live="polite"`.

## 7. Textes de l'interface (espagnol)

| Endroit | Texte |
|---|---|
| Titre | ¡Memoria! |
| Sous-titre | Encuentra las parejas: cada palabra con su imagen. |
| Sélecteur | Clase · 5e / 4e / 3e · « N temas » / « 1 tema » |
| Section | Temas de {clase} |
| État vide | Todavía no hay temas para {clase}. |
| Carte thème | N palabras · Mi tema · Jugar · Modificar · Eliminar · ¿Eliminar este tema? · Sí · No |
| Carte création | Crear un tema · Para {clase}, con tus propias fotos |
| Pop-up | ¿Con cuántas palabras quieres jugar? · palabras · {2n} cartas · {n} palabras sorteadas entre las {N} del tema · todas las palabras del tema · Cancelar · ¡A jugar! |
| Partie | Temas · Parejas · Intentos · Tiempo · Gira dos cartas: una palabra y su imagen. |
| Fin | ¡Enhorabuena! · Has encontrado las {n} parejas. · Repasa las palabras · Jugar otra vez · Cambiar de tema |
| Formulaire | Crear un tema · Modificar el tema · Nombre del tema · Ej.: La ropa · Clase · Palabras e imágenes · {k} listas · mínimo 2 · Añadir foto · Palabra {i} · el perro · Añadir una palabra · Cancelar · Guardar el tema |
| Statut | Tema «{nombre}» guardado en {clase}. |

## 8. Thèmes intégrés (5e)

| Thème | Mots |
|---|---|
| Las frutas (Les fruits) | la manzana, el plátano, la naranja, la fresa, las uvas, la sandía |
| Los animales (Les animaux) | el gato, el perro, el pez, el pájaro, la tortuga, el ratón |
| El material escolar (Le matériel scolaire) | el lápiz, la regla, el libro, las tijeras, la mochila, la goma |
| El tiempo (La météo) | el sol, la nube, la lluvia, la nieve, la tormenta, el arcoíris |

4e et 3e : aucun thème intégré pour l'instant (en attente des thématiques de la professeure).

## 9. Hors périmètre v1

Voix / prononciation, niveaux de difficulté, mode deux joueurs ou équipes, comptes élèves, scores enregistrés, partage en ligne des thèmes (voir questions ouvertes dans `CLAUDE.md`).
