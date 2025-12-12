// Dépendances
import {Arrow, Group, Layer, Path, RegularPolygon, Stage, Star} from "react-konva";
import {Case, Connexion} from "../Structure";
// Au cas ou

export default function GrilleEditeur(
    {
        rayon,
        hexagones,
        mascotteInfo,
        mascotteBio,
        rivieres,
        tyroliennes,
        onClick,
    }: {
        rayon: number;
        hexagones: Case[];
        mascotteInfo: null | Case;
        mascotteBio: null | Case;
        rivieres: Connexion[];
        tyroliennes: Connexion[];
        onClick: (hex: Case) => void;
    }) {
    const width = Math.max.apply(0, hexagones.map((h) => h.position.x)) + rayon;
    const height = Math.max.apply(0, hexagones.map((h) => h.position.y)) + rayon;

    return (
        <Stage width={width} height={height}>
            <Layer>
                <Group>
                    {/* --- CASES (VISUEL DU TERRAIN) --- */}
                    {hexagones.map((hexagone) => (
                            <RegularPolygon
                                key={"v-" + hexagone.id}
                                x={hexagone.position.x}
                                y={hexagone.position.y}
                                sides={6}
                                radius={rayon}
                                fill={hexagone.couleur}
                                stroke={"black"}
                            />
                        )
                    )}

                    {/* --- MASCOTTE INFO --- */}
                    {mascotteInfo ? (
                        <Star
                            x={mascotteInfo.position.x}
                            y={mascotteInfo.position.y}
                            numPoints={6}
                            innerRadius={rayon / 2.5}
                            outerRadius={rayon}
                            fill="#9486E1"
                            stroke="black"
                        />
                    ) : null}

                    {/* --- MASCOTTE BIO --- */}
                    {mascotteBio ? (
                        <Star
                            x={mascotteBio.position.x}
                            y={mascotteBio.position.y}
                            numPoints={6}
                            innerRadius={rayon / 2.5}
                            outerRadius={rayon}
                            fill="#F17961"
                            stroke="black"
                        />
                    ) : null}

                    {/* --- RIVIÈRES --- */}
                    {rivieres.map((connexion, i) => {
                        const path: string[] = [];
                        const start = hexagones.find((h) => h.id === `${connexion.tuiles[0][0]}-${connexion.tuiles[0][1]}`);
                        if (!start) return null;
                        path.push(`M ${start.position.x} ${start.position.y}`);
                        for (let k = 1; k < connexion.tuiles.length; k++) {
                            const tuile = connexion.tuiles[k];
                            const hexagone = hexagones.find((h) => h.id === `${tuile[0]}-${tuile[1]}`);
                            if (hexagone) {
                                path.push(`L ${hexagone.position.x} ${hexagone.position.y}`);
                            }
                        }
                        return (
                            <Path
                                key={`r-${i}`}
                                data={path.join(" ")}
                                stroke="#748BF8"
                                strokeWidth={4}
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
                                key={`t-${i}`}
                                points={[
                                    start.position.x,
                                    start.position.y,
                                    end.position.x,
                                    end.position.y
                                ]}
                                pointerLength={30}
                                pointerWidth={30}
                                fill="#FFA23A"
                                stroke="#FFA23A"
                                strokeWidth={4}
                            />
                        );
                    })}

                    {/* CASES (FONCTIONNEL)*/}
                    {hexagones.map((hexagone) => (
                        <RegularPolygon
                            key={hexagone.id}
                            x={hexagone.position.x}
                            y={hexagone.position.y}
                            sides={6}
                            radius={rayon}
                            onClick={() => onClick?.(hexagone)}
                        />
                    ))}
                </Group>
            </Layer>
        </Stage>
    );
}
