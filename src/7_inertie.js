import enums from './enums.js';
import { getThicknessFromDescription, getKeyByValue } from './utils.js';

export class Inertie {
  #classeInertieMapping = {
    0: 'légère',
    1: 'moyenne',
    2: 'lourde',
    3: 'très lourde'
  };

  /**
   * Return 1 if the plancher_haut has high inertia, 0 otherwise
   * @param de {Donnee_entree}
   * @returns {number}
   */
  calculateInertiePhLourd(de) {
    const type_isolation = Number.parseInt(de.enum_type_isolation_id);

    /**
     * Type isolation
     * 2 - Non isolé
     * 4 - ITE
     * 9 - isolé mais type d'isolation inconnu
     */
    if ([2, 4, 9].includes(type_isolation)) {
      /**
       * Type Plancher Haut
       * 8 - Dalle béton
       * 11 - Plafond lourd type entrevous terre-cuite, poutrelles béton
       */
      const type_plancher_haut = Number.parseInt(de.enum_type_plancher_haut_id);
      if (!type_plancher_haut || [8, 11].includes(type_plancher_haut)) return 1;
    }
    return 0;
  }

  /**
   * Return 1 if the plancher_bas has high inertia, 0 otherwise
   * @param de {Donnee_entree}
   * @returns {number}
   */
  calculateInertiePbLourd(de) {
    const methode_saisie_u = Number.parseInt(de.enum_methode_saisie_u_id);
    const type_isolation = Number.parseInt(de.enum_type_isolation_id);

    /**
     * Type isolation
     * 2 - Non isolé
     * 4 - ITE
     * 9 - isolé mais type d'isolation inconnu
     *
     * Méthode Saisie
     * 1 - non isolé
     */
    if (methode_saisie_u === 1 || [2, 4, 9].includes(type_isolation)) {
      /**
       * Type Plancher Bas
       * 9 - Dalle béton
       * 11 - Plancher lourd type entrevous terre-cuite, poutrelles béton
       * 12 - Plancher à entrevous isolant
       */
      const type_plancher_bas = Number.parseInt(de.enum_type_plancher_bas_id);
      if (!type_plancher_bas || [9, 11, 12].includes(type_plancher_bas)) return 1;
    }
    return 0;
  }

  /**
   * Return 1 if the mur has high inertia, 0 otherwise
   * @param de {Donnee_entree}
   * @returns {number}
   */
  calculateInertieMurLourd(de) {
    const methode_saisie_u = Number.parseInt(de.enum_methode_saisie_u_id);
    const type_isolation = Number.parseInt(de.enum_type_isolation_id);

    /**
     * Type isolation
     * 2 - Non isolé
     * 4 - ITE
     * 9 - isolé mais type d'isolation inconnu
     *
     * Méthode Saisie
     * 1 - non isolé
     */
    if (methode_saisie_u === 1 || [2, 4, 9].includes(type_isolation)) {
      const materiaux_structure_mur = Number.parseInt(de.enum_materiaux_structure_mur_id);
      let epaisseur_structure = Number.parseFloat(de.epaisseur_structure);

      if (!epaisseur_structure) {
        epaisseur_structure = getThicknessFromDescription(de.description);
      }

      /**
       * Matériaux Structure mur
       * 2 - Murs en pierre de taille et moellons constitué d'un seul matériaux
       * 3 - Murs en pierre de taille et moellons avec remplissage tout venant
       * 4 - Murs en pisé ou béton de terre stabilisé (à partir d'argile crue)
       * 19 - Murs sandwich béton/isolant/béton (sans isolation rapportée)
       * 21 - Autre matériau traditionel ancien
       */
      if ([2, 3, 4, 19].includes(materiaux_structure_mur)) return 1;

      /**
       * Matériaux Structure mur
       * 11 - Murs en blocs de béton pleins
       * 13 - Murs en béton banché
       */
      if ([11, 13].includes(materiaux_structure_mur) && epaisseur_structure > 7) return 1;

      /**
       * Matériaux Structure mur
       * 12 - Murs en blocs de béton creux
       */
      if ([12].includes(materiaux_structure_mur) && epaisseur_structure > 11) return 1;

      /**
       * Matériaux Structure mur
       * 8 - Murs en briques pleines simples
       * 9 - Murs en briques pleines doubles avec lame d'air
       * 10 - Murs en briques creuses
       * 15 - Brique terre cuite alvéolaire
       */
      if ([8, 9, 10, 15].includes(materiaux_structure_mur) && epaisseur_structure > 10.5) return 1;
    }
    return 0;
  }

  /**
   * Get the inertia for a DPE based on the inertia of plancher_haut, plancher_bas and mur
   * @param enveloppe {Enveloppe}
   */
  calculateInertie(enveloppe) {
    const inertie = {
      inertie_plancher_bas_lourd: this.#calculateInertieForCollection(
        enveloppe.plancher_bas_collection.plancher_bas || [],
        this.calculateInertiePbLourd
      ),
      inertie_plancher_haut_lourd: this.#calculateInertieForCollection(
        enveloppe.plancher_haut_collection.plancher_haut || [],
        this.calculateInertiePhLourd
      ),
      inertie_paroi_verticale_lourd: this.#calculateInertieForCollection(
        enveloppe.mur_collection.mur || [],
        this.calculateInertieMurLourd
      )
    };

    const nb_inertie_lourde =
      inertie.inertie_plancher_bas_lourd +
      inertie.inertie_plancher_haut_lourd +
      inertie.inertie_paroi_verticale_lourd;

    return {
      ...inertie,
      enum_classe_inertie_id: getKeyByValue(
        enums.classe_inertie,
        this.#classeInertieMapping[nb_inertie_lourde]
      )
    };
  }

  /**
   * Return 1 if the collection has high inertia (majority high inertia surface), 0 otherwise
   * @param collection {PlancherBasItem[] || PlancherHautItem[] || MurItem[]}
   * @param method - method to apply on each item to get inertia type
   * @returns {number}
   */
  #calculateInertieForCollection(collection, method) {
    const s_lourd = collection.reduce((acc, item) => {
      const de = item.donnee_entree;
      return acc + de.surface_paroi_opaque * method(de);
    }, 0);
    const s_total = collection.reduce((acc, pb) => acc + pb.donnee_entree.surface_paroi_opaque, 0);
    return s_lourd / s_total >= 0.5 ? 1 : 0;
  }
}
