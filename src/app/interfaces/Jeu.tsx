// Dépendances
import { Affichage } from "@/app/modules/Affichage";

/* === Jeu ===
Todo : Commenter vite fait
*/
export default function Jeu({ data, actions }: any) {
    return (
        <div className="game-layout">
            <aside className="sidebar">
                <div className="sidebar-inner">
                    <div className="sidebar-header">
                        <h2 className="title">CARTE "{data.carteId}"</h2>
                        <div className="game-status">
                            {data.modeJeu === "pvp" && <span className="badge">🆚 1V1</span>}
                            {data.modeJeu === "tvt" && <span className="badge">🆚 2V2</span>}
                            {data.modeJeu === "bot" && <span className="badge">🤖 BOT {data.difficulteIA.toUpperCase()}</span>}
                            {data.brouillard && <span className="badge">🌫️ BROUILLARD</span>}
                            {data.modeCarte && <span className="badge">🦫 CARTE</span>}
                        </div>
                        {data.equipe && <p className="">Pion n°{data.pion + 1} sélectionné</p>}
                    </div>
                    <h4>Controles :</h4>
                    <p><b>⬆️</b> Agrandir la carte</p>
                    <p><b>⬇️</b> : Rétrécir la carte</p>
                    <p><b>T</b> : Emprunter une tyrolienne au hasard</p>
                    <p><b>R</b> : Emprunter une riviere au hasard</p>
                    {data.equipe && <p><b>Clic droit</b> : Changer le pion</p>}
                    {data.modeCarte && (<div className="cards-section">
                        {data.modeCarte && (
                            <div className="carousel-container">
                                <button
                                    className="nav-arrow"
                                    disabled={data.indexCarte === 0}
                                    onClick={() => data.setIndexCarte(data.indexCarte - 1)}
                                >‹</button>
                                <div className="card-wrapper">
                                    {((data.tour === 0 ? data.piocheInfo : data.piocheBio)[data.indexCarte]) ? (
                                        <div className={`balatro-card ${data.tour === 0 ? 'card-blue' : 'card-red'}`}>
                                            <div className="card-tag">CARTE {data.indexCarte + 1} / 3</div>
                                            <div className="card-main-info">
                                                {(data.tour === 0 ? data.piocheInfo : data.piocheBio)[data.indexCarte][1]}
                                            </div>
                                            <div className="card-tooltip">
                                                {data.descriptionCartes[(data.tour === 0 ? data.piocheInfo : data.piocheBio)[data.indexCarte][0]]}
                                            </div>
                                            <button
                                                disabled={data.tour >= 5 && data.tour <= 8} // Empeche d'utiliser une carte pendant l'assignation d'un surveillant / d'une correction
                                                className="btn-card-action"
                                                onClick={() => actions.utiliserCarte(data.tour === 0, data.indexCarte)}
                                            >
                                                UTILISER
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="no-card">Pas de carte</div>
                                    )}
                                </div>
                                <button
                                    className="nav-arrow"
                                    disabled={data.indexCarte === 2}
                                    onClick={() => data.setIndexCarte(data.indexCarte + 1)}
                                >›</button>
                            </div>
                        )}
                    </div>
                    )}
                    <div className="interactive-actions">
                        {data.caseActuelle?.tyrolienne.nombre > 0 && (
                            <div className="actions-temp tyrolienne-block">
                                <p className="info-text">🚠 {data.caseActuelle?.tyrolienne.nombre} tyrolienne disponible</p>
                                <div className="btn-group">
                                    {data.caseActuelle.tyrolienne.sorties.map((sortie: any, index: number) => (
                                        <button key={index} className="btn-action" onClick={() => actions.deplacerJoueur(sortie)}>Emprunter la tyrolienne n°{index + 1}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.caseActuelle?.riviere.nombre > 0 && (
                            <div className="actions-temp riviere-block">
                                <p className="info-text">🛶 {data.caseActuelle?.riviere.nombre} rivière disponible</p>
                                <div className="btn-group">
                                    {data.caseActuelle.riviere.sorties.map((sortie: any, index: number) => (
                                        <button key={index} className="btn-action" onClick={() => actions.deplacerJoueur(sortie)}>Emprunter la rivière n°{index + 1}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="game-controls">
                        <button className="btn-simple" onClick={() => actions.quitter()}>RETOUR</button>
                    </div>
                </div>
            </aside>
            <main className="canvas-container">
                <Affichage
                    contexte={data.contexte}
                    rayon={data.rayon}
                    tour={data.tour}
                    pion={data.pion}
                    deplacement={actions.deplacerJoueur}
                    brouillard={data.brouillard}
                    equipe={data.equipe}
                    surveillants={data.surveillants}
                    castors={data.castors}
                    casse={data.casse}
                />
            </main>
        </div>
    );
}