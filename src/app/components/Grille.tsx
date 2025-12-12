// Dépendances
import { Arrow, Stage, Layer, Path, RegularPolygon, Group, Star, Circle} from "react-konva";
import { Case, Connexion } from "./Structure";
import { Graphe } from "./Graphe";

export default function Grille(
    {
    rayon,
    hexagones,
    joueur,
    ennemi,
    mascotteInfo,
    mascotteBio,
    residenceInfo,
    residenceBio,
    rivieres,
    tyroliennes,
    graphe,
    posJoueurCourant,
    deplacement
}: {
    rayon: number;
    hexagones: Case[];
    joueur: Case;
    ennemi: Case;
    mascotteInfo: Case;
    mascotteBio: Case;
    residenceInfo: Case;
    residenceBio: Case;
    rivieres: Connexion[];
    tyroliennes: Connexion[];
    graphe: Graphe;
    posJoueurCourant: [number, number]
    deplacement: (pos: [number, number]) => void;
}) {
    const width = Math.max.apply(0, hexagones.map((h) => h.position.x)) + rayon;
    const height = Math.max.apply(0, hexagones.map((h) => h.position.y)) + rayon;

    const voisins = graphe.graphe.find(g => 
        g.position.x === posJoueurCourant[0] && g.position.y === posJoueurCourant[1]
    )?.voisins || [];
    voisins.push(posJoueurCourant); 

    return (
        <Stage width={width} height={height}>
            <Layer>
                <Group>
                    {/* --- CASES (VISUEL DU TERRAIN) --- */}
                    {hexagones.map((hexagone) => (
                        <RegularPolygon
                            key = {"v-" + hexagone.id}
                            x = {hexagone.position.x}
                            y = {hexagone.position.y}
                            sides = {6}
                            radius = {rayon}
                            fill = {hexagone.couleur}
                            stroke = {"black"}
                        />
                        )
                    )}

                    {/* --- CASES (VISUEL DES ADJACENCES) --- */}
                    {hexagones.map((hexagone) => {
                        const [x, y] = hexagone.id.split("-").map(Number);
                        const adjacent = voisins.some(
                            (voisin) => voisin[0] === x && voisin[1] === y
                        );
                        if (!adjacent) {return null;}
                        return (
                        <RegularPolygon
                            key = {"a-" + hexagone.id}
                            x = {hexagone.position.x}
                            y = {hexagone.position.y}
                            sides = {6}
                            radius = {rayon}
                            stroke = {"red"}
                        />
                        )
                    })}     

                    {/* --- RESIDENCE INFO --- */}
                    <Star
                        x = {residenceInfo.position.x}
                        y = {residenceInfo.position.y}
                        numPoints = {6}
                        innerRadius = {rayon / 2.5}
                        outerRadius = {rayon}
                        fill = "#9486E1"
                        stroke = "black"
                    />

                    {/* --- RESIDENCE BIO --- */}
                    <Star
                        x = {residenceBio.position.x}
                        y = {residenceBio.position.y}
                        numPoints = {6}
                        innerRadius = {rayon / 2.5}
                        outerRadius = {rayon}
                        fill = "#F17961"
                        stroke = "black"
                    />

                    {/* --- RIVIÈRES --- */}
                    {rivieres.map((connexion, i) => {
                        const path: string[] = [];
                        const start = hexagones.find((h) => h.id === `${connexion.tuiles[0][0]}-${connexion.tuiles[0][1]}`);
                        if (!start) return null;
                        path.push(`M ${start.position.x} ${start.position.y}`);
                        for (let k = 1; k < connexion.tuiles.length; k++) {
                            const tuile = connexion.tuiles[k];
                            const hexagone = hexagones.find((h) => h.id === `${tuile[0]}-${tuile[1]}`);
                            if (hexagone) { path.push(`L ${hexagone.position.x} ${hexagone.position.y}`); }
                        }
                        return (
                            <Path
                                key = {`r-${i}`}
                                data = {path.join(" ")}
                                stroke = "#748BF8"
                                strokeWidth = {4}
                            />
                        );
                    })}

                    {/* --- TYROLIENNES --- */}
                    {tyroliennes.map((c, i) => {
                        const start = hexagones.find((h) => h.id === `${c.tuiles[0][0]}-${c.tuiles[0][1]}`);
                        const end = hexagones.find((h) => h.id === `${c.tuiles[1][0]}-${c.tuiles[1][1]}`);
                        if (!start || !end) return null;
                        return (
                            <Arrow
                                key = {`t-${i}`}
                                points = {[
                                    start.position.x,
                                    start.position.y,
                                    end.position.x,
                                    end.position.y
                                ]}
                                pointerLength = {30}
                                pointerWidth = {30}
                                fill = "#FFA23A"
                                stroke = "#FFA23A"
                                strokeWidth = {4}
                            />
                        );
                    })}

                    {/* JOUEURS */}
                    <Circle
                        x = {joueur.position.x}
                        y = {joueur.position.y}
                        radius = {rayon/2}
                        fill = "#9486E1"
                        stroke = "black"
                    />

                    {/* ENNEMI */}
                    <Circle
                        x = {ennemi.position.x}
                        y = {ennemi.position.y}
                        radius = {rayon/2}
                        fill = "#F17961"
                        stroke = "black"
                    />

                    {/* MASCOTTE INFO */}
                    <RegularPolygon
                            x = {mascotteInfo.position.x}
                            y = {mascotteInfo.position.y}
                            sides = {3}
                            radius = {rayon/2}
                            stroke = {"blue"}
                    />

                    {/* MASCOTTE BIO */}
                    <RegularPolygon
                            x = {mascotteBio.position.x}
                            y = {mascotteBio.position.y}
                            sides = {3}
                            radius = {rayon/2}
                            stroke = {"purple"}
                    />

                    {/* CASES (FONCTIONNEL)*/}
                    {hexagones.map((hexagone) => (
                        <RegularPolygon
                            key = {hexagone.id}
                            x = {hexagone.position.x}
                            y = {hexagone.position.y}
                            sides = {6}
                            radius = {rayon}
                            onClick = {() => {
                                const [x, y] = hexagone.id.split("-").map(Number);
                                deplacement([x, y]);
                            }}
                        />
                    ))}
                </Group>
            </Layer>
        </Stage>
    );
}
