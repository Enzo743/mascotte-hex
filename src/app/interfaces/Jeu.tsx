// Dépendances
import { Affichage } from "@/app/modules/Affichage";

/* === Jeu ===
Affiche une interface (à gauche de l'écran) avec les contrôles et les différentes indications et aides en fonction du mode de jeu et des options sélectionnées.
*/
export default function Jeu({ data, actions }: any) {
    return (
        <div className="game-layout">
            <aside className="sidebar">
                <div className="sidebar-inner">
                    <div className="sidebar-header">
                        {/* Titre constitué du nom de la carte sélectionnée pour la partie */}
                        <h2 className="title">CARTE "{data.carteId}"</h2>
                        {/* Affiche le mode de jeu et ses différents paramètres */}
                        <div className="game-status">
                            {data.modeJeu === "pvp" && <span className="badge">🆚 1V1</span>}
                            {data.modeJeu === "tvt" && <span className="badge">🆚 2V2</span>}
                            {data.modeJeu === "bot" && <span className="badge">🤖 BOT {data.difficulteIA.toUpperCase()}</span>}
                            {data.brouillard && <span className="badge">🌫️ BROUILLARD</span>}
                            {data.modeCarte && <span className="badge">🦫 CARTE</span>}
                        </div>
                        {/* En mode 2v2, affiche quel pion est sélectionné */}
                        {data.equipe && <p className="">Pion n°{data.pion + 1} sélectionné</p>}
                    </div>
                    {/* Simple affichage des controles du jeu */}
                    <h4>Controles :</h4>
                    <p><b>⬆️</b> Agrandir la carte</p>
                    <p><b>⬇️</b> : Rétrécir la carte</p>
                    {data.equipe && <p><b>Clic droit</b> : Changer le pion</p>}
                    {/* Affiche les cartes de l'équipe uniquement quand c'est nécessaire (pour éviter d'utiliser une nouvelle carte, etc) */}
                    {data.tour < 2 && data.modeCarte && (<div className="cards-section">
                        {data.modeCarte && (
                            <div className="carousel-container">
                                <button
                                    className="nav-arrow"
                                    disabled={data.indexCarte === 0}
                                    onClick={() => data.setIndexCarte(data.indexCarte - 1)}
                                >‹</button>
                                <div className="card-wrapper">
                                    {/* Couleur de la carte en fonction de l'équipe */}
                                    {((data.tour === 0 ? data.piocheInfo : data.piocheBio)[data.indexCarte]) ? (
                                        <div className={`balatro-card ${data.tour === 0 ? 'card-blue' : 'card-red'}`}>
                                            <div className="card-tag">CARTE {data.indexCarte + 1} / 3</div>
                                            <div className="card-main-info">
                                                {(data.tour === 0 ? data.piocheInfo : data.piocheBio)[data.indexCarte][1]}
                                            </div>
                                            <div className="card-tooltip">
                                                {data.descriptionCartes[(data.tour === 0 ? data.piocheInfo : data.piocheBio)[data.indexCarte][0]]}
                                            </div>
                                            {/* Si on cliquer sur UTIISER, la fonction utiliserCarte est appelée */}
                                            <button className="btn-card-action" onClick={() => actions.utiliserCarte(data.tour === 0, data.indexCarte)}>UTILISER</button>
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
                    {/* Message en cas de victoire, couleur et texte en fonction de l'équipe gagnante */}
                    {(data.tour == 2 || data.tour == 3) && (
                        <h3 className={`win ${data.tour === 2 ? "info" : "bio"}`}>VICTOIRE DE L'EQUIPE {data.tour == 2 ? "INFO 🐧" : "BIO 🥦"}</h3>
                    )}
                    {/* Affiche les tyroliennes empruntables, particulierement utile avec le mode brouillard */}
                    <div className="interactive-actions">
                        {data.tour < 2 && data.caseActuelle?.tyrolienne.nombre > 0 && (
                            <div className="actions-temp tyrolienne-block">
                                <p className="info-text">🚠 {data.caseActuelle?.tyrolienne.nombre} tyrolienne disponible</p>
                                <div className="btn-group">
                                    {/* Si l'on clique dessus, on se déplace vers la destination de la tyrolienne (inconnue en mode brouillard) */}
                                    {data.caseActuelle.tyrolienne.sorties.map((sortie: any, index: number) => (
                                        <button key={index} className="btn-action" onClick={() => actions.deplacerJoueur(sortie)}>Emprunter la tyrolienne n°{index + 1}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Affiche les rivières empruntables, particulierement utile avec le mode brouillard */}
                        {data.tour < 2 && data.caseActuelle?.riviere.nombre > 0 && (
                            <div className="actions-temp riviere-block">
                                <p className="info-text">🛶 {data.caseActuelle?.riviere.nombre} rivière disponible</p>
                                <div className="btn-group">
                                    {/* Si l'on clique dessus, on se déplace dans le sens du courant de celle-ci (destination inconnue en mode brouillard) */}
                                    {data.caseActuelle.riviere.sorties.map((sortie: any, index: number) => (
                                        <button key={index} className="btn-action" onClick={() => actions.deplacerJoueur(sortie)}>Emprunter la rivière n°{index + 1}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Revenir au menu de sélection */}
                    <div className="game-controls">
                        <button className="btn-simple" onClick={() => actions.quitter()}>RETOUR</button>
                    </div>
                </div>
            </aside>
            <main className="canvas-container">
                {/* Affichage de la grille de jeu */}
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