# 🐧/🥦 Mascotte Hex - Maïs Magnifiques
Bienvenue sur le GitLab du projet de programmation (HAI405I) des Maïs Magnifiques.

## Lancement du projet
Tout d'abord, allez à la racine du projet et lancez la commande : ``npm i`` pour installer les dépendances.
Ensuite, pour allumer le serveur, lancez la commande ``npm run dev``.
Attendez que le serveur soit lancé puis, sur votre navigateur préféré, tapez dans la barre de recherche ``localhost:3000``.

## Fonctionnalités implémentées
### 1. Le jeu
Le jeu possède deux équipes, les informaticiens et les biologistes. Le but de chacune des équipes est de voler la mascotte de l'équipe adverse.
Pour cela, chacun son tour, les joueurs vont se déplacer dans un environnement hostile sur une île. Les joueurs peuvent se déplacer librement sur les
plaines et les forêts, mais gare aux montagnes hostiles et aux océans mouvementés, le déplacement y est impossible.

Il y a deux types de structures utiles placées sur cette île, la première est la tyrolienne, elle permet de gagner du temps en survolant une
partie de l'île. La deuxième est la rivière, qui coule dans les plaines ou les forêts et permet de se déplacer de trois cases au cours de celle-ci.

### 2. L'éditeur de jeu

Il existe un éditeur de carte. Cet éditeur est conçu pour prendre en compte toutes les subtilités du jeu.

On peut y dessiner les paysages, c'est-à-dire ajouter des océans, plaines, forêts ou montagnes.
On peut également ajouter les résidences des deux équipes sur des plaines ou forêts.
Enfin, on peut ajouter des tyroliennes et des rivières, définies par des règles différentes :
- Pour les tyroliennes, elles ne peuvent démarrer que depuis une forêt pour atterrir dans une plaine ou une forêt. De plus,
  il est interdit qu'elles traversent une montagne.
- Pour les rivières, elles ne peuvent démarrer que depuis une forêt ou une plaine pour finir dans l'océan ou se jeter dans une autre rivière.

De plus, l'éditeur de carte vérifie constamment qu'il existe toujours un chemin pour aller d'une résidence à l'
autre. Si ce n'est pas le cas, la carte n'est pas affichée dans l'interface de sélection pour le jeu.

### 3. Le bot

Il y a plusieurs modes de jeu possibles, le premier est un mode de jeu avec deux joueurs sur le même ordinateur, où
chacun choisit son équipe de cœur.

Le second mode de jeu se joue contre un bot, selon le niveau de difficulté du bot choisi, ce dernier va prendre des
chemins plus ou moins rapides vers la victoire.
Le calcul du chemin se fait via un graphe orienté de tous les déplacements possibles sur la carte, sur lequel on applique l'algo BFS.