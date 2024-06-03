import { calcul_3cl } from '../src/engine.js';
import { getAdemeFileJson } from './test-helpers.js';

describe('Open3cl table values unit tests', () => {
  it('should match ujn in tv with a two digits precision uw number', () => {
    let output = calcul_3cl(structuredClone(getAdemeFileJson('2302E4043473J')));

    /**
     * Si uw_saisi : 2.35 ce ne match aucune valeur dans le fichier tv.js (le plus proche, c'est 2.3 ou 2.4).
     * On arrondit uw_saisi avec une précision à 1 chiffre apres la virgule (ex : 2.25 devient 2.4)
     */
    expect(
      output.logement.enveloppe.baie_vitree_collection.baie_vitree[0].donnee_intermediaire
    ).toMatchObject({ ujn: 2 });

    /**
     * Erreur d'expression régulière sur le type d'isolation, si ITE+ITI le caractère "+"
     * invalide l'expression régulière ce qui sélectionna la mauvaise entrée dans le fichier tv.js
     * Le "+" est echappé, ex : "\\+"
     */
    expect(
      output.logement.enveloppe.pont_thermique_collection.pont_thermique[0].donnee_intermediaire
    ).toMatchObject({ k: 0.08 });

    /**
     * Dans le fichier de table de valeur (onglet intermittence), si la méthode application dpe est différente de 1
     * alors aucune classe d'inertie n'est précisée.
     * Or, on recherchait systématiquement une correspondance dans cet onglet
     * avec une classe d'inertie ce qui ne matchait aucune correspondance pour les immeubles.
     */
    output = calcul_3cl(structuredClone(getAdemeFileJson('2344E0308327N')));
    expect(
      output.logement.installation_chauffage_collection.installation_chauffage[0]
        .emetteur_chauffage_collection.emetteur_chauffage[0].donnee_intermediaire
    ).toMatchObject({ i0: 0.86 });
  });
});
