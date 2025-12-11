// Getter qui permet de récupérer une carte par son nom
export async function getCarte(nom: string | null) {
    const response = await fetch(`/api/cartes/get/${nom}`, {
        method: "GET",
    });

    return await response.json();
}