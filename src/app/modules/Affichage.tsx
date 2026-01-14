// Dépendances
"use client";
import { Arrow, Circle, Group, Layer, Path, RegularPolygon, Star, Stage, Text } from "react-konva";
import { AffichageParams, Case, Noeud, Position, Riviere, Tyrolienne } from "./Interfaces";
import React from "react";

/*
=== Affichage ===
Fonction qui affiche l'intégralité des éléments disponibles de la carte
Affiche également les cases adjacentes du joueur à qui c'est le tour
Si l'on clique sur une case, la fonction déplacerJoueur est appelée (vers page.tsx)
*/
export function Affichage({contexte, rayon, tour, pion, deplacement, brouillard, equipe}: AffichageParams) {
    // Largeur et hauteur du canvas en pixels.
    const largeurCanvas: number = Math.max.apply(0, contexte.carte.cases.map((c) => c.positionCanvas.x)) + rayon;
    const hauteurCanvas: number = Math.max.apply(0, contexte.carte.cases.map((c) => c.positionCanvas.y)) + rayon;

    // "voisins" contient toutes les cases adjacentes au joueur à qui c'est le tour.
    const voisins = contexte.graphe.find(g => 
        g.noeud.x === (tour === 0 ? (pion === 0 ? contexte.joueurInfo.position.x : contexte.joueurInfo2.position.x) : (pion === 0 ? contexte.joueurBio.position.x : contexte.joueurBio2.position.x)) &&
        g.noeud.y === (tour === 0 ? (pion === 0 ? contexte.joueurInfo.position.y : contexte.joueurInfo2.position.y) : (pion === 0 ? contexte.joueurBio.position.y : contexte.joueurBio2.position.y))
    )?.voisins || [];

    const casesVisibles: Position[] = [];
    let i = contexte.joueurInfo.position.x; 
    let j = contexte.joueurInfo.position.y;
    casesVisibles.push({x : i, y : j});
    const adjacentsInfo: number[][] = (j%2 == 1) ? [[i,j-1],[i+1,j-1],[i-1,j],[i+1,j],[i,j+1],[i+1,j+1]] : [[i-1,j-1],[i,j-1],[i-1,j],[i+1,j],[i-1,j+1],[i,j+1]];
    adjacentsInfo.forEach((adjacent: number[]) => {
        casesVisibles.push({x : adjacent[0], y : adjacent[1]});
    });
    i = contexte.joueurBio.position.x;
    j = contexte.joueurBio.position.y;
    casesVisibles.push({x : i, y : j});
    const adjacentsBio: number[][] = (j%2 == 1) ? [[i,j-1],[i+1,j-1],[i-1,j],[i+1,j],[i,j+1],[i+1,j+1]] : [[i-1,j-1],[i,j-1],[i-1,j],[i+1,j],[i-1,j+1],[i,j+1]];
    adjacentsBio.forEach((adjacent: number[]) => {
        casesVisibles.push({x : adjacent[0], y : adjacent[1]});
    });
    if (equipe) {
        i = contexte.joueurInfo2.position.x;
        j = contexte.joueurInfo2.position.y;
        casesVisibles.push({x : i, y : j});
        const adjacentsInfo2: number[][] = (j%2 == 1) ? [[i,j-1],[i+1,j-1],[i-1,j],[i+1,j],[i,j+1],[i+1,j+1]] : [[i-1,j-1],[i,j-1],[i-1,j],[i+1,j],[i-1,j+1],[i,j+1]];
        adjacentsInfo2.forEach((adjacent: number[]) => {
            casesVisibles.push({x : adjacent[0], y : adjacent[1]});
        });
        i = contexte.joueurBio2.position.x;
        j = contexte.joueurBio2.position.y;
        casesVisibles.push({x : i, y : j});
        const adjacentsBio2: number[][] = (j%2 == 1) ? [[i,j-1],[i+1,j-1],[i-1,j],[i+1,j],[i,j+1],[i+1,j+1]] : [[i-1,j-1],[i,j-1],[i-1,j],[i+1,j],[i-1,j+1],[i,j+1]];
        adjacentsBio2.forEach((adjacent: number[]) => {
            casesVisibles.push({x : adjacent[0], y : adjacent[1]});
        });
    }

    return (
        // On rajoute 20 à la largeur et la hauteur du cadre du jeu pour que les stroke ne soient pas coupées (étant donné qu'elles ne sont pas comptées dans le calcul)
        <Stage width={largeurCanvas + 20} height={hauteurCanvas + 20}>
            <Layer>
                <Group>
                    {/* === VISUEL DES TERRAINS === 
                    Chaque case (hexagone) est affichée en fonction de sa position sur le canvas
                    */}
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

                    {/* === VISUEL DES RIVIERES === 
                    Les rivières sont des chemins svg composés de tous les points de la rivière
                    */}
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
                                strokeWidth = {6}
                            />
                        );
                    })}

                    {/* === RESIDENCES ===
                    Pas grand chose à expliquer ici
                    */}
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

                    {/* === VISUEL DES TYROLIENNES === 
                    Une tyrolienne est représentée par une flèche pointant du départ vers l'arrivée de la tyrolienne
                    */}
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
                                strokeWidth = {6}
                            />
                        );
                    })}

                    {/*=== JOUEURS ET MASCOTTES ===
                    Affiche les joueurs et les mascottes, en fonction de "mascotte" de Joueur
                    */}
                    {(() => {
                        const posInfoX: number = contexte.joueurInfo.position.x;
                        const posInfo2X: number = contexte.joueurInfo2.position.x;
                        const posInfoY: number = contexte.joueurInfo.position.y;
                        const posInfo2Y: number = contexte.joueurInfo2.position.y;
                        
                        const posBioX: number = contexte.joueurBio.position.x;
                        const posBio2X: number = contexte.joueurBio2.position.x;
                        const posBioY: number = contexte.joueurBio.position.y;
                        const posBio2Y:number = contexte.joueurBio2.position.y;
                        
                        const mascotteInfo: Case | undefined = contexte.joueurBio.mascotte ? contexte.carte.cases.find((c) => c.id === `${posBioX}-${posBioY}`) 
                        : contexte.joueurBio2.mascotte ? contexte.carte.cases.find((c) => c.id === `${posBio2X}-${posBio2Y}`) 
                            : contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceInfo.x}-${contexte.carte.residenceInfo.y}`);
                        const mascotteBio: Case | undefined = contexte.joueurInfo.mascotte ? contexte.carte.cases.find((c) => c.id === `${posInfoX}-${posInfoY}`) 
                        : contexte.joueurInfo2.mascotte ? contexte.carte.cases.find((c) => c.id === `${posInfo2X}-${posInfo2Y}`) 
                            : contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceBio.x}-${contexte.carte.residenceBio.y}`);
                        
                        const posInfo: Case | undefined = contexte.carte.cases.find((c) => c.id === `${posInfoX}-${posInfoY}`);
                        const posInfo2: Case | undefined = contexte.carte.cases.find((c) => c.id === `${posInfo2X}-${posInfo2Y}`);
                        const posBio: Case | undefined = contexte.carte.cases.find((c) => c.id === `${posBioX}-${posBioY}`);
                        const posBio2: Case | undefined = contexte.carte.cases.find((c) => c.id === `${posBio2X}-${posBio2Y}`);
                        
                        
                        if (equipe) {
                            if (!posInfo || !posInfo2 || !posBio || !posBio2 || !mascotteInfo || !mascotteBio) return;
                            const infoMemeCaseInfo2 = posInfo.positionMatrice.x === posInfo2.positionMatrice.x && posInfo.positionMatrice.y === posInfo2.positionMatrice.y;
                            const bioMemeCaseBio2 = posBio.positionMatrice.x === posBio2.positionMatrice.x && posBio.positionMatrice.y === posBio2.positionMatrice.y;
                            const infoMemeCaseBio = posInfo.positionMatrice.x === posBio.positionMatrice.x && posInfo.positionMatrice.y === posBio.positionMatrice.y;
                            const infoMemeCaseBio2 = posInfo.positionMatrice.x === posBio2.positionMatrice.x && posInfo.positionMatrice.y === posBio2.positionMatrice.y;
                            const info2MemeCaseBio = posInfo2.positionMatrice.x === posBio.positionMatrice.x && posInfo2.positionMatrice.y === posBio.positionMatrice.y;
                            const info2MemeCaseBio2 = posInfo2.positionMatrice.x === posBio2.positionMatrice.x && posInfo2.positionMatrice.y === posBio2.positionMatrice.y;
                            
                            const tailleDecalage: number = 10;
                            let decalageInfoX = 0;
                            let decalageInfoY = 0;
                            let decalageInfo2X = 0;
                            let decalageInfo2Y = 0;
                            let decalageBioX = 0;
                            let decalageBioY = 0;
                            let decalageBio2X = 0;
                            let decalageBio2Y = 0;
                            let decalageMascotteInfoX = 0;
                            let decalageMascotteInfoY = 0;
                            let decalageMascotteBioX = 0;
                            let decalageMascotteBioY = 0;
                            
                            if (bioMemeCaseBio2) {
                                decalageBioX = -tailleDecalage;
                                decalageBio2X = tailleDecalage;
                            }
                            if (infoMemeCaseInfo2) {
                                decalageInfoX = -tailleDecalage;
                                decalageInfo2X = tailleDecalage;
                            }
                            if (infoMemeCaseBio) {
                                decalageBioY = -tailleDecalage;
                                decalageInfoY = tailleDecalage;
                            }
                            if (infoMemeCaseBio2) {
                                decalageInfoY = tailleDecalage;
                                decalageBio2Y = -tailleDecalage;
                            }
                            if (info2MemeCaseBio) {
                                decalageBioY = -tailleDecalage;
                                decalageInfo2Y = 10;
                            }
                            if (info2MemeCaseBio2) {
                                decalageBio2Y = -tailleDecalage;
                                decalageInfo2Y = tailleDecalage;
                            }
                            return (
                                <>
                                    <Circle
                                        x = {posInfo.positionCanvas.x + decalageInfoX}
                                        y = {posInfo.positionCanvas.y + decalageInfoY}
                                        radius = {rayon / 2}
                                        fill = "#9486E1"
                                        stroke = "black"
                                    />
                                    <Circle
                                        x = {posInfo2.positionCanvas.x + decalageInfo2X}
                                        y = {posInfo2.positionCanvas.y + decalageInfo2Y}
                                        radius = {rayon / 2}
                                        fill = "#9486E1"
                                        stroke = "white"
                                    />
                                    <Circle
                                        x = {posBio.positionCanvas.x + decalageBioX}
                                        y = {posBio.positionCanvas.y + decalageBioY}
                                        radius = {rayon / 2}
                                        fill = "#F17961"
                                        stroke = "black"
                                    />
                                    <Circle
                                        x = {posBio2.positionCanvas.x + decalageBio2X}
                                        y = {posBio2.positionCanvas.y + decalageBio2Y}
                                        radius = {rayon / 2}
                                        fill = "#F17961"
                                        stroke = "white"
                                    />
                                    <Text
                                        x = {mascotteBio.positionCanvas.x + decalageMascotteBioX}
                                        y = {mascotteBio.positionCanvas.y + decalageMascotteBioY}
                                        text = {contexte.carte.residenceBio.x === contexte.joueurBio.position.x && 
                                                contexte.carte.residenceBio.y === contexte.joueurBio.position.y &&
                                                !contexte.joueurInfo.mascotte && !contexte.joueurInfo2.mascotte
                                                || 
                                                contexte.carte.residenceBio.x === contexte.joueurBio2.position.x && 
                                                contexte.carte.residenceBio.y === contexte.joueurBio2.position.y &&
                                                !contexte.joueurInfo2.mascotte && !contexte.joueurInfo.mascotte
                                                ? "" : "🥦"}
                                        fontSize = {rayon/2}
                                        offsetX = {rayon/3.5}
                                        offsetY = {rayon/3.5}
                                    />
                                    <Text
                                        x = {mascotteInfo.positionCanvas.x + decalageMascotteInfoX}
                                        y = {mascotteInfo.positionCanvas.y + decalageMascotteInfoY}
                                        text = {contexte.carte.residenceInfo.x === contexte.joueurInfo.position.x && 
                                                contexte.carte.residenceInfo.y === contexte.joueurInfo.position.y &&
                                                !contexte.joueurBio.mascotte && !contexte.joueurBio2.mascotte
                                                || 
                                                contexte.carte.residenceInfo.x === contexte.joueurInfo2.position.x && 
                                                contexte.carte.residenceInfo.y === contexte.joueurInfo2.position.y &&
                                                !contexte.joueurBio2.mascotte && !contexte.joueurBio.mascotte
                                                ? "" : "🐧"}
                                        fontSize = {rayon/2}
                                        offsetX = {rayon/3.5}
                                        offsetY = {rayon/3.5}
                                    />
                                </>
                            );
                        }
                        else {
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
                                        text = {contexte.carte.residenceBio.x === contexte.joueurBio.position.x && 
                                                contexte.carte.residenceBio.y === contexte.joueurBio.position.y &&
                                                !contexte.joueurInfo.mascotte
                                                ? "" : "🥦"}
                                        fontSize = {rayon/2}
                                        offsetX = {rayon/3.5}
                                        offsetY = {rayon/3.5}
                                    />
                                    <Text
                                        x = {mascotteInfo.positionCanvas.x}
                                        y = {mascotteInfo.positionCanvas.y}
                                        text = {contexte.carte.residenceInfo.x === contexte.joueurInfo.position.x && 
                                                contexte.carte.residenceInfo.y === contexte.joueurInfo.position.y &&
                                                !contexte.joueurBio.mascotte
                                                ? "" : "🐧"}
                                        fontSize = {rayon/2}
                                        offsetX = {rayon/3.5}
                                        offsetY = {rayon/3.5}
                                    />
                                </>
                            );
                        }
                    })()}

                    {/* === BROUILLARD === 
                    Affiche le brouillard, pour l'instant les joueurs ne peuvent que voir les cases où ils peuvent se déplacer
                    */}
                    {brouillard && contexte.carte.cases.map((c: Case) => {
                            const visible = casesVisibles.some(v =>
                                v.x === c.positionMatrice.x &&
                                v.y === c.positionMatrice.y
                            );
                            if (visible) return null;
                            return (
                                <RegularPolygon
                                    key = {"b-" + c.id}
                                    x = {c.positionCanvas.x}
                                    y = {c.positionCanvas.y}
                                    sides = {6}
                                    radius = {rayon}
                                    fill = "grey"
                                    stroke = {"black"}
                                />
                            );
                        })
                    }

                    {/* === CASES ADJACENTES === 
                    Ici on superpose les cases adjacentes (la ou le joueur peut se déplacer)
                    La couleur de la stroke est définie en fonction du joueur
                    */}
                    {contexte.carte.cases.map((c: Case) => {
                        const [x, y] = c.id.split("-").map(Number);
                        const visible = casesVisibles.some(v =>
                            v.x === x &&
                            v.y === y
                        );
                        if (brouillard && !visible) {return null;}
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
                            strokeWidth = {4}
                        />
                        )
                    })} 

                    {/* === INTERACTION AVEC LES CASES ===
                    Essentiel pour que les joueurs (humains) se déplacent
                    */}
                    {contexte.carte.cases.map((c: Case) => (
                    <React.Fragment key={c.id}>
                        <Text // Texte indiquant les coordonées (x,y) de la case, utile pour le debug.
                            x = {c.positionCanvas.x}
                            y = {c.positionCanvas.y}
                            text = {`${c.positionMatrice.x},${c.positionMatrice.y}`}
                            fontSize = {14}
                            fill = "transparent" // J'ai mis en transparent pour désactiver le "mode debug". Mettre en "black" pour le ré-afficher
                            offsetX = {10}
                            offsetY = {7}
                        />
                        <RegularPolygon
                            x={c.positionCanvas.x}
                            y={c.positionCanvas.y}
                            sides={6}
                            radius={rayon}
                            onClick={(event) => {
                                if (event.evt.button === 0) { // Clic gauche
                                    if (deplacement) {
                                        deplacement(c.positionMatrice); // On appelle la fonction avec comme paramètre les coordonées de la case, pour (si autorisé) déplacer le joueur vers celle ci.
                                    }
                                }
                            }}
                        />
                    </React.Fragment>
                ))}
                </Group>
            </Layer>
        </Stage>
    );
}