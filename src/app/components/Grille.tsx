"use client";
import {Arrow, Stage, Layer, Path, RegularPolygon, Group} from "react-konva";

// Interface des Cartes
interface Connexion {
    type: string;
    tuiles: number[][];
}
interface Carte {
        grille: {lignes: number; colonnes: number};
        résidences: {info: number[]; bio: number[]};
        terrains: {
            plaine: number[][]; 
            foret: number[][]; 
            montagne: number[][];
        };
        connexions: Connexion[];
}

// Interface des Cases (Hexagones)
interface Case {
    id: string;
    position: {x: number; y: number};
    type: string;
    couleur: string;
}

/*
Créé une grille composée d'hexagones.
La taille d'un côté ainsi que la distance centre/sommet sont définies par "rayon".
Les dimensions ainsi que le contenu de la grille sont définis par un objet de type "carte" (voir l'interface "Carte").
La distance centre/côté est définie par "petitRayon".
*/
export default function Grille({rayon, carte}: {rayon: number; carte: Carte}) {
    // Initialisation de la Grille
    const hexagons: Case[] = [];
    const petitRayon = (rayon/2) * Math.sqrt(3);
    for (let i = 0; i < carte.grille.lignes; i++) {
        const decalage = i % 2 === 1;
        for (let j = 0; j < carte.grille.colonnes; j++) {
            const position = {
                x: decalage ? petitRayon + petitRayon + j * (2 * petitRayon) : petitRayon + j * (2 * petitRayon),
                y: rayon + i * (rayon + rayon / 2)
            };
            hexagons.push({id: `${j}-${i}`, position, type: "ocean", couleur: "#748BF8"});
        }
    }

    // Affectation des terrains de "carte" à la Grille, ainsi que leur couleur
    // A modifier dans le futur, ce n'est pas optimisé (répétition, non extensible à d'autres terrains sans modification du code)
    carte.terrains.plaine.forEach(([i, j]) => {
        const hexagonIndex = hexagons.findIndex(hexagon => hexagon.id === `${i}-${j}`);
        if (hexagonIndex !== -1) {
            hexagons[hexagonIndex].type = "plaine";
            hexagons[hexagonIndex].couleur = "#62D926";
        }
    });
    carte.terrains.foret.forEach(([i, j]) => {
        const hexagonIndex = hexagons.findIndex(hexagon => hexagon.id === `${i}-${j}`);
        if (hexagonIndex !== -1) {
            hexagons[hexagonIndex].type = "foret";
            hexagons[hexagonIndex].couleur = "#1A4405";
        }
    });
    carte.terrains.montagne.forEach(([i, j]) => {
        const hexagonIndex = hexagons.findIndex(hexagon => hexagon.id === `${i}-${j}`);
        if (hexagonIndex !== -1) {
            hexagons[hexagonIndex].type = "montagne";
            hexagons[hexagonIndex].couleur = "#9E9E9E";
        }
    });

    // Affectation des tyroliennes de "carte" à la Grille
    const tyroliennes: Connexion[] = [];
    carte.connexions.forEach((connexion) => {
        if (connexion.type === "tyrolienne") {
            tyroliennes.push(connexion);
        }
    });

    // Affichage de la Grille
    return (
        <Stage width={rayon * 2 * carte.grille.colonnes} height={rayon * 2 * carte.grille.lignes}>
            <Layer>
                <Group x={0} y={0}>
                    {hexagons.map(hexagon => (
                        <RegularPolygon
                            key = {hexagon.id}
                            x = {hexagon.position.x}
                            y = {hexagon.position.y}
                            sides = {6}
                            radius = {rayon}
                            fill = {hexagon.couleur}
                            stroke = {"black"}
                        />
                    ))}
                    {tyroliennes.map((connexion) => {
                        const start = hexagons.find(hex => hex.id === `${connexion.tuiles[0][0]}-${connexion.tuiles[0][1]}`);
                        const end = hexagons.find(hex => hex.id === `${connexion.tuiles[1][0]}-${connexion.tuiles[1][1]}`);
                        if (!start || !end) return null;
                        return (
                            <Arrow
                                key = {`t-${connexion.tuiles[0][0]}-${connexion.tuiles[0][1]}-${connexion.tuiles[1][0]}-${connexion.tuiles[1][1]}`}
                                points = {[start.position.x, start.position.y, end.position.x, end.position.y]}
                                pointerLength = {30}
                                pointerWidth = {30}
                                fill = "orange"
                                stroke = "orange"
                                strokeWidth = {4}
                            />
                        );
                    })}
                </Group>
            </Layer>
        </Stage>
    );
}