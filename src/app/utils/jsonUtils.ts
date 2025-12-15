// Fonction qui permet de voir si deux tuiles sont identiques (en JSON)
export const estMemeTuile = (t1: unknown, t2: unknown) =>
    JSON.stringify(t1) === JSON.stringify(t2);