import { calcul_3cl } from '../src/engine.js';
import { getAdemeFileJson } from './test-helpers.js';

describe('Open3cl misc unit tests', () => {
  it('should match ujn in tv with a two digits precision uw number', () => {
    const output = calcul_3cl(structuredClone(getAdemeFileJson('2302E4043473J')));

    /**
     * Si uw_saisi : 2.35 ce ne match aucune valeur dans le fichier tv.js (le plus proche, c'est 2.3 ou 2.4).
     * On arrondit uw_saisi avec une précision à 1 chiffre apres la virgule (ex : 2.25 devient 2.4)
     */
    expect(
      output.logement.enveloppe.baie_vitree_collection.baie_vitree[0].donnee_intermediaire
    ).toMatchObject({ ujn: 2 });
  });

  it('regular expression with "+" character should be accepted for isolation ITE + ITI', () => {
    const output = calcul_3cl(structuredClone(getAdemeFileJson('2302E4043473J')));

    /**
     * Erreur d'expression régulière sur le type d'isolation, si ITE+ITI le caractère "+"
     * invalide l'expression régulière ce qui sélectionna la mauvaise entrée dans le fichier tv.js
     * Le "+" est echappé, ex : "\\+"
     */
    expect(
      output.logement.enveloppe.pont_thermique_collection.pont_thermique[0].donnee_intermediaire
    ).toMatchObject({ k: 0.08 });
  });

  it('should use inertie class only for individual housing', () => {
    /**
     * Dans le fichier de table de valeur (onglet intermittence), si la méthode application dpe est différente de 1
     * alors aucune classe d'inertie n'est précisée.
     * Or, on recherchait systématiquement une correspondance dans cet onglet
     * avec une classe d'inertie ce qui ne matchait aucune correspondance pour les immeubles.
     */
    const output = calcul_3cl(structuredClone(getAdemeFileJson('2344E0308327N')));
    expect(
      output.logement.installation_chauffage_collection.installation_chauffage[0]
        .emetteur_chauffage_collection.emetteur_chauffage[0].donnee_intermediaire
    ).toMatchObject({ i0: 0.86 });
  });

  it('should be able to specify uph_saisi', () => {
    const input = structuredClone(getAdemeFileJson('2344E0308327N'));

    input.logement.enveloppe.plancher_haut_collection.plancher_haut[0].donnee_entree.enum_methode_saisie_u_id = 9;
    input.logement.enveloppe.plancher_haut_collection.plancher_haut[0].donnee_entree.uph_saisi = 0.18;

    const output = calcul_3cl(structuredClone(input));
    expect(
      output.logement.enveloppe.plancher_haut_collection.plancher_haut[0].donnee_intermediaire
    ).toMatchObject({ b: 0, uph: 0.18 });

    expect(
      input.logement.enveloppe.plancher_haut_collection.plancher_haut[0].donnee_intermediaire.uph0
    ).toBe(
      output.logement.enveloppe.plancher_haut_collection.plancher_haut[0].donnee_intermediaire.uph0
    );
    expect(
      input.logement.enveloppe.plancher_bas_collection.plancher_bas[0].donnee_intermediaire.upb0
    ).toBe(
      output.logement.enveloppe.plancher_bas_collection.plancher_bas[0].donnee_intermediaire.upb0
    );
  });

  it('should be able to process a dpe with empty plancher_bas_collection and plancher_haut_collection', () => {
    const output = calcul_3cl(structuredClone(getAdemeFileJson('2421E0125604W')));

    expect(output.logement.enveloppe.plancher_bas_collection).toBe('');
    expect(output.logement.enveloppe.plancher_haut_collection).toBe('');

    expect(output.logement.sortie.qualite_isolation.qualite_isol_plancher_bas).toBe(1);
  });

  it('should have a valid tv_umur_if if no periode_isolation', () => {
    const input = structuredClone(getAdemeFileJson('2421E0125604W'));
    const inputTvMurId = input.logement.enveloppe.mur_collection.mur[0].donnee_entree.tv_umur_id;

    const output = calcul_3cl(structuredClone(input));

    const outputTvMurId = output.logement.enveloppe.mur_collection.mur[0].donnee_entree.tv_umur_id;
    expect(inputTvMurId).toBe(outputTvMurId);
  });
});
