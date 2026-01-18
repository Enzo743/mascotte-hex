// Dépendances
import Link from "next/link";
import GrilleEditeur from "@/app/components/editeur/GrilleEditeur";
import NouveauPopUpModal from "@/app/components/editeur/modals/NouveauPopUpModal";
import GestionnaireModal from "@/app/components/editeur/modals/GestionnaireModal";
import { ModeJeu, PremierTour } from "@/app/modules/Interfaces";

/* === Lobby ===
Page principale du jeu, deux côtés, deux utilités
- à gauche tout ce qui est apparenté à la création et modification des cartes, ainsi qu'un espace pour visualiser la carte sélectionnée
- à droite tout ce qui est apparenté au jeu, mode de jeu et ses paramètres
Enregistre les choix du joueur et le redirige au bon endroit
Pas grand interet à commenter plus que ca, c'est du html avec des onclick pour changer les états relatifs au jeu ou à l'éditeur
*/
export default function Lobby({ data, actions }: any) {
    return (
        <>
            <header className="container-fluid">
                <h1 className="text-center">🐧/🥦 MASCOTTE HEX</h1>
            </header>
            <main className="container-fluid main-game-layout">
                <div className="grid grid-full-height">
                    <div className="container">
                        <article>
                            <h3 className="text-center">🔧🗺️ EDITEUR DE CARTE</h3>
                            <br />
                            <div className={"grid"}>
                                <Link id="btnNouveau" href="/?show=true" role="button">Nouveau</Link>
                                <Link id="btnModifier" href="/?showModif=true" role="button">Modifier</Link>
                            </div>
                            {data.show && <NouveauPopUpModal />}
                            {data.showModification && <GestionnaireModal prefixe="./editeur/modifier" onCloseHref={"/"} />}
                        </article>
                        <article className="article-preview-map">
                            <h3 className="text-center">👀🗺️ AFFICHAGE DE LA CARTE</h3>
                            <div className="container-scroll-map">
                                {data.hexagones.length > 0 && <GrilleEditeur
                                    rayon={data.rayon}
                                    hexagones={data.hexagones}
                                    mascotteInfo={data.residenceInfo}
                                    mascotteBio={data.residenceBio}
                                    rivieres={data.rivieres}
                                    tyroliennes={data.tyroliennes}
                                    onClick={() => {}}
                                />}
                                <br />
                            </div>
                        </article>
                    </div>
                    <div className="container sidebar-training">
                        <article className="article-training-controls">
                            <h3 className="text-center">🎯⚔️ ENTRAINEMENT</h3>
                            <div className="container training-select-container">
                                <select value={data.modeJeu} onChange={(e) => {
                                    data.definirModeJeu(e.target.value as ModeJeu);
                                    data.definirBrouillard(false);
                                }}>
                                    <option value="" disabled>👉 CHOISIR MODE DE JEU</option>
                                    <option value="pvp" onClick={() => {actions.changerModeDeJeu}}>🆚 1 CONTRE 1</option>
                                    <option value="tvt" onClick={() => {actions.changerModeDeJeu}}>🆚 2 CONTRE 2</option>
                                    <option value="bot" onClick={() => {actions.changerModeDeJeu}}>🤖 CONTRE L'IA</option>
                                </select>
                            </div>
                            {data.modeJeu && (
                                <>
                                    <hr />
                                    <h4>{data.modeJeu === "bot" ? "Choisissez votre camp :" : "Quel camp commence ?"}</h4>
                                    <div role="group" className="btn-group-centered">
                                        {[
                                            { key: "info", label: "🐧 Informaticiens", color: "#9486E1" },
                                            { key: "bio", label: "🥦 Biologistes", color: "#F17961" },
                                            ...(data.modeJeu !== "bot" ? [{ key: "random", label: "🎲 Aléatoire", color: "#6FC1F7" }] : [])
                                        ].map((v) => {
                                            const selected = data.premierTour === v.key;
                                            return (
                                                <button
                                                    key={v.key}
                                                    onClick={() => data.definirPremierTour(v.key as PremierTour)}
                                                    style={{
                                                        flex: "1 1 200px", maxWidth: "260px", fontWeight: selected ? "bold" : undefined,
                                                        textDecoration: selected ? "underline" : undefined, backgroundColor: v.color, color: "#000"
                                                    }}
                                                >{v.label}</button>
                                            );
                                        })}
                                    </div>
                                    <hr />
                                    {data.modeJeu === "bot" && !data.brouillard && (
                                        <>
                                            <h4>Difficulté de l’IA :</h4>
                                            <div role="group" className="btn-group-centered">
                                                {[
                                                    { key: "stupide", emoji: "🤪", bgColor: "#4ade80" },
                                                    { key: "facile", emoji: "🙂", bgColor: "#a3e635" },
                                                    { key: "moyen", emoji: "😐", bgColor: "#facc15" },
                                                    { key: "difficile", emoji: "😈", bgColor: "#f97316" },
                                                    { key: "extreme", emoji: "🔥", bgColor: "#ef4444" }
                                                ].map((v) => {
                                                    const selected = data.difficulteIA === v.key;
                                                    return (
                                                        <button
                                                            key={v.key}
                                                            onClick={() => data.definirDifficulteIA(v.key as any)}
                                                            style={{
                                                                flex: "1 1 200px", maxWidth: "260px", fontWeight: selected ? "bold" : undefined,
                                                                textDecoration: selected ? "underline" : undefined, backgroundColor: v.bgColor, color: "#000"
                                                            }}
                                                        >{v.emoji} {v.key.toUpperCase()}</button>
                                                    );
                                                })}
                                            </div>
                                            <hr />
                                        </>
                                    )}
                                    <h4>Options :</h4>
                                    <input type="checkbox" role="switch" checked={data.brouillard} onChange={() => data.definirBrouillard(!data.brouillard)} />
                                    <label>Brouillard</label><br />
                                    <input type="checkbox" role="switch" checked={data.modeCarte} onChange={() => data.definirModeCarte(!data.modeCarte)} />
                                    <label>Cartes</label>
                                </>
                            )}
                            <hr />
                            <div className="actions-footer">
                                <Link id={"btnSelec"} href={"?showSelec=true"} role={"button"}>Choisir une carte</Link>
                                <button onClick={actions.demarrerJeu} disabled={!(data.modeJeu && data.premierTour && data.carteId)}>▶️ Démarrer</button>
                            </div>
                        </article>
                    </div>
                </div>
                {data.showSelection && <GestionnaireModal prefixe={"/"} onCloseHref={"/"} restriction />}
            </main>
        </>
    );
}