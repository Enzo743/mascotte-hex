"use client";
import { Arrow, Circle, Group, Layer, Path, RegularPolygon, Star, Stage, Text } from "react-konva";
import { AffichageParams, Carte, Case, Contexte, Noeud, Position, Riviere, Tyrolienne } from "./Interfaces";
import React from "react";


/*
=== Affichage ===
Fonction qui affiche l'intégralité des éléments disponibles de la carte.
Affiche également les cases adjacentes du joueur à qui c'est le tour.
Si l'on clique sur une case, la fonction déplacerJoueur est appelée (dans page.tsx).
*/
export function Affichage({contexte, rayon, tour, deplacement}: AffichageParams) {
    // Largeur et hauteur du canvas en pixels.
    const largeurCanvas: number = Math.max.apply(0, contexte.carte.cases.map((c) => c.positionCanvas.x)) + rayon;
    const hauteurCanvas: number = Math.max.apply(0, contexte.carte.cases.map((c) => c.positionCanvas.y)) + rayon;

    // "voisins" contient toutes les cartes adjacentes au joueur à qui c'est le tour.
    const voisins = contexte.graphe.find(g => 
        g.noeud.x === (tour === 0 ? contexte.joueurInfo.position.x : contexte.joueurBio.position.x) &&
        g.noeud.y === (tour === 0 ? contexte.joueurInfo.position.y : contexte.joueurBio.position.y)
    )?.voisins || [];

    return (
        <Stage width={largeurCanvas} height={hauteurCanvas}>
            <Layer>
                <Group>
                    {/* === VISUEL DES CASES === */}
                    {contexte.carte.cases.map((c: Case) => (
                            <RegularPolygon
                                key = {"v-" + c.id}
                                x = {c.positionCanvas.x}
                                y = {c.positionCanvas.y}
                                sides = {6}
                                radius = {rayon}
                                fill = {c.couleur}
                                stroke = {"black"}
                            />
                        )
                    )}

                    {/* === CASES ADJACENTES === */}
                    {contexte.carte.cases.map((c: Case) => {
                        const [x, y] = c.id.split("-").map(Number);
                        const adjacent = voisins.some(
                            (voisin) => voisin.x === x && voisin.y === y
                        );
                        if (!adjacent) {return null;}
                        return (
                        <RegularPolygon
                            key = {"a-" + c.id}
                            x = {c.positionCanvas.x}
                            y = {c.positionCanvas.y}
                            sides = {6}
                            radius = {rayon}
                            stroke = {tour === 0 ? "#9486E1" : tour === 1 ? "#F17961" : "transparent"}
                        />
                        )
                    })}     

                    {/* === VISUEL DES RIVIERES === */}
                    {contexte.carte.rivieres.map((riviere: Riviere) => {
                        const chemin: string[] = [];
                        chemin.push("M ");
                        riviere.parcours.forEach((partie: Position) => {
                            const affectation: Case | undefined = contexte.carte.cases.find(c => c.id === `${partie.x}-${partie.y}`);
                            if (affectation) {
                                chemin.push(`${affectation.positionCanvas.x} ${affectation.positionCanvas.y} L `);
                            }
                        });
                        const embouchure: Case | undefined = contexte.carte.cases.find(c => c.id === `${riviere.embouchure.x}-${riviere.embouchure.y}`);
                        if (embouchure) {
                            chemin.push(`${embouchure.positionCanvas.x} ${embouchure.positionCanvas.y}`);
                        }
                        return (
                            <Path
                                key={`r-${riviere.parcours[0].x}-${riviere.parcours[0].y}-${riviere.embouchure.x}-${riviere.embouchure.y}`}
                                data = {chemin.join(" ")}
                                stroke = "#748BF8"
                                strokeWidth = {4}
                            />
                        );
                    })}

                    {/* --- RESIDENCES --- */}
                    {(() => {
                        const residenceInfo: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceInfo.x}-${contexte.carte.residenceInfo.y}`);
                        const residenceBio: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceBio.x}-${contexte.carte.residenceBio.y}`);
                        if (!residenceInfo || !residenceBio) return;
                        return (
                            <>
                               <Star
                                    x = {residenceInfo.positionCanvas.x}
                                    y = {residenceInfo.positionCanvas.y}
                                    numPoints = {6}
                                    innerRadius = {rayon / 2.5}
                                    outerRadius = {rayon}
                                    fill = "#9486E1"
                                    stroke = "black"
                                />
                                <Star
                                    x = {residenceBio.positionCanvas.x}
                                    y = {residenceBio.positionCanvas.y}
                                    numPoints = {6}
                                    innerRadius = {rayon / 2.5}
                                    outerRadius = {rayon}
                                    fill = "#F17961"
                                    stroke = "black"
                                />
                            </>
                        );
                    })()}

                    {/* === VISUEL DES TYROLIENNES === */}
                    {contexte.carte.tyroliennes.map((tyrolienne: Tyrolienne) => {
                        const entree: Case | undefined = contexte.carte.cases.find((c) => c.id === `${tyrolienne.entree.x}-${tyrolienne.entree.y}`);
                        const sortie: Case | undefined = contexte.carte.cases.find((c) => c.id === `${tyrolienne.sortie.x}-${tyrolienne.sortie.y}`);
                        if (!entree || !sortie) return;
                        return (
                            <Arrow
                                key = {`t-${tyrolienne.entree.x}-${tyrolienne.entree.y}-${tyrolienne.sortie.x}-${tyrolienne.sortie.y}`}
                                points = {[
                                    entree.positionCanvas.x,
                                    entree.positionCanvas.y,
                                    sortie.positionCanvas.x,
                                    sortie.positionCanvas.y
                                ]}
                                pointerLength = {rayon/2.5}
                                pointerWidth = {rayon/2.5}
                                fill = "#FFA23A"
                                stroke = "#FFA23A"
                                strokeWidth = {4}
                            />
                        );
                    })}

                    {/*=== JOUEURS ET MASCOTTES === */}
                    {(() => {
                        const mascotteInfo: Case | undefined = contexte.joueurBio.mascotte ? contexte.carte.cases.find((c) => c.id === `${contexte.joueurBio.position.x}-${contexte.joueurBio.position.y}`) : contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceInfo.x}-${contexte.carte.residenceInfo.y}`);
                        const mascotteBio: Case | undefined = contexte.joueurInfo.mascotte ? contexte.carte.cases.find((c) => c.id === `${contexte.joueurInfo.position.x}-${contexte.joueurInfo.position.y}`) : contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceBio.x}-${contexte.carte.residenceBio.y}`);
                        const posInfo: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.joueurInfo.position.x}-${contexte.joueurInfo.position.y}`);
                        const posBio: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.joueurBio.position.x}-${contexte.joueurBio.position.y}`);
                        if (!posInfo || !posBio || !mascotteInfo || !mascotteBio) return;
                        return (
                            <>
                                <Circle
                                    x = {posInfo.positionCanvas.x}
                                    y = {posInfo.positionCanvas.y}
                                    radius = {rayon / 2}
                                    fill = "#9486E1"
                                    stroke = "black"
                                />
                                <Circle
                                    x = {posBio.positionCanvas.x}
                                    y = {posBio.positionCanvas.y}
                                    radius = {rayon / 2}
                                    fill = "#F17961"
                                    stroke = "black"
                                />
                                <Text
                                    x = {mascotteBio.positionCanvas.x}
                                    y = {mascotteBio.positionCanvas.y}
                                    text = {contexte.joueurInfo.mascotte ? "🥦" : ""}
                                    fontSize = {rayon/2}
                                    offsetX = {rayon/3.5}
                                    offsetY = {rayon/3.5}
                                />
                                <Text
                                    x = {mascotteInfo.positionCanvas.x}
                                    y = {mascotteInfo.positionCanvas.y}
                                    text = {contexte.joueurBio.mascotte ? "🐧" : ""}
                                    fontSize = {rayon/2}
                                    offsetX = {rayon/3.5}
                                    offsetY = {rayon/3.5}
                                />
                            </>
                        );
                    })()}

                    {/* === INTERACTION AVEC LES CASES === */}
                    {contexte.carte.cases.map((c: Case) => (
                    <React.Fragment key={c.id}>
                        <Text // Texte indiquant les coordonées (x,y) de la case, utile pour le debug.
                            x = {c.positionCanvas.x}
                            y = {c.positionCanvas.y}
                            text = {`${c.positionMatrice.x},${c.positionMatrice.y}`}
                            fontSize = {14}
                            fill = "black"
                            offsetX = {10}
                            offsetY = {7}
                        />
                        <RegularPolygon
                            x={c.positionCanvas.x}
                            y={c.positionCanvas.y}
                            sides={6}
                            radius={rayon}
                            onClick={() => {
                                if (deplacement) deplacement(c.positionMatrice);
                            }}
                        />
                    </React.Fragment>
                ))}
                </Group>
            </Layer>
        </Stage>
    );
}