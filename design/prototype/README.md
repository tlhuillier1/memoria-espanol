# Prototype jouable

`Main.dc.html` est la source exacte du prototype réalisé sur le canevas de design Claude
(https://claude.ai/code/artifact/d73230a6-c80a-4603-a13e-6452210f1bf9).

**Ne pas réutiliser ce fichier tel quel** : il dépend du moteur du canevas (`support.js`, balises `<x-dc>`, `<sc-if>`, `<sc-for>`, `<helmet>`, classe `DCLogic`, liaisons `{{…}}`) qui n'existe pas en dehors de cet outil. Il ne s'ouvre pas correctement dans un navigateur.

Il sert de **référence de comportement** :

- le balisage montre la structure et les styles de chaque écran (menu, pop-up, partie, fin, formulaire) ;
- le script en bas du fichier (`class Component`) contient la logique de référence :
  - `start()` — tirage aléatoire et mélange,
  - `flip()` — retournement, comptage des essais, paires, délais,
  - `openPicker()` / `setPickN()` — pop-up du nombre de mots,
  - `saveDraft()` — validation et enregistrement d'un thème,
  - `readImg()` — redimensionnement des photos,
  - `builtins()` — définition des pictos (déjà exportés en SVG dans `../assets/pictos/`).

Écarts voulus entre prototype et site final (la spécification fait foi) :

- le prototype stocke les thèmes créés en localStorage → le site doit utiliser IndexedDB ;
- la pop-up du prototype ne gère ni Échap, ni le piège de focus, ni le retour du focus → à implémenter ;
- les pictos sont générés en data URL dans le prototype → le site utilise les fichiers SVG.
