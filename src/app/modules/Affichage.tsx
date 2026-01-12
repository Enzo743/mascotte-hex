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
export function Affichage({contexte, rayon, tour, deplacement, brouillard, modeJeu}: AffichageParams) {
    // Largeur et hauteur du canvas en pixels.
    const largeurCanvas: number = Math.max.apply(0, contexte.carte.cases.map((c) => c.positionCanvas.x)) + rayon;
    const hauteurCanvas: number = Math.max.apply(0, contexte.carte.cases.map((c) => c.positionCanvas.y)) + rayon;

    // "voisins" contient toutes les cartes adjacentes au joueur à qui c'est le tour.
    const voisins = contexte.graphe.find(g => 
        g.noeud.x === (tour === 0 ? contexte.joueurInfo.position.x : contexte.joueurBio.position.x) &&
        g.noeud.y === (tour === 0 ? contexte.joueurInfo.position.y : contexte.joueurBio.position.y)
    )?.voisins || [];

    const visuel = contexte.graphe.find(g =>
        g.noeud.x === (tour === 0 ? contexte.joueurInfo.position.x : contexte.joueurBio.position.x) &&
        g.noeud.y === (tour === 0 ? contexte.joueurInfo.position.y : contexte.joueurBio.position.y)
    )?.voisins || [];
    contexte.graphe.find(g =>
        g.noeud.x === (tour === 0 ? contexte.joueurInfo.position.x : contexte.joueurBio.position.x) &&
        g.noeud.y === (tour === 0 ? contexte.joueurInfo.position.y : contexte.joueurBio.position.y)
    )?.voisins.map((n: Noeud) => {visuel.push(n)});
    visuel.push({x: contexte.joueurInfo.position.x, y: contexte.joueurInfo.position.y});
    visuel.push({x: contexte.joueurBio.position.x, y: contexte.joueurBio.position.y});

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
                        const mascotteInfo: Case | undefined = contexte.joueurBio.mascotte ? contexte.carte.cases.find((c) => c.id === `${contexte.joueurBio.position.x}-${contexte.joueurBio.position.y}`) : contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceInfo.x}-${contexte.carte.residenceInfo.y}`);
                        const mascotteBio: Case | undefined = contexte.joueurInfo.mascotte ? contexte.carte.cases.find((c) => c.id === `${contexte.joueurInfo.position.x}-${contexte.joueurInfo.position.y}`) : contexte.carte.cases.find((c) => c.id === `${contexte.carte.residenceBio.x}-${contexte.carte.residenceBio.y}`);
                        const posInfo: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.joueurInfo.position.x}-${contexte.joueurInfo.position.y}`);
                        const posInfo2: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.joueurInfo.position.x}-${contexte.joueurInfo.position.y}`);
                        const posBio: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.joueurBio.position.x}-${contexte.joueurBio.position.y}`);
                        const posBio2: Case | undefined = contexte.carte.cases.find((c) => c.id === `${contexte.joueurBio2.position.x}-${contexte.joueurBio.position.y}`);
                        if (modeJeu == "equipe") { // provisoire 
                            if (!posInfo || !posInfo2 || !posBio || !posBio2 || !mascotteInfo || !mascotteBio) return;
                            if (posInfo.positionMatrice.x === posInfo2.positionMatrice.x && posInfo.positionMatrice.y === posInfo2.positionMatrice.y 
                                && contexte.carte.residenceInfo.x !== posInfo.positionMatrice.x && contexte.carte.residenceInfo.y !== posInfo.positionMatrice.y) {
                                const decalage = contexte.joueurInfo.mascotte ? 5 : (contexte.joueurInfo2.mascotte ? -5 : 0);
                                return (
                                    <>
                                        <Circle
                                            x = {posInfo.positionCanvas.x + 5} // La valeur 5 est provisoire pour les tests
                                            y = {posInfo.positionCanvas.y}
                                            radius = {rayon / 3} // La valeur 3 est provisoire pour les tests
                                            fill = "#9486E1"
                                            stroke = "black"
                                        />
                                        <Circle
                                            x = {posInfo2.positionCanvas.x - 5} // La valeur 5 est provisoire pour les tests
                                            y = {posInfo2.positionCanvas.y}
                                            radius = {rayon / 3} // La valeur 3 est provisoire pour les tests
                                            fill = "#9486E1"
                                            stroke = "white"
                                        />

                                        <Circle
                                            x = {posBio.positionCanvas.x}
                                            y = {posBio.positionCanvas.y}
                                            radius = {rayon / 2}
                                            fill = "#F17961"
                                            stroke = "black"
                                        />
                                        <Circle
                                            x = {posBio2.positionCanvas.x}
                                            y = {posBio2.positionCanvas.y}
                                            radius = {rayon / 2}
                                            fill = "#F17961"
                                            stroke = "white"
                                        />
                                        <Text
                                            x = {mascotteBio.positionCanvas.x + decalage}
                                            y = {mascotteBio.positionCanvas.y}
                                            text = {contexte.carte.residenceBio.x === contexte.joueurBio.position.x && 
                                                    contexte.carte.residenceBio.y === contexte.joueurBio.position.y &&
                                                    !contexte.joueurInfo.mascotte
                                                    &&
                                                    contexte.carte.residenceBio.x === contexte.joueurBio2.position.x && 
                                                    contexte.carte.residenceBio.y === contexte.joueurBio2.position.y &&
                                                    !contexte.joueurInfo2.mascotte
                                                    ? "" : "🥦"}
                                            fontSize = {decalage != 0 ? rayon/3 : rayon/2} // La valeur 3 est provisoire pour les tests
                                            offsetX = {rayon/3.5}
                                            offsetY = {rayon/3.5}
                                        />
                                        <Text
                                            x = {mascotteInfo.positionCanvas.x}
                                            y = {mascotteInfo.positionCanvas.y}
                                            text = {contexte.carte.residenceInfo.x === contexte.joueurInfo.position.x && 
                                                    contexte.carte.residenceInfo.y === contexte.joueurInfo.position.y &&
                                                    !contexte.joueurBio.mascotte
                                                    &&
                                                    contexte.carte.residenceInfo.x === contexte.joueurInfo2.position.x && 
                                                    contexte.carte.residenceInfo.y === contexte.joueurInfo2.position.y &&
                                                    !contexte.joueurBio2.mascotte
                                                    ? "" : "🐧"}
                                            fontSize = {rayon/2}
                                            offsetX = {rayon/3.5}
                                            offsetY = {rayon/3.5}
                                        />
                                    </>
                                );
                            }
                            if (posBio.positionMatrice.x === posBio2.positionMatrice.x && posBio.positionMatrice.y === posBio2.positionMatrice.y
                                && contexte.carte.residenceBio.x !== posBio.positionMatrice.x && contexte.carte.residenceBio.y !== posBio.positionMatrice.y) {
                                const decalage = contexte.joueurBio.mascotte ? 5 : (contexte.joueurBio2.mascotte ? -5 : 0);
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
                                            x = {posInfo2.positionCanvas.x}
                                            y = {posInfo2.positionCanvas.y}
                                            radius = {rayon / 2}
                                            fill = "#9486E1"
                                            stroke = "white"
                                        />

                                        <Circle
                                            x = {posBio.positionCanvas.x + 5} // La valeur 5 est provisoire pour les tests
                                            y = {posBio.positionCanvas.y}
                                            radius = {rayon / 3} // La valeur 3 est provisoire pour les tests
                                            fill = "#F17961"
                                            stroke = "black"
                                        />
                                        <Circle
                                            x = {posBio2.positionCanvas.x - 5}
                                            y = {posBio2.positionCanvas.y}
                                            radius = {rayon / 3}
                                            fill = "#F17961"
                                            stroke = "white"
                                        />
                                        <Text
                                            x = {mascotteBio.positionCanvas.x}
                                            y = {mascotteBio.positionCanvas.y}
                                            text = {contexte.carte.residenceBio.x === contexte.joueurBio.position.x && 
                                                    contexte.carte.residenceBio.y === contexte.joueurBio.position.y &&
                                                    !contexte.joueurInfo.mascotte
                                                    && 
                                                    contexte.carte.residenceBio.x === contexte.joueurBio2.position.x && 
                                                    contexte.carte.residenceBio.y === contexte.joueurBio2.position.y &&
                                                    !contexte.joueurInfo2.mascotte
                                                    ? "" : "🥦"}
                                            fontSize = {decalage != 0 ? rayon/3 : rayon/2} // La valeur 3 est provisoire pour les tests
                                            offsetX = {rayon/3.5}
                                            offsetY = {rayon/3.5}
                                        />
                                        <Text
                                            x = {mascotteInfo.positionCanvas.x + decalage}
                                            y = {mascotteInfo.positionCanvas.y}
                                            text = {contexte.carte.residenceInfo.x === contexte.joueurInfo.position.x && 
                                                    contexte.carte.residenceInfo.y === contexte.joueurInfo.position.y &&
                                                    !contexte.joueurBio.mascotte
                                                    && 
                                                    contexte.carte.residenceInfo.x === contexte.joueurInfo2.position.x && 
                                                    contexte.carte.residenceInfo.y === contexte.joueurInfo2.position.y &&
                                                    !contexte.joueurBio2.mascotte
                                                    ? "" : "🐧"}
                                            fontSize = {decalage != 0 ? rayon/3 : rayon/2} // La valeur 3 est provisoire pour les tests
                                            offsetX = {rayon/3.5}
                                            offsetY = {rayon/3.5}
                                        />
                                    </>
                                );
                            }
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
                                        x = {posInfo2.positionCanvas.x}
                                        y = {posInfo2.positionCanvas.y}
                                        radius = {rayon / 2}
                                        fill = "#9486E1"
                                        stroke = "white"
                                    />

                                    <Circle
                                        x = {posBio.positionCanvas.x}
                                        y = {posBio.positionCanvas.y}
                                        radius = {rayon / 2}
                                        fill = "#F17961"
                                        stroke = "black"
                                    />
                                    <Circle
                                        x = {posBio2.positionCanvas.x}
                                        y = {posBio2.positionCanvas.y}
                                        radius = {rayon / 2}
                                        fill = "#F17961"
                                        stroke = "white"
                                    />
                                    <Text
                                        x = {mascotteBio.positionCanvas.x}
                                        y = {mascotteBio.positionCanvas.y}
                                        text = {contexte.carte.residenceBio.x === contexte.joueurBio.position.x && 
                                                contexte.carte.residenceBio.y === contexte.joueurBio.position.y &&
                                                !contexte.joueurInfo.mascotte
                                                && 
                                                contexte.carte.residenceBio.x === contexte.joueurBio2.position.x && 
                                                contexte.carte.residenceBio.y === contexte.joueurBio2.position.y &&
                                                !contexte.joueurInfo2.mascotte
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
                                                && 
                                                contexte.carte.residenceInfo.x === contexte.joueurInfo2.position.x && 
                                                contexte.carte.residenceInfo.y === contexte.joueurInfo2.position.y &&
                                                !contexte.joueurBio2.mascotte
                                                ? "" : "🐧"}
                                        fontSize = {rayon/2}
                                        offsetX = {rayon/3.5}
                                        offsetY = {rayon/3.5}
                                    />
                                </>
                            );
                        }else {
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
                    })}

                    {/* === BROUILLARD === 
                    Affiche le brouillard, pour l'instant les joueurs ne peuvent que voir les cases où ils peuvent se déplacer
                    */}
                    {brouillard && contexte.carte.cases.map((c: Case) => {
                            const visible = visuel.some(v =>
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
                            onClick={() => {
                                if (deplacement) deplacement(c.positionMatrice); // On appelle la fonction avec comme paramètre les coordonées de la case, pour (si authorisé) déplacer le joueur vers celle ci.
                            }}
                        />
                    </React.Fragment>
                ))}
                </Group>
            </Layer>
        </Stage>
    );
}