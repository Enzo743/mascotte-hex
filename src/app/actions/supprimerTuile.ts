export async function supprimerTuile(nom: string, x: number, y: number, type: string): Promise<Response> {
    const reponse: Response = await fetch("/api/cartes/supprimer", {
        method: "POST",
        body: JSON.stringify({
            nom: `${nom}`,
            type: `${type}`,
            tuileSupprimee: [x, y]
        })
    });

    return await reponse.json();
}