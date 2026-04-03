import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * route → /api/cartes/renommer
 * Route en POST qui renomme une carte en fonction de son nom actuel et de son nouveau nom
 */
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const {ancienNom, nouveauNom} = await req.json();

        const ancienChemin: string = path.join('./public/json/', `${ancienNom}.json`);
        const nouveauChemin: string = path.join('./public/json/', `${nouveauNom}.json`);

        // Vérifie que l'ancien fichier existe
        if (!fs.existsSync(ancienChemin)) {
            return NextResponse.json(
                {status: 'error', message: 'Carte introuvable'},
                {status: 404}
            );
        }

        // Renomme le fichier
        fs.renameSync(ancienChemin, nouveauChemin);

        return NextResponse.json({
            status: 'success',
            message: 'Carte renommée avec succès',
            nouveauNom
        });
    } catch (error) {
        console.error('Erreur lors du renommage:', error);
        return NextResponse.json(
            {status: 'error', message: 'Erreur serveur'},
            {status: 500}
        );
    }
}