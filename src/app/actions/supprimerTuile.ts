export async function supprimerTuile(nom: string | null, x: number, y: number, type: string) {
    const reponse = await fetch("/api/cartes/supprimer", {
        method: "POST",
        body: JSON.stringify({
            nom: `${nom}`,
            type: `${type}`,
            tuileSupprimee: [x, y]
        })
    });

    return await reponse.json();
}