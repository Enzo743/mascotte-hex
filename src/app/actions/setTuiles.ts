export async function setTuiles(collection) {
    const json = JSON.parse(collection);

    console.log(json);

    const tuiles = JSON.stringify({
        "nom": json.nom,
        "residenceInfo": json?.residenceInfo,
        "residenceBio": json?.residenceBio,
        "montagne": json?.montagne,
        "foret": json?.foret,
        "ocean": json?.ocean,
        "plaine": json?.plaine,
        "tyrolienne": json?.tyrolienne,
        "riviere": json?.riviere
    })

    console.log(tuiles);

    const response = await fetch("/api/cartes/ajouter/", {
        method: "POST",
        body: tuiles,
    });

    return await response.json();
}