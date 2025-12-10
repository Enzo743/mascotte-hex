"use client";
import { Stage, Layer, RegularPolygon, Text, Group } from "react-konva";

/*
Crée une grille composée d'hexagone.
La dimension de la grille est définie en fonction de :
- "nb_x" (nombre d'hexagones sur l'axe des abscisse, sur la longueur de la grille),
- "nb_y" (nombre d'hexagones sur l'axe des ordonées, sur la hauteur de la grille).
La taille d'un côté ainsi que la distance centre/sommet est définie par "rayon".
La distance centre/côté est définie par "petitRayon".
*/
export default function Grille({rayon=40, nb_x=10, nb_y=6}) {
    const hexagons = [];
    let petitRayon = (rayon/2) * Math.sqrt(3);
    for (let i = 0; i < nb_y; i++) {
        let decalage = 0 == i%2;
        for (let j = 0; j < nb_x; j++) {
            if (decalage) {
                hexagons.push(
                    <RegularPolygon 
                        x = {petitRayon+rayon+j*(2*petitRayon)} 
                        y = {rayon+i*(rayon + rayon/2)} 
                        sides = {6} 
                        radius = {rayon} 
                        fill = {"#5C7EF8"} 
                        stroke = {"black"}
                    />
                );
            } else {
                hexagons.push(
                    <RegularPolygon 
                        x = {rayon+j*(2*petitRayon)} 
                        y = {rayon+i*(rayon + rayon/2)} 
                        sides = {6} 
                        radius = {rayon} 
                        fill=  {"#5C7EF8"} 
                        stroke = {"black"}
                    />
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