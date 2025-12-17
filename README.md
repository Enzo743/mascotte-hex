# Mascotte Hex Mais Magnifiques

Bienvenue sur le GitLab du projet de programmation (HAI405I) du groupe des Mais Magnifiques.

## Lancement du projet

Pour lancer le projet, vous devez lancer la commande ``npm run dev`` à la racine du projet.

## Fonctionnalités implémentées

### Le jeu

Le jeu consiste en deux équipes, les informaticiens et les biologistes. Le but de chacune des équipes est de voler la
mascotte de l'équipe adverse.

Pour cela, chacun après leur tour, les joueurs vont se déplacer dans un environnement hostile sur une île. Sur les
plaines et les forêts, les joueurs peuvent se déplacer librement, alors sur les montagnes hostiles et les océans
mouvementés, le déplacement y est impossible.

Il y a deux aides placées sur cette île, la première est la tyrolienne, elle permet de gagner du temps en survolant une
partie de l'île. La deuxième est la
rivière, la rivière coule dans la plaine et les forêts et permet de se déplacer de trois cases à chaque tour.

### L'éditeur de jeu

Pour créer une carte, il existe un éditeur de carte. Cet éditeur est conçu pour prendre en compte toutes les subtilités
du jeu.

On peut y colorier les terrains qui existent, c'est-à-dire l'océan, la plaine, la forêt et la montagne. De plus, on peut
ajouter les deux résidences sur des cases plaines et forêts. Enfin, on peut ajouter des tyroliennes et des rivières,
définies par des règles différentes :

- Pour les tyroliennes, elles ne peuvent démarrer que depuis une forêt pour finir dans une plaine ou une forêt. De plus,
  il est interdit de traverser une montagne.
- Pour les rivières, elles ne peuvent démarrer que depuis une forêt ou une plaine pour finir dans l'océan ou dans une
  autre rivière. De plus, il est interdit de traverser une montagne à tout moment, et les rivières ne peuvent aller que
  vers l'océan.

De plus, à tout moment, l'éditeur de jeu va vérifier qu'il existe toujours un chemin pour aller d'une résidence à l'
autre dans les deux sens. Si cela n'est pas le cas, la carte n'est pas affiché dans les possibilités de jeu.

### Le bot

Il y a plusieurs modes de jeu possibles, le premier est un mode de jeu avec deux joueurs sur le même ordinateur, où
chacun choisit son équipe préférée.

Le second mode de jeu se joue contre un bot, selon le niveau de difficulté du bot choisi, ce dernier va prendre des
chemins plus ou moins intelligent. Cela vous permet de jouer tout seul au jeu selon la difficulté qui vous souhaitez.