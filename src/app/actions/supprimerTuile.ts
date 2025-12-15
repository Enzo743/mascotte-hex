export async function supprimerTuile(nom: string | null, x: number, y: number) {
    const reponse = await fetch("/api/cartes/supprimer", {
        method: "POST",
        body: JSON.stringify({
            nom: `${nom}`,
            type: "tyrolienne",
            tuileSupprimee: [x, y]
        })
    });

    return await reponse.json();
}