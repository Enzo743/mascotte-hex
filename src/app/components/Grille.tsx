"use client";
import { Stage, Layer, RegularPolygon, Text, Group } from "react-konva";

/*
Crée une grille composée d'hexagone.
La dimension de la grille est définie en fonction de :
- "nb_x" (nombre d'hexagones sur l'axe des abscisse, sur la longueur de la grille),
- "nb_y" (nombre d'hexagones sur l'axe des ordonées, sur la hauteur de la grille).
La taille de chaque hexagone est définie par "rayon".

Pour l'instant la grille n'est pas proprement alignée (à corriger).
J'ai pour l'instant ajusté à tatillon, il faudra le refaire plus mathématiquement.
*/
export default function Grille({rayon=40, nb_x=10, nb_y=6}) {
    const hexagons = [];
    for (let i = 0; i < nb_y; i++) {
        let decalage = 0 == i%2;
        for (let j = 0; j < nb_x; j++) {
            if (decalage) {
                hexagons.push(
                    <RegularPolygon x={rayon*.86+rayon+j*(rayon*1.7)} y={rayon+i*(rayon*1.5)} sides={6} radius={rayon} fill={"#5C7EF8"} stroke={"black"}/>
                );
            } else {
                hexagons.push(
                    <RegularPolygon x={rayon+j*(rayon*1.7)} y={rayon+i*(rayon*1.5)} sides={6} radius={rayon} fill={"#5C7EF8"} stroke={"black"}/>
                );
            }
        }
    }
    return (
        <>
            <Stage width={(rayon*2)*nb_x} height={(rayon*2)*nb_y}>
                <Layer>
                    <Group x={0} y={0}>
                        {hexagons}
                    </Group>
                </Layer>
            </Stage>
        </>
    );
}